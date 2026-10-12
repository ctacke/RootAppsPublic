import { createServer, IncomingMessage, Server, ServerResponse } from "node:http";
import { BOT_HEADERS, BotEventEnvelope, TriggerEvent } from "./types";
import { BotContext } from "./context";
import { verifySignature } from "./crypto";

export type BotHandler<E = TriggerEvent> = (
  event: E,
  ctx: BotContext
) => void | Promise<void>;

export interface BotOptions {
  secret: string;
  /** Deduplication window in ms. Default: 5 minutes. Set to 0 to disable. */
  dedupeWindowMs?: number;
}

export class Bot {
  private readonly secret: string;
  private readonly handlers = new Map<string, BotHandler<any>[]>();
  private readonly seenDeliveries = new Map<string, number>();
  private readonly dedupeWindowMs: number;

  constructor(options: BotOptions) {
    if (!options.secret) {
      throw new Error("Bot options must include 'secret'");
    }
    this.secret = options.secret;
    this.dedupeWindowMs = options.dedupeWindowMs ?? 5 * 60_000;
  }

  /**
   * Registers a handler for a specific event type, or "*" for all events.
   */
  on<E = TriggerEvent>(eventType: string, handler: BotHandler<E>): this {
    const list = this.handlers.get(eventType) ?? [];
    list.push(handler);
    this.handlers.set(eventType, list);
    return this;
  }

  /**
   * Processes a webhook request (e.g. from an existing Express or Next.js app).
   * Verifies the HMAC signature, executes registered handlers, and returns the response status and body.
   */
  async processRequest(
    rawBody: string,
    headers: Record<string, string | string[] | undefined>
  ): Promise<{ status: number; body: object }> {
    const getHeader = (key: string): string | undefined => {
      const val = headers[key.toLowerCase()] ?? headers[key];
      return Array.isArray(val) ? val[0] : val;
    };

    const timestamp = getHeader(BOT_HEADERS.timestamp);
    const signature = getHeader(BOT_HEADERS.signature);

    const verified = verifySignature(this.secret, timestamp, signature, rawBody);
    if (!verified.ok) {
      return { status: 401, body: { error: verified.reason } };
    }

    let envelope: BotEventEnvelope;
    try {
      envelope = JSON.parse(rawBody) as BotEventEnvelope;
    } catch {
      return { status: 400, body: { error: "invalid JSON body" } };
    }

    if (!envelope || typeof envelope !== "object" || !envelope.event) {
      return { status: 400, body: { error: "malformed envelope: missing event" } };
    }

    // Deduplication
    const now = Date.now();
    if (this.dedupeWindowMs > 0 && envelope.deliveryId) {
      const lastSeen = this.seenDeliveries.get(envelope.deliveryId);
      if (lastSeen !== undefined && now - lastSeen < this.dedupeWindowMs) {
        return { status: 200, body: { actions: [] } };
      }
      this.seenDeliveries.set(envelope.deliveryId, now);

      // Prune expired
      for (const [id, seenAt] of this.seenDeliveries.entries()) {
        if (now - seenAt > this.dedupeWindowMs) {
          this.seenDeliveries.delete(id);
        }
      }
    }

    const event = envelope.event;
    const ctx = new BotContext(event, envelope.deliveryId, envelope.botId);

    // Call matching handlers
    const specificHandlers = this.handlers.get(event.type) ?? [];
    const wildcardHandlers = this.handlers.get("*") ?? [];
    const allHandlers = [...specificHandlers, ...wildcardHandlers];

    for (const handler of allHandlers) {
      try {
        await handler(event, ctx);
      } catch (err) {
        console.error(`[NodeRootBot] Error in handler for event ${event.type}:`, err);
      }
    }

    return {
      status: 200,
      body: { actions: ctx.actions }
    };
  }

  /**
   * Express/Connect middleware for handling deliveries.
   */
  middleware() {
    return async (req: IncomingMessage & { body?: any }, res: ServerResponse) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.end("Method Not Allowed");
        return;
      }

      let rawBody = "";
      if (typeof req.body === "string") {
        rawBody = req.body;
      } else if (Buffer.isBuffer(req.body)) {
        rawBody = req.body.toString("utf8");
      } else {
        rawBody = await new Promise<string>((resolve, reject) => {
          const chunks: Buffer[] = [];
          req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
          req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
          req.on("error", reject);
        });
      }

      const result = await this.processRequest(rawBody, req.headers as Record<string, string | undefined>);
      res.statusCode = result.status;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(result.body));
    };
  }

  /**
   * Starts a standalone HTTP server.
   */
  listen(port: number, host = "0.0.0.0"): Promise<Server> {
    return new Promise((resolve) => {
      const server = createServer(this.middleware());
      server.listen(port, host, () => {
        resolve(server);
      });
    });
  }
}

export function createBot(options: BotOptions): Bot {
  return new Bot(options);
}

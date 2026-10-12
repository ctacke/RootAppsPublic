"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
exports.createBot = createBot;
const node_http_1 = require("node:http");
const types_1 = require("./types");
const context_1 = require("./context");
const crypto_1 = require("./crypto");
class Bot {
    secret;
    handlers = new Map();
    seenDeliveries = new Map();
    dedupeWindowMs;
    constructor(options) {
        if (!options.secret) {
            throw new Error("Bot options must include 'secret'");
        }
        this.secret = options.secret;
        this.dedupeWindowMs = options.dedupeWindowMs ?? 5 * 60_000;
    }
    /**
     * Registers a handler for a specific event type, or "*" for all events.
     */
    on(eventType, handler) {
        const list = this.handlers.get(eventType) ?? [];
        list.push(handler);
        this.handlers.set(eventType, list);
        return this;
    }
    /**
     * Processes a webhook request (e.g. from an existing Express or Next.js app).
     * Verifies the HMAC signature, executes registered handlers, and returns the response status and body.
     */
    async processRequest(rawBody, headers) {
        const getHeader = (key) => {
            const val = headers[key.toLowerCase()] ?? headers[key];
            return Array.isArray(val) ? val[0] : val;
        };
        const timestamp = getHeader(types_1.BOT_HEADERS.timestamp);
        const signature = getHeader(types_1.BOT_HEADERS.signature);
        const verified = (0, crypto_1.verifySignature)(this.secret, timestamp, signature, rawBody);
        if (!verified.ok) {
            return { status: 401, body: { error: verified.reason } };
        }
        let envelope;
        try {
            envelope = JSON.parse(rawBody);
        }
        catch {
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
        const ctx = new context_1.BotContext(event, envelope.deliveryId, envelope.botId);
        // Call matching handlers
        const specificHandlers = this.handlers.get(event.type) ?? [];
        const wildcardHandlers = this.handlers.get("*") ?? [];
        const allHandlers = [...specificHandlers, ...wildcardHandlers];
        for (const handler of allHandlers) {
            try {
                await handler(event, ctx);
            }
            catch (err) {
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
        return async (req, res) => {
            if (req.method !== "POST") {
                res.statusCode = 405;
                res.end("Method Not Allowed");
                return;
            }
            let rawBody = "";
            if (typeof req.body === "string") {
                rawBody = req.body;
            }
            else if (Buffer.isBuffer(req.body)) {
                rawBody = req.body.toString("utf8");
            }
            else {
                rawBody = await new Promise((resolve, reject) => {
                    const chunks = [];
                    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
                    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
                    req.on("error", reject);
                });
            }
            const result = await this.processRequest(rawBody, req.headers);
            res.statusCode = result.status;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result.body));
        };
    }
    /**
     * Starts a standalone HTTP server.
     */
    listen(port, host = "0.0.0.0") {
        return new Promise((resolve) => {
            const server = (0, node_http_1.createServer)(this.middleware());
            server.listen(port, host, () => {
                resolve(server);
            });
        });
    }
}
exports.Bot = Bot;
function createBot(options) {
    return new Bot(options);
}
//# sourceMappingURL=bot.js.map
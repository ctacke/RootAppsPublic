import { IncomingMessage, Server, ServerResponse } from "node:http";
import { TriggerEvent } from "./types";
import { BotContext } from "./context";
export type BotHandler<E = TriggerEvent> = (event: E, ctx: BotContext) => void | Promise<void>;
export interface BotOptions {
    secret: string;
    /** Deduplication window in ms. Default: 5 minutes. Set to 0 to disable. */
    dedupeWindowMs?: number;
}
export declare class Bot {
    private readonly secret;
    private readonly handlers;
    private readonly seenDeliveries;
    private readonly dedupeWindowMs;
    constructor(options: BotOptions);
    /**
     * Registers a handler for a specific event type, or "*" for all events.
     */
    on<E = TriggerEvent>(eventType: string, handler: BotHandler<E>): this;
    /**
     * Processes a webhook request (e.g. from an existing Express or Next.js app).
     * Verifies the HMAC signature, executes registered handlers, and returns the response status and body.
     */
    processRequest(rawBody: string, headers: Record<string, string | string[] | undefined>): Promise<{
        status: number;
        body: object;
    }>;
    /**
     * Express/Connect middleware for handling deliveries.
     */
    middleware(): (req: IncomingMessage & {
        body?: any;
    }, res: ServerResponse) => Promise<void>;
    /**
     * Starts a standalone HTTP server.
     */
    listen(port: number, host?: string): Promise<Server>;
}
export declare function createBot(options: BotOptions): Bot;
//# sourceMappingURL=bot.d.ts.map
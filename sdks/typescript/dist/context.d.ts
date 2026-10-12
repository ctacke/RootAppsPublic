import type { BotAction, ScheduleJobRequest, SendMessageRequest, SendNotificationRequest, TriggerEvent } from "./types";
/**
 * Context object provided to bot event handlers.
 * Allows convenient, typed registration of actions to respond with.
 */
export declare class BotContext {
    readonly event: TriggerEvent;
    readonly deliveryId: string;
    readonly botId: string;
    private readonly _actions;
    constructor(event: TriggerEvent, deliveryId: string, botId: string);
    /** The list of actions accumulated during handler execution. */
    get actions(): readonly BotAction[];
    /**
     * Quick helper to send a message. Defaults to the event's channel if omitted.
     */
    sendMessage(content: string, options?: Partial<Omit<SendMessageRequest, "content">>): this;
    /**
     * Helper to reply directly to the event's message.
     */
    reply(content: string, notifyParent?: boolean): this;
    /** Edit an existing message. */
    editMessage(channelId: string, messageId: string, content: string): this;
    /** Delete a message. */
    deleteMessage(channelId: string, messageId: string): this;
    /** Add an emoji reaction to a message. */
    addReaction(channelId: string, messageId: string, shortcode: string): this;
    /** React to the event's message directly. */
    react(shortcode: string): this;
    /** Remove a reaction from a message. */
    removeReaction(channelId: string, messageId: string, shortcode: string): this;
    /** Send an in-app community notification. */
    sendNotification(request: SendNotificationRequest): this;
    /** Schedule a background job. */
    scheduleJob(request: ScheduleJobRequest): this;
    /** Delete a scheduled job. */
    deleteScheduledJob(jobId: string): this;
}
//# sourceMappingURL=context.d.ts.map
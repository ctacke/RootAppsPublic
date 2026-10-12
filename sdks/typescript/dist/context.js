"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotContext = void 0;
/**
 * Context object provided to bot event handlers.
 * Allows convenient, typed registration of actions to respond with.
 */
class BotContext {
    event;
    deliveryId;
    botId;
    _actions = [];
    constructor(event, deliveryId, botId) {
        this.event = event;
        this.deliveryId = deliveryId;
        this.botId = botId;
    }
    /** The list of actions accumulated during handler execution. */
    get actions() {
        return this._actions;
    }
    /**
     * Quick helper to send a message. Defaults to the event's channel if omitted.
     */
    sendMessage(content, options) {
        const action = {
            type: "sendMessage",
            content,
            channelId: options?.channelId ?? this.event.channelId
        };
        if (options?.parentMessageIds !== undefined) {
            action.parentMessageIds = options.parentMessageIds;
        }
        if (options?.notifyParent !== undefined) {
            action.notifyParent = options.notifyParent;
        }
        this._actions.push(action);
        return this;
    }
    /**
     * Helper to reply directly to the event's message.
     */
    reply(content, notifyParent = false) {
        if (!this.event.messageId) {
            throw new Error("Cannot reply: current event does not have a messageId");
        }
        return this.sendMessage(content, {
            parentMessageIds: [this.event.messageId],
            notifyParent
        });
    }
    /** Edit an existing message. */
    editMessage(channelId, messageId, content) {
        this._actions.push({
            type: "editMessage",
            channelId,
            messageId,
            content
        });
        return this;
    }
    /** Delete a message. */
    deleteMessage(channelId, messageId) {
        this._actions.push({
            type: "deleteMessage",
            channelId,
            messageId
        });
        return this;
    }
    /** Add an emoji reaction to a message. */
    addReaction(channelId, messageId, shortcode) {
        this._actions.push({
            type: "addReaction",
            channelId,
            messageId,
            shortcode
        });
        return this;
    }
    /** React to the event's message directly. */
    react(shortcode) {
        if (!this.event.channelId || !this.event.messageId) {
            throw new Error("Cannot react: current event lacks channelId or messageId");
        }
        return this.addReaction(this.event.channelId, this.event.messageId, shortcode);
    }
    /** Remove a reaction from a message. */
    removeReaction(channelId, messageId, shortcode) {
        this._actions.push({
            type: "removeReaction",
            channelId,
            messageId,
            shortcode
        });
        return this;
    }
    /** Send an in-app community notification. */
    sendNotification(request) {
        this._actions.push({
            type: "sendNotification",
            ...request
        });
        return this;
    }
    /** Schedule a background job. */
    scheduleJob(request) {
        this._actions.push({
            type: "scheduleJob",
            ...request
        });
        return this;
    }
    /** Delete a scheduled job. */
    deleteScheduledJob(jobId) {
        this._actions.push({
            type: "deleteScheduledJob",
            jobId
        });
        return this;
    }
}
exports.BotContext = BotContext;
//# sourceMappingURL=context.js.map
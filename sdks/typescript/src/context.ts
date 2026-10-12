import type {
  BotAction,
  EditMessageRequest,
  ScheduleJobRequest,
  SendMessageRequest,
  SendNotificationRequest,
  TriggerEvent
} from "./types";

/**
 * Context object provided to bot event handlers.
 * Allows convenient, typed registration of actions to respond with.
 */
export class BotContext {
  private readonly _actions: BotAction[] = [];

  constructor(
    public readonly event: TriggerEvent,
    public readonly deliveryId: string,
    public readonly botId: string
  ) {}

  /** The list of actions accumulated during handler execution. */
  get actions(): readonly BotAction[] {
    return this._actions;
  }

  /**
   * Quick helper to send a message. Defaults to the event's channel if omitted.
   */
  sendMessage(
    content: string,
    options?: Partial<Omit<SendMessageRequest, "content">>
  ): this {
    const action: BotAction = {
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
  reply(content: string, notifyParent = false): this {
    if (!this.event.messageId) {
      throw new Error("Cannot reply: current event does not have a messageId");
    }
    return this.sendMessage(content, {
      parentMessageIds: [this.event.messageId],
      notifyParent
    });
  }

  /** Edit an existing message. */
  editMessage(channelId: string, messageId: string, content: string): this {
    this._actions.push({
      type: "editMessage",
      channelId,
      messageId,
      content
    });
    return this;
  }

  /** Delete a message. */
  deleteMessage(channelId: string, messageId: string): this {
    this._actions.push({
      type: "deleteMessage",
      channelId,
      messageId
    });
    return this;
  }

  /** Add an emoji reaction to a message. */
  addReaction(channelId: string, messageId: string, shortcode: string): this {
    this._actions.push({
      type: "addReaction",
      channelId,
      messageId,
      shortcode
    });
    return this;
  }

  /** React to the event's message directly. */
  react(shortcode: string): this {
    if (!this.event.channelId || !this.event.messageId) {
      throw new Error("Cannot react: current event lacks channelId or messageId");
    }
    return this.addReaction(this.event.channelId, this.event.messageId, shortcode);
  }

  /** Remove a reaction from a message. */
  removeReaction(channelId: string, messageId: string, shortcode: string): this {
    this._actions.push({
      type: "removeReaction",
      channelId,
      messageId,
      shortcode
    });
    return this;
  }

  /** Send an in-app community notification. */
  sendNotification(request: SendNotificationRequest): this {
    this._actions.push({
      type: "sendNotification",
      ...request
    });
    return this;
  }

  /** Schedule a background job. */
  scheduleJob(request: ScheduleJobRequest): this {
    this._actions.push({
      type: "scheduleJob",
      ...request
    });
    return this;
  }

  /** Delete a scheduled job. */
  deleteScheduledJob(jobId: string): this {
    this._actions.push({
      type: "deleteScheduledJob",
      jobId
    });
    return this;
  }
}

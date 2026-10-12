/**
 * Common wire types and constants for Node-ROOT bots.
 */
export declare const BOT_ENVELOPE_VERSION = 1;
export declare const BOT_TIMEOUT_DEFAULT_MS = 10000;
export declare const BOT_TIMEOUT_MAX_MS = 30000;
export declare const BOT_MAX_ACTIONS_PER_RESPONSE = 25;
export declare const BOT_ALL_EVENTS = "*";
export declare const BOT_HEADERS: {
    readonly timestamp: "x-noderoot-timestamp";
    readonly signature: "x-noderoot-signature";
    readonly delivery: "x-noderoot-delivery";
    readonly event: "x-noderoot-event";
};
export declare const MESSAGE_POSTED = "event.messagePosted";
export declare const USER_JOINED_COMMUNITY = "event.userJoinedCommunity";
export declare const USER_LEFT_COMMUNITY = "event.userLeftCommunity";
export interface TriggerEvent {
    type: string;
    communityId?: string;
    communityName?: string;
    channelId?: string;
    channelName?: string;
    userId?: string;
    userName?: string;
    messageId?: string;
    messageText?: string;
    raw?: Record<string, unknown>;
}
export interface SendMessageRequest {
    channelId: string;
    content: string;
    parentMessageIds?: string[];
    notifyParent?: boolean;
}
export interface EditMessageRequest {
    channelId: string;
    messageId: string;
    content: string;
}
export interface MessageRef {
    channelId: string;
    messageId: string;
}
export interface ReactionRequest {
    channelId: string;
    messageId: string;
    shortcode: string;
}
export interface SendNotificationRequest {
    userId: string;
    title: string;
    body: string;
}
export interface ScheduleJobRequest {
    tag: string;
    fireAt?: string;
    jobInterval?: string;
}
export type BotAction = ({
    type: "sendMessage";
} & Omit<SendMessageRequest, "channelId"> & {
    channelId?: string;
}) | ({
    type: "editMessage";
} & EditMessageRequest) | ({
    type: "deleteMessage";
} & MessageRef) | ({
    type: "addReaction";
} & ReactionRequest) | ({
    type: "removeReaction";
} & ReactionRequest) | ({
    type: "sendNotification";
} & SendNotificationRequest) | ({
    type: "scheduleJob";
} & ScheduleJobRequest) | {
    type: "deleteScheduledJob";
    jobId: string;
};
export type BotActionType = BotAction["type"];
export interface BotResponse {
    actions?: BotAction[];
}
export interface BotEventEnvelope {
    version: number;
    deliveryId: string;
    botId: string;
    sentAt: string;
    event: TriggerEvent;
}
export interface BotRegistration {
    id: string;
    name: string;
    url: string;
    secret: string;
    enabled: boolean;
    disabledReason?: string;
    allowInsecure?: boolean;
    timeoutMs?: number;
    events: string[];
    channelIds?: string[];
    createdAt: string;
    updatedAt: string;
}
export type BotSummary = Omit<BotRegistration, "secret">;
export interface BotInput {
    name: string;
    url: string;
    enabled?: boolean;
    allowInsecure?: boolean;
    timeoutMs?: number;
    events: string[];
    channelIds?: string[];
}
export interface BotActionResult {
    type: string;
    ok: boolean;
    error?: string;
    id?: string;
}
export type BotDeliveryStatus = "delivered" | "failed" | "dropped";
export interface BotDeliveryLogEntry {
    deliveryId: string;
    eventType: string;
    at: string;
    status: BotDeliveryStatus;
    attempts: number;
    latencyMs?: number;
    httpStatus?: number;
    error?: string;
    actions: BotActionResult[];
    responseErrors: string[];
}
export interface BotTestResult {
    ok: boolean;
    httpStatus?: number;
    latencyMs?: number;
    error?: string;
    actions: BotAction[];
    responseErrors: string[];
    results?: BotActionResult[];
}
//# sourceMappingURL=types.d.ts.map
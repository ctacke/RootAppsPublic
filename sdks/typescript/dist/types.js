"use strict";
/**
 * Common wire types and constants for Node-ROOT bots.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_LEFT_COMMUNITY = exports.USER_JOINED_COMMUNITY = exports.MESSAGE_POSTED = exports.BOT_HEADERS = exports.BOT_ALL_EVENTS = exports.BOT_MAX_ACTIONS_PER_RESPONSE = exports.BOT_TIMEOUT_MAX_MS = exports.BOT_TIMEOUT_DEFAULT_MS = exports.BOT_ENVELOPE_VERSION = void 0;
exports.BOT_ENVELOPE_VERSION = 1;
exports.BOT_TIMEOUT_DEFAULT_MS = 10_000;
exports.BOT_TIMEOUT_MAX_MS = 30_000;
exports.BOT_MAX_ACTIONS_PER_RESPONSE = 25;
exports.BOT_ALL_EVENTS = "*";
exports.BOT_HEADERS = {
    timestamp: "x-noderoot-timestamp",
    signature: "x-noderoot-signature",
    delivery: "x-noderoot-delivery",
    event: "x-noderoot-event"
};
exports.MESSAGE_POSTED = "event.messagePosted";
exports.USER_JOINED_COMMUNITY = "event.userJoinedCommunity";
exports.USER_LEFT_COMMUNITY = "event.userLeftCommunity";
//# sourceMappingURL=types.js.map
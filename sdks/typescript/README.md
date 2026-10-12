# @noderoot/bot-sdk

The official Node.js / TypeScript SDK for developing self-hosted bots and external webhook services for **Node-ROOT** on [Root](https://www.root.io/).

---

## Features

- **Built-in Webhook Server**: Standalone HTTP server or middleware for Express/Connect.
- **HMAC-SHA256 Cryptography**: Automatic signature validation and timestamp verification against replay attacks.
- **Typed Actions**: Fluent API for returning Root actions (`sendMessage`, `reply`, `react`, `deleteMessage`, `editMessage`, `scheduleJob`, and `sendNotification`).
- **Deduplication**: Automatic in-memory delivery ID deduplication.
- **Zero Dependencies**: Uses only standard Node.js built-ins (`node:http`, `node:crypto`).

---

## Installation

```bash
npm install @noderoot/bot-sdk
```

---

## Quickstart

```typescript
import { createBot, MESSAGE_POSTED } from "@noderoot/bot-sdk";

// Secret provided by Node-ROOT when installing your bot
const secret = process.env.NODEROOT_SECRET || "nrs_your_hmac_secret";
const port = Number(process.env.PORT) || 3000;

const bot = createBot({ secret });

// Listen for messages
bot.on(MESSAGE_POSTED, (evt, ctx) => {
  const text = (evt.messageText || "").trim();

  // Command response
  if (text === "!ping") {
    ctx.reply("pong! 🏓");
    ctx.react("ping_pong");
    return;
  }

  // Keyword moderation
  if (text.toLowerCase().includes("spam")) {
    ctx.react("warning");
    ctx.reply(`Warning @${evt.userName}: Prohibited content detected.`);
    // Optionally delete the message:
    // ctx.deleteMessage(evt.channelId!, evt.messageId!);
  }
});

// Wildcard logger
bot.on("*", (evt) => {
  console.log(`[Event Received] ${evt.type}`);
});

// Start the server
bot.listen(port).then(() => {
  console.log(`Bot listening on http://0.0.0.0:${port}/`);
});
```

---

## Express / Next.js Integration

If you already run an Express server:

```typescript
import express from "express";
import { createBot } from "@noderoot/bot-sdk";

const app = express();
const bot = createBot({ secret: process.env.NODEROOT_SECRET! });

// Mount bot webhook middleware
app.post("/webhook", bot.middleware());

app.listen(3000);
```

---

## Available Actions

Inside your event handler, use `ctx` to queue actions executed by Node-ROOT:

- `ctx.sendMessage(content, options)`: Post a message to the event's channel (or any channel).
- `ctx.reply(content, notifyParent)`: Reply directly to the message that triggered the event.
- `ctx.react(shortcode)`: Add an emoji reaction to the triggering message.
- `ctx.editMessage(channelId, messageId, content)`: Edit an existing message.
- `ctx.deleteMessage(channelId, messageId)`: Delete an offending message.
- `ctx.addReaction(channelId, messageId, shortcode)`: React to any message.
- `ctx.removeReaction(channelId, messageId, shortcode)`: Remove a reaction.
- `ctx.sendNotification({ userId, title, body })`: Send an in-app Root notification.
- `ctx.scheduleJob({ tag, fireAt, jobInterval })`: Schedule a background job.
- `ctx.deleteScheduledJob(jobId)`: Cancel a scheduled job.

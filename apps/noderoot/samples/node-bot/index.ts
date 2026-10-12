import { createBot, MESSAGE_POSTED } from "@noderoot/bot-sdk";

// Secret provided by Node-ROOT when creating/rotating bot in the Bots Panel
const secret = process.env.NODEROOT_SECRET || "nrs_sample_secret_replace_with_yours";
const port = Number(process.env.PORT) || 3000;

const bot = createBot({ secret });

// Listen for message events
bot.on(MESSAGE_POSTED, (evt, ctx) => {
  const text = (evt.messageText || "").trim();
  console.log(`[SampleBot] Received message from ${evt.userName || evt.userId}: "${text}"`);

  // Simple ping command
  if (text === "!ping") {
    ctx.reply("pong! 🏓");
    ctx.react("ping_pong");
    return;
  }

  // Greeting command
  if (text.startsWith("!hello")) {
    ctx.sendMessage(`Hello, @${evt.userName || "friend"}! Welcome to Root.`);
    return;
  }

  // Help command
  if (text === "!help") {
    ctx.reply("Available commands:\n• `!ping` - Pong response\n• `!hello` - Friendly greeting\n• `!help` - List commands");
    return;
  }
});

// Wildcard logger
bot.on("*", (evt) => {
  console.log(`[SampleBot] Event received: ${evt.type}`);
});

// Start the server
bot.listen(port).then(() => {
  console.log(`[SampleBot] Listening on http://localhost:${port}/`);
  console.log(`[SampleBot] Set this URL in Node-ROOT with allowInsecure checked for local dev.`);
});

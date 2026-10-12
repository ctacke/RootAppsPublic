# noderoot-bot (Python SDK)

The official Python SDK for developing self-hosted bots and external webhook services for **Node-ROOT** on [Root](https://www.root.io/).

---

## Features

- **Standard Library Only**: Zero external dependencies (uses standard `http.server`, `hmac`, `hashlib`, `json`, `time`).
- **Turnkey Server**: Built-in HTTP server that automatically binds to `PORT` / `SERVER_PORT` for platforms like [bot-hosting.net](https://bot-hosting.net/).
- **HMAC-SHA256 Cryptography**: Automatic cryptographic verification and replay-attack prevention.
- **Fluent Actions**: Queue `reply()`, `send_message()`, `react()`, and `delete_message()` actions to be executed by Node-ROOT.

---

## Installation

Either install via pip:

```bash
pip install .
```

Or simply drop `noderoot_bot.py` into your project directory!

---

## Quickstart

```python
import os
from noderoot_bot import NodeRootBot

# Set your secret via NODEROOT_SECRET environment variable or directly
secret = os.environ.get("NODEROOT_SECRET", "nrs_your_secret_from_noderoot")
bot = NodeRootBot(secret=secret)

# Words to moderate
BANNED_WORDS = ["spam", "buy now", "free nitro", "crypto scam"]

@bot.on("event.messagePosted")
def handle_message(event, ctx):
    text = (event.get("messageText") or "").strip()
    user = event.get("userName") or event.get("userId") or "someone"
    print(f"[ModerationBot] Message received from {user}: '{text}'")

    # Check for prohibited keywords
    lower_text = text.lower()
    matched = [word for word in BANNED_WORDS if word in lower_text]

    if matched:
        print(f"[ModerationBot] Flagged message from {user}: {matched}")
        # Add warning reaction
        ctx.react("warning")
        # Reply with warning
        ctx.reply(f"⚠️ Warning @{user}: Prohibited language detected.")
        # Optionally delete:
        # ctx.delete_message()
    elif text == "!ping":
        ctx.reply("pong from Python! 🛡️")
        ctx.react("shield")

@bot.on("*")
def handle_all(event, ctx):
    print(f"[ModerationBot] Observed event: {event.get('type')}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT") or os.environ.get("SERVER_PORT") or 5000)
    print(f"Starting bot server on 0.0.0.0:{port}...")
    bot.run(host="0.0.0.0", port=port)
```

---

## Available Actions

Inside your handler, `ctx` accumulates actions returned to Node-ROOT:

- `ctx.send_message(content, channel_id=None)`: Send a message to the event's channel (or specified channel).
- `ctx.reply(content)`: Reply directly to the message triggering the event.
- `ctx.react(shortcode)`: React to the message with an emoji shortcode (e.g. `warning`, `shield`, `thumbsup`).
- `ctx.delete_message(message_id=None, channel_id=None)`: Delete the message.

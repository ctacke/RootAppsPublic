---
title: Self-Hosted Bots & Webhook Guide
permalink: /noderoot/bots/
app: noderoot
---

Node-ROOT features a **Self-Hosted Bot Bridge** that allows external bots written in any programming language (Python, TypeScript, Go, Rust, C#, etc.) to receive events from [Root](https://www.root.io/) and execute actions back into your community.

Whether you run a bot on a free hosting platform like [bot-hosting.net](https://bot-hosting.net/), a cloud VPS, or your local machine, Node-ROOT handles event delivery, cryptographic signing, retry queues, and action execution.

---

## 🎥 Demonstration Video

Watch a walkthrough of building, installing, and testing a self-hosted bot with Node-ROOT:

<div style="position: relative; width: 100%; max-width: 800px; margin: 1rem 0; padding-bottom: 45%; height: 0; overflow: hidden;">
  <iframe src="https://www.youtube.com/embed/vbWrmTFftyo" title="Node-ROOT Self-Hosted Bots Demonstration" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>

Prefer to watch on YouTube? [Open the video directly](https://youtu.be/vbWrmTFftyo).

---

## ⚠️ Crucial Concept: Direct Bot vs. Canvas Workflow

Before building or installing a bot, understand the difference between the two ways Node-ROOT can interact with your bot:

> ### 💡 If the logic is in your bot, NO workflow needs to be created!
> When your external bot handles its own event subscriptions (e.g. checking for keywords, slash commands, or automated moderation), **you do NOT need to create a flow on the Node-ROOT canvas.**
> 
> Simply install the bot in the **Bots** management modal. Node-ROOT automatically delivers subscribed events (like `event.messagePosted`) directly to your bot's webhook URL, and executes whatever actions (`sendMessage`, `addReaction`, `deleteMessage`, etc.) your bot returns.
> 
> **Warning**: If you install the bot in the Bots modal *and* also create a canvas workflow with `Message Posted ➔ Call Bot`, your bot will be invoked **twice for the same message** (once by the automatic webhook dispatcher and once by the workflow), resulting in duplicate replies!

### When should you use the canvas "Call Bot" node?
Use the **Call Bot** action node on the canvas **only** if you want Node-ROOT workflows to orchestrate *when* and *how* the bot is invoked. For example:
- Running an AI prompt through an external bot only when a specific keyword list matches.
- Calling your bot on a timer (using Node-ROOT's `Job Triggered` scheduler node).
- Transforming or filtering data in Node-ROOT before passing it to your custom microservice.

---

## Sample Bots

We provide ready-to-run sample bots for both Python and TypeScript:

### 1. Python Moderation Bot (Ready to Deploy)
A lightweight Python bot that inspects incoming chat messages, flags prohibited words (e.g., `spam`, `crypto scam`), adds a `warning` reaction, replies with a moderation warning, and can optionally delete offending messages.

- **Download Package**: [noderoot-python-bot.zip]({{ '/assets/downloads/noderoot-python-bot.zip' | relative_url }})
- **Python SDK Source**: [sdks/python/](https://github.com/ctacke/RootAppsPublic/tree/main/sdks/python)
- **Features**:
  - Zero external dependencies beyond the standard library (uses built-in `http.server`, `hmac`, and `hashlib`).
  - Turnkey deployment on [bot-hosting.net](https://bot-hosting.net/) or any host that supports Python.
  - Automatic port binding via `PORT` or `SERVER_PORT` environment variables.

### 2. TypeScript / Node.js Bot
Built using the official `@noderoot/bot-sdk` package.

- **TypeScript SDK Source**: [sdks/typescript/](https://github.com/ctacke/RootAppsPublic/tree/main/sdks/typescript)
- **Install**:
  ```bash
  npm install @noderoot/bot-sdk
  ```

---

## Quickstart: Deploying the Python Bot on bot-hosting.net

[bot-hosting.net](https://bot-hosting.net/) provides free hosting suitable for 24/7 webhooks.

1. **Download the archive**: Grab [noderoot-python-bot.zip]({{ '/assets/downloads/noderoot-python-bot.zip' | relative_url }}).
2. **Create a Python Bot**: On your bot-hosting.net dashboard, create a new bot and select **Python 3.12+**.
3. **Upload Files**: In the File Manager, upload and extract `noderoot-python-bot.zip`. The root should contain `main.py`, `bot.py`, `noderoot_bot.py`, and `requirements.txt`.
4. **Note your Port & URL**:
   - In the **Startup** or **Network** settings, note the external IP / domain and the allocated port (e.g. `http://143.198.230.115:56738`).
5. **Start the Bot**: Click **Start**. The console should show:
   ```
   [PythonBot] Starting bot server on 0.0.0.0:56738...
   [NodeRootBot] Server running on http://0.0.0.0:56738/
   ```

---

## Installing Your Bot in Node-ROOT

### Step 1: Open the Bots Panel
In Node-ROOT, click the **Bots** button in the top toolbar to open the bot manager.

![Self-Hosted Bots Configuration]({{ '/assets/images/noderoot/self-host-config.png' | relative_url }})

### Step 2: Configure Your Bot
Click **+ Install bot** and fill in the configuration:
- **Bot Name**: A friendly label for your bot (e.g., `ModerationBot`).
- **Webhook URL**: The full endpoint URL of your bot (e.g. `http://143.198.230.115:56738` or `https://mybot.example.com/webhook`).
- **Allow Insecure (HTTP)**: Check this if your endpoint uses `http://` instead of `https://`.
- **Timeout (ms)**: Maximum time Node-ROOT waits for a response (default: `10000ms`).
- **Subscribed Events**:
  - Keep `* (All Events)` checked to receive all events, or choose specific events like `event.messagePosted`.
  - Leave **Channel Filter** blank to monitor all channels, or specify channel IDs separated by commas.

### Step 3: Copy Your HMAC Secret
Click **Install Bot**. A banner will display the newly generated HMAC secret:
```
nrs_9e67c8b417e29780005d52ad58cf2a25ffc991a029580637df21699f7d4323eb
```
> **Important**: Copy this secret and save it in your bot hosting environment variable `NODEROOT_SECRET` (or replace the placeholder secret in `bot.py`). Node-ROOT never displays this secret again.

---

## Testing Your Bot

Node-ROOT includes an interactive test harness that delivers immediate synthetic events directly to your bot so you can verify connectivity, signature validation, and action parsing.

1. Switch to the **Send Test Event** tab.
2. Select an event type (e.g., `event.messagePosted`) and enter a test payload message (e.g., `Hello from Node-ROOT test event!`).
3. *(Optional)* Check **Execute returned actions in Root** if you want test actions to actually post into your channels.
4. Click **Send Test Event**.

![Send Test Event]({{ '/assets/images/noderoot/self-host-test.png' | relative_url }})

The outcome panel displays:
- **Status & HTTP Code**: Confirms 200 OK responses.
- **Latency**: Round-trip response time in milliseconds.
- **Returned Actions**: Exact JSON actions returned by your bot.
- **Response Validation Issues**: Identifies malformed action payloads before they can affect live chats.

---

## Monitoring Deliveries

Click the **Delivery Log** tab to inspect the last 50 deliveries stored in server memory.

![Delivery Log]({{ '/assets/images/noderoot/self-host-log.png' | relative_url }})

Each entry tracks:
- Delivery timestamp and status (`DELIVERED`, `FAILED`, or `DROPPED`).
- Number of attempts and retry backoff.
- Network latency.
- Executed actions and individual action success/failure status.

---

## The Python Bot Implementation

Here is how simple the moderation bot logic is using [`bot.py`](https://github.com/ctacke/RootAppsPublic/blob/main/apps/noderoot/samples/python-bot/bot.py):

```python
import os
from noderoot_bot import NodeRootBot

secret = os.environ.get("NODEROOT_SECRET", "nrs_sample_secret_replace_with_yours")
bot = NodeRootBot(secret=secret)

# Words or phrases to moderate
BANNED_WORDS = ["spam", "buy now", "free nitro", "crypto scam"]

@bot.on("event.messagePosted")
def handle_message(event, ctx):
    text = (event.get("messageText") or "").strip()
    user = event.get("userName") or event.get("userId") or "someone"
    print(f"[ModerationBot] Message received from {user}: '{text}'")

    # Check if the message contains any moderated words
    lower_text = text.lower()
    matched = [word for word in BANNED_WORDS if word in lower_text]

    if matched:
        print(f"[ModerationBot] Flagged message from {user} matching: {matched}")
        # Add a warning reaction to the flagged message
        ctx.react("warning")
        # Reply with a moderation warning
        ctx.reply(f"⚠️ Warning @{user}: Your message contains prohibited content. Please follow the community rules.")
        # Optionally delete the offending message:
        # ctx.delete_message()
    elif text == "!ping":
        ctx.reply("pong from Moderation Bot! 🛡️")
        ctx.react("shield")
```

---

## The TypeScript Bot Implementation

Using `@noderoot/bot-sdk`:

```typescript
import { createBot, MESSAGE_POSTED } from "@noderoot/bot-sdk";

const secret = process.env.NODEROOT_SECRET || "nrs_your_secret";
const bot = createBot({ secret });

bot.on(MESSAGE_POSTED, (evt, ctx) => {
  const text = (evt.messageText || "").trim();

  if (text === "!ping") {
    ctx.reply("pong! 🏓");
    ctx.react("ping_pong");
    return;
  }

  if (text.toLowerCase().includes("spam")) {
    ctx.react("warning");
    ctx.reply(`Warning @${evt.userName}: Prohibited language detected.`);
  }
});

bot.listen(3000);
```

---

## Actions Reference

Bots can return any combination of the following actions in their JSON response (`{"actions": [...]}`):

| Action Type | Description | Key Properties |
| :--- | :--- | :--- |
| `sendMessage` | Posts a message to a channel | `content`, `channelId` (optional), `parentMessageIds` |
| `editMessage` | Edits an existing message | `channelId`, `messageId`, `content` |
| `deleteMessage` | Deletes a message | `channelId`, `messageId` |
| `addReaction` | Adds an emoji reaction | `channelId`, `messageId`, `shortcode` |
| `removeReaction` | Removes an emoji reaction | `channelId`, `messageId`, `shortcode` |
| `sendNotification` | Sends an in-app notification | `userId`, `title`, `body` |
| `scheduleJob` | Schedules a deferred job | `tag`, `fireAt`, `jobInterval` |
| `deleteScheduledJob`| Cancels a scheduled job | `jobId` |

---

## Cryptographic Security (HMAC-SHA256)

Every request POSTed to your bot carries headers verifying authenticity:

```http
POST /webhook HTTP/1.1
Content-Type: application/json
x-noderoot-timestamp: 1730000000
x-noderoot-delivery: d_4a3b8c7d-e90f-481b-a912-87c2b5ec2840
x-noderoot-signature: v1=7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
```

1. **Signature Data**: `timestamp + "." + raw_body_utf8_bytes`.
2. **Hash**: SHA-256 HMAC generated using the shared secret.
3. **Header Format**: `v1=<hex_encoded_hmac>`.
4. **Timestamp Window**: Requests with timestamps older or newer than 300 seconds are rejected by the SDK to prevent replay attacks.

---

## Workflow Integration (Optional "Call Bot" Node)

If you *do* want to incorporate your bot into a canvas workflow (e.g. calling your bot after a filter condition or timer):

![Workflow Moderation]({{ '/assets/images/noderoot/workflow-moderation.png' | relative_url }})

1. Add the **Call Bot** node from the **Actions** category on the palette.
2. In the Properties panel, choose your installed bot from the **Bot** dropdown.
3. If your bot returns actions and you want Node-ROOT to run them automatically, leave **Execute Returned Actions** checked (`runActions: true`).
4. If you want the workflow itself to process the bot's response downstream, uncheck **Execute Returned Actions**; the bot's JSON response will be saved into `{{data.botResponse}}`.

---

[← Back to Node-ROOT Overview]({{ '/noderoot/support/' | relative_url }})

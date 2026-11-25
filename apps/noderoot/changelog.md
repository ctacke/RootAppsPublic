---
title: Node-ROOT Changelog
permalink: /noderoot/changelog/
app: noderoot
---

What's new in **Node-ROOT**, newest first.

## 1.3.0 — 25 November 2026

### Image moderation

- **New "Image Hash" node**: Fetches an image and produces a fingerprint (SHA-256) of its contents, so workflows can match it against a list of known-bad images.
- **New "Add to List" action node**: Adds an entry to a named list from within a workflow.
- **Strike counter**: Record strikes against a member and check whether they have reached a threshold, so a workflow can escalate for repeat offenders.
- **Ready-made samples**: Importable profile-image moderation workflows, including one that escalates with repeat strikes.

### Platform

- Updated to Root SDK 0.22.0.

## 1.2.0 — 4 November 2026

### Ephemeral channels

- **New "Ephemeral" action node**: Deletes messages in a channel older than an age you choose (minutes, hours, days or weeks), so a channel clears itself out. Includes a **Preserve pinned** option to keep pinned messages, and a **Max deletions per run** safety cap (0 = unlimited).

### New "Timer" trigger

- **Run workflows on a schedule**: A new Timer trigger fires on a fixed interval (seconds, minutes, hours or days), independent of any chat event. Timing is a reusable building block — wire it to anything that should happen periodically, like an ephemeral-channel sweep.

### List Messages

- **New "List Messages" data node**: Fetches recent messages from a channel (newest first) for workflows that need to look at channel history.

### Ready-made sample

- **"Ephemeral channel (6h)" workflow**: An importable sample wiring a 15-minute Timer into the Ephemeral node to keep a channel clear of messages older than six hours. Pick your channel and deploy.

### Clearer error reporting

- **Real failure details**: When a workflow action fails, the logs now show the underlying reason (including the service error code) instead of an opaque "root-error". The Ephemeral node also says whether listing or deleting messages failed, and one message it cannot delete no longer aborts the whole sweep.

## 1.1.4 — 14 October 2026

### Flow editor fix

- **Node dragging**: Fixed node movement so dragging from mouse-down behaves correctly on the canvas.

## 1.1.3 — 14 October 2026

### Action execution settling delay

When workflows execute fast actions in response to real-time events, the action could occasionally reach the backend before the client finished rendering the triggering event (for example, a message deletion action firing before the inbound message appeared in the channel).

- **Backend settling delay**: Action nodes now include a brief 250ms delay before execution (`actionStartDelayMs`), giving the client UI and backend state time to settle.
- **Configurable**: Configurable via execution options, and automatically disabled in test runs so simulation performance remains instant.

## 1.1.2 — 12 October 2026

### "Call Bot" node improvements

- **Integrated Bot Picker**: The `Call Bot` action node now features a native dropdown picker to select any registered bot directly by name, complete with an inline refresh button in the properties panel.
- **Automatic Secret & Endpoint Resolution**: When a registered bot is selected, Node-ROOT automatically resolves its webhook URL, HMAC signing secret, and configured timeout from the bot store—no manual copying and pasting of secrets or URLs into node properties required.
- **Custom Overrides**: Optional override fields remain available if you need to provide a custom URL, HMAC secret, or timeout override for a specific execution.
- **Automatic Environment Sync**: The editor now keeps registered bots in sync with channels and roles, and automatically refreshes the bot list when closing the Bots modal.

## 1.1.1 — 12 October 2026

### Unsecured HTTP bot endpoints

- **Remote HTTP support**: The "Allow Insecure" toggle now permits plain HTTP connections to any bot endpoint, not just `localhost` and private IP addresses. This makes it easier to connect bots hosted on test servers or third-party hosting platforms that do not terminate TLS/HTTPS.
- **Python bot logging fix**: Improved log formatting resilience in the sample Python bot server to prevent formatting errors on incoming connections.

## 1.1.0 — 12 October 2026

### Self-Hosted Bots & Webhook Bridge

Node-ROOT now supports connecting external, self-hosted bots written in any programming language (Python, TypeScript, Go, Rust, C#, etc.) hosted anywhere (locally, on a VPS, or on bot-hosting platforms like bot-hosting.net).

- **Direct Webhook Bridge (No workflow needed)**:
  - Register external endpoints that subscribe to platform events (all events `*`, or specific events like `event.messagePosted`), with optional channel filtering.
  - Node-ROOT automatically delivers real-time events to your bot via signed HTTP POST requests and executes any Root actions (`sendMessage`, `editMessage`, `deleteMessage`, `addReaction`, `removeReaction`, `sendNotification`, `scheduleJob`, `deleteScheduledJob`) your bot returns in its JSON response.
  - **If your logic is in the bot, no canvas workflow needs to be created or deployed.**
- **Cryptographic Request Signing**:
  - Webhook deliveries are signed using HMAC-SHA256 (`x-noderoot-signature`) with a timestamp header (`x-noderoot-timestamp`) and unique delivery identifier (`x-noderoot-delivery`) to prevent replay attacks and tampering.
  - Secret rotation support with immediate revocation of previous keys.
- **In-Editor Bot Management & Diagnostics**:
  - Install, configure, enable, or disable bots directly from the **Bots** toolbar button.
  - **Send Test Event**: Fire synthetic events immediately against your bot and inspect HTTP status, latency, returned actions, and response validation warnings in real time.
  - **Delivery Log**: In-memory inspection of the last 50 deliveries per bot, including attempt counts, response status, latency, and action execution results.
  - **Resilience**: Independent per-bot queues, bounded concurrency, exponential backoff retries, and automatic circuit breaker protection against persistently failing endpoints.
- **"Call Bot" Action Node**:
  - New `Call Bot` action node (`action.callBot`) on the canvas with a dropdown to select any installed bot.
  - Allows workflows to invoke bots conditionally with custom payloads, with an option to automatically execute returned actions or map responses into workflow variables.
- **SDKs & Sample Bots**:
  - Published `@noderoot/bot-sdk` npm package for Node.js / TypeScript.
  - Published standalone Python bot framework with a keyword moderation sample and ready-to-deploy zip archive.
  - See the [Self-Hosted Bots Guide]({{ '/noderoot/bots/' | relative_url }}) for full instructions.

## 1.0.0 — 4 October 2026

### Expanded Root API node coverage (95 total node types)

Node-ROOT now features **95 node types** spanning the full breadth of the Root SDK API, providing deep automation capabilities for scheduling, files, moderation, voice channels, permissions, and emojis.

- **Job Scheduler**:
  - `Job Triggered` and `Job Missed` trigger nodes with tag filtering.
  - `Schedule Job` action for one-time or recurring (daily, weekly, monthly, yearly) tasks.
  - `Delete Scheduled Job` action and `List Scheduled Jobs` data lookup.
- **Channel Files**:
  - `Channel File Uploaded` and `Channel File Deleted` triggers.
  - `Delete Channel File` action for file and attachment cleanup.
  - `List Channel Files` and `Get Channel File` data lookups with download URL access.
- **Message & Moderation Extras**:
  - `User Typing` trigger to respond to typing activity.
  - `Set Typing Indicator` action to display the bot typing indicator during workflow execution.
  - `Message Unpinned` trigger and `List Pinned Messages` data lookup.
  - `Reactions Cleared` trigger and `Clear Reactions` action (clear all or specific emoji reactions).
  - `Flag Message` action for reporting content with standard moderation reasons.
- **Custom Emojis & Member Groups**:
  - `Custom Emoji Created` and `Custom Emoji Deleted` triggers.
  - `Delete Custom Emoji` action and `List Custom Emojis` data lookup.
  - `Group Members Added` and `Group Members Removed` triggers with member group filtering.
- **Voice Channels & Invites**:
  - `User Joined Voice Channel` and `User Left Voice Channel` triggers.
  - `Disconnect User from Voice Channel` action and `List Voice Channels` data lookup.
  - `Invite Created` and `Invite Revoked` triggers, `Create Channel Invite` action, and `List Channel Invites` data lookup.
- **Channel Permission Overrides, Audit Logs & Community Settings**:
  - `Channel Permission Override Created/Updated` and `Channel Permission Override Deleted` triggers.
  - `Set Channel Permission Overrides` and `Delete Channel Permission Overrides` actions, plus `List Channel Permission Overrides` data lookup.
  - `List Audit Log Entries` data lookup for inspecting administrative and moderation logs.
  - `Update Community Settings` action for managing community metadata and default system channels.

## 0.9.8 — 1 October 2026

### Refresh channels, roles and lists without reloading

When you add a channel or a role in Root, Node-ROOT now picks it up without a
full reload.

- A new **Refresh** button in the toolbar re-fetches your community's channels,
  roles and lists from Root on demand, with a spinner while it works.
- Channel, role and list pickers — in both the node properties panel and the
  Event Simulator — each have their own inline refresh button, so you can pull
  in something you just created without leaving the field you're editing.
- Node-ROOT also refreshes on its own when you switch back to the editor tab,
  so the pickers are up to date when you return.

### Pickers keep a value they don't recognise

A channel, role or list that isn't in the current list — for example one named
by a template, or one removed since you set it — is no longer silently dropped
from a picker. It stays selected and is shown as-is, so your workflow keeps the
value you chose.

### Keyword lists

- **New "Exact match (entire text)" mode** for list conditions, which matches
  only when the whole message is exactly a list entry — alongside the existing
  Whole word, Anywhere, and Starts with modes.
- **Whole-word matching now catches commands and emoji.** Entries like `!help`
  now match even though the message starts with punctuation, and emoji such as
  ❤️ are matched as whole tokens instead of being stripped away.

---

Questions or problems? See [Support]({{ '/noderoot/support/' | relative_url }}).

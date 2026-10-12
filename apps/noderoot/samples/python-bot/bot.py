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
        ctx.reply(f"⚠️ Warning @{user}: Your message contains prohibited content ({', '.join(matched)}). Please follow the community rules.")
        # Optionally delete the offending message:
        # ctx.delete_message()
    elif text == "!ping":
        ctx.reply("pong from Moderation Bot! 🛡️")
        ctx.react("shield")
    elif text.startswith("!echo "):
        to_echo = text[6:]
        ctx.send_message(f"Echo: {to_echo}")


@bot.on("*")
def handle_all(event, ctx):
    print(f"[ModerationBot] Observed event: {event.get('type')}")


def main():
    # bot-hosting.net and Pterodactyl panels provide PORT or SERVER_PORT
    port = int(os.environ.get("PORT") or os.environ.get("SERVER_PORT") or 5000)
    print(f"[PythonBot] Starting bot server on 0.0.0.0:{port}...")
    bot.run(host="0.0.0.0", port=port)


if __name__ == "__main__":
    main()

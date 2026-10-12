import hmac
import hashlib
import json
import time
from typing import Callable, Dict, List, Optional, Any
from http.server import HTTPServer, BaseHTTPRequestHandler

SIGNATURE_TOLERANCE_SECONDS = 300
SIGNATURE_VERSION = "v1"


def verify_signature(
    secret: str,
    timestamp_header: Optional[str],
    signature_header: Optional[str],
    raw_body: bytes,
    now_seconds: Optional[int] = None,
    tolerance_seconds: int = SIGNATURE_TOLERANCE_SECONDS
) -> tuple[bool, str]:
    if not timestamp_header or not signature_header:
        return False, "missing signature headers"

    try:
        timestamp = int(timestamp_header)
    except ValueError:
        return False, "invalid timestamp"

    if now_seconds is None:
        now_seconds = int(time.time())

    if abs(now_seconds - timestamp) > tolerance_seconds:
        return False, "timestamp outside tolerance"

    data_to_sign = f"{timestamp}.".encode("utf-8") + raw_body
    mac = hmac.new(secret.encode("utf-8"), data_to_sign, hashlib.sha256).hexdigest()
    expected_signature = f"{SIGNATURE_VERSION}={mac}"

    if not hmac.compare_digest(expected_signature, signature_header):
        return False, "signature mismatch"

    return True, ""


class BotContext:
    def __init__(self, event: Dict[str, Any], delivery_id: str, bot_id: str):
        self.event = event
        self.delivery_id = delivery_id
        self.bot_id = bot_id
        self.actions: List[Dict[str, Any]] = []

    def send_message(self, content: str, channel_id: Optional[str] = None) -> "BotContext":
        cid = channel_id or self.event.get("channelId")
        act: Dict[str, Any] = {
            "type": "sendMessage",
            "content": content
        }
        if cid:
            act["channelId"] = cid
        self.actions.append(act)
        return self

    def reply(self, content: str) -> "BotContext":
        msg_id = self.event.get("messageId")
        cid = self.event.get("channelId")
        if not msg_id:
            raise ValueError("Cannot reply: current event lacks messageId")
        act: Dict[str, Any] = {
            "type": "sendMessage",
            "content": content,
            "parentMessageIds": [msg_id]
        }
        if cid:
            act["channelId"] = cid
        self.actions.append(act)
        return self

    def react(self, shortcode: str) -> "BotContext":
        cid = self.event.get("channelId")
        msg_id = self.event.get("messageId")
        if not cid or not msg_id:
            raise ValueError("Cannot react: current event lacks channelId or messageId")
        self.actions.append({
            "type": "addReaction",
            "channelId": cid,
            "messageId": msg_id,
            "shortcode": shortcode
        })
        return self

    def delete_message(self, message_id: Optional[str] = None, channel_id: Optional[str] = None) -> "BotContext":
        cid = channel_id or self.event.get("channelId")
        mid = message_id or self.event.get("messageId")
        if not cid or not mid:
            raise ValueError("Cannot delete message: current event lacks channelId or messageId")
        self.actions.append({
            "type": "deleteMessage",
            "channelId": cid,
            "messageId": mid
        })
        return self


class NodeRootBot:
    def __init__(self, secret: str, dedupe_window_seconds: int = 300):
        self.secret = secret
        self.dedupe_window_seconds = dedupe_window_seconds
        self.handlers: Dict[str, List[Callable[[Dict[str, Any], BotContext], None]]] = {}
        self.seen_deliveries: Dict[str, float] = {}

    def on(self, event_type: str):
        """Decorator to register a handler for an event type."""
        def decorator(fn: Callable[[Dict[str, Any], BotContext], None]):
            if event_type not in self.handlers:
                self.handlers[event_type] = []
            self.handlers[event_type].append(fn)
            return fn
        return decorator

    def process_request(self, raw_body: bytes, headers: Dict[str, str]) -> tuple[int, Dict[str, Any]]:
        # Normalize headers to lowercase
        h = {k.lower(): v for k, v in headers.items()}
        timestamp = h.get("x-noderoot-timestamp")
        signature = h.get("x-noderoot-signature")

        ok, reason = verify_signature(self.secret, timestamp, signature, raw_body)
        if not ok:
            return 401, {"error": reason}

        try:
            envelope = json.loads(raw_body.decode("utf-8"))
        except Exception:
            return 400, {"error": "Invalid JSON"}

        delivery_id = envelope.get("deliveryId")
        now = time.time()
        if self.dedupe_window_seconds > 0 and delivery_id:
            if delivery_id in self.seen_deliveries:
                if now - self.seen_deliveries[delivery_id] < self.dedupe_window_seconds:
                    return 200, {"actions": []}
            self.seen_deliveries[delivery_id] = now
            # prune old
            self.seen_deliveries = {
                k: v for k, v in self.seen_deliveries.items()
                if now - v <= self.dedupe_window_seconds
            }

        event = envelope.get("event", {})
        ctx = BotContext(event, delivery_id or "", envelope.get("botId", ""))
        event_type = event.get("type", "")

        to_call = self.handlers.get(event_type, []) + self.handlers.get("*", [])
        for fn in to_call:
            try:
                fn(event, ctx)
            except Exception as e:
                print(f"[NodeRootBot] Error in handler for {event_type}: {e}")

        return 200, {"actions": ctx.actions}

    def run(self, host: str = "0.0.0.0", port: int = 5000):
        """Runs a built-in HTTPServer."""
        bot_instance = self

        class Handler(BaseHTTPRequestHandler):
            def do_POST(self):
                content_len = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_len)
                status, response_dict = bot_instance.process_request(body, dict(self.headers))
                self.send_response(status)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(response_dict).encode("utf-8"))

            def log_message(self, format, *args):
                try:
                    msg = format % args
                except Exception:
                    msg = " ".join(str(a) for a in args)
                print(f"[NodeRootBot HTTP] {self.address_string()} - {msg}")

        server = HTTPServer((host, port), Handler)
        print(f"[NodeRootBot] Server running on http://{host}:{port}/")
        server.serve_forever()

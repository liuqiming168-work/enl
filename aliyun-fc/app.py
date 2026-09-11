import base64
import hashlib
import hmac
import json
import os
from datetime import datetime, timezone
from email.utils import format_datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlencode


ALLOWED_ORIGIN = "https://liuqiming168-work.github.io"
SERVICE_HOST = "ise-api.xfyun.cn"
SERVICE_PATH = "/v2/open-ise"


class Handler(BaseHTTPRequestHandler):
    def response_headers(self, origin):
        return {
            "Access-Control-Allow-Origin": origin,
            "Cache-Control": "no-store",
            "Content-Type": "application/json; charset=utf-8",
            "Vary": "Origin",
            "X-Content-Type-Options": "nosniff",
        }

    def send_json(self, status, body, origin=ALLOWED_ORIGIN):
        payload = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        for name, value in self.response_headers(origin).items():
            self.send_header(name, value)
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_OPTIONS(self):
        origin = self.headers.get("Origin", "")
        if origin != ALLOWED_ORIGIN:
            self.send_json(403, {"error": "Origin not allowed"})
            return
        self.send_response(204)
        for name, value in self.response_headers(origin).items():
            self.send_header(name, value)
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        origin = self.headers.get("Origin", "")
        if origin != ALLOWED_ORIGIN:
            self.send_json(403, {"error": "Origin not allowed"})
            return

        app_id = os.environ.get("XFYUN_APP_ID")
        api_key = os.environ.get("XFYUN_API_KEY")
        api_secret = os.environ.get("XFYUN_API_SECRET")
        if not app_id or not api_key or not api_secret:
            self.send_json(503, {"error": "iFLYTEK credentials are not configured"}, origin)
            return

        date = format_datetime(datetime.now(timezone.utc), usegmt=True)
        source = f"host: {SERVICE_HOST}\ndate: {date}\nGET {SERVICE_PATH} HTTP/1.1"
        digest = hmac.new(
            api_secret.encode("utf-8"), source.encode("utf-8"), hashlib.sha256
        ).digest()
        signature = base64.b64encode(digest).decode("ascii")
        authorization_source = (
            f'api_key="{api_key}", algorithm="hmac-sha256", '
            f'headers="host date request-line", signature="{signature}"'
        )
        query = urlencode(
            {
                "authorization": base64.b64encode(
                    authorization_source.encode("utf-8")
                ).decode("ascii"),
                "date": date,
                "host": SERVICE_HOST,
            }
        )
        self.send_json(
            200,
            {
                "appId": app_id,
                "url": f"wss://{SERVICE_HOST}{SERVICE_PATH}?{query}",
            },
            origin,
        )


if __name__ == "__main__":
    port = int(os.environ.get("FC_SERVER_PORT", "9000"))
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()

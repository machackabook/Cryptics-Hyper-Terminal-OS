#!/usr/bin/env python3
"""Read-only GAIA node discovery API. Python standard library only."""
import json
import os
import secrets
import stat
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path.home() / ".local/share/gaia-node"
IDENTITY = ROOT / "state" / "node.json"
HOST = "127.0.0.1"
PORT = int(os.environ.get("GAIA_NODE_PORT", "43188"))
TOKEN_FILE = ROOT / "state" / "node-api-token"
ALLOWED_ORIGINS = {
    "http://127.0.0.1:3000", "http://localhost:3000",
    "http://127.0.0.1:43188", "http://localhost:43188",
}

def get_token():
    TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not TOKEN_FILE.exists():
        fd = os.open(str(TOKEN_FILE), os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, "w") as stream:
            stream.write(secrets.token_urlsafe(32))
    TOKEN_FILE.chmod(stat.S_IRUSR | stat.S_IWUSR)
    return TOKEN_FILE.read_text().strip()

TOKEN = get_token()

class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        origin = self.headers.get("Origin", "")
        if origin not in ALLOWED_ORIGINS:
            self.send_error(403)
            return
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Vary", "Origin")
        self.end_headers()

    def do_GET(self):
        origin = self.headers.get("Origin")
        if origin and origin not in ALLOWED_ORIGINS:
            self.send_error(403)
            return
        auth = self.headers.get("Authorization", "")
        if not secrets.compare_digest(auth, "Bearer " + TOKEN):
            self.send_error(401)
            return
        if self.path == "/health":
            body = {"ok": True, "service": "gaia-node", "status": "ready"}
        elif self.path == "/node":
            if not IDENTITY.exists():
                self.send_error(503, "Node identity missing")
                return
            data = json.loads(IDENTITY.read_text())
            body = {k: data.get(k) for k in ("node_id", "hostname", "architecture", "runtime", "status")}
        elif self.path == "/capabilities":
            body = {"capabilities": ["node.discovery", "drive.artifact.sync"], "execution_enabled": False}
        else:
            self.send_error(404)
            return
        data = json.dumps(body).encode()
        self.send_response(200)
        if origin:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

if __name__ == "__main__":
    print(f"GAIA node discovery listening on http://{HOST}:{PORT}; bearer token stored locally", flush=True)
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()

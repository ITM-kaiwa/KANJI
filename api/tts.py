"""
Vercel Python Serverless Function: text-to-speech via edge-tts.

Deployed automatically by Vercel because this file lives at /api/tts.py and
a requirements.txt exists at the project root (see ../requirements.txt).

Usage from the frontend (see src/components/SpeakButton.tsx):
  GET /api/tts?text=日&voice=ja-JP-NanamiNeural   -> audio/mpeg bytes
  POST /api/tts  { "text": "日", "voice": "ja-JP-NanamiNeural" }
"""

from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import asyncio
import json

import edge_tts

DEFAULT_VOICE = "ja-JP-NanamiNeural"
MAX_TEXT_LENGTH = 200


class handler(BaseHTTPRequestHandler):
    def _send_cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _send_json_error(self, status: int, message: str) -> None:
        self.send_response(status)
        self._send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps({"error": message}).encode("utf-8"))

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self) -> None:
        query = parse_qs(urlparse(self.path).query)
        text = (query.get("text") or [""])[0]
        voice = (query.get("voice") or [DEFAULT_VOICE])[0]
        self._synthesize_and_respond(text, voice)

    def do_POST(self) -> None:
        length = int(self.headers.get("Content-Length", 0) or 0)
        raw_body = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(raw_body or b"{}")
        except json.JSONDecodeError:
            payload = {}
        text = payload.get("text", "")
        voice = payload.get("voice", DEFAULT_VOICE)
        self._synthesize_and_respond(text, voice)

    def _synthesize_and_respond(self, text: str, voice: str) -> None:
        text = (text or "").strip()
        voice = (voice or DEFAULT_VOICE).strip()

        if not text:
            self._send_json_error(400, "Missing 'text' parameter")
            return
        if len(text) > MAX_TEXT_LENGTH:
            self._send_json_error(400, f"'text' too long (max {MAX_TEXT_LENGTH} chars)")
            return

        try:
            audio_bytes = asyncio.run(_generate_audio(text, voice))
        except Exception as exc:  # noqa: BLE001 - surface any TTS failure as JSON
            self._send_json_error(500, f"TTS generation failed: {exc}")
            return

        if not audio_bytes:
            self._send_json_error(500, "TTS produced no audio")
            return

        self.send_response(200)
        self._send_cors_headers()
        self.send_header("Content-Type", "audio/mpeg")
        self.send_header("Cache-Control", "public, max-age=86400, immutable")
        self.end_headers()
        self.wfile.write(audio_bytes)


async def _generate_audio(text: str, voice: str) -> bytes:
    communicate = edge_tts.Communicate(text, voice)
    audio_chunks = bytearray()
    async for chunk in communicate.stream():
        if chunk.get("type") == "audio":
            audio_chunks.extend(chunk["data"])
    return bytes(audio_chunks)

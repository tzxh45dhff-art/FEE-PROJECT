#!/usr/bin/env bash
#
# sync — start the backend + ngrok tunnel in one command.
#
# Usage:
#   npm run sync          (from the project root)
#   ./scripts/sync.sh     (directly)
#
# Starts the Express server on port 4000, waits for it to be ready, then
# opens an ngrok tunnel and prints the public URL. Ctrl-C kills both.

set -euo pipefail

PORT="${PORT:-4000}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cleanup() {
  echo ""
  echo "⏹  Shutting down…"
  kill 0 2>/dev/null
  wait 2>/dev/null
}
trap cleanup EXIT INT TERM

# ── 1. Start the backend server ──────────────────────────────────────────────
echo "🚀 Starting backend server on port $PORT…"
npm --prefix "$ROOT/server" run dev &

# Wait until the server is accepting connections
echo -n "⏳ Waiting for server"
for i in $(seq 1 30); do
  if curl -sf "http://localhost:$PORT/api" >/dev/null 2>&1; then
    echo " ✓"
    break
  fi
  echo -n "."
  sleep 1
  if [ "$i" -eq 30 ]; then
    echo ""
    echo "❌ Server didn't start within 30 s. Check server logs above."
    exit 1
  fi
done

# ── 2. Start ngrok ──────────────────────────────────────────────────────────
NGROK_DOMAIN="nimbly-unroasted-gaffe.ngrok-free.dev"
echo "🌐 Starting ngrok tunnel on $NGROK_DOMAIN…"
ngrok http "$PORT" --url="$NGROK_DOMAIN" --log=stdout > /tmp/ngrok-sync.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to expose the URL
sleep 3
NGROK_URL=""
for i in $(seq 1 10); do
  NGROK_URL=$(curl -sf http://localhost:4040/api/tunnels 2>/dev/null \
    | grep -o '"public_url":"https://[^"]*"' \
    | head -1 \
    | cut -d'"' -f4) || true
  if [ -n "$NGROK_URL" ]; then
    break
  fi
  sleep 1
done

if [ -z "$NGROK_URL" ]; then
  echo "❌ Could not get ngrok URL. Is ngrok authenticated?"
  echo "   Run: ngrok config add-authtoken <YOUR_TOKEN>"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Backend:  http://localhost:$PORT"
echo "  🌍 Tunnel:   $NGROK_URL"
echo ""
echo "  Set this in Vercel → Environment Variables:"
echo "    VITE_API_URL = $NGROK_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl-C to stop both."
echo ""

# Keep running until Ctrl-C
wait

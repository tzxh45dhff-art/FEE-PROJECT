#!/usr/bin/env bash
#
# sync - start the backend + ngrok tunnel in one command.
#
# Usage:
#   npm run sync
#   ./scripts/sync.sh
#

PORT=4000
# $0 is the symlink (~/.local/bin/sync) when run as a bare global command —
# resolve it to the real script before walking up to the project root, or
# ROOT ends up pointing at ~/.local instead of the repo.
SELF="$0"
while [ -L "$SELF" ]; do
  LINK="$(readlink "$SELF")"
  case "$LINK" in
    /*) SELF="$LINK" ;;
    *) SELF="$(dirname "$SELF")/$LINK" ;;
  esac
done
ROOT="$(cd "$(dirname "$SELF")/.." && pwd)"
NGROK_DOMAIN="letter-fiction-fog.ngrok-free.dev"

CLEANED=0
cleanup() {
  [ "$CLEANED" = 1 ] && return
  CLEANED=1
  trap - EXIT INT TERM
  echo ""
  echo "Shutting down..."
  kill 0 2>/dev/null
  wait 2>/dev/null
}
trap cleanup EXIT INT TERM

# Start the backend server
echo "Starting backend server on port $PORT..."
npm --prefix "$ROOT/server" run dev &

# Wait for server to be ready
echo "Waiting for server..."
sleep 4

# Start ngrok with static domain
echo "Starting ngrok tunnel on $NGROK_DOMAIN..."
ngrok http "$PORT" --url="$NGROK_DOMAIN" --log=stdout > /tmp/ngrok-sync.log 2>&1 &

sleep 3

echo ""
echo "======================================================"
echo "  Backend:  http://localhost:$PORT"
echo "  Tunnel:   https://$NGROK_DOMAIN"
echo ""
echo "  Set in Vercel Environment Variables:"
echo "    VITE_API_URL = https://$NGROK_DOMAIN"
echo "======================================================"
echo ""
echo "Press Ctrl-C to stop both."
echo ""

wait

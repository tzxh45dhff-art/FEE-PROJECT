#!/usr/bin/env bash
#
# Huddle API — one command to run it around the clock on a Linux machine.
#
#   ./start-server.sh            start everything, keep it running until Ctrl+C
#   ./start-server.sh --no-tunnel   the API only, without ngrok
#
# What it does, in order, every time:
#
#   1. Checks the machine: Linux, a .env next to this file, curl, openssl.
#   2. Makes sure Node 22 is available. If the system has no suitable Node, it
#      downloads the official build into ./.runtime — no sudo, nothing installed
#      system-wide, nothing added to your shell profile.
#   3. Makes sure ngrok is available, the same way, and that it has your
#      authtoken. The first run asks for the token once; ngrok stores it in its
#      own config (~/.config/ngrok), not in this folder.
#   4. Installs the server's dependencies if they are missing or were built for
#      another machine. A node_modules folder copied over from a Mac contains
#      macOS binaries (Prisma's query engine among them) that cannot run here,
#      so this detects that and rebuilds rather than failing at the first query.
#   5. Backs up the database, applies the schema, builds the server, and
#      builds the code judge's Docker image if Docker is available.
#   6. Starts the API and the tunnel and watches both. Either one dying is
#      restarted after a short pause; the API is also health-checked, so a
#      process that is alive but stuck gets restarted too.
#   7. Asks the system not to suspend while it runs — including on closing the
#      lid — so a laptop can serve all day.
#
# Logs go to ./logs. Everything this script downloads goes to ./.runtime.

set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

RUNTIME="$ROOT/.runtime"
export NPM_CONFIG_UPDATE_NOTIFIER=false NPM_CONFIG_FUND=false NPM_CONFIG_AUDIT=false
LOGS="$ROOT/logs"
BACKUPS="$ROOT/backups"
mkdir -p "$RUNTIME/bin" "$LOGS" "$BACKUPS"
export PATH="$RUNTIME/shim:$RUNTIME/node/bin:$RUNTIME/bin:$PATH"

NO_TUNNEL=0
for arg in "$@"; do
  case "$arg" in
    --no-tunnel) NO_TUNNEL=1 ;;
    -h|--help) sed -n '2,32p' "$0"; exit 0 ;;
    *) echo "Unknown option: $arg (try --help)"; exit 2 ;;
  esac
done

# ── output ───────────────────────────────────────────────────────────────────
if [[ -t 1 ]]; then B=$'\e[1m'; D=$'\e[2m'; R=$'\e[31m'; G=$'\e[32m'; Y=$'\e[33m'; N=$'\e[0m'; else B= D= R= G= Y= N=; fi
say()  { printf '%s\n' "${B}▸${N} $*"; }
ok()   { printf '%s\n' "  ${G}✓${N} $*"; }
warn() { printf '%s\n' "  ${Y}!${N} $*"; }
die()  { printf '%s\n' "  ${R}✗ $*${N}" >&2; exit 1; }
stamp() { date '+%Y-%m-%d %H:%M:%S'; }

# Read one value out of .env without executing the file — it holds secrets and
# arbitrary text, and sourcing it would run any of that as shell.
env_get() {
  local key="$1" line
  line="$(grep -E "^[[:space:]]*${key}=" .env 2>/dev/null | tail -n 1 || true)"
  line="${line#*=}"
  line="${line%\"}"; line="${line#\"}"
  line="${line%\'}"; line="${line#\'}"
  printf '%s' "$line"
}

# ── 0. stay awake ────────────────────────────────────────────────────────────
# Re-run ourselves under systemd-inhibit, which holds off sleep, idle suspend
# and the lid switch for exactly as long as this script runs. No sudo needed
# for a local user, and it lets go the moment the script stops.
if [[ -z "${HUDDLE_INHIBITED:-}" ]] && command -v systemd-inhibit >/dev/null 2>&1; then
  export HUDDLE_INHIBITED=1
  if systemd-inhibit --who="Huddle server" --why="Serving Huddle rooms" \
       --what="sleep:idle:handle-lid-switch" --mode=block true >/dev/null 2>&1; then
    exec systemd-inhibit --who="Huddle server" --why="Serving Huddle rooms" \
      --what="sleep:idle:handle-lid-switch" --mode=block "$0" "$@"
  fi
fi

echo
say "${B}Huddle API${N}  ${D}$(stamp)${N}"

# ── 1. preflight ─────────────────────────────────────────────────────────────
say "Checking this machine"
OS="$(uname -s)"
case "$(uname -m)" in
  x86_64|amd64) ARCH=x64; NGROK_ARCH=amd64 ;;
  aarch64|arm64) ARCH=arm64; NGROK_ARCH=arm64 ;;
  *) die "Unsupported CPU: $(uname -m)" ;;
esac
[[ "$OS" == "Linux" ]] && ok "Linux $(uname -r), $ARCH" || warn "This script is written for Linux; running on $OS ($ARCH) anyway"

[[ -f .env ]] || die ".env is missing. Copy it over from the Mac along with this folder — it holds the database path, the allowed origins and every API key."
ok ".env found"

for tool in curl tar; do
  command -v "$tool" >/dev/null 2>&1 || die "$tool is not installed. On Ubuntu/Debian: sudo apt install -y $tool"
done
if [[ "$OS" == "Linux" ]] && ! command -v openssl >/dev/null 2>&1; then
  die "openssl is not installed, and the database driver needs it. On Ubuntu/Debian: sudo apt install -y openssl"
fi
ok "curl, tar$([[ "$OS" == Linux ]] && echo ", openssl")"

# An exported PORT wins over .env, matching how the server itself reads it.
PORT="${PORT:-$(env_get PORT)}"; PORT="${PORT:-4000}"; export PORT

# ── 2. node ──────────────────────────────────────────────────────────────────
# process.loadEnvFile, which the server uses to read .env, arrived in 20.12.
node_ok() {
  command -v node >/dev/null 2>&1 || return 1
  node -e 'const [a,b]=process.versions.node.split(".").map(Number); process.exit(a>20||(a===20&&b>=12)?0:1)' 2>/dev/null
}
say "Node.js"
if ! node_ok; then
  [[ "$OS" == "Linux" ]] || die "Node 20.12 or newer is required."
  warn "No suitable Node on this machine — fetching Node 22 into .runtime/node"
  base="https://nodejs.org/dist/latest-v22.x"
  file="$(curl -fsSL "$base/SHASUMS256.txt" | awk '{print $2}' | grep -E "^node-v22\.[0-9.]+-linux-${ARCH}\.tar\.xz$" | head -n 1)"
  [[ -n "$file" ]] || die "Could not find a Node 22 build for linux-$ARCH at $base"
  sum="$(curl -fsSL "$base/SHASUMS256.txt" | awk -v f="$file" '$2==f {print $1}')"
  curl -fSL --progress-bar "$base/$file" -o "$RUNTIME/$file"
  echo "$sum  $RUNTIME/$file" | sha256sum -c --quiet - || die "Node download failed its checksum"
  command -v xz >/dev/null 2>&1 || die "xz is needed to unpack Node. On Ubuntu/Debian: sudo apt install -y xz-utils"
  rm -rf "$RUNTIME/node"; mkdir -p "$RUNTIME/node"
  tar -xJf "$RUNTIME/$file" -C "$RUNTIME/node" --strip-components=1
  rm -f "$RUNTIME/$file"
  hash -r
  node_ok || die "Node was downloaded but does not run"
fi
# npm and npx ship as symlinks, and some filesystems (FAT/exFAT USB sticks,
# certain shared folders) turn a symlink into an empty file. Plain wrapper
# scripts work everywhere, so fall back to those if npm will not run.
if ! npm --version >/dev/null 2>&1; then
  cli="$(dirname "$(dirname "$(command -v node)")")/lib/node_modules/npm/bin"
  [[ -f "$cli/npm-cli.js" ]] || die "npm is missing from this Node install"
  mkdir -p "$RUNTIME/shim"
  printf '#!/bin/sh\nexec node "%s/npm-cli.js" "$@"\n' "$cli" > "$RUNTIME/shim/npm"
  printf '#!/bin/sh\nexec node "%s/npx-cli.js" "$@"\n' "$cli" > "$RUNTIME/shim/npx"
  chmod +x "$RUNTIME/shim/npm" "$RUNTIME/shim/npx"
  hash -r
fi
ok "node $(node --version), npm $(npm --version)"

# ── 3. ngrok ─────────────────────────────────────────────────────────────────
NGROK_DOMAIN="$(env_get NGROK_DOMAIN)"
NGROK_DOMAIN="${NGROK_DOMAIN:-letter-fiction-fog.ngrok-free.dev}"
if [[ "$NO_TUNNEL" == 0 ]]; then
  say "ngrok"
  if ! command -v ngrok >/dev/null 2>&1; then
    [[ "$OS" == "Linux" ]] || die "ngrok is not installed"
    warn "ngrok not found — fetching it into .runtime/bin"
    curl -fSL --progress-bar "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-${NGROK_ARCH}.tgz" -o "$RUNTIME/ngrok.tgz"
    tar -xzf "$RUNTIME/ngrok.tgz" -C "$RUNTIME/bin"
    rm -f "$RUNTIME/ngrok.tgz"
    hash -r
  fi
  ok "$(ngrok version 2>/dev/null | head -n 1)"

  # A token in .env (NGROK_AUTHTOKEN) wins; otherwise use whatever ngrok has
  # stored; otherwise ask once. The token is handed to ngrok's own config and
  # never written into this folder.
  token_env="${NGROK_AUTHTOKEN:-$(env_get NGROK_AUTHTOKEN)}"
  if [[ -n "$token_env" ]]; then
    ngrok config add-authtoken "$token_env" >/dev/null
    ok "authtoken taken from .env"
  elif ngrok config check >/dev/null 2>&1 && grep -qsE '^\s*authtoken:\s*\S' \
         "${XDG_CONFIG_HOME:-$HOME/.config}/ngrok/ngrok.yml" "$HOME/.ngrok2/ngrok.yml" "$HOME/Library/Application Support/ngrok/ngrok.yml"; then
    ok "authtoken already configured"
  elif [[ -t 0 ]]; then
    echo
    echo "    ngrok needs your authtoken once. Find it at:"
    echo "    https://dashboard.ngrok.com/get-started/your-authtoken"
    read -r -s -p "    Paste it here (input is hidden): " token; echo
    [[ -n "$token" ]] || die "No token entered"
    ngrok config add-authtoken "$token" >/dev/null || die "ngrok rejected that token"
    ok "authtoken saved to ngrok's config"
  else
    die "ngrok has no authtoken. Run this script once in a terminal so it can ask, or put NGROK_AUTHTOKEN=… in .env"
  fi
  ok "domain: $NGROK_DOMAIN"
fi

# ── 4. dependencies ──────────────────────────────────────────────────────────
# Stamped with the platform and Node they were built for. A folder copied from
# the Mac carries macOS binaries, which is the one thing guaranteed to break.
say "Dependencies"
# The lockfile is part of the stamp, so a pull that adds or updates a package
# reinstalls instead of starting with it missing.
lock_hash="$(sha256sum package-lock.json | cut -c1-12)"
want_stamp="$OS-$(uname -m)-node$(node -p 'process.versions.modules')-lock$lock_hash"
have_stamp="$(cat node_modules/.huddle-platform 2>/dev/null || true)"
if [[ ! -d node_modules || "$have_stamp" != "$want_stamp" ]]; then
  [[ -d node_modules ]] && warn "packages changed or were built for another machine — reinstalling"
  npm ci --no-audit --no-fund --loglevel=error
  echo "$want_stamp" > node_modules/.huddle-platform
fi
npx --no-install prisma generate >/dev/null 2>&1 || die "prisma generate failed — run: npx prisma generate"
ok "installed for $want_stamp"

# ── 5. database and build ────────────────────────────────────────────────────
say "Database"
db_url="$(env_get DATABASE_URL)"
if [[ "$db_url" == file:* ]]; then
  db_path="${db_url#file:}"
  [[ "$db_path" = /* ]] || db_path="$ROOT/prisma/${db_path#./}"
  if [[ -f "$db_path" ]]; then
    cp "$db_path" "$BACKUPS/$(basename "$db_path" .db)-$(date +%Y%m%d-%H%M%S).db"
    # Keep the newest ten.
    ls -1t "$BACKUPS"/*.db 2>/dev/null | tail -n +11 | xargs -r rm -f
    ok "backed up $(basename "$db_path") ($(du -h "$db_path" | cut -f1))"
  else
    warn "no database yet at $db_path — a new one will be created"
  fi
fi
# Never --accept-data-loss. If the schema would drop data this stops and says
# so, and the backup above is the way back; it does not get to decide that alone.
if ! npx --no-install prisma db push --skip-generate >"$LOGS/prisma.log" 2>&1; then
  tail -n 15 "$LOGS/prisma.log" >&2
  die "The database schema could not be applied (see logs/prisma.log). Nothing was changed."
fi
ok "schema up to date"

say "Build"
npm run --silent build >"$LOGS/build.log" 2>&1 || { tail -n 20 "$LOGS/build.log" >&2; die "TypeScript build failed (see logs/build.log)"; }
ok "dist/ built"

# ── the code judge ───────────────────────────────────────────────────────────
# Java, C++, C, Python and Node run on this machine in throwaway, locked-down
# containers built from ./judge — about a second a submission, against half a
# minute on the public judge. Optional: without Docker, the public judge is
# used as before. The image is rebuilt only when ./judge changes.
say "Code judge"
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  judge_hash="$(cat judge/Dockerfile judge/run.py | sha256sum | cut -c1-12)"
  if [[ "$(docker image inspect huddle-judge --format '{{ index .Config.Labels "huddle.hash" }}' 2>/dev/null)" != "$judge_hash" ]]; then
    warn "building the judge image (first time takes a few minutes)"
    docker build -q -t huddle-judge --label "huddle.hash=$judge_hash" judge >"$LOGS/judge-build.log" 2>&1 \
      || { tail -n 15 "$LOGS/judge-build.log" >&2; die "The judge image did not build (see logs/judge-build.log)"; }
  fi
  export JUDGE_DOCKER_IMAGE="${JUDGE_DOCKER_IMAGE:-huddle-judge}"
  ok "local judge ready ($JUDGE_DOCKER_IMAGE)"
elif command -v docker >/dev/null 2>&1; then
  warn "Docker is installed but not usable by $(whoami) — add yourself to the docker group (sudo usermod -aG docker $(whoami)) and log in again. Using the public judge."
else
  warn "no Docker — Java and C++ use the public judge (slow). Install Docker to run them here."
fi

# ── 6. run and watch ─────────────────────────────────────────────────────────
health() { curl -fsS -m 4 "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1; }

if health; then
  die "Something is already answering on port $PORT. Stop it first (or change PORT in .env)."
fi

API_PID=""; TUNNEL_PID=""; STOPPING=0

start_api() {
  echo "── $(stamp) starting API" >>"$LOGS/api.log"
  NODE_ENV=production node dist/server.js >>"$LOGS/api.log" 2>&1 &
  API_PID=$!
}
start_tunnel() {
  echo "── $(stamp) starting tunnel" >>"$LOGS/ngrok.log"
  ngrok http "$PORT" --url="$NGROK_DOMAIN" --log=stdout --log-format=logfmt >>"$LOGS/ngrok.log" 2>&1 &
  TUNNEL_PID=$!
}
stop_all() {
  STOPPING=1
  echo
  say "Stopping"
  [[ -n "$TUNNEL_PID" ]] && kill "$TUNNEL_PID" 2>/dev/null || true
  [[ -n "$API_PID" ]] && kill "$API_PID" 2>/dev/null || true
  wait 2>/dev/null || true
  ok "stopped cleanly at $(stamp)"
  exit 0
}
trap stop_all INT TERM

say "Starting"
start_api
for _ in $(seq 1 60); do health && break; sleep 0.5; done
health || { tail -n 25 "$LOGS/api.log" >&2; die "The API did not come up (see logs/api.log)"; }
ok "API on http://127.0.0.1:$PORT"

PUBLIC=""
if [[ "$NO_TUNNEL" == 0 ]]; then
  start_tunnel
  PUBLIC="https://$NGROK_DOMAIN"
  for _ in $(seq 1 40); do
    curl -fsS -m 5 -H 'ngrok-skip-browser-warning: 1' "$PUBLIC/api/health" >/dev/null 2>&1 && break
    kill -0 "$TUNNEL_PID" 2>/dev/null || break
    sleep 1
  done
  if curl -fsS -m 5 -H 'ngrok-skip-browser-warning: 1' "$PUBLIC/api/health" >/dev/null 2>&1; then
    ok "tunnel live at $PUBLIC"
  else
    if grep -q "ERR_NGROK_105\|ERR_NGROK_107\|authentication failed" "$LOGS/ngrok.log" 2>/dev/null; then
      warn "ngrok rejected the authtoken. Copy a fresh one from https://dashboard.ngrok.com/get-started/your-authtoken"
      warn "then run:  .runtime/bin/ngrok config add-authtoken <token>   (or ngrok config add-authtoken <token>)"
    elif grep -q "ERR_NGROK_334\|already online" "$LOGS/ngrok.log" 2>/dev/null; then
      warn "That domain is already in use — another ngrok (probably the Mac's) still has it. Stop that one; this will keep retrying."
    else
      warn "The tunnel did not come up yet — this will keep retrying (see logs/ngrok.log)"
    fi
  fi
fi

APP="$(env_get HUDDLE_APP)"; APP="${APP:-https://huddle-sync.vercel.app}"
echo
echo "  ${B}Running.${N} Leave this terminal open; Ctrl+C stops everything."
[[ -n "$PUBLIC" ]] && echo "  Open the app with:  ${B}$APP/?api=$PUBLIC${N}"
echo "  Logs:               $LOGS/api.log, $LOGS/ngrok.log"
echo

# Watch both. A dead process restarts after a pause that grows if it keeps
# dying, so a broken config does not spin the CPU; the API is also restarted
# if it stops answering health checks while still alive.
api_backoff=2; tunnel_backoff=2; misses=0
while [[ "$STOPPING" == 0 ]]; do
  sleep 5 & wait $! || true

  if ! kill -0 "$API_PID" 2>/dev/null; then
    warn "$(stamp) API exited — restarting in ${api_backoff}s"
    sleep "$api_backoff"; api_backoff=$(( api_backoff < 60 ? api_backoff * 2 : 60 ))
    start_api; misses=0
    continue
  fi

  if health; then
    misses=0; api_backoff=2
  else
    misses=$((misses + 1))
    if (( misses >= 6 )); then
      warn "$(stamp) API stopped answering for 30s — restarting it"
      kill "$API_PID" 2>/dev/null || true; sleep 2; kill -9 "$API_PID" 2>/dev/null || true
      wait "$API_PID" 2>/dev/null || true
      start_api; misses=0
    fi
  fi

  if [[ "$NO_TUNNEL" == 0 ]] && ! kill -0 "$TUNNEL_PID" 2>/dev/null; then
    warn "$(stamp) tunnel exited — restarting in ${tunnel_backoff}s"
    sleep "$tunnel_backoff"; tunnel_backoff=$(( tunnel_backoff < 120 ? tunnel_backoff * 2 : 120 ))
    start_tunnel
  elif [[ "$NO_TUNNEL" == 0 ]]; then
    tunnel_backoff=2
  fi
done

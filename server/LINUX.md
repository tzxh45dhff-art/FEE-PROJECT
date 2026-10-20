# Moving the server to the Linux laptop

Five minutes, once. After that it's one command.

## 1. On the Mac — stop it, then copy

1. **Stop the Mac's server and ngrok first.** Ctrl+C in both terminals. Two
   reasons: copying the database while the server is writing to it can copy a
   half-written file, and the ngrok domain can only be online in one place at a
   time — the Linux one won't connect while the Mac still holds it.
2. Copy the whole **`server`** folder to the Linux laptop (USB stick, `scp`,
   drag and drop — anything). Include everything; in particular:
   - **`.env`** — every key, the allowed origins, the database path.
     It's hidden in Finder; press **⌘⇧.** to show it before dragging.
   - **`prisma/dev.db`** — all users, rooms and history.
   - **`uploads/`** — uploaded videos and music.

   `node_modules` can come along or not — the script notices it was built for
   macOS and rebuilds it.

## 2. On Linux — run it

```bash
cd server
./start-server.sh
```

The first run takes a few minutes. It downloads Node 22 and ngrok into
`server/.runtime` if the machine doesn't have them (no sudo, nothing installed
system-wide), installs dependencies, backs up the database and starts.

It asks for your **ngrok authtoken** once — get it from
<https://dashboard.ngrok.com/get-started/your-authtoken>. ngrok stores it in its
own config; it never goes in this folder.

When it's up you'll see:

```
  Running. Leave this terminal open; Ctrl+C stops everything.
  Open the app with:  https://huddle-sync.vercel.app/?api=https://letter-fiction-fog.ngrok-free.dev
```

The address is the same reserved domain the Mac used, so **nothing changes for
anyone** — the app, the extension and links already shared keep working.

## Keeping it up

- **It restarts itself.** If the API crashes or stops answering, or the tunnel
  drops, it comes back on its own within seconds.
- **Lid closed is fine.** While the script runs it asks the system not to
  suspend, including on closing the lid. Keep it plugged in.
- **Closing the terminal stops it.** To keep it running after you close the
  terminal or log out, run it inside `tmux`:
  ```bash
  sudo apt install -y tmux     # once
  tmux new -s huddle ./start-server.sh
  # detach with Ctrl+B then D; come back with: tmux attach -t huddle
  ```
- **Logs:** `server/logs/api.log` and `server/logs/ngrok.log`.
- **Backups:** every start saves a copy of the database to `server/backups/`
  (newest ten kept).

## If something goes wrong

| It says | Do this |
|---|---|
| `.env is missing` | Copy `.env` from the Mac's `server/` folder (hidden file). |
| `openssl is not installed` | `sudo apt install -y openssl` |
| `xz is needed to unpack Node` | `sudo apt install -y xz-utils` |
| `That domain is already in use` | The Mac's ngrok is still running. Stop it; the Linux side retries on its own. |
| `Something is already answering on port 4000` | An old copy is still running. `pkill -f dist/server.js` |
| `The database schema could not be applied` | Nothing was changed. Send `logs/prisma.log` over. The latest backup is in `backups/`. |

## Options

- `./start-server.sh --no-tunnel` — the API only, no ngrok.
- In `.env`: `NGROK_DOMAIN=…` to use a different reserved domain,
  `NGROK_AUTHTOKEN=…` to skip the prompt, `PORT=…` to move off 4000.

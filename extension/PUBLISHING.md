# Publishing, so nobody has to sideload

The zip-and-developer-mode routine is not a shortcut anybody chose. It is what
Chrome allows for an extension that is not in its store, and everything about
it that feels unprofessional — the folder that must not move, the developer
mode prompt on every restart, a person having to be *told* there is a new
version — is a consequence of that one fact.

There is exactly one way out on Chrome, and it is the Web Store:

| | Sideloaded (today) | Web Store |
|---|---|---|
| Install | download, unzip, developer mode, load unpacked | one click |
| Update | tell everyone, they repeat the above | automatic, within hours |
| Folder | must stay put forever | irrelevant |
| Restart | "disable developer mode extensions" every time | nothing |

**Self-hosting is not a third option.** Chrome removed `.crx` auto-update for
Windows and macOS in 2014; what remains works only through enterprise policy,
which means a registry key or a managed plist on every machine. That is further
from professional, not closer.

## What only you can do

Three things need a person with a Google account and a card:

1. **Register as a developer** — one-time **$5** at
   [chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole).
2. **Upload and submit.** Review is usually hours to a few days.
3. **Choose the visibility.** **Unlisted** is almost certainly what you want:
   anybody with the link can install it, but it does not appear in search and
   is not presented to the public. Same one-click install, same auto-updates.

Everything else is done and waiting.

## Build the upload

```bash
node extension/scripts/package.mjs --store
```

Writes `extension/dist/huddle-store-<version>.zip`. This is **not** the same
file the app hands out. The store build has `key` removed, because that field
is how a sideloaded copy pins an id for itself and the store assigns its own —
which also means **the published extension will have a different id** from the
sideloaded one, and there is no way to know it in advance.

## After it is approved, two settings

1. **Add the new id to the API.** Copy the id from the listing and add it to
   `CLIENT_ORIGIN` in `server/.env`, then **restart the server** — that file is
   read once at startup:

   ```
   CLIENT_ORIGIN=...,chrome-extension://<the new id>
   ```

2. **Point the app at the listing.** Set this on the Vercel project and
   redeploy:

   ```
   VITE_EXTENSION_STORE_URL=https://chromewebstore.google.com/detail/<id>
   ```

   The Watch tab switches on its own: the download and its four steps become a
   single **Add to Chrome** button, and the out-of-date notice stops telling
   people to re-download because Chrome will have handled it.

Keep the sideloaded id in `CLIENT_ORIGIN` too until everyone has moved over.
Both work at once.

## Listing copy

**Name** — `Huddle — Watch Together`

**Summary** (132 char limit)

> Keep a Netflix or Prime Video tab at the same moment as everyone else in your
> Huddle room. Everyone uses their own subscription.

**Description**

> Huddle holds your Netflix or Prime Video tab to the same moment as everyone
> else watching with you.
>
> Play, pause and seek travel both ways — anyone can act, and everyone follows.
> Small differences are closed by playing imperceptibly faster or slower rather
> than by jumping, so the picture stays smooth.
>
> Everyone watches on their own subscription, in their own browser. Nothing is
> relayed, mirrored or re-streamed, and no login is shared. What travels between
> you is a timestamp and a play/pause flag — nothing else.
>
> Requires a Huddle room. Open one in a tab and the extension configures itself.

**Category** — Entertainment. **Language** — English.

## What the review will ask

It asks you to justify each permission in your own words. These are accurate:

- **`storage`** — "Stores the API address, the room, and the extension's own
  session token, so the user does not have to enter them by hand."
- **Host permissions** — "The extension reads the playback clock of the tab the
  user is already watching (netflix.com, primevideo.com, amazon.com/gp/video)
  and connects to the user's own Huddle server, whose address is chosen by the
  user and therefore not known in advance."
- **Single purpose** — "Synchronising playback position between people watching
  the same title in a shared room."
- **Remote code** — **No.** Everything, including the socket.io client, is in
  the package.
- **Data use** — the extension collects nothing. It transmits a playback
  position and a play/pause state to the user's own server. Tick nothing on the
  data-collection form, and do check the three certifications at the bottom.

### The one thing likely to come back

`host_permissions` is `*://*/*`. That is genuinely needed — the Huddle server's
address is whatever the person running it chose, so it cannot be listed ahead
of time — but a reviewer seeing it on an extension that names three sites will
sometimes push back.

If it does, the narrower shape is to declare the three streaming sites plus the
app origins, and move `*://*/*` to `optional_host_permissions`, requested from
the popup when a server is configured. That is a real change to how the
extension gets its permission, so it wants testing in a real Chrome before it
is submitted — not blind, and not while the current build is working. Ask and
I will do it that way round.

## Firefox and Edge

Both take the same package almost unchanged. Edge's Partner Center accepts the
Chrome zip as-is and is free. Firefox needs `browser_specific_settings` and its
own review at addons.mozilla.org, also free. Neither is done here; say the word.

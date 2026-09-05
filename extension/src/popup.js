const $ = (id) => document.getElementById(id)

/**
 * What the extension is doing, and — when it is not working — why.
 *
 * The popup used to print the worker's raw status and, underneath it, a
 * permanent "add this origin to CLIENT_ORIGIN" note. That note was correct
 * advice back when Chrome assigned every install its own id, and it is
 * actively misleading now that the id is pinned and allowed before anybody
 * installs anything: it reads as the thing to go and fix, so the actual cause
 * goes unread. It cost a real debugging session, on a server that was simply
 * running older config than its own .env file.
 *
 * So each state now says what it means and what to do about it, and the origin
 * note appears only in the one case where it is genuinely the answer.
 */
function explain(state) {
  const status = state.status ?? 'idle'
  const server = state.config?.server

  if (status === 'connected') return null

  if (status === 'idle' || status === 'not configured') {
    return {
      why: 'Nothing to connect to yet. Open your Huddle room in a tab — this reads the API, the room and a token of its own from that page. Nothing to type.',
    }
  }

  if (status === 'connecting') {
    return { why: `Reaching ${server ?? 'the server'}…` }
  }

  if (status.startsWith('refused')) {
    /*
     * The one case where the origin is worth showing. Two causes reach here
     * and they are worth separating, because the fix is different: the server
     * not allowing this origin, and the server not being up at all.
     */
    return {
      why: `The server at ${server ?? 'that address'} refused the connection.`,
      origin: true,
    }
  }

  if (status === 'disconnected') {
    return {
      why: `Lost the connection to ${server ?? 'the server'}. It reconnects on its own if the server comes back.`,
    }
  }

  return { why: null }
}

async function paint() {
  const state = await chrome.runtime.sendMessage({ kind: 'state' }).catch(() => null)
  if (!state) return

  const item = state.snapshot?.item
  const good = state.status === 'connected'

  $('status').innerHTML =
    `<span class="${good ? 'ok' : 'bad'}">${state.status}</span>` +
    (state.config?.roomCode ? `<br />Room: ${state.config.roomCode}` : '') +
    (item ? `<br />On now: ${item.title}` : '<br />Nothing on in the room yet.') +
    (good ? `<br />Clock offset: ${Math.round(state.offset)}ms` : '')

  const detail = explain(state)
  $('why').textContent = detail?.why ?? ''

  /* Only when the server actually turned this socket away. */
  const origin = $('origin')
  origin.hidden = !detail?.origin
  if (detail?.origin) {
    origin.innerHTML =
      'Two things cause this. Usually the API is not running, or the tunnel address moved — ' +
      'check it is up first.<br /><br />' +
      "Otherwise this extension's origin is not on the server's <code>CLIENT_ORIGIN</code> list. " +
      'It is the same on every install, so it normally only has to be added once:<br />' +
      `<b>${location.origin}</b><br /><br />` +
      'A server already running when that list changed is still using the old one — it is read ' +
      'at startup, so it needs a restart, not just an edit.'
  }

  /* Once it has configured itself there is nothing to hand-enter, so the
     fallback stays folded away rather than sitting there implying there is
     still a step outstanding. */
  const auto = document.getElementById('auto')
  if (auto) auto.style.display = good ? 'none' : 'block'
}

async function prefill() {
  const stored = await chrome.storage.local.get(['server', 'roomCode', 'token', 'suggestedToken'])
  $('server').value = stored.server ?? ''
  $('code').value = stored.roomCode ?? ''
  /* A token picked up from the app tab is offered, never used silently — it
     is in the field where it can be seen and cleared before Connect. */
  $('token').value = stored.token || stored.suggestedToken || ''
}

$('save').addEventListener('click', async () => {
  const button = $('save')
  button.disabled = true
  $('status').textContent = 'Connecting…'

  const server = $('server').value.trim().replace(/\/$/, '')

  let origin
  try {
    origin = new URL(server).origin
  } catch {
    $('status').innerHTML = '<span class="bad">That server URL does not parse.</span>'
    button.disabled = false
    return
  }

  /* Asked for at the moment it is needed, for the one origin just typed,
     rather than demanding every site up front at install time. */
  const granted = await chrome.permissions.request({ origins: [`${origin}/*`] })
  if (!granted) {
    $('status').innerHTML =
      '<span class="bad">Permission refused</span><br />The extension cannot reach that server without it.'
    button.disabled = false
    return
  }

  const result = await chrome.runtime.sendMessage({
    kind: 'save',
    server,
    code: $('code').value.trim(),
    token: $('token').value.trim(),
  })

  if (!result?.ok) $('status').innerHTML = `<span class="bad">${result?.error ?? 'Could not connect.'}</span>`
  else setTimeout(paint, 700)

  button.disabled = false
})

void prefill().then(paint)
setInterval(paint, 1500)

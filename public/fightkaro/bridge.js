/* Huddle owns authentication; the game receives only signalling responses. */
(() => {
  const original = window.fetch.bind(window);
  const pending = new Map();
  let seq = 0;
  window.fetch = (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    if (!url.startsWith('/api/fightkaro/') || parent === window) return original(input, init);
    return new Promise((resolve, reject) => {
      const id = ++seq;
      const abort = () => {
        pending.delete(id);
        parent.postMessage({ type: 'fight:abort', id }, location.origin);
        reject(new DOMException('Request aborted', 'AbortError'));
      };
      if (init.signal?.aborted) return abort();
      init.signal?.addEventListener('abort', abort, { once: true });
      pending.set(id, { resolve, reject, cleanup: () => init.signal?.removeEventListener('abort', abort) });
      parent.postMessage({ type: 'fight:request', id, path: url, method: init.method || 'GET', body: init.body }, location.origin);
    });
  };
  window.addEventListener('message', (event) => {
    if (event.source !== parent || event.origin !== location.origin || event.data?.type !== 'fight:response') return;
    const request = pending.get(event.data.id);
    if (!request) return;
    pending.delete(event.data.id); request.cleanup();
    if (event.data.error) request.reject(new Error(event.data.error));
    else request.resolve(new Response(JSON.stringify(event.data.body), { status: event.data.status, headers: { 'Content-Type': 'application/json' } }));
  });
  window.addEventListener('error', () => parent.postMessage({ type: 'fight:error' }, location.origin));
  window.addEventListener('unhandledrejection', () => parent.postMessage({ type: 'fight:error' }, location.origin));
  window.addEventListener('load', () => parent.postMessage({ type: 'fight:loaded' }, location.origin));
})();

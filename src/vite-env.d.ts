/// <reference types="vite/client" />

/**
 * The version in `extension/manifest.json`, injected at build time.
 *
 * Defined in `vite.config.ts` so the number lives in exactly one place. The
 * page compares it against the version the installed extension reports to
 * decide whether to tell somebody their copy is out of date — a sideloaded
 * extension has no update channel, so if the page does not say so, nobody
 * finds out.
 */
declare const __EXTENSION_VERSION__: string

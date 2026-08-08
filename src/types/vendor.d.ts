/**
 * liquidGL is vendored JavaScript with no types of its own. It's imported for
 * its side effect only — it attaches `window.liquidGL` — so an opaque module
 * declaration is all that's needed. The typed surface lives in
 * src/lib/liquidGlass.ts, which declares the globals it installs.
 */
declare module '@/vendor/liquidGL.js'

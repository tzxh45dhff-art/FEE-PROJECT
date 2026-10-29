import path from 'node:path'

/** The socket test harness overrides this so scratch games never rewrite live catalogue/history files. */
export const gameCacheDirectory = () => process.env.GAME_CACHE_DIR
  ? path.resolve(process.env.GAME_CACHE_DIR)
  : path.resolve(import.meta.dirname, '../../.cache')

import type { PenMatch } from '../../../server/src/games/penfight'
export type { Position as WirePen } from '../../../server/src/games/penfight.physics'
export type { Player as GamePlayer, PenStyle } from '../../../server/src/games/penfight'
export type GameSnapshot = PenMatch & { roomId: string; serverNow: number; receivedAt: number }

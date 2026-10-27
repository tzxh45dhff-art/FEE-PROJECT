/** Manual balance audit: node --import tsx server/test/penfight.balance.ts
 * A repeatable aiming policy, not a substitute for tests with real players.
 */
import { chooseBotShot, openingPens, simulate, type BotDifficulty } from '../src/games/penfight.physics.js'

for (const difficulty of ['chill', 'sharp'] as BotDifficulty[]) {
  let seed = 19
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
  const wins = [0, 0]
  let draws = 0, shots = 0, unfinished = 0, firstShotDecisions = 0
  const rounds = 1000
  for (let round = 0; round < rounds; round++) {
    // Each layout is played from both opening seats before moving on.
    let pens = openingPens(Math.floor(round / 2) + 1)
    let seat = round % 2 as 0 | 1
    for (let turn = 0; turn < 50; turn++) {
      const mine = pens[seat], other = pens[1 - seat]!
      const heading = Math.atan2(other.z - mine.z, other.x - mine.x) + (random() - 0.5) * 0.16
      const shot = seat === 1 ? chooseBotShot(pens, seat, difficulty, random) : {
        dx: Math.cos(heading), dz: Math.sin(heading), power: 0.65 + random() * 0.35, contact: (random() - 0.5) * 0.2,
      }
      pens = simulate(pens, seat, shot).frames.at(-1)!
      if (pens.some(p => !p.onDesk)) {
        if (!pens[0].onDesk && !pens[1].onDesk) draws++
        else { wins[pens[0].onDesk ? 0 : 1]!++; if (turn === 0) firstShotDecisions++ }
        shots += turn + 1
        break
      }
      if (turn === 49) unfinished++
      seat = (1 - seat) as 0 | 1
    }
  }
  console.log(JSON.stringify({ difficulty, rounds, casualPolicyWins: wins[0], rivalWins: wins[1], draws, averageShots: +(shots / rounds).toFixed(2), unfinished, firstShotDecisions }))
}

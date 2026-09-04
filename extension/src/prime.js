/**
 * Prime Video, as a member of the room.
 *
 * Same engine as Netflix — see `sync.js`. The tuning differs a little because
 * the two players behave differently under a seek: Prime's rebuffers faster
 * and more predictably, so it can be held a touch tighter without spending a
 * stall to do it.
 */

;(() => {
  window.__huddleStartSync({
    name: 'Prime Video',
    tuning: {
      /* Tighter than Netflix's two seconds. Prime returns from a seek quickly
         enough that a correction is cheap, so the room can be held closer
         before the cost of fixing it outweighs the gap. */
      hardSeconds: 1.6,
      initialSeekCost: 0.8,
    },
  })
})()

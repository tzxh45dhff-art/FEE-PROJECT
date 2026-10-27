import { dealCounts, dealRange, type Range } from './helpers'
import type { MafiaOptions, Phase, Role } from './types'

/**
 * The game explaining itself: what each card does, and what each part of a
 * round is for — in the story's voice first, then in plain words.
 */

export const ROLE_GUIDE: Record<Role, { night: string; win: string; tip: string }> = {
  villager: {
    night: 'You have no power — you just mark who you suspect. It’s a private hunch for the case file; it can’t hurt anyone.',
    win: 'when every member of the Family has been hanged.',
    tip: 'By day, listen for who changes their story and who defends whom. Your vote is your weapon.',
  },
  mafia: {
    night: 'Each night you and the Family choose one person to kill. If you disagree, a coin decides.',
    win: 'when the Family equal the town in number.',
    tip: 'By day, act like an ordinary citizen. Steer suspicion onto someone else — gently.',
  },
  godfather: {
    night: 'Each night your pick is the Family’s kill.',
    win: 'when the Family equal the town in number.',
    tip: 'If the Inspector checks you, you come back clean. Use it.',
  },
  doctor: {
    night: 'Each night, choose one person to protect. If the Family come for them, they live. Not the same person two nights running; yourself, only once.',
    win: 'when every member of the Family has been hanged.',
    tip: 'Keep quiet about being the Doctor — the Family come for the Doctor first.',
  },
  detective: {
    night: 'Each night, open a file on one person. By morning you’ll know if they work for the Family.',
    win: 'when every member of the Family has been hanged.',
    tip: 'Share what you find when it counts — once you reveal yourself, the Family will hunt you.',
  },
  jester: {
    night: 'At night, mark a hunch like everyone else.',
    win: 'only if the town hangs you.',
    tip: 'Look a little suspicious — but not so obviously that they see through it.',
  },
}

/** The first time each part of a round comes up: a line of story, then what to do. */
export const PHASE_GUIDE: Partial<Record<Phase, { title: string; story: string; plain: (ctx: { role: Role | null; accused: boolean; withAIs: boolean }) => string }>> = {
  night: {
    title: 'Night falls',
    story: 'The town sleeps. Somewhere in the dark, the Family choose their victim.',
    plain: () => 'Everyone makes a choice at night — so nobody can tell who has a real power. Tap a photograph to choose; you can change your mind until the clock runs out. Your card’s job is written just below.',
  },
  dawn: {
    title: 'Morning',
    story: 'The morning paper lands on every doorstep.',
    plain: () => 'The paper tells you who died overnight — that’s your first clue. Read it, then tap Continue.',
  },
  day: {
    title: 'The day: talk it out',
    story: 'The survivors gather, and everyone has a theory.',
    plain: ({ withAIs }) =>
      withAIs
        ? 'Discuss who might be in the Family. Type in Table talk to question the AIs — say someone’s name and they’ll answer you. When you’ve heard enough, tap “Ready to vote”.'
        : 'Talk it over out loud — who seemed nervous, who defended whom? When you’ve heard enough, tap “Ready to vote”. Voting starts once most of you are ready.',
  },
  vote: {
    title: 'Nominations',
    story: 'Fingers start pointing across the room.',
    plain: () => 'Tap the person you want to put on trial — or “No one”. Whoever is named most stands trial, as long as they beat “no one”.',
  },
  defence: {
    title: 'The trial',
    story: 'The accused gets the floor. One chance to talk their way out.',
    plain: ({ accused, withAIs }) =>
      accused
        ? `You’re on trial! ${withAIs ? 'Type your defence in Table talk' : 'Speak up'} — convince them you’re innocent. Tap “I rest my case” when you’re done.`
        : 'Read what the accused says in their defence. Next, you’ll decide: guilty or innocent.',
  },
  judgement: {
    title: 'The judgement',
    story: 'The room goes quiet. The town decides.',
    plain: ({ accused }) =>
      accused ? 'The town is voting on you. A tie means you walk free.' : 'Vote Guilty to hang them, or Innocent to let them go. A tie means they walk free. If they’re hanged, their card is revealed.',
  },
}

/**
 * Which cards are in play for this table — as ranges, since the real counts
 * are a secret until the end (see `dealRange`). With the roll off, exact.
 */
export function rolesInPlay(n: number, options: MafiaOptions): { family: Range; doctors: Range; inspectors: Range; godfather: boolean; jester: boolean } {
  const d = dealCounts(n, options)
  if (options.randomPowers === false) return { family: [d.family, d.family], doctors: [d.doctors, d.doctors], inspectors: [d.detectives, d.detectives], godfather: d.godfather, jester: d.jester > 0 }
  const r = dealRange(n, options)
  return { family: r.family, doctors: r.doctors, inspectors: r.detectives, godfather: d.godfather, jester: d.jester > 0 }
}

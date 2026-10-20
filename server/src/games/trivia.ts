import { BANK, CATEGORIES, type Category } from './trivia.questions.js'
import { shuffle } from './engine.js'
import { quizGame, type QuizOptions } from './quiz.js'

/**
 * Live trivia: everyone gets the same question at the same moment, fastest
 * right answer scores most. Pick the categories you want; the questions are
 * drawn from those, mixed, without repeats inside a game.
 */

type Options = QuizOptions & { categories: Category[] }

const ALL = Object.keys(CATEGORIES) as Category[]

export const trivia = quizGame<Options>({
  id: 'trivia',
  label: 'Live trivia',
  readyMs: 3_000,

  options(raw) {
    const body = (raw ?? {}) as { rounds?: unknown; seconds?: unknown; categories?: unknown }
    const rounds = [5, 10, 15, 20].includes(body.rounds as number) ? (body.rounds as number) : 10
    const seconds = [10, 15, 20].includes(body.seconds as number) ? (body.seconds as number) : 15
    const picked = Array.isArray(body.categories) ? ALL.filter((c) => (body.categories as unknown[]).includes(c)) : ALL
    if (picked.length === 0) return { error: 'Pick at least one category' }
    return { rounds, seconds, categories: picked }
  },

  items({ rounds, categories }, ctx) {
    /* Round-robin across the chosen categories so a mixed game stays mixed. */
    const piles = categories.map((c) => shuffle(BANK.filter((e) => e[0] === c), ctx))
    const drawn: (typeof BANK)[number][] = []
    for (let i = 0; drawn.length < rounds && piles.some((p) => p.length > 0); i++) {
      const pile = piles[i % piles.length]!
      const next = pile.pop()
      if (next) drawn.push(next)
    }
    return shuffle(drawn, ctx).map(([category, prompt, right, ...wrong]) => {
      const options = shuffle([right, ...wrong], ctx)
      return { prompt, tag: `${CATEGORIES[category].emoji} ${CATEGORIES[category].label}`, options, answer: options.indexOf(right) }
    })
  },
})

import * as azure from '../services/azure.service.js'
import { BANK, CATEGORIES, type Category } from './trivia.questions.js'
import { byFreshness, shuffle } from './engine.js'
import { quizGame, type QuizOptions } from './quiz.js'
import { questionKey, triviaCatalog, type TriviaQuestion } from '../services/triviaCatalog.service.js'
import { seenFor } from '../services/seen.service.js'

/**
 * Live trivia: everyone gets the same question at the same moment, fastest
 * right answer scores most. Pick the categories you want; the questions are
 * drawn from those, mixed, without repeats inside a game.
 */

type Options = QuizOptions & { categories: Category[]; bank?: TriviaQuestion[] }

const ALL = Object.keys(CATEGORIES) as Category[]

export const trivia = quizGame<Options>({
  id: 'trivia',
  label: 'Live trivia',
  readyMs: 3_000,

  options(raw) {
    const body = (raw ?? {}) as { rounds?: unknown; seconds?: unknown; categories?: unknown; lateJoin?: unknown }
    const rounds = [5, 10, 15, 20].includes(body.rounds as number) ? (body.rounds as number) : 10
    const seconds = [10, 15, 20].includes(body.seconds as number) ? (body.seconds as number) : 15
    const picked = Array.isArray(body.categories) ? ALL.filter((c) => (body.categories as unknown[]).includes(c)) : ALL
    if (picked.length === 0) return { error: 'Pick at least one category' }
    return { rounds, seconds, categories: picked, lateJoin: body.lateJoin !== false }
  },

  async prepare(roomId, options) {
    return { ...options, bank: await triviaCatalog(options.categories, await seenFor(roomId, 'trivia'), options.rounds) }
  },

  items({ rounds, categories, bank = BANK.map((entry) => ({ entry })) }, ctx) {
    /* Round-robin across the chosen categories so a mixed game stays mixed. */
    /* Popped from the end, so the questions this room hasn't had go last. */
    const seen = new Set([...(ctx.seen ?? [])].map(questionKey))
    const piles = shuffle(categories, ctx).map((c) => byFreshness(bank.filter(({ entry }) => entry[0] === c), ({ entry }) => questionKey(entry[1]), { ...ctx, seen }).reverse())
    const drawn: TriviaQuestion[] = []
    for (let i = 0; drawn.length < rounds && piles.some((p) => p.length > 0); i++) {
      const pile = piles[i % piles.length]!
      const freshRemain = piles.some((p) => p.length && !seen.has(questionKey(p.at(-1)!.entry[1])))
      if (freshRemain && pile.length && seen.has(questionKey(pile.at(-1)!.entry[1]))) continue
      const next = pile.pop()
      if (next) drawn.push(next)
    }
    return shuffle(drawn, ctx).map(({ entry: [category, prompt, right, ...wrong], attribution }) => {
      const options = shuffle([right, ...wrong], ctx)
      return { prompt, tag: CATEGORIES[category].label, category, options, answer: options.indexOf(right), attribution }
    })
  },

  /*
   * A line about each answer, for the reveal — "the Nile runs about 6,650 km".
   * Written while the first question is being read; a reveal that comes
   * before it is ready simply shows no fact.
   */
  async background(_roomId, _options, state) {
    if (!azure.configured()) return null
    const list = state.items.map((item, i) => `${i + 1}. ${item.prompt} — Answer: ${item.options[item.answer]}`).join('\n')
    try {
      const reply = await Promise.race([
        azure.chatJson<{ facts?: unknown }>(
          [
            { role: 'system', content: 'You write short, true, delightful trivia facts. You only answer with JSON.' },
            {
              role: 'user',
              content: `For each quiz question below, write one fact about the correct answer that someone would enjoy hearing right after getting it: one sentence, at most 24 words, accurate, no hedging, and do not just restate the question.\n\n${list}\n\nAnswer as JSON: {"facts": ["fact for 1", "fact for 2", ...]} in the same order.`,
            },
          ],
          { temperature: 0.5, maxTokens: 1600 },
        ),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 25_000)),
      ])
      const facts = Array.isArray(reply?.facts) ? reply.facts.map((f) => (typeof f === 'string' ? f : '')) : []
      return facts.some(Boolean) ? { action: 'facts', payload: { facts } } : null
    } catch {
      return null
    }
  },
})

/** Refresh the bundled public bank. No key, account, model calls or user data. */
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { PUBLIC_BANK } from '../games/trivia.public.js'
import { PUBLIC_CATEGORIES, parsePublicQuestion, uniqueQuestions } from '../services/triviaCatalog.service.js'

let bank = [...PUBLIC_BANK]
const sources = [11, 12, 9, 11, 12, 17, 11, 12, 22, 11, 12, 23, 18, 10, 25, 27, 28, 20, 19, 30]
let nextRequest = 0
for (const id of sources) {
  await new Promise((resolve) => setTimeout(resolve, Math.max(0, nextRequest - Date.now())))
  nextRequest = Date.now() + 5600
  try {
    const response = await fetch(`https://opentdb.com/api.php?amount=50&category=${id}&type=multiple&encode=base64`, { signal: AbortSignal.timeout(8000) })
    const body = await response.json() as { response_code: number; results?: unknown[] }
    if (!response.ok || body.response_code !== 0) { console.log(`Category ${id}: unavailable`); continue }
    const category = PUBLIC_CATEGORIES.find(([source]) => source === id)![1]
    const rows = (body.results ?? []).flatMap((raw) => { const entry = parsePublicQuestion(raw, category); return entry ? [entry] : [] })
    bank = uniqueQuestions([...bank, ...rows])
    const source = '/**\n * Questions from Open Trivia DB (https://opentdb.com/), CC BY-SA 4.0.\n * https://creativecommons.org/licenses/by-sa/4.0/\n * Filtered for four distinct answers and stable facts; correct answer is first.\n * Refresh: cd server && npx tsx src/scripts/refreshTrivia.ts\n */\nimport type { Entry } from \'./trivia.questions.js\'\nexport const PUBLIC_BANK: Entry[] = [\n' + bank.map((entry) => `  ${JSON.stringify(entry)},`).join('\n') + '\n]\n'
    await writeFile(fileURLToPath(new URL('../games/trivia.public.ts', import.meta.url)), source)
    console.log(`Category ${id}: ${bank.length} distinct questions bundled`)
  } catch { console.log(`Category ${id}: connection unavailable`) }
  finally { nextRequest = Date.now() + 5600 }
}

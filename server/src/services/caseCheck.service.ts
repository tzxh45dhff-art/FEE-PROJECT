import { prisma } from '../models/prisma.js'
import { splitCases, verifyCases } from './generate.service.js'

/**
 * Checking a new problem's test cases after it is already on screen.
 *
 * Writing a problem takes seconds; checking its cases — a reference solution
 * written by the model and run against every one on the judge — took the
 * better part of two minutes, and the person who asked for the problem sat
 * watching a spinner for all of it. So the problem is saved and shown the
 * moment it is written, and the cases are checked here, behind it. A case the
 * reference disagrees with is dropped when the check lands; until then the
 * problem says it is still checking.
 *
 * Kept in memory: a restart mid-check leaves the cases unchecked, which is
 * where every problem started before this existed — not wrong, just unvetted.
 */
const checking = new Set<string>()

export function isChecking(problemId: string) {
  return checking.has(problemId)
}

export function checkLater(problemId: string, statement: string, cases: { input: string; expected: string }[]) {
  checking.add(problemId)
  void (async () => {
    try {
      const kept = await verifyCases(statement, cases)
      if (kept.length === cases.length) return
      const rows = splitCases(kept)
      await prisma.$transaction([
        prisma.codingTestCase.deleteMany({ where: { problemId } }),
        prisma.codingTestCase.createMany({
          data: rows.map((row, position) => ({ ...row, position, problemId })),
        }),
      ])
    } catch (cause) {
      /* The problem may have been deleted while it was being checked, or the
         judge fell over. Either way the cases stay as they were written. */
      console.error('[syncroom] case check', cause instanceof Error ? cause.message : cause)
    } finally {
      checking.delete(problemId)
    }
  })()
}

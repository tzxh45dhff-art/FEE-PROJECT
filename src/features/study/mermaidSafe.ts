/**
 * Making a generated diagram parse.
 *
 * Mermaid's grammar treats brackets and parentheses as syntax wherever they
 * appear, including inside a node's label. So `A[Collection (I)]` — a
 * perfectly reasonable thing to write about Java interfaces — is a parse
 * error, and `A[Old Array: [1, 2, 3]]` is another. Both came out of a real
 * lesson, and what the reader saw was the diagram's own source code sitting
 * where the picture should have been.
 *
 * Asking the model for "valid simple Mermaid" is what the prompt already did.
 * This is the same lesson as the code highlights and the list pointers before
 * it: a rule that can be enforced mechanically should be enforced, not
 * requested. Quoting a label is always safe — `A["Collection (I)"]` parses,
 * means exactly the same thing, and needs no cooperation from the model.
 *
 * Applied when the diagram is rendered rather than when it is written, which
 * is deliberate: every diagram already sitting in somebody's saved lessons and
 * notes is broken in exactly this way, and fixing it here repairs those too
 * without regenerating anything.
 */

/** Characters that are grammar to Mermaid and therefore unsafe bare. */
const NEEDS_QUOTING = /[()[\]{}]/

/** Openers that begin a node label, paired with what closes them. */
const CLOSERS: Record<string, string> = { '[': ']', '(': ')', '{': '}' }

/**
 * Quote one label's text, unless it is quoted already.
 *
 * Inner quotes become `#quot;` — Mermaid's own entity escape — because a raw
 * one would end the string early and produce a different parse error than the
 * one being fixed.
 */
function quoted(body: string): string {
  const trimmed = body.trim()
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) return body
  if (!NEEDS_QUOTING.test(body)) return body
  return `"${body.replace(/"/g, '#quot;')}"`
}

export function safeMermaid(source: string): string {
  let out = ''
  let i = 0

  while (i < source.length) {
    const ch = source[i]!

    /*
     * An edge label: `A -->|text| B`. Delimited by pipes and never nested, so
     * the closing one is simply the next pipe.
     */
    if (ch === '|') {
      const end = source.indexOf('|', i + 1)
      if (end === -1) {
        out += ch
        i += 1
        continue
      }
      out += `|${quoted(source.slice(i + 1, end))}|`
      i = end + 1
      continue
    }

    const closer = CLOSERS[ch]
    if (!closer) {
      out += ch
      i += 1
      continue
    }

    /*
     * A doubled opener is a different node shape — `[[subroutine]]`,
     * `((circle))`, `{{hexagon}}` — and quoting its inner pair away would
     * silently change the shape rather than fix the label. Kept as its own
     * case so the shape survives.
     */
    const doubled = source[i + 1] === ch
    const open = doubled ? ch + ch : ch
    const close = doubled ? closer + closer : closer

    /* Scan to the matching close, counting nesting of this bracket only —
       which is what lets `[Old Array: [1, 2]]` find its real end rather than
       stopping at the first `]` and mangling the rest of the line. */
    let depth = 0
    let scan = i
    let end = -1
    while (scan < source.length) {
      if (source.startsWith(open, scan)) {
        depth += 1
        scan += open.length
        continue
      }
      if (source.startsWith(close, scan)) {
        depth -= 1
        if (depth === 0) {
          end = scan
          break
        }
        scan += close.length
        continue
      }
      scan += 1
    }

    /* Unbalanced. Left exactly as it was — a diagram this broken is the
       model's to answer for, and guessing at a repair would more likely
       produce a different wrong picture than the right one. */
    if (end === -1) {
      out += ch
      i += 1
      continue
    }

    out += open + quoted(source.slice(i + open.length, end)) + close
    i = end + close.length
  }

  return out
}

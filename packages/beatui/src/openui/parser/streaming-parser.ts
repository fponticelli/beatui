import type { ComponentNameChecker, ParseResult } from './types'
import { createParser } from './parser'

/**
 * Creates a streaming (incremental) parser for OpenUI Lang.
 *
 * Maintains an internal text buffer that grows with each push(chunk) call.
 * On each push, appends the chunk to the buffer and re-parses the full buffer.
 *
 * TODO: This is O(n^2) due to full re-parsing on each push. For v2, implement
 * incremental parsing that only re-processes changed/new lines.
 */
export function createStreamingParser(checker?: ComponentNameChecker): {
  push(chunk: string): ParseResult
  getResult(): ParseResult
} {
  const parse = createParser(checker)
  let buffer = ''
  let lastResult: ParseResult = {
    root: null,
    statements: new Map(),
    meta: {
      incomplete: true,
      unresolved: [],
      statementCount: 0,
      errors: [],
    },
  }

  return {
    push(chunk: string): ParseResult {
      buffer += chunk
      lastResult = parse(buffer)
      return lastResult
    },

    getResult(): ParseResult {
      return lastResult
    },
  }
}

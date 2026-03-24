/**
 * Tokenizes OpenUI Lang input into logical lines.
 *
 * Physical lines are joined when expressions have unclosed parens/brackets/braces.
 * String literals are respected — delimiters inside "..." don't count.
 * Handles escaped quotes inside strings.
 * Empty lines are skipped.
 */
export function tokenizeLines(input: string): string[] {
  const physicalLines = input.split('\n')
  const logicalLines: string[] = []
  let buffer = ''
  let depth = 0

  for (const raw of physicalLines) {
    const line = raw.trimEnd()

    if (buffer === '' && line.trim() === '') {
      // Skip empty lines when not accumulating
      continue
    }

    if (buffer !== '') {
      buffer += '\n' + line
    } else {
      buffer = line
    }

    // Count unbalanced open delimiters outside strings
    depth = countOpenDepth(buffer)

    if (depth <= 0) {
      const trimmed = buffer.trim()
      if (trimmed !== '') {
        logicalLines.push(trimmed)
      }
      buffer = ''
      depth = 0
    }
  }

  // If buffer still has content (e.g. unclosed expression at end of input),
  // emit it anyway as an incomplete line
  if (buffer.trim() !== '') {
    logicalLines.push(buffer.trim())
  }

  return logicalLines
}

/**
 * Returns the net open-delimiter depth of a string, skipping string contents.
 */
function countOpenDepth(text: string): number {
  let depth = 0
  let inString = false
  let i = 0

  while (i < text.length) {
    const ch = text[i]

    if (inString) {
      if (ch === '\\') {
        // Skip escaped character
        i += 2
        continue
      }
      if (ch === '"') {
        inString = false
      }
    } else {
      if (ch === '"') {
        inString = true
      } else if (ch === '(' || ch === '[' || ch === '{') {
        depth++
      } else if (ch === ')' || ch === ']' || ch === '}') {
        depth--
      }
    }
    i++
  }

  return depth
}

import type {
  ASTNode,
  ComponentNameChecker,
  ParseError,
  ParseResult,
  Statement,
} from './types'
import { tokenizeLines } from './tokenizer'

/**
 * Creates a synchronous parser for OpenUI Lang.
 *
 * Each statement is `identifier = expression`.
 * The `root` statement drives the top-level render target.
 */
export function createParser(
  checker?: ComponentNameChecker
): (input: string) => ParseResult {
  return (input: string): ParseResult => {
    return parseInput(input, checker)
  }
}

function parseInput(
  input: string,
  checker?: ComponentNameChecker
): ParseResult {
  const lines = tokenizeLines(input)
  const statements = new Map<string, Statement>()
  const errors: ParseError[] = []
  const definedNames = new Set<string>()
  const referencedNames = new Set<string>()

  // Line numbers for error reporting: track which physical line each logical line starts on.
  // We use a simple counter based on logical line index as the tokenizer merges physical lines.
  // For more accurate tracking we'll count newlines in the original input up to the logical line.
  const physicalLines = input.split('\n')
  let physicalLineIndex = 0

  for (let li = 0; li < lines.length; li++) {
    const logicalLine = lines[li]

    // Find this logical line's approximate physical line number (1-based).
    // Advance physicalLineIndex until we find the start of logicalLine.
    const firstPhysical = logicalLine.split('\n')[0].trim()
    while (physicalLineIndex < physicalLines.length) {
      if (physicalLines[physicalLineIndex].trim().startsWith(firstPhysical.slice(0, 20))) {
        break
      }
      physicalLineIndex++
    }
    const lineNumber = physicalLineIndex + 1

    // Split on first `=`
    const eqIdx = logicalLine.indexOf('=')
    if (eqIdx === -1) {
      errors.push({
        line: lineNumber,
        message: `Malformed statement (no '='): ${logicalLine}`,
        code: 'syntax',
      })
      physicalLineIndex++
      continue
    }

    const identifier = logicalLine.slice(0, eqIdx).trim()
    const exprStr = logicalLine.slice(eqIdx + 1).trim()

    if (!isValidIdentifier(identifier)) {
      errors.push({
        line: lineNumber,
        message: `Invalid identifier: '${identifier}'`,
        code: 'syntax',
      })
      physicalLineIndex++
      continue
    }

    let node: ASTNode
    try {
      node = parseExpression(exprStr, referencedNames, errors, lineNumber, checker)
    } catch {
      errors.push({
        line: lineNumber,
        message: `Failed to parse expression: ${exprStr}`,
        code: 'syntax',
      })
      physicalLineIndex++
      continue
    }

    definedNames.add(identifier)
    statements.set(identifier, { value: node })
    physicalLineIndex++
  }

  const unresolved = [...referencedNames].filter(n => !definedNames.has(n))
  const root = statements.has('root') ? statements.get('root')!.value : null

  return {
    root,
    statements,
    meta: {
      incomplete: false,
      unresolved,
      statementCount: statements.size,
      errors,
    },
  }
}

function isValidIdentifier(s: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)
}

/**
 * Recursively parse an expression string into an ASTNode.
 */
function parseExpression(
  expr: string,
  referencedNames: Set<string>,
  errors: ParseError[],
  lineNumber: number,
  checker?: ComponentNameChecker
): ASTNode {
  expr = expr.trim()

  // null
  if (expr === 'null') {
    return { type: 'null' }
  }

  // boolean
  if (expr === 'true') {
    return { type: 'boolean', value: true }
  }
  if (expr === 'false') {
    return { type: 'boolean', value: false }
  }

  // string
  if (expr.startsWith('"')) {
    return parseString(expr)
  }

  // number
  if (/^-?\d/.test(expr) || /^-?\.\d/.test(expr)) {
    const n = Number(expr)
    if (!isNaN(n)) {
      return { type: 'number', value: n }
    }
  }

  // array
  if (expr.startsWith('[')) {
    return parseArray(expr, referencedNames, errors, lineNumber, checker)
  }

  // object
  if (expr.startsWith('{')) {
    return parseObject(expr, referencedNames, errors, lineNumber, checker)
  }

  // component: starts with uppercase letter followed by '('
  if (/^[A-Z]/.test(expr) && expr.includes('(')) {
    return parseComponent(expr, referencedNames, errors, lineNumber, checker)
  }

  // reference: starts with lowercase letter or underscore
  if (/^[a-z_]/.test(expr)) {
    const name = expr
    referencedNames.add(name)
    return { type: 'reference', name }
  }

  // Bare uppercase word (component with no args, no parens — treat as reference-like)
  if (/^[A-Z][a-zA-Z0-9_]*$/.test(expr)) {
    // Uppercase identifier without parens — treat as component with no args
    const name = expr
    if (checker && !checker.has(name)) {
      errors.push({
        line: lineNumber,
        message: `Unknown component: '${name}'`,
        code: 'unknown-component',
      })
    }
    return { type: 'component', name, args: [] }
  }

  throw new Error(`Cannot parse expression: ${expr}`)
}

function parseString(expr: string): ASTNode {
  if (!expr.startsWith('"') || !expr.endsWith('"')) {
    throw new Error(`Malformed string: ${expr}`)
  }
  const inner = expr.slice(1, -1)
  // Process JSON-style escape sequences
  const value = inner.replace(
    /\\(["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
    (_, esc: string) => {
      switch (esc[0]) {
        case '"':
          return '"'
        case '\\':
          return '\\'
        case '/':
          return '/'
        case 'b':
          return '\b'
        case 'f':
          return '\f'
        case 'n':
          return '\n'
        case 'r':
          return '\r'
        case 't':
          return '\t'
        case 'u':
          return String.fromCharCode(parseInt(esc.slice(1), 16))
        default:
          return esc
      }
    }
  )
  return { type: 'string', value }
}

/**
 * Split a comma-separated list of expressions, respecting nested delimiters and strings.
 */
function splitArgs(inner: string): string[] {
  const parts: string[] = []
  let depth = 0
  let inString = false
  let start = 0
  let i = 0

  while (i < inner.length) {
    const ch = inner[i]

    if (inString) {
      if (ch === '\\') {
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
      } else if (ch === ',' && depth === 0) {
        parts.push(inner.slice(start, i).trim())
        start = i + 1
      }
    }
    i++
  }

  const last = inner.slice(start).trim()
  if (last !== '') {
    parts.push(last)
  }

  return parts
}

function parseArray(
  expr: string,
  referencedNames: Set<string>,
  errors: ParseError[],
  lineNumber: number,
  checker?: ComponentNameChecker
): ASTNode {
  // expr looks like: [item1, item2, ...]
  const inner = expr.slice(1, -1).trim()
  if (inner === '') {
    return { type: 'array', items: [] }
  }
  const parts = splitArgs(inner)
  const items = parts.map(p =>
    parseExpression(p, referencedNames, errors, lineNumber, checker)
  )
  return { type: 'array', items }
}

function parseObject(
  expr: string,
  referencedNames: Set<string>,
  errors: ParseError[],
  lineNumber: number,
  checker?: ComponentNameChecker
): ASTNode {
  // expr looks like: {key: value, key2: value2}
  const inner = expr.slice(1, -1).trim()
  if (inner === '') {
    return { type: 'object', entries: {} }
  }

  const parts = splitArgs(inner)
  const entries: Record<string, ASTNode> = {}

  for (const part of parts) {
    // Split on first colon (outside strings/nested)
    const colonIdx = findFirstColon(part)
    if (colonIdx === -1) {
      throw new Error(`Malformed object entry: ${part}`)
    }
    const key = part.slice(0, colonIdx).trim()
    const val = part.slice(colonIdx + 1).trim()
    entries[key] = parseExpression(val, referencedNames, errors, lineNumber, checker)
  }

  return { type: 'object', entries }
}

function findFirstColon(s: string): number {
  let depth = 0
  let inString = false
  let i = 0

  while (i < s.length) {
    const ch = s[i]
    if (inString) {
      if (ch === '\\') {
        i += 2
        continue
      }
      if (ch === '"') inString = false
    } else {
      if (ch === '"') {
        inString = true
      } else if (ch === '(' || ch === '[' || ch === '{') {
        depth++
      } else if (ch === ')' || ch === ']' || ch === '}') {
        depth--
      } else if (ch === ':' && depth === 0) {
        return i
      }
    }
    i++
  }
  return -1
}

function parseComponent(
  expr: string,
  referencedNames: Set<string>,
  errors: ParseError[],
  lineNumber: number,
  checker?: ComponentNameChecker
): ASTNode {
  // expr looks like: ComponentName(arg1, arg2, ...)
  const parenIdx = expr.indexOf('(')
  const name = expr.slice(0, parenIdx).trim()

  if (checker && !checker.has(name)) {
    errors.push({
      line: lineNumber,
      message: `Unknown component: '${name}'`,
      code: 'unknown-component',
    })
  }

  // Find matching closing paren
  const inner = expr.slice(parenIdx + 1, -1).trim()
  if (inner === '') {
    return { type: 'component', name, args: [] }
  }

  const parts = splitArgs(inner)
  const args = parts.map(p =>
    parseExpression(p, referencedNames, errors, lineNumber, checker)
  )
  return { type: 'component', name, args }
}

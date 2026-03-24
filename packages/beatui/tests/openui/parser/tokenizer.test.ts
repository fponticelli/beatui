import { describe, it, expect } from 'vitest'
import { tokenizeLines } from '../../../src/openui/parser/tokenizer'

describe('tokenizeLines', () => {
  it('returns empty array for empty input', () => {
    expect(tokenizeLines('')).toEqual([])
  })

  it('splits single-line statements', () => {
    const input = 'a = 1\nb = 2\nc = 3'
    expect(tokenizeLines(input)).toEqual(['a = 1', 'b = 2', 'c = 3'])
  })

  it('skips empty lines', () => {
    const input = 'a = 1\n\nb = 2\n\n\nc = 3'
    expect(tokenizeLines(input)).toEqual(['a = 1', 'b = 2', 'c = 3'])
  })

  it('joins lines when paren is open', () => {
    const input = 'root = Button(\n  "hello"\n)'
    const result = tokenizeLines(input)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('Button(')
    expect(result[0]).toContain('"hello"')
  })

  it('joins lines when bracket is open', () => {
    const input = 'items = [\n  1,\n  2,\n  3\n]'
    const result = tokenizeLines(input)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('[')
    expect(result[0]).toContain('1,')
  })

  it('joins lines when brace is open', () => {
    const input = 'config = {\n  key: "val"\n}'
    const result = tokenizeLines(input)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('{')
    expect(result[0]).toContain('key: "val"')
  })

  it('does not count delimiters inside strings', () => {
    // The string "((" should not count as open parens
    const input = 'a = "((("\nb = 2'
    const result = tokenizeLines(input)
    expect(result).toHaveLength(2)
    expect(result[0]).toBe('a = "((("')
    expect(result[1]).toBe('b = 2')
  })

  it('handles escaped quotes inside strings', () => {
    // The \" should not close the string
    const input = 'a = "say \\"hello\\""\nb = 2'
    const result = tokenizeLines(input)
    expect(result).toHaveLength(2)
    expect(result[0]).toBe('a = "say \\"hello\\""')
  })

  it('handles nested brackets', () => {
    const input = 'a = [[1, 2],\n[3, 4]]'
    const result = tokenizeLines(input)
    expect(result).toHaveLength(1)
    expect(result[0]).toContain('[[1, 2],')
  })

  it('handles multiple complete statements with multi-line ones', () => {
    const input = [
      'a = 1',
      'b = Button(',
      '  "text"',
      ')',
      'c = 3',
    ].join('\n')
    const result = tokenizeLines(input)
    expect(result).toHaveLength(3)
    expect(result[0]).toBe('a = 1')
    expect(result[1]).toContain('Button(')
    expect(result[2]).toBe('c = 3')
  })

  it('handles a line with only spaces/tabs as empty', () => {
    const input = 'a = 1\n   \nb = 2'
    const result = tokenizeLines(input)
    expect(result).toEqual(['a = 1', 'b = 2'])
  })
})

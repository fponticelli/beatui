import { describe, it, expect } from 'vitest'
import { createStreamingParser } from '../../../src/openui/parser/streaming-parser'
import type { ComponentNameChecker } from '../../../src/openui/parser/types'

describe('createStreamingParser', () => {
  it('parses a single complete push', () => {
    const sp = createStreamingParser()
    const result = sp.push('root = "hello"')
    expect(result.root).toEqual({ type: 'string', value: 'hello' })
  })

  it('getResult returns the last computed result without re-parsing', () => {
    const sp = createStreamingParser()
    sp.push('root = 42')
    const result = sp.getResult()
    expect(result.root).toEqual({ type: 'number', value: 42 })
  })

  it('getResult before any push returns empty result', () => {
    const sp = createStreamingParser()
    const result = sp.getResult()
    expect(result.root).toBeNull()
    expect(result.meta.statementCount).toBe(0)
  })

  it('accumulates statements across multiple pushes', () => {
    const sp = createStreamingParser()
    sp.push('a = 1\n')
    sp.push('b = 2\n')
    const result = sp.push('c = 3')
    expect(result.meta.statementCount).toBe(3)
    expect(result.statements.has('a')).toBe(true)
    expect(result.statements.has('b')).toBe(true)
    expect(result.statements.has('c')).toBe(true)
  })

  it('handles mid-statement chunk splits', () => {
    const sp = createStreamingParser()
    // Push half of an assignment
    sp.push('root = Butt')
    // The partial expression should not crash — root may be null or partially parsed
    sp.push('on("hello")')
    const result = sp.getResult()
    // After both chunks, root = Button("hello") should be complete
    expect(result.root).toEqual({
      type: 'component',
      name: 'Button',
      args: [{ type: 'string', value: 'hello' }],
    })
  })

  it('handles incremental pushes character by character', () => {
    const sp = createStreamingParser()
    const input = 'root = "hi"'
    for (const ch of input) {
      sp.push(ch)
    }
    const result = sp.getResult()
    expect(result.root).toEqual({ type: 'string', value: 'hi' })
  })

  it('handles multi-line statements split across chunks', () => {
    const sp = createStreamingParser()
    sp.push('root = Button(\n')
    sp.push('  "text"\n')
    const result = sp.push(')')
    expect(result.root).toEqual({
      type: 'component',
      name: 'Button',
      args: [{ type: 'string', value: 'text' }],
    })
  })

  it('uses component name checker when provided', () => {
    const checker: ComponentNameChecker = {
      has(name: string) {
        return name === 'Button'
      },
    }
    const sp = createStreamingParser(checker)
    const result = sp.push('root = Unknown()')
    expect(result.meta.errors.some(e => e.code === 'unknown-component')).toBe(true)
  })

  it('each push returns the current ParseResult', () => {
    const sp = createStreamingParser()
    const r1 = sp.push('a = 1')
    expect(r1.meta.statementCount).toBe(1)
    const r2 = sp.push('\nb = 2')
    expect(r2.meta.statementCount).toBe(2)
  })
})

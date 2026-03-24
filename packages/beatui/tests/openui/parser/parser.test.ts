import { describe, it, expect } from 'vitest'
import { createParser } from '../../../src/openui/parser/parser'
import type { ComponentNameChecker } from '../../../src/openui/parser/types'

describe('createParser', () => {
  const parse = createParser()

  describe('primitive types', () => {
    it('parses a string value', () => {
      const result = parse('root = "hello"')
      expect(result.root).toEqual({ type: 'string', value: 'hello' })
    })

    it('parses string with escape sequences', () => {
      const result = parse('root = "line1\\nline2"')
      expect(result.root).toEqual({ type: 'string', value: 'line1\nline2' })
    })

    it('parses string with tab escape', () => {
      const result = parse('root = "col1\\tcol2"')
      expect(result.root).toEqual({ type: 'string', value: 'col1\tcol2' })
    })

    it('parses string with escaped quote', () => {
      const result = parse('root = "say \\"hi\\""')
      expect(result.root).toEqual({ type: 'string', value: 'say "hi"' })
    })

    it('parses string with unicode escape', () => {
      const result = parse('root = "\\u0041"')
      expect(result.root).toEqual({ type: 'string', value: 'A' })
    })

    it('parses an integer number', () => {
      const result = parse('root = 42')
      expect(result.root).toEqual({ type: 'number', value: 42 })
    })

    it('parses a decimal number', () => {
      const result = parse('root = 3.14')
      expect(result.root).toEqual({ type: 'number', value: 3.14 })
    })

    it('parses a negative number', () => {
      const result = parse('root = -7')
      expect(result.root).toEqual({ type: 'number', value: -7 })
    })

    it('parses a negative decimal number', () => {
      const result = parse('root = -0.5')
      expect(result.root).toEqual({ type: 'number', value: -0.5 })
    })

    it('parses true', () => {
      const result = parse('root = true')
      expect(result.root).toEqual({ type: 'boolean', value: true })
    })

    it('parses false', () => {
      const result = parse('root = false')
      expect(result.root).toEqual({ type: 'boolean', value: false })
    })

    it('parses null', () => {
      const result = parse('root = null')
      expect(result.root).toEqual({ type: 'null' })
    })
  })

  describe('composite types', () => {
    it('parses an empty array', () => {
      const result = parse('root = []')
      expect(result.root).toEqual({ type: 'array', items: [] })
    })

    it('parses an array with elements', () => {
      const result = parse('root = [1, 2, 3]')
      expect(result.root).toEqual({
        type: 'array',
        items: [
          { type: 'number', value: 1 },
          { type: 'number', value: 2 },
          { type: 'number', value: 3 },
        ],
      })
    })

    it('parses a mixed-type array', () => {
      const result = parse('root = ["a", 1, true, null]')
      expect(result.root).toEqual({
        type: 'array',
        items: [
          { type: 'string', value: 'a' },
          { type: 'number', value: 1 },
          { type: 'boolean', value: true },
          { type: 'null' },
        ],
      })
    })

    it('parses an empty object', () => {
      const result = parse('root = {}')
      expect(result.root).toEqual({ type: 'object', entries: {} })
    })

    it('parses an object with entries', () => {
      const result = parse('root = {name: "Alice", age: 30}')
      expect(result.root).toEqual({
        type: 'object',
        entries: {
          name: { type: 'string', value: 'Alice' },
          age: { type: 'number', value: 30 },
        },
      })
    })
  })

  describe('components', () => {
    it('parses a component with no args', () => {
      const result = parse('root = Button()')
      expect(result.root).toEqual({ type: 'component', name: 'Button', args: [] })
    })

    it('parses a component with positional args', () => {
      const result = parse('root = Button("click me", true)')
      expect(result.root).toEqual({
        type: 'component',
        name: 'Button',
        args: [
          { type: 'string', value: 'click me' },
          { type: 'boolean', value: true },
        ],
      })
    })

    it('parses nested components', () => {
      const result = parse('root = Container(Button("ok"))')
      expect(result.root).toEqual({
        type: 'component',
        name: 'Container',
        args: [
          {
            type: 'component',
            name: 'Button',
            args: [{ type: 'string', value: 'ok' }],
          },
        ],
      })
    })
  })

  describe('references', () => {
    it('parses a reference', () => {
      const result = parse('root = myVar')
      expect(result.root).toEqual({ type: 'reference', name: 'myVar' })
    })

    it('tracks unresolved references', () => {
      const result = parse('root = myVar')
      expect(result.meta.unresolved).toContain('myVar')
    })

    it('resolves references that are defined', () => {
      const result = parse('myVar = "hello"\nroot = myVar')
      expect(result.meta.unresolved).not.toContain('myVar')
    })

    it('returns root from the root statement', () => {
      const result = parse('title = "Hello"\nroot = title')
      expect(result.root).toEqual({ type: 'reference', name: 'title' })
      expect(result.statements.has('title')).toBe(true)
    })
  })

  describe('metadata', () => {
    it('counts statements correctly', () => {
      const result = parse('a = 1\nb = 2\nc = 3')
      expect(result.meta.statementCount).toBe(3)
    })

    it('returns null root when no root statement', () => {
      const result = parse('a = 1\nb = 2')
      expect(result.root).toBeNull()
    })

    it('records syntax errors for malformed lines', () => {
      const result = parse('not valid line without equals')
      expect(result.meta.errors).toHaveLength(1)
      expect(result.meta.errors[0].code).toBe('syntax')
    })

    it('continues parsing after malformed lines (error recovery)', () => {
      const input = 'a = 1\nthis line has no equals sign\nb = 2'
      const result = parse(input)
      expect(result.meta.statementCount).toBe(2)
      expect(result.meta.errors).toHaveLength(1)
      expect(result.statements.has('a')).toBe(true)
      expect(result.statements.has('b')).toBe(true)
    })
  })

  describe('component name checking', () => {
    it('records unknown-component error when checker is provided and name is unknown', () => {
      const checker: ComponentNameChecker = {
        has(name: string) {
          return name === 'Button'
        },
      }
      const parseWithChecker = createParser(checker)
      const result = parseWithChecker('root = UnknownComp()')
      expect(result.meta.errors.some(e => e.code === 'unknown-component')).toBe(true)
    })

    it('does not record error for known component names', () => {
      const checker: ComponentNameChecker = {
        has(name: string) {
          return name === 'Button'
        },
      }
      const parseWithChecker = createParser(checker)
      const result = parseWithChecker('root = Button()')
      expect(result.meta.errors.filter(e => e.code === 'unknown-component')).toHaveLength(0)
    })
  })

  describe('multi-line statements', () => {
    it('parses a multi-line component call', () => {
      const input = ['root = Button(', '  "hello world",', '  true', ')'].join('\n')
      const result = parse(input)
      expect(result.root).toEqual({
        type: 'component',
        name: 'Button',
        args: [
          { type: 'string', value: 'hello world' },
          { type: 'boolean', value: true },
        ],
      })
    })

    it('parses a multi-line array', () => {
      const input = ['items = [', '  1,', '  2,', '  3', ']'].join('\n')
      const result = parse(input)
      const stmt = result.statements.get('items')
      expect(stmt?.value).toEqual({
        type: 'array',
        items: [
          { type: 'number', value: 1 },
          { type: 'number', value: 2 },
          { type: 'number', value: 3 },
        ],
      })
    })
  })
})

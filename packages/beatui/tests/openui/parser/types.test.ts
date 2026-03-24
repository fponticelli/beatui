import { describe, it, expect } from 'vitest'
import type {
  ASTNode,
  ParseResult,
  ParseError,
  Statement,
  ComponentNameChecker,
} from '../../../src/openui/parser/types'

describe('ASTNode types (smoke tests)', () => {
  it('can create a component node', () => {
    const node: ASTNode = { type: 'component', name: 'Button', args: [] }
    expect(node.type).toBe('component')
  })

  it('can create a string node', () => {
    const node: ASTNode = { type: 'string', value: 'hello' }
    expect(node.type).toBe('string')
    if (node.type === 'string') {
      expect(node.value).toBe('hello')
    }
  })

  it('can create a number node', () => {
    const node: ASTNode = { type: 'number', value: 42 }
    expect(node.type).toBe('number')
    if (node.type === 'number') {
      expect(node.value).toBe(42)
    }
  })

  it('can create a boolean node', () => {
    const node: ASTNode = { type: 'boolean', value: true }
    expect(node.type).toBe('boolean')
    if (node.type === 'boolean') {
      expect(node.value).toBe(true)
    }
  })

  it('can create a null node', () => {
    const node: ASTNode = { type: 'null' }
    expect(node.type).toBe('null')
  })

  it('can create an array node', () => {
    const node: ASTNode = {
      type: 'array',
      items: [
        { type: 'number', value: 1 },
        { type: 'number', value: 2 },
      ],
    }
    expect(node.type).toBe('array')
    if (node.type === 'array') {
      expect(node.items).toHaveLength(2)
    }
  })

  it('can create an object node', () => {
    const node: ASTNode = {
      type: 'object',
      entries: {
        key: { type: 'string', value: 'val' },
      },
    }
    expect(node.type).toBe('object')
    if (node.type === 'object') {
      expect(node.entries['key']).toBeDefined()
    }
  })

  it('can create a reference node', () => {
    const node: ASTNode = { type: 'reference', name: 'myVar' }
    expect(node.type).toBe('reference')
    if (node.type === 'reference') {
      expect(node.name).toBe('myVar')
    }
  })

  it('can create a Statement', () => {
    const stmt: Statement = { value: { type: 'null' } }
    expect(stmt.value.type).toBe('null')
  })

  it('can create a ParseError', () => {
    const err: ParseError = { line: 1, message: 'oops', code: 'syntax' }
    expect(err.code).toBe('syntax')
  })

  it('can create a ParseResult', () => {
    const result: ParseResult = {
      root: null,
      statements: new Map(),
      meta: {
        incomplete: false,
        unresolved: [],
        statementCount: 0,
        errors: [],
      },
    }
    expect(result.root).toBeNull()
    expect(result.meta.statementCount).toBe(0)
  })

  it('can implement ComponentNameChecker', () => {
    const checker: ComponentNameChecker = {
      has(name: string) {
        return name === 'Button'
      },
    }
    expect(checker.has('Button')).toBe(true)
    expect(checker.has('Unknown')).toBe(false)
  })
})

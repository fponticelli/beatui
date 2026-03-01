import { describe, it, expect } from 'vitest'
import {
  Filter,
  evaluateBuiltinFilter,
  evaluateFilterExpr,
  describeBuiltinFilter,
  describeFilter,
  isBuiltinFilter,
  inferValueType,
  type FilterBase,
  type TextFilter,
  type CompareFilter,
  type RangeFilter,
  type SetFilter,
  type BooleanFilter,
  type NullFilter,
} from '../src/components/data/filter'

// ---------------------------------------------------------------------------
// Filter builder output shapes
// ---------------------------------------------------------------------------

describe('Filter builders', () => {
  it('should build text filters', () => {
    const f = Filter.contains('name', 'alice')
    expect(f).toEqual({
      kind: 'text',
      column: 'name',
      operator: 'contains',
      value: 'alice',
    })
  })

  it('should build text filter with caseSensitive', () => {
    const f = Filter.contains('name', 'Alice', true)
    expect(f).toEqual({
      kind: 'text',
      column: 'name',
      operator: 'contains',
      value: 'Alice',
      caseSensitive: true,
    })
  })

  it('should build all text operator variants', () => {
    expect(Filter.notContains('c', 'v').operator).toBe('notContains')
    expect(Filter.equals('c', 'v').operator).toBe('equals')
    expect(Filter.notEquals('c', 'v').operator).toBe('notEquals')
    expect(Filter.startsWith('c', 'v').operator).toBe('startsWith')
    expect(Filter.endsWith('c', 'v').operator).toBe('endsWith')
  })

  it('should build text filter with generic text()', () => {
    const f = Filter.text('col', 'endsWith', 'xyz')
    expect(f.kind).toBe('text')
    expect(f.operator).toBe('endsWith')
    expect(f.value).toBe('xyz')
  })

  it('should build compare filters with inferred value types', () => {
    const str = Filter.eq('c', 'hello')
    expect(str.valueType).toBe('string')
    expect(str.value).toBe('hello')

    const num = Filter.gt('c', 42)
    expect(num.valueType).toBe('number')
    expect(num.value).toBe(42)

    const big = Filter.lt('c', 100n)
    expect(big.valueType).toBe('bigint')
    expect(big.value).toBe(100n)

    const d = new Date('2024-01-01')
    const date = Filter.gte('c', d)
    expect(date.valueType).toBe('date')
    expect(date.value).toBe(d)

    const bool = Filter.eq('c', true)
    expect(bool.valueType).toBe('boolean')
    expect(bool.value).toBe(true)
  })

  it('should build all compare operator variants', () => {
    expect(Filter.eq('c', 1).operator).toBe('eq')
    expect(Filter.neq('c', 1).operator).toBe('neq')
    expect(Filter.gt('c', 1).operator).toBe('gt')
    expect(Filter.gte('c', 1).operator).toBe('gte')
    expect(Filter.lt('c', 1).operator).toBe('lt')
    expect(Filter.lte('c', 1).operator).toBe('lte')
  })

  it('should build range filters', () => {
    const f = Filter.between('age', 18, 65)
    expect(f.kind).toBe('range')
    expect(f.column).toBe('age')
    expect(f.valueType).toBe('number')
    expect((f as RangeFilter & { min: number }).min).toBe(18)
    expect((f as RangeFilter & { max: number }).max).toBe(65)
  })

  it('should build range filter with exclusive', () => {
    const f = Filter.between('age', 0, 100, true)
    expect(f.exclusive).toBe(true)
  })

  it('should build set filters', () => {
    const f = Filter.oneOf('role', ['admin', 'editor'])
    expect(f.kind).toBe('set')
    expect(f.mode).toBe('include')
    expect(f.valueType).toBe('string')
    expect((f as SetFilter & { values: string[] }).values).toEqual([
      'admin',
      'editor',
    ])
  })

  it('should build noneOf set filters', () => {
    const f = Filter.noneOf('status', [1, 2])
    expect(f.mode).toBe('exclude')
    expect(f.valueType).toBe('number')
  })

  it('should build boolean filters', () => {
    expect(Filter.isTrue('active')).toEqual({
      kind: 'boolean',
      column: 'active',
      value: true,
    })
    expect(Filter.isFalse('active')).toEqual({
      kind: 'boolean',
      column: 'active',
      value: false,
    })
  })

  it('should build null filters', () => {
    expect(Filter.isNull('deletedAt')).toEqual({
      kind: 'null',
      column: 'deletedAt',
      operator: 'isNull',
    })
    expect(Filter.isNotNull('deletedAt')).toEqual({
      kind: 'null',
      column: 'deletedAt',
      operator: 'isNotNull',
    })
  })

  it('should build combinators', () => {
    const f = Filter.and(
      Filter.gt('age', 18),
      Filter.lt('age', 65)
    )
    expect(f.kind).toBe('and')
    expect('filters' in f && (f as { filters: unknown[] }).filters).toHaveLength(2)

    const orF = Filter.or(Filter.eq('a', 1), Filter.eq('b', 2))
    expect(orF.kind).toBe('or')

    const notF = Filter.not(Filter.eq('a', 1))
    expect(notF.kind).toBe('not')
  })
})

// ---------------------------------------------------------------------------
// inferValueType
// ---------------------------------------------------------------------------

describe('inferValueType', () => {
  it('should infer string', () => expect(inferValueType('hi')).toBe('string'))
  it('should infer number', () => expect(inferValueType(42)).toBe('number'))
  it('should infer bigint', () => expect(inferValueType(10n)).toBe('bigint'))
  it('should infer boolean', () =>
    expect(inferValueType(true)).toBe('boolean'))
  it('should infer date', () =>
    expect(inferValueType(new Date())).toBe('date'))
})

// ---------------------------------------------------------------------------
// isBuiltinFilter
// ---------------------------------------------------------------------------

describe('isBuiltinFilter', () => {
  it('should return true for builtin kinds', () => {
    expect(isBuiltinFilter(Filter.contains('c', 'v'))).toBe(true)
    expect(isBuiltinFilter(Filter.eq('c', 1))).toBe(true)
    expect(isBuiltinFilter(Filter.between('c', 1, 10))).toBe(true)
    expect(isBuiltinFilter(Filter.oneOf('c', ['a']))).toBe(true)
    expect(isBuiltinFilter(Filter.isTrue('c'))).toBe(true)
    expect(isBuiltinFilter(Filter.isNull('c'))).toBe(true)
  })

  it('should return false for custom kinds', () => {
    const custom: FilterBase = { kind: 'custom-geo', column: 'location' }
    expect(isBuiltinFilter(custom)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// evaluateBuiltinFilter — text
// ---------------------------------------------------------------------------

describe('evaluateBuiltinFilter — text', () => {
  it('contains', () => {
    const f = Filter.contains('c', 'lic') as TextFilter
    expect(evaluateBuiltinFilter(f, 'Alice')).toBe(true)
    expect(evaluateBuiltinFilter(f, 'Bob')).toBe(false)
  })

  it('notContains', () => {
    const f = Filter.notContains('c', 'ob') as TextFilter
    expect(evaluateBuiltinFilter(f, 'Alice')).toBe(true)
    expect(evaluateBuiltinFilter(f, 'Bob')).toBe(false)
  })

  it('equals', () => {
    const f = Filter.equals('c', 'alice') as TextFilter
    expect(evaluateBuiltinFilter(f, 'Alice')).toBe(true) // case insensitive
    expect(evaluateBuiltinFilter(f, 'Bob')).toBe(false)
  })

  it('notEquals', () => {
    const f = Filter.notEquals('c', 'alice') as TextFilter
    expect(evaluateBuiltinFilter(f, 'Alice')).toBe(false)
    expect(evaluateBuiltinFilter(f, 'Bob')).toBe(true)
  })

  it('startsWith', () => {
    const f = Filter.startsWith('c', 'al') as TextFilter
    expect(evaluateBuiltinFilter(f, 'Alice')).toBe(true)
    expect(evaluateBuiltinFilter(f, 'Bob')).toBe(false)
  })

  it('endsWith', () => {
    const f = Filter.endsWith('c', 'ce') as TextFilter
    expect(evaluateBuiltinFilter(f, 'Alice')).toBe(true)
    expect(evaluateBuiltinFilter(f, 'Bob')).toBe(false)
  })

  it('caseSensitive = true', () => {
    const f = Filter.contains('c', 'Ali', true) as TextFilter
    expect(evaluateBuiltinFilter(f, 'Alice')).toBe(true)
    expect(evaluateBuiltinFilter(f, 'alice')).toBe(false)
  })

  it('handles null value', () => {
    const f = Filter.contains('c', 'x') as TextFilter
    expect(evaluateBuiltinFilter(f, null)).toBe(false)
    expect(evaluateBuiltinFilter(f, undefined)).toBe(false)
  })

  it('handles empty string filter value', () => {
    const f = Filter.contains('c', '') as TextFilter
    expect(evaluateBuiltinFilter(f, 'anything')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// evaluateBuiltinFilter — compare
// ---------------------------------------------------------------------------

describe('evaluateBuiltinFilter — compare', () => {
  it('eq / neq for numbers', () => {
    const eq = Filter.eq('c', 5) as CompareFilter
    expect(evaluateBuiltinFilter(eq, 5)).toBe(true)
    expect(evaluateBuiltinFilter(eq, 6)).toBe(false)

    const neq = Filter.neq('c', 5) as CompareFilter
    expect(evaluateBuiltinFilter(neq, 5)).toBe(false)
    expect(evaluateBuiltinFilter(neq, 6)).toBe(true)
  })

  it('gt / gte / lt / lte for numbers', () => {
    expect(evaluateBuiltinFilter(Filter.gt('c', 5) as CompareFilter, 6)).toBe(true)
    expect(evaluateBuiltinFilter(Filter.gt('c', 5) as CompareFilter, 5)).toBe(false)
    expect(evaluateBuiltinFilter(Filter.gte('c', 5) as CompareFilter, 5)).toBe(true)
    expect(evaluateBuiltinFilter(Filter.lt('c', 5) as CompareFilter, 4)).toBe(true)
    expect(evaluateBuiltinFilter(Filter.lt('c', 5) as CompareFilter, 5)).toBe(false)
    expect(evaluateBuiltinFilter(Filter.lte('c', 5) as CompareFilter, 5)).toBe(true)
  })

  it('eq for strings', () => {
    const f = Filter.eq('c', 'hello') as CompareFilter
    expect(evaluateBuiltinFilter(f, 'hello')).toBe(true)
    expect(evaluateBuiltinFilter(f, 'world')).toBe(false)
  })

  it('compare for dates', () => {
    const d1 = new Date('2024-01-01')
    const d2 = new Date('2024-06-01')
    const f = Filter.gt('c', d1) as CompareFilter
    expect(evaluateBuiltinFilter(f, d2)).toBe(true)
    expect(evaluateBuiltinFilter(f, d1)).toBe(false)
  })

  it('eq for dates', () => {
    const d = new Date('2024-01-01')
    const f = Filter.eq('c', d) as CompareFilter
    expect(evaluateBuiltinFilter(f, new Date('2024-01-01'))).toBe(true)
    expect(evaluateBuiltinFilter(f, new Date('2024-06-01'))).toBe(false)
  })

  it('compare for bigint', () => {
    const f = Filter.gte('c', 100n) as CompareFilter
    expect(evaluateBuiltinFilter(f, 100n)).toBe(true)
    expect(evaluateBuiltinFilter(f, 99n)).toBe(false)
  })

  it('returns false for null values', () => {
    const f = Filter.eq('c', 5) as CompareFilter
    expect(evaluateBuiltinFilter(f, null)).toBe(false)
    expect(evaluateBuiltinFilter(f, undefined)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// evaluateBuiltinFilter — range
// ---------------------------------------------------------------------------

describe('evaluateBuiltinFilter — range', () => {
  it('inclusive range (default)', () => {
    const f = Filter.between('c', 10, 20) as RangeFilter
    expect(evaluateBuiltinFilter(f, 10)).toBe(true)
    expect(evaluateBuiltinFilter(f, 15)).toBe(true)
    expect(evaluateBuiltinFilter(f, 20)).toBe(true)
    expect(evaluateBuiltinFilter(f, 9)).toBe(false)
    expect(evaluateBuiltinFilter(f, 21)).toBe(false)
  })

  it('exclusive range', () => {
    const f = Filter.between('c', 10, 20, true) as RangeFilter
    expect(evaluateBuiltinFilter(f, 10)).toBe(false)
    expect(evaluateBuiltinFilter(f, 11)).toBe(true)
    expect(evaluateBuiltinFilter(f, 19)).toBe(true)
    expect(evaluateBuiltinFilter(f, 20)).toBe(false)
  })

  it('min only', () => {
    const f = Filter.between('c', 10, undefined) as RangeFilter
    expect(evaluateBuiltinFilter(f, 10)).toBe(true)
    expect(evaluateBuiltinFilter(f, 9)).toBe(false)
    expect(evaluateBuiltinFilter(f, 1000)).toBe(true)
  })

  it('max only', () => {
    const f = Filter.between('c', undefined, 20) as RangeFilter
    expect(evaluateBuiltinFilter(f, 20)).toBe(true)
    expect(evaluateBuiltinFilter(f, 21)).toBe(false)
    expect(evaluateBuiltinFilter(f, -100)).toBe(true)
  })

  it('returns false for null values', () => {
    const f = Filter.between('c', 1, 10) as RangeFilter
    expect(evaluateBuiltinFilter(f, null)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// evaluateBuiltinFilter — set
// ---------------------------------------------------------------------------

describe('evaluateBuiltinFilter — set', () => {
  it('include mode', () => {
    const f = Filter.oneOf('c', ['admin', 'editor']) as SetFilter
    expect(evaluateBuiltinFilter(f, 'admin')).toBe(true)
    expect(evaluateBuiltinFilter(f, 'editor')).toBe(true)
    expect(evaluateBuiltinFilter(f, 'viewer')).toBe(false)
  })

  it('exclude mode', () => {
    const f = Filter.noneOf('c', ['blocked', 'spam']) as SetFilter
    expect(evaluateBuiltinFilter(f, 'blocked')).toBe(false)
    expect(evaluateBuiltinFilter(f, 'active')).toBe(true)
  })

  it('numeric set', () => {
    const f = Filter.oneOf('c', [1, 2, 3]) as SetFilter
    expect(evaluateBuiltinFilter(f, 2)).toBe(true)
    expect(evaluateBuiltinFilter(f, 4)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// evaluateBuiltinFilter — boolean
// ---------------------------------------------------------------------------

describe('evaluateBuiltinFilter — boolean', () => {
  it('isTrue', () => {
    const f = Filter.isTrue('c') as BooleanFilter
    expect(evaluateBuiltinFilter(f, true)).toBe(true)
    expect(evaluateBuiltinFilter(f, false)).toBe(false)
  })

  it('isFalse', () => {
    const f = Filter.isFalse('c') as BooleanFilter
    expect(evaluateBuiltinFilter(f, false)).toBe(true)
    expect(evaluateBuiltinFilter(f, true)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// evaluateBuiltinFilter — null
// ---------------------------------------------------------------------------

describe('evaluateBuiltinFilter — null', () => {
  it('isNull', () => {
    const f = Filter.isNull('c') as NullFilter
    expect(evaluateBuiltinFilter(f, null)).toBe(true)
    expect(evaluateBuiltinFilter(f, undefined)).toBe(true)
    expect(evaluateBuiltinFilter(f, 'value')).toBe(false)
  })

  it('isNotNull', () => {
    const f = Filter.isNotNull('c') as NullFilter
    expect(evaluateBuiltinFilter(f, null)).toBe(false)
    expect(evaluateBuiltinFilter(f, 'value')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// evaluateFilterExpr
// ---------------------------------------------------------------------------

describe('evaluateFilterExpr', () => {
  const accessor = (col: string, row: Record<string, unknown>) => row[col]

  it('evaluates single builtin filter', () => {
    const f = Filter.gt('age', 25)
    expect(evaluateFilterExpr(f, { age: 30 }, accessor)).toBe(true)
    expect(evaluateFilterExpr(f, { age: 20 }, accessor)).toBe(false)
  })

  it('evaluates AND', () => {
    const f = Filter.and(
      Filter.gt('age', 18),
      Filter.lt('age', 65)
    )
    expect(evaluateFilterExpr(f, { age: 30 }, accessor)).toBe(true)
    expect(evaluateFilterExpr(f, { age: 10 }, accessor)).toBe(false)
    expect(evaluateFilterExpr(f, { age: 70 }, accessor)).toBe(false)
  })

  it('evaluates OR', () => {
    const f = Filter.or(
      Filter.eq('role', 'admin'),
      Filter.eq('role', 'editor')
    )
    expect(evaluateFilterExpr(f, { role: 'admin' }, accessor)).toBe(true)
    expect(evaluateFilterExpr(f, { role: 'editor' }, accessor)).toBe(true)
    expect(evaluateFilterExpr(f, { role: 'viewer' }, accessor)).toBe(false)
  })

  it('evaluates NOT', () => {
    const f = Filter.not(Filter.eq('status', 'blocked'))
    expect(evaluateFilterExpr(f, { status: 'active' }, accessor)).toBe(true)
    expect(evaluateFilterExpr(f, { status: 'blocked' }, accessor)).toBe(false)
  })

  it('delegates custom filter kind to callback', () => {
    const custom: FilterBase = { kind: 'geo-radius', column: 'location' }
    const opts = {
      evaluateFilter: (_f: FilterBase, row: Record<string, unknown>) =>
        (row.location as string) === 'NYC',
    }
    expect(evaluateFilterExpr(custom, { location: 'NYC' }, accessor, opts)).toBe(true)
    expect(evaluateFilterExpr(custom, { location: 'LA' }, accessor, opts)).toBe(false)
  })

  it('includes row when custom kind has no handler', () => {
    const custom: FilterBase = { kind: 'unknown', column: 'c' }
    expect(evaluateFilterExpr(custom, { c: 'x' }, accessor)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// describeBuiltinFilter
// ---------------------------------------------------------------------------

describe('describeBuiltinFilter', () => {
  it('text filter', () => {
    expect(describeBuiltinFilter(Filter.contains('name', 'alice'))).toBe(
      'name contains "alice"'
    )
    expect(describeBuiltinFilter(Filter.notContains('name', 'x'))).toBe(
      'name does not contain "x"'
    )
    expect(describeBuiltinFilter(Filter.equals('name', 'Bob'))).toBe(
      'name equals "Bob"'
    )
    expect(describeBuiltinFilter(Filter.startsWith('name', 'A'))).toBe(
      'name starts with "A"'
    )
    expect(describeBuiltinFilter(Filter.endsWith('name', 'e'))).toBe(
      'name ends with "e"'
    )
  })

  it('compare filter', () => {
    expect(describeBuiltinFilter(Filter.gt('age', 30))).toBe('age > 30')
    expect(describeBuiltinFilter(Filter.lte('age', 65))).toBe('age \u2264 65')
    expect(describeBuiltinFilter(Filter.eq('name', 'Alice'))).toBe(
      'name = Alice'
    )
  })

  it('range filter', () => {
    const desc = describeBuiltinFilter(Filter.between('age', 18, 65))
    expect(desc).toBe('18 \u2264 age \u2264 65')
  })

  it('range filter exclusive', () => {
    const desc = describeBuiltinFilter(Filter.between('age', 18, 65, true))
    expect(desc).toBe('18 < age < 65')
  })

  it('range filter min only', () => {
    const desc = describeBuiltinFilter(Filter.between('age', 18, undefined))
    expect(desc).toBe('age \u2265 18')
  })

  it('range filter max only', () => {
    const desc = describeBuiltinFilter(Filter.between('age', undefined, 65))
    expect(desc).toBe('age \u2264 65')
  })

  it('set filter', () => {
    expect(describeBuiltinFilter(Filter.oneOf('role', ['admin', 'editor']))).toBe(
      'role in [admin, editor]'
    )
    expect(describeBuiltinFilter(Filter.noneOf('status', [1, 2]))).toBe(
      'status not in [1, 2]'
    )
  })

  it('boolean filter', () => {
    expect(describeBuiltinFilter(Filter.isTrue('active'))).toBe(
      'active is true'
    )
    expect(describeBuiltinFilter(Filter.isFalse('active'))).toBe(
      'active is false'
    )
  })

  it('null filter', () => {
    expect(describeBuiltinFilter(Filter.isNull('deletedAt'))).toBe(
      'deletedAt is null'
    )
    expect(describeBuiltinFilter(Filter.isNotNull('email'))).toBe(
      'email is not null'
    )
  })
})

// ---------------------------------------------------------------------------
// describeFilter (with custom callback)
// ---------------------------------------------------------------------------

describe('describeFilter', () => {
  it('describes builtin filter', () => {
    expect(describeFilter(Filter.contains('name', 'alice'))).toBe(
      'name contains "alice"'
    )
  })

  it('uses custom callback for unknown kinds', () => {
    const custom: FilterBase = { kind: 'geo', column: 'loc' }
    expect(
      describeFilter(custom, { describeFilter: f => `${f.column} [geo]` })
    ).toBe('loc [geo]')
  })

  it('fallback for unknown kind without callback', () => {
    const custom: FilterBase = { kind: 'geo', column: 'loc' }
    expect(describeFilter(custom)).toBe('loc: [geo]')
  })
})

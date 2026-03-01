import { describe, it, expect } from 'vitest'
import {
  Filter,
  evaluateBuiltinFilter,
  describeBuiltinFilter,
  isBuiltinFilter,
  CompositeColumnFilter,
} from '../src/components/data/filter'
import { createDataSource } from '../src/components/data/data-source'
import { prop } from '@tempots/dom'

describe('CompositeColumnFilter', () => {
  describe('Filter.composite builder', () => {
    it('should produce correct shape', () => {
      const f = Filter.composite('salary', 'and', [
        Filter.gt('salary', 100000),
        Filter.lt('salary', 200000),
      ])
      expect(f.kind).toBe('composite')
      expect(f.column).toBe('salary')
      expect(f.mode).toBe('and')
      expect(f.filters).toHaveLength(2)
    })

    it('should produce or mode', () => {
      const f = Filter.composite('dept', 'or', [
        Filter.equals('dept', 'Engineering'),
        Filter.equals('dept', 'Design'),
      ])
      expect(f.mode).toBe('or')
    })

    it('should allow empty filters array', () => {
      const f = Filter.composite('x', 'and', [])
      expect(f.filters).toHaveLength(0)
    })
  })

  describe('isBuiltinFilter', () => {
    it('should recognize composite as builtin', () => {
      const f = Filter.composite('col', 'and', [Filter.gt('col', 10)])
      expect(isBuiltinFilter(f)).toBe(true)
    })
  })

  describe('evaluateBuiltinFilter', () => {
    it('AND mode — all conditions must pass', () => {
      const f = Filter.composite('salary', 'and', [
        Filter.gt('salary', 50000),
        Filter.lt('salary', 150000),
      ])
      // 80000 passes both
      expect(evaluateBuiltinFilter(f, 80000)).toBe(true)
      // 200000 fails lt
      expect(evaluateBuiltinFilter(f, 200000)).toBe(false)
      // 30000 fails gt
      expect(evaluateBuiltinFilter(f, 30000)).toBe(false)
    })

    it('OR mode — at least one condition must pass', () => {
      const f = Filter.composite('name', 'or', [
        Filter.contains('name', 'alice'),
        Filter.contains('name', 'bob'),
      ])
      expect(evaluateBuiltinFilter(f, 'alice smith')).toBe(true)
      expect(evaluateBuiltinFilter(f, 'bob jones')).toBe(true)
      expect(evaluateBuiltinFilter(f, 'charlie')).toBe(false)
    })

    it('empty filters — AND returns true, OR returns false', () => {
      const andF = Filter.composite('x', 'and', [])
      const orF = Filter.composite('x', 'or', [])
      // Array.every on empty => true, Array.some on empty => false
      expect(evaluateBuiltinFilter(andF, 'anything')).toBe(true)
      expect(evaluateBuiltinFilter(orF, 'anything')).toBe(false)
    })

    it('single child — behaves like the child filter', () => {
      const f = Filter.composite('col', 'and', [
        Filter.equals('col', 'hello'),
      ])
      expect(evaluateBuiltinFilter(f, 'hello')).toBe(true)
      expect(evaluateBuiltinFilter(f, 'world')).toBe(false)
    })
  })

  describe('describeBuiltinFilter', () => {
    it('AND mode — joins with AND', () => {
      const f = Filter.composite('salary', 'and', [
        Filter.gt('salary', 100000),
        Filter.lt('salary', 200000),
      ])
      const desc = describeBuiltinFilter(f)
      expect(desc).toContain('AND')
      expect(desc).toContain('salary > 100000')
      expect(desc).toContain('salary < 200000')
    })

    it('OR mode — joins with OR', () => {
      const f = Filter.composite('name', 'or', [
        Filter.contains('name', 'a'),
        Filter.contains('name', 'b'),
      ])
      const desc = describeBuiltinFilter(f)
      expect(desc).toContain('OR')
    })

    it('empty filters — shows (empty)', () => {
      const f = Filter.composite('x', 'and', [])
      expect(describeBuiltinFilter(f)).toBe('x: (empty)')
    })
  })

  describe('DataSource integration', () => {
    interface Row {
      id: string
      name: string
      salary: number
    }

    const rows: Row[] = [
      { id: '1', name: 'Alice', salary: 120000 },
      { id: '2', name: 'Bob', salary: 80000 },
      { id: '3', name: 'Charlie', salary: 150000 },
      { id: '4', name: 'Diana', salary: 95000 },
    ]

    it('composite AND filter narrows results', () => {
      const ds = createDataSource<Row>({
        data: prop(rows),
        rowId: r => r.id,
      })

      ds.setFilter(
        Filter.composite('salary', 'and', [
          Filter.gt('salary', 90000),
          Filter.lt('salary', 130000),
        ])
      )

      const result = ds.rows.value
      expect(result.map(r => r.name)).toEqual(['Alice', 'Diana'])
      ds.dispose()
    })

    it('composite OR filter widens results', () => {
      const ds = createDataSource<Row>({
        data: prop(rows),
        rowId: r => r.id,
      })

      ds.setFilter(
        Filter.composite('name', 'or', [
          Filter.contains('name', 'li'),
          Filter.contains('name', 'ob'),
        ])
      )

      const result = ds.rows.value
      expect(result.map(r => r.name)).toEqual(['Alice', 'Bob', 'Charlie'])
      ds.dispose()
    })

    it('setFilter replaces previous column filter', () => {
      const ds = createDataSource<Row>({
        data: prop(rows),
        rowId: r => r.id,
      })

      ds.setFilter(Filter.gt('salary', 100000))
      expect(ds.rows.value).toHaveLength(2) // Alice, Charlie

      // Replace with composite
      ds.setFilter(
        Filter.composite('salary', 'and', [
          Filter.gt('salary', 90000),
          Filter.lt('salary', 130000),
        ])
      )
      expect(ds.rows.value.map(r => r.name)).toEqual(['Alice', 'Diana'])
      ds.dispose()
    })

    it('getColumnFilters returns composite filter', () => {
      const ds = createDataSource<Row>({
        data: prop(rows),
        rowId: r => r.id,
      })

      const composite = Filter.composite('salary', 'and', [
        Filter.gt('salary', 90000),
      ])
      ds.setFilter(composite)

      const colFilters = ds.getColumnFilters('salary').value
      expect(colFilters).toHaveLength(1)
      expect((colFilters[0] as CompositeColumnFilter).kind).toBe('composite')
      ds.dispose()
    })
  })
})

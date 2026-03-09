import { describe, it, expect, beforeEach } from 'vitest'
import { prop, render, Value } from '@tempots/dom'
import {
  createDataSource,
  DataSource,
} from '../../src/components/data/data-source'
import { DataTable } from '../../src/components/data/data-table'
import { WithProviders } from '../helpers/test-providers'

interface TestRow {
  id: string
  name: string
  age: number
}

const testData: TestRow[] = [
  { id: '1', name: 'Charlie', age: 30 },
  { id: '2', name: 'Alice', age: 25 },
  { id: '3', name: 'Bob', age: 35 },
]

function flush(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

describe('DataTable sort icon signal propagation', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  describe('DataSource in isolation', () => {
    it('getSortDirection signal should update after toggleSort (pull)', () => {
      const ds = createDataSource<TestRow>({
        data: prop(testData),
        rowId: row => row.id,
      })

      const direction = ds.getSortDirection('name')
      expect(direction.value).toBeUndefined()

      ds.toggleSort('name')
      expect(direction.value).toBe('asc')

      ds.toggleSort('name')
      expect(direction.value).toBe('desc')

      ds.toggleSort('name')
      expect(direction.value).toBeUndefined()

      ds.dispose()
    })

    it('getSortDirection signal should push notifications via Value.on', () => {
      const ds = createDataSource<TestRow>({
        data: prop(testData),
        rowId: row => row.id,
      })

      const direction = ds.getSortDirection('name')
      const observed: (string | undefined)[] = []
      const unsub = Value.on(direction, d => observed.push(d))

      ds.toggleSort('name')
      ds.toggleSort('name')
      ds.toggleSort('name')

      // Should receive initial + all changes
      expect(observed).toContain('asc')
      expect(observed).toContain('desc')

      unsub()
      ds.dispose()
    })

    it('direction.map should propagate updates (pull-based)', () => {
      const ds = createDataSource<TestRow>({
        data: prop(testData),
        rowId: row => row.id,
      })

      const direction = ds.getSortDirection('name')
      const iconName = direction.map((d): string => {
        switch (d) {
          case 'asc':
            return 'line-md:arrow-small-up'
          case 'desc':
            return 'line-md:arrow-small-down'
          default:
            return 'line-md:arrows-vertical'
        }
      })

      expect(iconName.value).toBe('line-md:arrows-vertical')

      ds.toggleSort('name')
      expect(iconName.value).toBe('line-md:arrow-small-up')

      ds.toggleSort('name')
      expect(iconName.value).toBe('line-md:arrow-small-down')

      ds.toggleSort('name')
      expect(iconName.value).toBe('line-md:arrows-vertical')

      iconName.dispose()
      ds.dispose()
    })
  })

  describe('DataTable rendered context', () => {
    it('should render sortable header with correct initial aria-sort', async () => {
      render(
        WithProviders(() =>
          DataTable<TestRow>({
            data: prop(testData),
            columns: [
              {
                id: 'name',
                header: 'Name',
                cell: row => Value.map(row, r => r.name),
                sortable: true,
              },
            ],
            rowId: r => r.id,
            sortable: true,
          })
        ),
        container
      )

      await flush()

      const nameTh = container.querySelector(
        'th.bc-sortable-header'
      ) as HTMLElement
      expect(nameTh).not.toBeNull()
      expect(nameTh.getAttribute('aria-sort')).toBe('none')
      expect(nameTh.className).toBe('bc-sortable-header')
    })

    it('th aria-sort and class should update after clicking', async () => {
      render(
        WithProviders(() =>
          DataTable<TestRow>({
            data: prop(testData),
            columns: [
              {
                id: 'name',
                header: 'Name',
                cell: row => Value.map(row, r => r.name),
                sortable: true,
              },
            ],
            rowId: r => r.id,
            sortable: true,
          })
        ),
        container
      )

      await flush()

      const nameTh = container.querySelector(
        'th.bc-sortable-header'
      ) as HTMLElement

      nameTh.click()
      await flush()

      expect(nameTh.getAttribute('aria-sort')).toBe('ascending')
      expect(nameTh.className).toContain('bc-sortable-header--asc')

      nameTh.click()
      await flush()

      expect(nameTh.getAttribute('aria-sort')).toBe('descending')
      expect(nameTh.className).toContain('bc-sortable-header--desc')

      nameTh.click()
      await flush()

      expect(nameTh.getAttribute('aria-sort')).toBe('none')
      expect(nameTh.className).toBe('bc-sortable-header')
    })

    it('icon element class should update to reflect active sort direction', async () => {
      let capturedDs: DataSource<TestRow> | undefined

      render(
        WithProviders(() =>
          DataTable<TestRow>({
            data: prop(testData),
            columns: [
              {
                id: 'name',
                header: 'Name',
                cell: row => Value.map(row, r => r.name),
                sortable: true,
              },
            ],
            rowId: r => r.id,
            sortable: true,
            onDataSource: ds => {
              capturedDs = ds
            },
          })
        ),
        container
      )

      await flush()

      const iconSpan = container.querySelector(
        '.bc-sortable-header__icon'
      ) as HTMLElement
      expect(iconSpan).not.toBeNull()
      expect(iconSpan.className).toBe('bc-sortable-header__icon')

      capturedDs!.toggleSort('name')
      await flush()

      expect(iconSpan.className).toContain('bc-sortable-header__icon--active')
    })

    it('getSortDirection value should be correct after sort in DataTable context', async () => {
      let capturedDs: DataSource<TestRow> | undefined

      render(
        WithProviders(() =>
          DataTable<TestRow>({
            data: prop(testData),
            columns: [
              {
                id: 'name',
                header: 'Name',
                cell: row => Value.map(row, r => r.name),
                sortable: true,
              },
            ],
            rowId: r => r.id,
            sortable: true,
            onDataSource: ds => {
              capturedDs = ds
            },
          })
        ),
        container
      )

      await flush()

      capturedDs!.toggleSort('name')
      await flush()

      expect(capturedDs!.getSortDirection('name').value).toBe('asc')
    })
  })
})

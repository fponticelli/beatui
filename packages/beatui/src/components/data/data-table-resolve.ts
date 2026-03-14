import {
  attr,
  Fragment,
  html,
  OnDispose,
  prop,
  Signal,
  TNode,
  Value,
} from '@tempots/dom'
import { ControlSize } from '../theme'
import { DataSource } from './data-source'
import {
  ColumnFilterConfig,
  DataColumnDef,
  DataTablePaginationOptions,
  DataTableToolbarOptions,
} from './data-table-types'
import { ColumnFilter } from './column-filter'
import { ColumnFilterPanel } from './column-filter-panel'
import { Filter } from './filter'
import { RowGroup } from './data-source'

export function resolveToolbarOptions(
  toolbar: boolean | DataTableToolbarOptions
): DataTableToolbarOptions | false {
  if (toolbar === true) return {}
  if (toolbar === false || toolbar == null) return false
  return toolbar
}

/**
 * Partition groups into pages, keeping whole groups together.
 * A group only spans multiple pages if it alone exceeds pageSize.
 * Collapsed groups count as 1 row (just the header) for page capacity.
 */
export function paginateGroups<T>(
  groups: RowGroup<T>[],
  pageSize: number,
  collapsed: Set<string>
): RowGroup<T>[][] {
  if (pageSize <= 0) return [groups]
  const pages: RowGroup<T>[][] = []
  let page: RowGroup<T>[] = []
  let pageRows = 0

  for (const group of groups) {
    // Collapsed groups take up only 1 row (the header)
    const effectiveRows = collapsed.has(group.key) ? 1 : group.rows.length

    if (effectiveRows <= pageSize) {
      // Small or collapsed group — keep together
      if (pageRows > 0 && pageRows + effectiveRows > pageSize) {
        pages.push(page)
        page = []
        pageRows = 0
      }
      page.push(group)
      pageRows += effectiveRows
    } else {
      // Large expanded group — split into pageSize chunks
      if (pageRows > 0) {
        pages.push(page)
        page = []
        pageRows = 0
      }
      let offset = 0
      while (offset < group.rows.length) {
        const chunk = group.rows.slice(offset, offset + pageSize)
        page.push({ key: group.key, rows: chunk })
        pageRows = chunk.length
        if (offset + pageSize < group.rows.length) {
          pages.push(page)
          page = []
          pageRows = 0
        }
        offset += pageSize
      }
    }
  }
  if (page.length > 0) pages.push(page)
  return pages.length > 0 ? pages : [[]]
}

export function resolvePaginationOptions(
  pagination: boolean | DataTablePaginationOptions
): DataTablePaginationOptions | false {
  if (pagination === true) return { pageSize: 10 }
  if (pagination === false || pagination == null) return false
  return pagination
}

/**
 * Resolve a static ColumnFilterConfig into filter UI content.
 * Returns null when the config disables filtering.
 */
export function resolveFilterContent<T, C extends string>(
  config: ColumnFilterConfig<T, C> | false | undefined,
  ds: DataSource<T, C>,
  colId: C,
  size: Value<ControlSize>
): TNode {
  if (config == null || config === false) return null

  if (config === true || config === 'text') {
    return html.div(
      attr.class('bc-column-filter-panel'),
      ColumnFilter({ dataSource: ds, column: colId, size })
    )
  }

  if (config === 'number') {
    return ColumnFilterPanel({
      dataSource: ds,
      column: colId,
      columnType: 'number',
      size,
      embedded: true,
    })
  }

  if (typeof config === 'object' && 'render' in config) {
    return config.render({ dataSource: ds, column: colId, size })
  }

  if (typeof config === 'object' && 'input' in config) {
    return resolveCustomInput(config, ds, colId, size)
  }

  if (typeof config === 'object' && 'type' in config) {
    switch (config.type) {
      case 'select':
        return html.div(
          attr.class('bc-column-filter-panel'),
          ColumnFilter({
            dataSource: ds,
            column: colId,
            type: 'select',
            options: config.options,
            size,
          })
        )
      case 'tags':
        return html.div(
          attr.class('bc-column-filter-panel'),
          ColumnFilter({
            dataSource: ds,
            column: colId,
            type: 'tags',
            options: config.options,
            size,
          })
        )
      case 'panel':
        return ColumnFilterPanel({
          dataSource: ds,
          column: colId,
          columnType: config.valueType,
          size,
          embedded: true,
        })
    }
  }

  return null
}

/**
 * Create a writable prop synced with the data source's text filter value.
 * Returns the node from the custom input callback plus disposal logic.
 */
function resolveCustomInput<T, C extends string>(
  config: { input: (value: Signal<string>, size: Value<ControlSize>) => TNode },
  ds: DataSource<T, C>,
  colId: C,
  size: Value<ControlSize>
): TNode {
  const readValue = ds.getTextFilterValue(colId)
  const value = prop(readValue.value)
  let syncing = false
  const unsub1 = readValue.on(v => {
    if (!syncing && value.value !== v) {
      syncing = true
      value.set(v)
      syncing = false
    }
  })
  const unsub2 = value.on(v => {
    if (!syncing && readValue.value !== v) {
      syncing = true
      if (v === '') ds.removeFilter(colId)
      else ds.setFilter(Filter.text(colId, 'contains', v))
      syncing = false
    }
  })
  return Fragment(
    OnDispose(() => {
      unsub1()
      unsub2()
      value.dispose()
    }),
    config.input(value, size)
  )
}

/**
 * Resolve a static ColumnFilterConfig into filter cell content (for 'row' layout).
 */
export function resolveFilterCell<T, C extends string>(
  config: ColumnFilterConfig<T, C> | false | undefined,
  ds: DataSource<T, C>,
  colId: C,
  size: Value<ControlSize>
): TNode {
  if (config == null || config === false) return html.th()

  if (config === true || config === 'text') {
    return html.th(ColumnFilter({ dataSource: ds, column: colId, size }))
  }

  if (config === 'number') {
    return html.th(
      ColumnFilterPanel({
        dataSource: ds,
        column: colId,
        columnType: 'number',
        size,
      })
    )
  }

  if (typeof config === 'object' && 'render' in config) {
    return html.th(config.render({ dataSource: ds, column: colId, size }))
  }

  if (typeof config === 'object' && 'input' in config) {
    return html.th(resolveCustomInput(config, ds, colId, size))
  }

  if (typeof config === 'object' && 'type' in config) {
    switch (config.type) {
      case 'select':
        return html.th(
          ColumnFilter({
            dataSource: ds,
            column: colId,
            type: 'select',
            options: config.options,
            size,
          })
        )
      case 'tags':
        return html.th(
          ColumnFilter({
            dataSource: ds,
            column: colId,
            type: 'tags',
            options: config.options,
            size,
          })
        )
      case 'panel':
        return html.th(
          ColumnFilterPanel({
            dataSource: ds,
            column: colId,
            columnType: config.valueType,
            size,
          })
        )
    }
  }

  return html.th()
}

/** Resolve the current filter config for a column (static snapshot) */
export function getFilterConfig<T, C extends string>(
  col: DataColumnDef<T, C>
): ColumnFilterConfig<T, C> | false | undefined {
  if (col.filter == null) return undefined
  return Value.get(col.filter) as ColumnFilterConfig<T, C>
}

/** Check if a column has any filter configured (non-reactive check for setup) */
export function colHasFilter<T, C extends string>(
  col: DataColumnDef<T, C>
): boolean {
  return col.filter != null
}

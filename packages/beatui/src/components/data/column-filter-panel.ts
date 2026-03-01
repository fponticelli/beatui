import {
  attr,
  ForEach,
  Fragment,
  html,
  MapSignal,
  on,
  OnDispose,
  prop,
  TNode,
  Value,
  When,
} from '@tempots/dom'
import { DataSource } from './data-source'
import {
  BuiltinFilter,
  CompositeColumnFilter,
  CompareOperator,
  Filter,
  TextOperator,
} from './filter'
import { ColumnValueType } from './data-table-types'
import { ControlSize } from '../theme'
import { Icon } from './icon'
import { Flyout } from '../navigation/flyout'
import { NativeSelect } from '../form/input/native-select'
import { TextInput } from '../form/input/text-input'
import { NumberInput } from '../form/input/number-input'
import { CloseButton } from '../button/close-button'
import { Button } from '../button/button'
import { SegmentedInput } from '../form/input/segmented-input'
import { Option, SelectOption } from '../form/input/option'
import { Use } from '@tempots/dom'
import { BeatUII18n } from '../../beatui-i18n'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const TEXT_OPERATORS: { value: string; labelKey: string }[] = [
  { value: 'contains', labelKey: 'filterPanelContains' },
  { value: 'notContains', labelKey: 'filterPanelNotContains' },
  { value: 'equals', labelKey: 'filterPanelEquals' },
  { value: 'notEquals', labelKey: 'filterPanelNotEquals' },
  { value: 'startsWith', labelKey: 'filterPanelStartsWith' },
  { value: 'endsWith', labelKey: 'filterPanelEndsWith' },
  { value: 'isNull', labelKey: 'filterPanelIsNull' },
  { value: 'isNotNull', labelKey: 'filterPanelIsNotNull' },
]

const NUMBER_OPERATORS: { value: string; labelKey: string }[] = [
  { value: 'eq', labelKey: 'filterPanelEquals' },
  { value: 'neq', labelKey: 'filterPanelNotEquals' },
  { value: 'gt', labelKey: 'filterPanelGt' },
  { value: 'gte', labelKey: 'filterPanelGte' },
  { value: 'lt', labelKey: 'filterPanelLt' },
  { value: 'lte', labelKey: 'filterPanelLte' },
  { value: 'between', labelKey: 'filterPanelBetween' },
  { value: 'isNull', labelKey: 'filterPanelIsNull' },
  { value: 'isNotNull', labelKey: 'filterPanelIsNotNull' },
]

interface FilterCondition {
  id: number
  operator: string
  value: string
}

const NULL_OPS = new Set(['isNull', 'isNotNull'])

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/**
 * Options for the {@link ColumnFilterPanel} component.
 *
 * @typeParam T - The type of data rows in the data source
 * @typeParam C - Column identifier type (defaults to `string`)
 */
export interface ColumnFilterPanelOptions<T, C extends string = string> {
  /** The data source to wire filtering into */
  dataSource: DataSource<T, C>
  /** Column identifier */
  column: C
  /** The column value type, determining which operators are available. @default 'text' */
  columnType?: ColumnValueType
  /** Size variant. @default 'sm' */
  size?: Value<ControlSize>
}

// ---------------------------------------------------------------------------
// Helpers — convert between local conditions and filter AST
// ---------------------------------------------------------------------------

function conditionToFilter<C extends string>(
  column: C,
  cond: FilterCondition,
  columnType: ColumnValueType
): BuiltinFilter<C> | null {
  const op = cond.operator

  if (op === 'isNull') return Filter.isNull(column)
  if (op === 'isNotNull') return Filter.isNotNull(column)

  if (cond.value === '') return null

  if (columnType === 'number') {
    if (op === 'between') {
      const parts = cond.value.split(',').map(Number)
      if (parts.length === 2 && !parts.some(isNaN)) {
        return Filter.between(column, parts[0], parts[1])
      }
      return null
    }
    const num = Number(cond.value)
    if (Number.isNaN(num)) return null
    switch (op as CompareOperator) {
      case 'eq':
        return Filter.eq(column, num)
      case 'neq':
        return Filter.neq(column, num)
      case 'gt':
        return Filter.gt(column, num)
      case 'gte':
        return Filter.gte(column, num)
      case 'lt':
        return Filter.lt(column, num)
      case 'lte':
        return Filter.lte(column, num)
      default:
        return null
    }
  }

  return Filter.text(column, op as TextOperator, cond.value)
}

function filterToConditions<C extends string>(
  filter: BuiltinFilter<C>
): FilterCondition[] {
  switch (filter.kind) {
    case 'text':
      return [{ id: nextId(), operator: filter.operator, value: filter.value }]
    case 'compare':
      return [
        {
          id: nextId(),
          operator: filter.operator,
          value: String(filter.value),
        },
      ]
    case 'range':
      return [
        {
          id: nextId(),
          operator: 'between',
          value: `${filter.min},${filter.max}`,
        },
      ]
    case 'null':
      return [{ id: nextId(), operator: filter.operator, value: '' }]
    case 'composite':
      return (filter as CompositeColumnFilter<C>).filters.flatMap(f =>
        filterToConditions(f)
      )
    default:
      return []
  }
}

let _nextId = 0
function nextId(): number {
  return ++_nextId
}

// ---------------------------------------------------------------------------
// Per-condition state management
// ---------------------------------------------------------------------------

interface ConditionState {
  opProp: ReturnType<typeof prop<string>>
  valProp: ReturnType<typeof prop<string>>
  val2Prop: ReturnType<typeof prop<string>>
}

function createConditionState(operator: string, value: string, value2 = ''): ConditionState {
  return {
    opProp: prop(operator),
    valProp: prop(value),
    val2Prop: prop(value2),
  }
}

function disposeConditionState(state: ConditionState) {
  state.opProp.dispose()
  state.valProp.dispose()
  state.val2Prop.dispose()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A flyout-based per-column filter builder that lets users compose
 * multiple conditions with AND/OR logic.
 *
 * @typeParam T - The type of data rows
 * @param opts - Configuration for the filter panel
 * @returns A trigger button with a flyout filter panel
 */
export function ColumnFilterPanel<T, C extends string = string>(
  opts: ColumnFilterPanelOptions<T, C>
): TNode {
  const { dataSource, column, columnType = 'text', size = 'sm' } = opts

  const columnFilters = dataSource.getColumnFilters(column)
  const hasActiveFilters = columnFilters.map(f => f.length > 0)

  // Per-condition state: Maps keyed by condition ID
  const stateMap = new Map<number, ConditionState>()

  // The ID list drives ForEach — only changes on add/remove
  const conditionIds = prop<number[]>([])
  const mode = prop<'and' | 'or'>('and')

  function defaultOperator(): string {
    return columnType === 'number' ? 'eq' : 'contains'
  }

  function createCondition(operator: string, value: string, value2 = ''): number {
    const id = nextId()
    stateMap.set(id, createConditionState(operator, value, value2))
    return id
  }

  function disposeAllConditions() {
    for (const state of stateMap.values()) disposeConditionState(state)
    stateMap.clear()
  }

  function populateFromDataSource() {
    disposeAllConditions()

    const filters = columnFilters.value
    let conds: FilterCondition[]

    if (filters.length === 0) {
      conds = [{ id: 0, operator: defaultOperator(), value: '' }]
      mode.set('and')
    } else {
      const composite = filters.find(f => f.kind === 'composite') as
        | CompositeColumnFilter<C>
        | undefined
      if (composite) {
        mode.set(composite.mode)
        conds = filterToConditions(composite)
      } else {
        mode.set('and')
        conds = filters.flatMap(f => {
          if (
            f.kind === 'text' ||
            f.kind === 'compare' ||
            f.kind === 'range' ||
            f.kind === 'null' ||
            f.kind === 'composite'
          ) {
            return filterToConditions(f as BuiltinFilter<C>)
          }
          return []
        })
      }
      if (conds.length === 0) {
        conds = [{ id: 0, operator: defaultOperator(), value: '' }]
      }
    }

    const ids: number[] = []
    for (const c of conds) {
      if (c.operator === 'between' && c.value.includes(',')) {
        const [v1, v2] = c.value.split(',')
        ids.push(createCondition(c.operator, v1, v2))
      } else {
        ids.push(createCondition(c.operator, c.value))
      }
    }
    conditionIds.set(ids)
  }

  function addCondition() {
    const id = createCondition(defaultOperator(), '')
    conditionIds.set([...conditionIds.value, id])
  }

  function removeCondition(id: number) {
    const state = stateMap.get(id)
    if (state) {
      disposeConditionState(state)
      stateMap.delete(id)
    }
    const next = conditionIds.value.filter(i => i !== id)
    if (next.length === 0) {
      addCondition()
    } else {
      conditionIds.set(next)
    }
  }

  function applyFilters() {
    const ids = conditionIds.value
    const valid = ids
      .map(id => {
        const state = stateMap.get(id)
        if (!state) return null
        const op = state.opProp.value
        // "between" uses val and val2 directly
        if (op === 'between') {
          const min = Number(state.valProp.value)
          const max = Number(state.val2Prop.value)
          if (Number.isNaN(min) || Number.isNaN(max)) return null
          return Filter.between(column, min, max)
        }
        return conditionToFilter(
          column,
          { id, operator: op, value: state.valProp.value },
          columnType
        )
      })
      .filter((f): f is BuiltinFilter<C> => f != null)

    if (valid.length === 0) {
      dataSource.removeFilter(column)
    } else if (valid.length === 1) {
      dataSource.setFilter(valid[0])
    } else {
      dataSource.setFilter(Filter.composite(column, mode.value, valid))
    }
  }

  function clearFilters() {
    dataSource.removeFilter(column)
    disposeAllConditions()
    const id = createCondition(defaultOperator(), '')
    conditionIds.set([id])
    mode.set('and')
  }

  const operators = columnType === 'number' ? NUMBER_OPERATORS : TEXT_OPERATORS

  return Fragment(
    OnDispose(() => {
      disposeAllConditions()
      conditionIds.dispose()
      mode.dispose()
    }),
    html.div(
      attr.class('bc-column-filter-panel__trigger-wrap'),
      html.button(
        attr.class(
          hasActiveFilters.map(
            (active): string =>
              active
                ? 'bc-column-filter-panel__trigger bc-column-filter-panel__trigger--active'
                : 'bc-column-filter-panel__trigger'
          )
        ),
        attr.type('button'),
        Icon({ icon: 'lucide:filter', size }),
        When(hasActiveFilters, () =>
          html.span(attr.class('bc-column-filter-panel__active-dot'))
        ),
        Flyout({
          content: () =>
            Use(BeatUII18n, t => {
              populateFromDataSource()

              const dt = t.$.dataTable

              const operatorOptions: SelectOption<string>[] = operators.map(
                op =>
                  Option.value(
                    op.value,
                    dt.value[
                      op.labelKey as keyof typeof dt.value
                    ] as string
                  )
              )

              return html.div(
                attr.class('bc-column-filter-panel'),
                on.click(e => e.stopPropagation()),

                // AND/OR mode toggle
                When(
                  conditionIds.map(ids => ids.length >= 2),
                  () =>
                    html.div(
                      attr.class('bc-column-filter-panel__mode'),
                      SegmentedInput({
                        options: {
                          and: dt.map(d => d.filterPanelAnd),
                          or: dt.map(d => d.filterPanelOr),
                        },
                        value: mode as Value<'and' | 'or'>,
                        onChange: (v: 'and' | 'or') => mode.set(v),
                        size: 'xs',
                      })
                    )
                ),

                // Condition rows
                html.div(
                  attr.class('bc-column-filter-panel__conditions'),
                  ForEach(conditionIds, idSignal =>
                    MapSignal(idSignal, id => {
                      const state = stateMap.get(id)
                      if (!state) return null

                      const valuePlaceholder = dt.map(
                        d => d.filterPanelValuePlaceholder
                      )

                      const makeNumberInput = (
                        valProp: ReturnType<typeof prop<string>>,
                        placeholder?: Value<string>
                      ) =>
                        NumberInput({
                          value: valProp.map(v =>
                            v === '' ? 0 : Number(v)
                          ),
                          size: 'xs',
                          class: 'bc-column-filter-panel__value',
                          placeholder: placeholder ?? valuePlaceholder,
                          onChange: (v: number) =>
                            valProp.set(String(v)),
                        })

                      const makeTextInput = (
                        valProp: ReturnType<typeof prop<string>>
                      ) =>
                        TextInput({
                          value: valProp,
                          size: 'xs',
                          class: 'bc-column-filter-panel__value',
                          placeholder: valuePlaceholder,
                          onInput: (v: string) => valProp.set(v),
                        })

                      // Value row content depends on operator
                      const valueRow = (): TNode => {
                        if (columnType === 'number') {
                          // "between" shows two number inputs
                          const isBetween = state.opProp.map(
                            op => op === 'between'
                          )
                          return Fragment(
                            makeNumberInput(state.valProp),
                            When(isBetween, () =>
                              makeNumberInput(state.val2Prop)
                            )
                          )
                        }
                        return makeTextInput(state.valProp)
                      }

                      return html.div(
                        attr.class('bc-column-filter-panel__row'),
                        // Operator + close on one line
                        html.div(
                          attr.class('bc-column-filter-panel__row-header'),
                          NativeSelect<string>({
                            value: state.opProp,
                            options: operatorOptions,
                            size: 'xs',
                            class: 'bc-column-filter-panel__operator',
                            onChange: (v: string) => state.opProp.set(v),
                          }),
                          CloseButton({
                            size: 'xs',
                            onClick: () => removeCondition(id),
                          })
                        ),
                        // Value input(s) below — hidden for null ops
                        html.div(
                          attr.class(
                            state.opProp.map((op): string =>
                              NULL_OPS.has(op)
                                ? 'bc-column-filter-panel__value-wrap bc-column-filter-panel__value-wrap--hidden'
                                : 'bc-column-filter-panel__value-wrap'
                            )
                          ),
                          valueRow()
                        )
                      )
                    })
                  )
                ),

                // Add condition
                html.div(
                  attr.class('bc-column-filter-panel__add'),
                  html.button(
                    attr.type('button'),
                    attr.class('bc-column-filter-panel__add-btn'),
                    on.click(() => addCondition()),
                    '+ ',
                    dt.map(d => d.filterPanelAddCondition)
                  )
                ),

                // Footer actions
                html.div(
                  attr.class('bc-column-filter-panel__actions'),
                  Button(
                    {
                      size: 'xs',
                      variant: 'outline',
                      onClick: () => clearFilters(),
                    },
                    dt.map(d => d.filterPanelClear)
                  ),
                  Button(
                    {
                      size: 'xs',
                      variant: 'filled',
                      onClick: () => applyFilters(),
                    },
                    dt.map(d => d.filterPanelApply)
                  )
                )
              )
            }),
          placement: 'bottom-start',
          showOn: 'click',
          showDelay: 0,
          hideDelay: 0,
        })
      )
    )
  )
}

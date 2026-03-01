// ---------------------------------------------------------------------------
// Value-type discriminators
// ---------------------------------------------------------------------------

/**
 * A value annotated with its runtime type. Used by compare, range, and set
 * filters so that the evaluator can handle each type correctly without
 * function predicates.
 */
export type TypedValue =
  | { valueType: 'string'; value: string }
  | { valueType: 'number'; value: number }
  | { valueType: 'bigint'; value: bigint }
  | { valueType: 'date'; value: Date }
  | { valueType: 'boolean'; value: boolean }

/**
 * A range bound annotated with its runtime type.
 * At least one of `min` or `max` must be provided.
 */
export type TypedRange =
  | { valueType: 'string'; min?: string; max?: string }
  | { valueType: 'number'; min?: number; max?: number }
  | { valueType: 'bigint'; min?: bigint; max?: bigint }
  | { valueType: 'date'; min?: Date; max?: Date }

/**
 * A set of values annotated with its runtime type.
 */
export type TypedSet =
  | { valueType: 'string'; values: string[] }
  | { valueType: 'number'; values: number[] }
  | { valueType: 'bigint'; values: bigint[] }
  | { valueType: 'date'; values: Date[] }
  | { valueType: 'boolean'; values: boolean[] }

// ---------------------------------------------------------------------------
// Operators
// ---------------------------------------------------------------------------

/** Operators for text (string-only) filters. */
export type TextOperator =
  | 'contains'
  | 'notContains'
  | 'equals'
  | 'notEquals'
  | 'startsWith'
  | 'endsWith'

/** Operators for compare filters (any orderable type). */
export type CompareOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'

// ---------------------------------------------------------------------------
// Filter base (open for extension)
// ---------------------------------------------------------------------------

/**
 * Open base type for all filters.
 *
 * @typeParam C - Column identifier type
 */
export interface FilterBase<C extends string = string> {
  kind: string
  column: C
}

// ---------------------------------------------------------------------------
// Builtin filter kinds
// ---------------------------------------------------------------------------

/**
 * Text (string-only) filter with case-sensitivity option.
 */
export interface TextFilter<C extends string = string> extends FilterBase<C> {
  kind: 'text'
  operator: TextOperator
  value: string
  caseSensitive?: boolean
}

/**
 * Comparison filter for orderable types.
 */
export type CompareFilter<C extends string = string> = FilterBase<C> & {
  kind: 'compare'
  operator: CompareOperator
} & TypedValue

/**
 * Range filter (between min and max).
 */
export type RangeFilter<C extends string = string> = FilterBase<C> & {
  kind: 'range'
  exclusive?: boolean
} & TypedRange

/**
 * Set membership filter.
 */
export type SetFilter<C extends string = string> = FilterBase<C> & {
  kind: 'set'
  mode: 'include' | 'exclude'
} & TypedSet

/**
 * Boolean filter.
 */
export interface BooleanFilter<C extends string = string>
  extends FilterBase<C> {
  kind: 'boolean'
  value: boolean
}

/**
 * Null-check filter.
 */
export interface NullFilter<C extends string = string> extends FilterBase<C> {
  kind: 'null'
  operator: 'isNull' | 'isNotNull'
}

/**
 * A composite per-column filter that combines multiple child filters
 * using AND or OR logic. All children share the same column.
 */
export interface CompositeColumnFilter<C extends string = string>
  extends FilterBase<C> {
  kind: 'composite'
  mode: 'and' | 'or'
  filters: BuiltinFilter<C>[]
}

/**
 * Closed union of all builtin filter kinds.
 */
export type BuiltinFilter<C extends string = string> =
  | TextFilter<C>
  | CompareFilter<C>
  | RangeFilter<C>
  | SetFilter<C>
  | BooleanFilter<C>
  | NullFilter<C>
  | CompositeColumnFilter<C>

// ---------------------------------------------------------------------------
// Filter expressions (combinators)
// ---------------------------------------------------------------------------

export type FilterExpr<C extends string = string> =
  | FilterBase<C>
  | { kind: 'and'; filters: FilterExpr<C>[] }
  | { kind: 'or'; filters: FilterExpr<C>[] }
  | { kind: 'not'; filter: FilterExpr<C> }

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

const BUILTIN_KINDS = new Set([
  'text',
  'compare',
  'range',
  'set',
  'boolean',
  'null',
  'composite',
])

/**
 * Returns `true` if `f` is one of the builtin filter kinds.
 */
export function isBuiltinFilter<C extends string = string>(
  f: FilterBase<C>
): f is BuiltinFilter<C> {
  return BUILTIN_KINDS.has(f.kind)
}

// ---------------------------------------------------------------------------
// Runtime value-type inference
// ---------------------------------------------------------------------------

type InferableValue = string | number | bigint | Date | boolean

/**
 * Infers the `valueType` discriminator from a runtime value.
 */
export function inferValueType(v: InferableValue): TypedValue['valueType'] {
  if (v instanceof Date) return 'date'
  switch (typeof v) {
    case 'string':
      return 'string'
    case 'number':
      return 'number'
    case 'bigint':
      return 'bigint'
    case 'boolean':
      return 'boolean'
    default:
      return 'string'
  }
}

// ---------------------------------------------------------------------------
// Evaluation helpers
// ---------------------------------------------------------------------------

function compareValues(a: unknown, b: unknown, valueType: string): number {
  if (a == null && b == null) return 0
  if (a == null) return -1
  if (b == null) return 1
  switch (valueType) {
    case 'string':
      return String(a).localeCompare(String(b))
    case 'number':
      return (a as number) - (b as number)
    case 'bigint': {
      const diff = (a as bigint) - (b as bigint)
      return diff < 0n ? -1 : diff > 0n ? 1 : 0
    }
    case 'date':
      return (a as Date).getTime() - (b as Date).getTime()
    case 'boolean':
      return (a ? 1 : 0) - ((b as boolean) ? 1 : 0)
    default:
      return String(a).localeCompare(String(b))
  }
}

function valuesEqual(a: unknown, b: unknown, valueType: string): boolean {
  if (valueType === 'date') {
    if (a instanceof Date && b instanceof Date)
      return a.getTime() === b.getTime()
    return a === b
  }
  return a === b
}

// ---------------------------------------------------------------------------
// Builtin filter evaluator
// ---------------------------------------------------------------------------

/**
 * Evaluates a single builtin filter against a cell value.
 *
 * @param filter - The builtin filter descriptor
 * @param value - The cell value to test
 * @returns Whether the value passes the filter
 */
export function evaluateBuiltinFilter<C extends string = string>(
  filter: BuiltinFilter<C>,
  value: unknown
): boolean {
  switch (filter.kind) {
    case 'text': {
      const caseSensitive = filter.caseSensitive ?? false
      const str = value == null ? '' : String(value)
      const filterVal = filter.value
      const a = caseSensitive ? str : str.toLowerCase()
      const b = caseSensitive ? filterVal : filterVal.toLowerCase()
      switch (filter.operator) {
        case 'contains':
          return a.includes(b)
        case 'notContains':
          return !a.includes(b)
        case 'equals':
          return a === b
        case 'notEquals':
          return a !== b
        case 'startsWith':
          return a.startsWith(b)
        case 'endsWith':
          return a.endsWith(b)
      }
      return false
    }

    case 'compare': {
      if (value == null) return false
      const cmp = compareValues(value, filter.value, filter.valueType)
      switch (filter.operator) {
        case 'eq':
          return valuesEqual(value, filter.value, filter.valueType)
        case 'neq':
          return !valuesEqual(value, filter.value, filter.valueType)
        case 'gt':
          return cmp > 0
        case 'gte':
          return cmp >= 0
        case 'lt':
          return cmp < 0
        case 'lte':
          return cmp <= 0
      }
      return false
    }

    case 'range': {
      if (value == null) return false
      const exclusive = filter.exclusive ?? false
      if (filter.min != null) {
        const cmpMin = compareValues(value, filter.min, filter.valueType)
        if (exclusive ? cmpMin <= 0 : cmpMin < 0) return false
      }
      if (filter.max != null) {
        const cmpMax = compareValues(value, filter.max, filter.valueType)
        if (exclusive ? cmpMax >= 0 : cmpMax > 0) return false
      }
      return true
    }

    case 'set': {
      const found = (filter as SetFilter).values.some((v: unknown) =>
        valuesEqual(value, v, filter.valueType)
      )
      return filter.mode === 'include' ? found : !found
    }

    case 'boolean':
      return value === filter.value

    case 'null':
      return filter.operator === 'isNull' ? value == null : value != null

    case 'composite': {
      const combine =
        filter.mode === 'and' ? Array.prototype.every : Array.prototype.some
      return combine.call(filter.filters, (child: BuiltinFilter<C>) =>
        evaluateBuiltinFilter(child, value)
      )
    }
  }
}

// ---------------------------------------------------------------------------
// Expression evaluator
// ---------------------------------------------------------------------------

export interface EvaluateFilterOptions<T, C extends string = string> {
  /** Evaluate a custom (non-builtin) filter kind. Return `true` to include the row. */
  evaluateFilter?: (filter: FilterBase<C>, row: T) => boolean
}

/**
 * Evaluates a filter expression tree against a row.
 *
 * @param expr - Filter expression (single filter, AND, OR, NOT)
 * @param row - The data row
 * @param accessor - Maps a column to its cell value
 * @param opts - Optional callbacks for custom filter kinds
 */
export function evaluateFilterExpr<T, C extends string = string>(
  expr: FilterExpr<C>,
  row: T,
  accessor: (column: C, row: T) => unknown,
  opts?: EvaluateFilterOptions<T, C>
): boolean {
  if (expr.kind === 'and') {
    return (expr as { kind: 'and'; filters: FilterExpr<C>[] }).filters.every(
      f => evaluateFilterExpr(f, row, accessor, opts)
    )
  }
  if (expr.kind === 'or') {
    return (expr as { kind: 'or'; filters: FilterExpr<C>[] }).filters.some(f =>
      evaluateFilterExpr(f, row, accessor, opts)
    )
  }
  if (expr.kind === 'not') {
    return !evaluateFilterExpr(
      (expr as { kind: 'not'; filter: FilterExpr<C> }).filter,
      row,
      accessor,
      opts
    )
  }

  // Leaf filter
  const filter = expr as FilterBase<C>
  if (isBuiltinFilter(filter)) {
    const value = accessor(filter.column, row)
    return evaluateBuiltinFilter(filter, value)
  }

  // Custom kind — delegate to callback
  if (opts?.evaluateFilter) {
    return opts.evaluateFilter(filter, row)
  }

  // Unknown kind with no handler — include the row
  return true
}

// ---------------------------------------------------------------------------
// Describe helpers
// ---------------------------------------------------------------------------

function formatValue(v: unknown): string {
  if (v instanceof Date) return v.toLocaleDateString()
  if (typeof v === 'bigint') return v.toString()
  return String(v)
}

const TEXT_OP_LABELS: Record<TextOperator, string> = {
  contains: 'contains',
  notContains: 'does not contain',
  equals: 'equals',
  notEquals: 'does not equal',
  startsWith: 'starts with',
  endsWith: 'ends with',
}

const COMPARE_OP_LABELS: Record<CompareOperator, string> = {
  eq: '=',
  neq: '\u2260',
  gt: '>',
  gte: '\u2265',
  lt: '<',
  lte: '\u2264',
}

/**
 * Returns a human-readable label for a builtin filter.
 */
export function describeBuiltinFilter<C extends string = string>(
  filter: BuiltinFilter<C>
): string {
  const col = filter.column
  switch (filter.kind) {
    case 'text':
      return `${col} ${TEXT_OP_LABELS[filter.operator]} "${filter.value}"`
    case 'compare':
      return `${col} ${COMPARE_OP_LABELS[filter.operator]} ${formatValue(filter.value)}`
    case 'range': {
      const parts: string[] = []
      if (filter.min != null) parts.push(`${formatValue(filter.min)}`)
      parts.push(col)
      if (filter.max != null) parts.push(formatValue(filter.max))
      return parts.length === 3
        ? `${parts[0]} ${filter.exclusive ? '<' : '\u2264'} ${parts[1]} ${filter.exclusive ? '<' : '\u2264'} ${parts[2]}`
        : filter.min != null
          ? `${col} ${filter.exclusive ? '>' : '\u2265'} ${formatValue(filter.min)}`
          : `${col} ${filter.exclusive ? '<' : '\u2264'} ${formatValue(filter.max!)}`
    }
    case 'set':
      return filter.mode === 'include'
        ? `${col} in [${filter.values.map(formatValue).join(', ')}]`
        : `${col} not in [${filter.values.map(formatValue).join(', ')}]`
    case 'boolean':
      return `${col} is ${filter.value}`
    case 'null':
      return filter.operator === 'isNull'
        ? `${col} is null`
        : `${col} is not null`

    case 'composite': {
      const sep = filter.mode === 'and' ? ' AND ' : ' OR '
      if (filter.filters.length === 0) return `${col}: (empty)`
      return filter.filters.map(f => describeBuiltinFilter(f)).join(sep)
    }
  }
}

export interface DescribeFilterOptions<C extends string = string> {
  /** Describe a custom (non-builtin) filter kind. */
  describeFilter?: (filter: FilterBase<C>) => string
}

/**
 * Returns a human-readable label for any filter, delegating to a callback
 * for custom kinds.
 */
export function describeFilter<C extends string = string>(
  filter: FilterBase<C>,
  opts?: DescribeFilterOptions<C>
): string {
  if (isBuiltinFilter(filter)) {
    return describeBuiltinFilter(filter)
  }
  if (opts?.describeFilter) {
    return opts.describeFilter(filter)
  }
  return `${filter.column}: [${filter.kind}]`
}

// ---------------------------------------------------------------------------
// Filter builder namespace
// ---------------------------------------------------------------------------

function inferTypedValue(v: InferableValue): TypedValue {
  if (v instanceof Date) return { valueType: 'date', value: v }
  switch (typeof v) {
    case 'number':
      return { valueType: 'number', value: v }
    case 'bigint':
      return { valueType: 'bigint', value: v }
    case 'boolean':
      return { valueType: 'boolean', value: v }
    default:
      return { valueType: 'string', value: String(v) }
  }
}

function inferTypedRange(
  min: InferableValue | undefined,
  max: InferableValue | undefined
): TypedRange {
  const ref = min ?? max
  const vt = inferValueType(ref!)
  const result: Record<string, unknown> = { valueType: vt }
  if (min != null) result.min = min
  if (max != null) result.max = max
  return result as TypedRange
}

function inferTypedSet(values: InferableValue[]): TypedSet {
  const vt = values.length > 0 ? inferValueType(values[0]) : 'string'
  return { valueType: vt, values } as TypedSet
}

/**
 * Ergonomic builder namespace for constructing filter descriptors.
 *
 * @example
 * ```ts
 * Filter.contains('name', 'alice')
 * Filter.gt('age', 30)
 * Filter.between('salary', 50000, 150000)
 * Filter.oneOf('role', ['admin', 'editor'])
 * Filter.isNull('deletedAt')
 * Filter.and(Filter.gt('age', 18), Filter.lt('age', 65))
 * ```
 */
export const Filter = {
  // --- Text ---
  text: <C extends string = string>(
    column: C,
    operator: TextOperator,
    value: string,
    caseSensitive?: boolean
  ): TextFilter<C> => ({
    kind: 'text',
    column,
    operator,
    value,
    ...(caseSensitive != null ? { caseSensitive } : {}),
  }),
  contains: <C extends string = string>(
    column: C,
    value: string,
    caseSensitive?: boolean
  ): TextFilter<C> => Filter.text(column, 'contains', value, caseSensitive),
  notContains: <C extends string = string>(
    column: C,
    value: string,
    caseSensitive?: boolean
  ): TextFilter<C> =>
    Filter.text(column, 'notContains', value, caseSensitive),
  equals: <C extends string = string>(
    column: C,
    value: string,
    caseSensitive?: boolean
  ): TextFilter<C> => Filter.text(column, 'equals', value, caseSensitive),
  notEquals: <C extends string = string>(
    column: C,
    value: string,
    caseSensitive?: boolean
  ): TextFilter<C> => Filter.text(column, 'notEquals', value, caseSensitive),
  startsWith: <C extends string = string>(
    column: C,
    value: string,
    caseSensitive?: boolean
  ): TextFilter<C> => Filter.text(column, 'startsWith', value, caseSensitive),
  endsWith: <C extends string = string>(
    column: C,
    value: string,
    caseSensitive?: boolean
  ): TextFilter<C> => Filter.text(column, 'endsWith', value, caseSensitive),

  // --- Compare ---
  eq: <C extends string = string>(
    column: C,
    value: InferableValue
  ): CompareFilter<C> => ({
    kind: 'compare',
    column,
    operator: 'eq',
    ...inferTypedValue(value),
  }) as CompareFilter<C>,
  neq: <C extends string = string>(
    column: C,
    value: InferableValue
  ): CompareFilter<C> => ({
    kind: 'compare',
    column,
    operator: 'neq',
    ...inferTypedValue(value),
  }) as CompareFilter<C>,
  gt: <C extends string = string>(
    column: C,
    value: InferableValue
  ): CompareFilter<C> => ({
    kind: 'compare',
    column,
    operator: 'gt',
    ...inferTypedValue(value),
  }) as CompareFilter<C>,
  gte: <C extends string = string>(
    column: C,
    value: InferableValue
  ): CompareFilter<C> => ({
    kind: 'compare',
    column,
    operator: 'gte',
    ...inferTypedValue(value),
  }) as CompareFilter<C>,
  lt: <C extends string = string>(
    column: C,
    value: InferableValue
  ): CompareFilter<C> => ({
    kind: 'compare',
    column,
    operator: 'lt',
    ...inferTypedValue(value),
  }) as CompareFilter<C>,
  lte: <C extends string = string>(
    column: C,
    value: InferableValue
  ): CompareFilter<C> => ({
    kind: 'compare',
    column,
    operator: 'lte',
    ...inferTypedValue(value),
  }) as CompareFilter<C>,

  // --- Range ---
  between: <C extends string = string>(
    column: C,
    min: InferableValue | undefined,
    max: InferableValue | undefined,
    exclusive?: boolean
  ): RangeFilter<C> => ({
    kind: 'range',
    column,
    ...(exclusive != null ? { exclusive } : {}),
    ...inferTypedRange(min, max),
  }) as RangeFilter<C>,

  // --- Set ---
  oneOf: <C extends string = string>(
    column: C,
    values: InferableValue[]
  ): SetFilter<C> => ({
    kind: 'set',
    column,
    mode: 'include',
    ...inferTypedSet(values),
  }) as SetFilter<C>,
  noneOf: <C extends string = string>(
    column: C,
    values: InferableValue[]
  ): SetFilter<C> => ({
    kind: 'set',
    column,
    mode: 'exclude',
    ...inferTypedSet(values),
  }) as SetFilter<C>,

  // --- Boolean ---
  isTrue: <C extends string = string>(column: C): BooleanFilter<C> => ({
    kind: 'boolean',
    column,
    value: true,
  }),
  isFalse: <C extends string = string>(column: C): BooleanFilter<C> => ({
    kind: 'boolean',
    column,
    value: false,
  }),

  // --- Null ---
  isNull: <C extends string = string>(column: C): NullFilter<C> => ({
    kind: 'null',
    column,
    operator: 'isNull',
  }),
  isNotNull: <C extends string = string>(column: C): NullFilter<C> => ({
    kind: 'null',
    column,
    operator: 'isNotNull',
  }),

  // --- Composite (per-column multi-condition) ---
  composite: <C extends string = string>(
    column: C,
    mode: 'and' | 'or',
    filters: BuiltinFilter<C>[]
  ): CompositeColumnFilter<C> => ({
    kind: 'composite',
    column,
    mode,
    filters,
  }),

  // --- Combinators ---
  and: <C extends string = string>(
    ...filters: FilterExpr<C>[]
  ): FilterExpr<C> => ({
    kind: 'and',
    filters,
  }),
  or: <C extends string = string>(
    ...filters: FilterExpr<C>[]
  ): FilterExpr<C> => ({
    kind: 'or',
    filters,
  }),
  not: <C extends string = string>(filter: FilterExpr<C>): FilterExpr<C> => ({
    kind: 'not',
    filter,
  }),
}

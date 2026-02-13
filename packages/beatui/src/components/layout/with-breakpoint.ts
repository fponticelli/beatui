import { Signal, Size, TNode, WithElement } from '@tempots/dom'
import { ElementRect, Rect, WindowSize } from '@tempots/ui'

/**
 * A record mapping breakpoint names to their minimum width thresholds in pixels.
 * Keys are string breakpoint names and values are numeric pixel widths.
 */
export type Breakpoints = { [_ in string]: number }

/**
 * Information object provided to the callback in {@link WithBreakpoint},
 * containing the current breakpoint state and comparison utilities.
 *
 * @typeParam T - The breakpoints record type.
 * @typeParam K - The union of breakpoint name keys.
 */
export interface BreakpointInfo<
  T extends Breakpoints,
  K extends keyof T = keyof T & string,
> {
  /**
   * Reactive signal containing the current width and the matching breakpoint name.
   * Updates automatically when the viewport or element is resized.
   */
  value: Signal<{ width: number; breakpoint: K }>
  /** The original breakpoints definition record. */
  breakpoints: T
  /** The breakpoints as a sorted `[width, name]` tuple array (ascending by width). */
  asList: [number, K][]
  /**
   * Tests whether a given width matches a breakpoint comparison expression.
   *
   * @param value - A breakpoint name or comparison expression (e.g., `'>=md'`, `'<lg'`).
   * @param width - The width in pixels to test against.
   * @returns `true` if the width satisfies the comparison.
   */
  is: <K extends string & keyof T>(
    value: BreakPointComparison<K>,
    width: number
  ) => boolean
}

/**
 * Comparison operators supported in breakpoint comparison expressions.
 *
 * - `'='` - Exact match (width falls within the breakpoint range)
 * - `'!='` - Not equal (width does not fall within the breakpoint range)
 * - `'<='` - Less than or equal to the breakpoint threshold
 * - `'>='` - Greater than or equal to the breakpoint threshold
 * - `'<'` - Strictly less than the breakpoint threshold
 * - `'>'` - Strictly greater than the breakpoint threshold
 */
export type Operator = '!=' | '<=' | '>=' | '<' | '>' | '='

const operators: Operator[] = ['!=', '<=', '>=', '<', '>', '=']

/**
 * A breakpoint comparison expression. Can be a plain breakpoint name (treated
 * as exact match) or an operator-prefixed breakpoint name (e.g., `'>=md'`, `'<lg'`).
 *
 * @typeParam K - The breakpoint name type.
 */
export type BreakPointComparison<K extends string> = K | `${Operator}${K}`

function getOperatorAndValue<K extends string>(
  value: BreakPointComparison<K>
): [Operator, K] {
  for (const operator of operators) {
    if (typeof value === 'string' && value.startsWith(operator)) {
      return [operator, value.slice(operator.length) as K]
    }
  }
  return ['=', value as K]
}

/**
 * Compares a given width against a breakpoint comparison expression using
 * the provided sorted breakpoint list.
 *
 * @typeParam T - The breakpoints record type.
 * @typeParam K - The union of breakpoint name keys.
 * @param sortedList - Breakpoints sorted ascending by width as `[width, name]` tuples.
 * @param value - A breakpoint comparison expression (e.g., `'md'`, `'>=lg'`, `'<sm'`).
 * @param width - The width in pixels to evaluate.
 * @returns `true` if the width satisfies the comparison expression.
 * @throws Error if the breakpoint name in the comparison is not found.
 *
 * @example
 * ```typescript
 * const breakpoints: [number, string][] = [[0, 'sm'], [768, 'md'], [1024, 'lg']]
 * compareBreakpoint(breakpoints, '>=md', 800)  // true
 * compareBreakpoint(breakpoints, '<md', 500)    // true
 * compareBreakpoint(breakpoints, 'lg', 1024)    // true
 * ```
 */
export function compareBreakpoint<
  T extends Breakpoints,
  K extends string & keyof T = keyof T & string,
>(
  sortedList: [number, keyof T][],
  value: BreakPointComparison<K>,
  width: number
): boolean {
  const [operator, v] = getOperatorAndValue<K>(value)

  // Find the index in the sorted list
  const sortedIndex = sortedList.findIndex(item => item[1] === v)

  if (sortedIndex === -1) {
    throw new Error(`Breakpoint ${String(v)} not found`)
  }

  // Get the current breakpoint width (lower bound)
  const breakpointWidth = sortedList[sortedIndex][0]

  // Get the next breakpoint width (or Infinity if this is the last breakpoint)
  const nextBreakpointWidth =
    sortedIndex < sortedList.length - 1
      ? sortedList[sortedIndex + 1][0]
      : Infinity

  switch (operator) {
    case '=':
      // For '=', check if width is between this breakpoint (inclusive) and the next breakpoint (exclusive)
      return width >= breakpointWidth && width < nextBreakpointWidth
    case '!=':
      // For '!=', check if width is NOT between this breakpoint (inclusive) and the next breakpoint (exclusive)
      return !(width >= breakpointWidth && width < nextBreakpointWidth)
    case '<=':
      // For '<=', check if width is less than or equal to this breakpoint
      return width <= breakpointWidth
    case '>=':
      // For '>=', check if width is greater than or equal to this breakpoint
      return width >= breakpointWidth
    case '<':
      // For '<', check if width is less than this breakpoint
      return width < breakpointWidth
    case '>':
      // For '>', check if width is greater than this breakpoint
      return width > breakpointWidth
    default:
      return false
  }
}

/**
 * Finds the breakpoint name that a given width falls into, based on a sorted
 * breakpoint list. Returns the last breakpoint whose threshold is less than
 * or equal to the width.
 *
 * @typeParam T - The breakpoints record type.
 * @param sortedList - Breakpoints sorted ascending by width as `[width, name]` tuples.
 * @param width - The width in pixels to look up.
 * @returns The matching breakpoint name.
 */
export function findBreakpoint<T extends Breakpoints>(
  sortedList: [number, keyof T][],
  width: number
) {
  // Find the last breakpoint whose width is less than or equal to the current width
  // This is the breakpoint that the width falls into
  const index = sortedList.findIndex(item => item[0] > width) - 1

  if (index >= 0) {
    // Found a breakpoint that the width falls into
    return sortedList[index][1]
  } else if (sortedList.length > 0 && width >= sortedList[0][0]) {
    // Width is greater than or equal to the first breakpoint
    return sortedList[0][1]
  } else {
    // Width is less than all breakpoints, return the first one
    return sortedList[0][1]
  }
}

/**
 * Configuration options for the {@link WithBreakpoint} component.
 *
 * @typeParam T - The breakpoints record type.
 */
export interface WithBreakpointOptions<T extends Breakpoints> {
  /** The breakpoints definition mapping names to pixel width thresholds. */
  breakpoints: T
  /**
   * Whether to track the viewport (window) size or the parent element size.
   * Use `'element'` for container-query-like behavior.
   * @default 'viewport'
   */
  mode?: 'element' | 'viewport'
}

/**
 * Provides reactive breakpoint information to a callback function. Monitors
 * either the viewport width or the parent element width (depending on `mode`)
 * and determines which breakpoint range the current width falls into.
 *
 * The callback receives a {@link BreakpointInfo} object with the current
 * breakpoint signal, the breakpoints definition, and a comparison utility.
 *
 * @typeParam T - The breakpoints record type.
 * @param fn - Callback receiving breakpoint info and returning renderable content.
 * @param options - Breakpoint definitions and tracking mode.
 * @returns A renderable that tracks size and provides breakpoint info.
 *
 * @example
 * ```typescript
 * WithBreakpoint(
 *   ({ value, is }) =>
 *     html.div(
 *       value.map(({ breakpoint }) =>
 *         is('>=md', value.value.width)
 *           ? 'Desktop layout'
 *           : 'Mobile layout'
 *       )
 *     ),
 *   {
 *     breakpoints: { sm: 0, md: 768, lg: 1024 },
 *     mode: 'viewport',
 *   }
 * )
 * ```
 */
export function WithBreakpoint<T extends Breakpoints>(
  fn: (info: BreakpointInfo<T>) => TNode,
  { breakpoints, mode = 'viewport' }: WithBreakpointOptions<T>
) {
  const list = Object.entries(breakpoints).map(
    ([k, v]) => [v, k] as [number, keyof T]
  )

  // Sort the list by width once to ensure correct range comparisons
  const sortedList = [...list].sort((a, b) => a[0] - b[0]) as [
    number,
    keyof T & string,
  ][]

  const sizeCallback = (size: Signal<Size> | Signal<Rect>) => {
    const value = size.map(({ width }) => {
      const index = sortedList.findIndex(item => item[0] > width) - 1

      if (index >= 0) {
        return { width, breakpoint: sortedList[index][1] }
      } else if (sortedList.length > 0 && width >= sortedList[0][0]) {
        return { width, breakpoint: sortedList[0][1] }
      } else {
        return { width, breakpoint: sortedList[0][1] }
      }
    })

    const is = <K extends string & keyof T>(
      value: BreakPointComparison<K>,
      width: number
    ): boolean =>
      compareBreakpoint(sortedList, value as BreakPointComparison<K>, width)

    return fn({
      value,
      breakpoints,
      asList: sortedList,
      is,
    })
  }

  if (mode === 'element') {
    return ElementRect(sizeCallback)
  }

  return WindowSize(sizeCallback)
}

let multiplier = NaN

function remToPx(rem: string | undefined, alt: number): number {
  if (!rem) {
    return alt
  }
  if (isNaN(multiplier)) {
    multiplier = parseFloat(getComputedStyle(document.documentElement).fontSize)
  }
  return parseFloat(rem) * multiplier
}

function getCSSVariableInPX(
  style: CSSStyleDeclaration,
  name: string,
  alt: number
) {
  return remToPx(style.getPropertyValue(name), alt)
}

/**
 * Standard BeatUI viewport breakpoint thresholds. Values are read from
 * CSS custom properties (`--breakpoint-*`) with sensible defaults.
 *
 * | Name   | Default (px) |
 * |--------|-------------|
 * | `zero` | 0           |
 * | `xs`   | 640         |
 * | `sm`   | 768         |
 * | `md`   | 1024        |
 * | `lg`   | 1280        |
 * | `xl`   | 1536        |
 */
export type BeatUIBreakpoints = {
  zero: number
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
}

/**
 * Union type of all standard BeatUI viewport breakpoint names.
 */
export type BeatUIBreakpoint = keyof BeatUIBreakpoints

/**
 * Convenience wrapper around {@link WithBreakpoint} that uses the standard
 * BeatUI viewport breakpoints. Reads breakpoint thresholds from CSS custom
 * properties (`--breakpoint-xs`, `--breakpoint-sm`, etc.) with sensible
 * fallback values.
 *
 * @param fn - Callback receiving BeatUI breakpoint info and returning renderable content.
 * @returns A renderable that tracks viewport size against BeatUI breakpoints.
 *
 * @example
 * ```typescript
 * WithBeatUIBreakpoint(({ value, is }) =>
 *   html.div(
 *     value.map(({ width, breakpoint }) =>
 *       is('>=md', width)
 *         ? html.div(attr.class('desktop'), 'Wide layout')
 *         : html.div(attr.class('mobile'), 'Narrow layout')
 *     )
 *   )
 * )
 * ```
 */
export function WithBeatUIBreakpoint(
  fn: (info: BreakpointInfo<BeatUIBreakpoints>) => TNode
) {
  return WithElement(el => {
    const style = getComputedStyle(el)
    const viewportBreakpoints: BeatUIBreakpoints = {
      zero: 0,
      xs: getCSSVariableInPX(style, '--breakpoint-xs', 640),
      sm: getCSSVariableInPX(style, '--breakpoint-sm', 768),
      md: getCSSVariableInPX(style, '--breakpoint-md', 1024),
      lg: getCSSVariableInPX(style, '--breakpoint-lg', 1280),
      xl: getCSSVariableInPX(style, '--breakpoint-xl', 1536),
    }
    return WithBreakpoint(fn, { breakpoints: viewportBreakpoints })
  })
}

/**
 * BeatUI element-level (container query) breakpoint thresholds. Values are
 * read from CSS custom properties (`--container-*`) with Tailwind-inspired defaults.
 *
 * | Name   | Default (px) |
 * |--------|-------------|
 * | `zero` | 0           |
 * | `3xs`  | 256         |
 * | `2xs`  | 288         |
 * | `xs`   | 320         |
 * | `sm`   | 384         |
 * | `md`   | 448         |
 * | `lg`   | 512         |
 * | `xl`   | 640         |
 * | `2xl`  | 768         |
 * | `3xl`  | 1024        |
 * | `4xl`  | 1280        |
 * | `5xl`  | 1536        |
 * | `6xl`  | 2048        |
 */
export type TWElementBreakpoints = {
  zero: number
  '3xs': number
  '2xs': number
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
  '3xl': number
  '4xl': number
  '5xl': number
  '6xl': number
}

/**
 * Convenience wrapper around {@link WithBreakpoint} that uses BeatUI
 * element-level (container query) breakpoints. Tracks the parent element's
 * width rather than the viewport, enabling component-local responsive behavior.
 *
 * Reads breakpoint thresholds from CSS custom properties (`--container-3xs`,
 * `--container-2xs`, etc.) with Tailwind-inspired fallback values.
 *
 * @param fn - Callback receiving element breakpoint info and returning renderable content.
 * @returns A renderable that tracks element size against container breakpoints.
 *
 * @example
 * ```typescript
 * WithBeatUIElementBreakpoint(({ value, is }) =>
 *   html.div(
 *     value.map(({ width, breakpoint }) =>
 *       is('>=md', width)
 *         ? html.div('Wide container layout')
 *         : html.div('Narrow container layout')
 *     )
 *   )
 * )
 * ```
 */
export function WithBeatUIElementBreakpoint(
  fn: (info: BreakpointInfo<TWElementBreakpoints>) => TNode
) {
  return WithElement(el => {
    const style = getComputedStyle(el)
    const elementBreakpoints: TWElementBreakpoints = {
      zero: 0,
      '3xs': getCSSVariableInPX(style, '--container-3xs', 256),
      '2xs': getCSSVariableInPX(style, '--container-2xs', 288),
      xs: getCSSVariableInPX(style, '--container-xs', 320),
      sm: getCSSVariableInPX(style, '--container-sm', 384),
      md: getCSSVariableInPX(style, '--container-md', 448),
      lg: getCSSVariableInPX(style, '--container-lg', 512),
      xl: getCSSVariableInPX(style, '--container-xl', 640),
      '2xl': getCSSVariableInPX(style, '--container-2xl', 768),
      '3xl': getCSSVariableInPX(style, '--container-3xl', 1024),
      '4xl': getCSSVariableInPX(style, '--container-4xl', 1280),
      '5xl': getCSSVariableInPX(style, '--container-5xl', 1536),
      '6xl': getCSSVariableInPX(style, '--container-6xl', 2048),
    }
    return WithBreakpoint(fn, {
      breakpoints: elementBreakpoints,
      mode: 'element',
    })
  })
}

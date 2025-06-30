import { Signal, Size, TNode, WithElement } from '@tempots/dom'
import { ElementRect, Rect, WindowSize } from '@tempots/ui'

export type Breakpoints = { [_ in string]: number }
export interface BreakpointInfo<
  T extends Breakpoints,
  K extends keyof T = keyof T & string,
> {
  value: Signal<{ width: number; breakpoint: K }>
  breakpoints: T
  asList: [number, K][]
  is: <K extends string & keyof T>(
    value: BreakPointComparison<K>,
    width: number
  ) => boolean
}

export type Operator = '!=' | '<=' | '>=' | '<' | '>' | '='

const operators: Operator[] = ['!=', '<=', '>=', '<', '>', '=']

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

export interface WithBreakpointOptions<T extends Breakpoints> {
  breakpoints: T
  mode?: 'element' | 'viewport'
}

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

export type BeatUIBreakpoints = {
  zero: number
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
}

export type BeatUIBreakpoint = keyof BeatUIBreakpoints

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

import { Signal, Size, TNode } from '@tempots/dom'
import { ElementSize, WindowSize } from '@tempots/ui'

export type Breakpoints = Record<string, number>
export interface BreakpointInfo<T extends Breakpoints> {
  width: Signal<number>
  breakpoint: Signal<keyof T>
  breakpoints: T
  asList: [number, keyof T][]
  is: <K extends keyof T>(
    value: BreakPointComparison<K>,
    width: number
  ) => boolean
}

export const elementBreakpoints: Breakpoints = {
  zero: 0,
  '3xs': 256,
  '2xs': 288,
  xs: 320,
  sm: 384,
  md: 448,
  lg: 512,
  xl: 640,
  '2xl': 768,
  '3xl': 1024,
  '4xl': 1280,
  '5xl': 1536,
  '6xl': 2048,
}

export const viewportBreakpoints: Breakpoints = {
  zero: 0,
  xs: 640,
  sm: 768,
  md: 1024,
  lg: 1280,
  xl: 1536,
}

export type Operator = '!=' | '<=' | '>=' | '<' | '>' | '='

const operators: Operator[] = ['!=', '<=', '>=', '<', '>', '=']

export type BreakPointComparison<K> = K extends string
  ? K | `${Operator}${K}`
  : never

function getOperatorAndValue<K>(value: BreakPointComparison<K>): [Operator, K] {
  for (const operator of operators) {
    if (typeof value === 'string' && value.startsWith(operator)) {
      return [operator, value.slice(operator.length) as K]
    }
  }
  return ['=', value as K]
}

export function compareBreakpoint<T extends Breakpoints>(
  sortedList: [number, keyof T][],
  value: BreakPointComparison<keyof T>,
  width: number
): boolean {
  const [operator, v] = getOperatorAndValue<keyof T>(value)

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
  const sortedList = [...list].sort((a, b) => a[0] - b[0])

  const sizeCallback = (size: Signal<Size>) => {
    const width = size.map(({ width }) => width)
    // Use the sorted list for findBreakpoint
    const breakpoint = width.map(width => {
      // Find the breakpoint directly without re-sorting
      const index = sortedList.findIndex(item => item[0] > width) - 1

      if (index >= 0) {
        return sortedList[index][1]
      } else if (sortedList.length > 0 && width >= sortedList[0][0]) {
        return sortedList[0][1]
      } else {
        return sortedList[0][1]
      }
    })

    const is = (value: BreakPointComparison<keyof T>, width: number): boolean =>
      compareBreakpoint(
        sortedList,
        value as BreakPointComparison<keyof T>,
        width
      )

    return fn({
      width,
      breakpoint,
      breakpoints,
      asList: sortedList,
      is,
    })
  }

  if (mode === 'element') {
    return ElementSize(sizeCallback)
  }

  return WindowSize(sizeCallback)
}

export function WithTWBreakpoint(
  fn: (info: BreakpointInfo<typeof viewportBreakpoints>) => TNode
) {
  return WithBreakpoint(fn, { breakpoints: viewportBreakpoints })
}

export function WithTWElementBreakpoint(
  fn: (info: BreakpointInfo<typeof elementBreakpoints>) => TNode
) {
  return WithBreakpoint(fn, {
    breakpoints: elementBreakpoints,
    mode: 'element',
  })
}

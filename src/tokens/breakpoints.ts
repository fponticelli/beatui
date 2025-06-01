// Breakpoint Design Tokens
// TypeScript-defined breakpoint values that generate CSS variables and media queries at build time

import { objectEntries } from '@tempots/std'

export const breakpoints = {
  sm: '40rem', // 640px
  md: '48rem', // 768px
  lg: '64rem', // 1024px
  xl: '80rem', // 1280px
  '2xl': '96rem', // 1536px
} as const

export type BreakpointName = keyof typeof breakpoints

// Helper functions
export function getBreakpointVarName(size: BreakpointName): string {
  return `--breakpoint-${size}`
}

export function getBreakpointVar(size: BreakpointName): string {
  return `var(${getBreakpointVarName(size)})`
}

export function getBreakpointMediaQuery(size: BreakpointName): string {
  return `@media (width >= ${breakpoints[size]})`
}

// Generate CSS variables from breakpoint tokens
export function generateBreakpointVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  objectEntries(breakpoints).forEach(([size, value]) => {
    variables[getBreakpointVarName(size as BreakpointName)] = value
  })

  return variables
}

// Radius Design Tokens
// TypeScript-defined radius values that generate CSS variables and media queries at build time

import { objectEntries } from '@tempots/std'

export const shadows = {
  none: 'none',
  '2xs': '0 1px rgb(0 0 0 / 0.05)',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  'top-2xs': '0 -1px rgb(0 0 0 / 0.05)',
  'top-xs': '0 -1px 2px 0 rgb(0 0 0 / 0.05)',
  'top-sm': '0 -1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'top-md': '0 -4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'top-lg':
    '0 -10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'top-xl':
    '0 -20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  'top-2xl': '0 -25px 50px -12px rgb(0 0 0 / 0.25)',
} as const

export type ShadowSize = keyof typeof shadows

// Helper functions
export function getShadowVarName(size: ShadowSize): string {
  return `--shadow-${size}`
}

export function getShadowVar(size: ShadowSize): string {
  return `var(${getShadowVarName(size)})`
}

// Generate CSS variables from radius tokens
export function generateShadowVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  objectEntries(shadows).forEach(([size, value]) => {
    variables[getShadowVarName(size as ShadowSize)] = value
  })

  return variables
}

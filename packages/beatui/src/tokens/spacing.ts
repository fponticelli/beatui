// Spacing Design Tokens
// TypeScript-defined spacing values that generate CSS variables at build time

import { objectEntries } from '@tempots/std'

export const baseSpacing = '0.25rem'

export const spacing = {
  none: '0',
  px: '1px',
  base: baseSpacing,
  xs: 'calc(var(--spacing-base) / 2)',
  sm: 'var(--spacing-base)',
  md: 'calc(var(--spacing-base) * 1.5)',
  lg: 'calc(var(--spacing-base) * 2)',
  xl: 'calc(var(--spacing-base) * 3)',
  '2xl': 'calc(var(--spacing-base) * 4)',
  '3xl': 'calc(var(--spacing-base) * 6)',
  '4xl': 'calc(var(--spacing-base) * 8)',
  full: '9999px',
} as const

export type SpacingName = keyof typeof spacing

// Helper functions
export function getSpacingVarName(size: SpacingName): string {
  return `--spacing-${size}`
}

export function getSpacingVar(size: SpacingName): string {
  return `var(${getSpacingVarName(size)})`
}

// Generate CSS variables from spacing tokens
export function generateSpacingVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  objectEntries(spacing).forEach(([size, value]) => {
    variables[getSpacingVarName(size as SpacingName)] = value
  })

  return variables
}

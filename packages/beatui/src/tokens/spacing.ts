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
  full: '2000px',
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

export const semanticSpacingNames = [
  'stack-2xs',
  'stack-xs',
  'stack-sm',
  'stack-md',
  'stack-lg',
  'stack-xl',
] as const

export type SemanticSpacingName = (typeof semanticSpacingNames)[number]

export type SemanticSpacingOverrides = Partial<
  Record<SemanticSpacingName, string>
>

const defaultSemanticSpacing: Record<SemanticSpacingName, string> = {
  'stack-2xs': 'calc(var(--spacing-base) / 2)',
  'stack-xs': 'calc(var(--spacing-base) * 1)',
  'stack-sm': 'calc(var(--spacing-base) * 2)',
  'stack-md': 'calc(var(--spacing-base) * 3)',
  'stack-lg': 'calc(var(--spacing-base) * 4)',
  'stack-xl': 'calc(var(--spacing-base) * 6)',
}

export function getSemanticSpacingVarName(name: SemanticSpacingName): string {
  return `--spacing-${name}`
}

export function generateSemanticSpacingVariables(
  overrides?: SemanticSpacingOverrides
): Record<string, string> {
  const variables: Record<string, string> = {}
  const mapping = { ...defaultSemanticSpacing, ...overrides }

  objectEntries(mapping).forEach(([name, value]) => {
    variables[getSemanticSpacingVarName(name as SemanticSpacingName)] = value
  })

  return variables
}

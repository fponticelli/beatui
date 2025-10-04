// Radius Design Tokens
// TypeScript-defined radius values that generate CSS variables and media queries at build time

import { objectEntries } from '@tempots/std'

export const radius = {
  none: '0',
  xs: 'calc(var(--spacing-base) / 2)',
  sm: 'var(--spacing-base)',
  md: 'calc(var(--spacing-base) * 1.5)',
  lg: 'calc(var(--spacing-base) * 2)',
  xl: 'calc(var(--spacing-base) * 3)',
  full: '9999px',
} as const

export type RadiusName = keyof typeof radius

// Helper functions
export function getRadiusVarName(size: RadiusName): string {
  return `--radius-${size}`
}

export function getRadiusVar(size: RadiusName): string {
  return `var(${getRadiusVarName(size)})`
}

export function getRadiusMediaQuery(size: RadiusName): string {
  return `@media (width >= ${radius[size]})`
}

// Generate CSS variables from radius tokens
export function generateRadiusVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  objectEntries(radius).forEach(([size, value]) => {
    variables[getRadiusVarName(size as RadiusName)] = value
  })

  return variables
}

export const semanticRadiusNames = [
  'control',
  'control-sm',
  'control-xs',
  'button',
  'surface',
  'overlay',
  'popover',
  'pill',
  'focus',
] as const

export type SemanticRadiusName = (typeof semanticRadiusNames)[number]

export type SemanticRadiusOverrides = Partial<
  Record<SemanticRadiusName, string>
>

const defaultSemanticRadii: Record<SemanticRadiusName, string> = {
  control: getRadiusVar('md'),
  'control-sm': getRadiusVar('sm'),
  'control-xs': getRadiusVar('xs'),
  button: getRadiusVar('md'),
  surface: getRadiusVar('lg'),
  overlay: getRadiusVar('lg'),
  popover: getRadiusVar('md'),
  pill: getRadiusVar('full'),
  focus: getRadiusVar('sm'),
}

export function getSemanticRadiusVarName(name: SemanticRadiusName): string {
  return `--radius-${name}`
}

export function generateSemanticRadiusVariables(
  overrides?: SemanticRadiusOverrides
): Record<string, string> {
  const variables: Record<string, string> = {}
  const mapping = { ...defaultSemanticRadii, ...overrides }

  objectEntries(mapping).forEach(([name, value]) => {
    variables[getSemanticRadiusVarName(name as SemanticRadiusName)] = value
  })

  return variables
}

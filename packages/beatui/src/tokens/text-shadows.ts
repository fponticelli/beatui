// Text Shadow Design Tokens
// TypeScript-defined text shadow values that generate CSS variables at build time

import { objectEntries } from '@tempots/std'

export const textShadows = {
  none: 'none',
  '2xs': '0px 1px 0px rgb(0 0 0 / 0.15)',
  xs: '0px 1px 1px rgb(0 0 0 / 0.2)',
  sm: '0px 1px 0px rgb(0 0 0 / 0.075), 0px 1px 1px rgb(0 0 0 / 0.075), 0px 2px 2px rgb(0 0 0 / 0.075)',
  md: '0px 1px 1px rgb(0 0 0 / 0.1), 0px 1px 2px rgb(0 0 0 / 0.1), 0px 2px 4px rgb(0 0 0 / 0.1)',
  lg: '0px 1px 2px rgb(0 0 0 / 0.1), 0px 3px 2px rgb(0 0 0 / 0.1), 0px 4px 8px rgb(0 0 0 / 0.1)',
} as const

export type TextShadowSize = keyof typeof textShadows

export const semanticTextShadowNames = [
  'button-filled',
  'button-light',
  'button-default',
] as const

export type SemanticTextShadowName = (typeof semanticTextShadowNames)[number]

export type SemanticTextShadowOverrides = Partial<
  Record<SemanticTextShadowName, string>
>

const defaultSemanticTextShadows: Record<SemanticTextShadowName, string> = {
  'button-filled': getTextShadowVar('sm'),
  'button-light': getTextShadowVar('xs'),
  'button-default': getTextShadowVar('2xs'),
}

// Helper functions
export function getTextShadowVarName(size: TextShadowSize): string {
  return `--text-shadow-${size}`
}

export function getTextShadowVar(size: TextShadowSize): string {
  return `var(${getTextShadowVarName(size)})`
}

// Generate CSS variables from radius tokens
export function generateTextShadowVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  objectEntries(textShadows).forEach(([size, value]) => {
    variables[getTextShadowVarName(size as TextShadowSize)] = value
  })

  return variables
}

export function getSemanticTextShadowVarName(
  name: SemanticTextShadowName
): string {
  return `--text-shadow-${name}`
}

export function generateSemanticTextShadowVariables(
  overrides?: SemanticTextShadowOverrides
): Record<string, string> {
  const variables: Record<string, string> = {}
  const mapping = { ...defaultSemanticTextShadows, ...overrides }

  objectEntries(mapping).forEach(([name, value]) => {
    variables[getSemanticTextShadowVarName(name as SemanticTextShadowName)] =
      value
  })

  return variables
}

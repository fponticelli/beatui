// Z-Index Design Tokens
// TypeScript-defined z-index values for consistent layering

import { objectEntries } from '@tempots/std'

export const zIndex = {
  // Base layers
  base: 0,
  raised: 10,

  // Navigation and layout
  navigation: 20,
  sidebar: 20,

  // Overlays and modals
  overlay: 50,
  modal: 60,

  // Tooltips and popovers
  tooltip: 70,
  popover: 80,

  // Notifications and alerts
  notification: 90,

  // Maximum priority
  maximum: 100,
} as const

export type ZIndexName = keyof typeof zIndex

// Helper functions
export function getZIndexVarName(level: ZIndexName): string {
  return `--z-index-${level}`
}

export function getZIndexVar(level: ZIndexName): string {
  return `var(${getZIndexVarName(level)})`
}

// Generate CSS variables from z-index tokens
export function generateZIndexVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  objectEntries(zIndex).forEach(([level, value]) => {
    variables[getZIndexVarName(level as ZIndexName)] = value.toString()
  })

  return variables
}

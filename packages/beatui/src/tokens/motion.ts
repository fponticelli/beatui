// Motion Design Tokens
// Defines motion durations and easing curves exposed as CSS variables

import { objectEntries } from '@tempots/std'

export const motionDurations = {
  instant: '0s',
  fast: '120ms',
  base: '200ms',
  slow: '320ms',
  relaxed: '480ms',
} as const

export const motionEasings = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.33, 1, 0.68, 1)',
  entrance: 'cubic-bezier(0, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.8, 0, 0.6, 1)',
} as const

export type MotionDurationName = keyof typeof motionDurations
export type MotionEasingName = keyof typeof motionEasings

export function getMotionDurationVarName(name: MotionDurationName): string {
  return `--motion-duration-${name}`
}

export function getMotionDurationVar(name: MotionDurationName): string {
  return `var(${getMotionDurationVarName(name)})`
}

export function getMotionEasingVarName(name: MotionEasingName): string {
  return `--motion-easing-${name}`
}

export function getMotionEasingVar(name: MotionEasingName): string {
  return `var(${getMotionEasingVarName(name)})`
}

export function generateMotionVariables(): Record<string, string> {
  const variables: Record<string, string> = {}

  objectEntries(motionDurations).forEach(([name, value]) => {
    variables[getMotionDurationVarName(name as MotionDurationName)] = value
  })

  objectEntries(motionEasings).forEach(([name, value]) => {
    variables[getMotionEasingVarName(name as MotionEasingName)] = value
  })

  return variables
}

export const semanticMotionNames = [
  'transition-fast',
  'transition-medium',
  'transition-slow',
  'transition-overlay',
  'transition-emphasis',
  'easing-standard',
  'easing-emphasis',
  'easing-entrance',
  'easing-exit',
] as const

export type SemanticMotionName = (typeof semanticMotionNames)[number]

export type SemanticMotionOverrides = Partial<
  Record<SemanticMotionName, string>
>

const defaultSemanticMotion: Record<SemanticMotionName, string> = {
  'transition-fast': getMotionDurationVar('fast'),
  'transition-medium': getMotionDurationVar('base'),
  'transition-slow': getMotionDurationVar('slow'),
  'transition-overlay': getMotionDurationVar('relaxed'),
  'transition-emphasis': getMotionDurationVar('fast'),
  'easing-standard': getMotionEasingVar('standard'),
  'easing-emphasis': getMotionEasingVar('emphasized'),
  'easing-entrance': getMotionEasingVar('entrance'),
  'easing-exit': getMotionEasingVar('exit'),
}

export function getSemanticMotionVarName(name: SemanticMotionName): string {
  return `--motion-${name}`
}

export function generateSemanticMotionVariables(
  overrides?: SemanticMotionOverrides
): Record<string, string> {
  const variables: Record<string, string> = {}
  const mapping = { ...defaultSemanticMotion, ...overrides }

  objectEntries(mapping).forEach(([name, value]) => {
    variables[getSemanticMotionVarName(name as SemanticMotionName)] = value
  })

  return variables
}

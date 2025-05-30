// BEM Class Generation System
// This file defines BEM class naming conventions and generation utilities

export type BEMModifier = string | Record<string, boolean | string | number>

export interface BEMClassOptions {
  block: string
  element?: string
  modifiers?: BEMModifier[]
}

// Generate BEM class names
export function bemClass({
  block,
  element,
  modifiers = [],
}: BEMClassOptions): string {
  let className = block

  if (element) {
    className += `__${element}`
  }

  const modifierClasses = modifiers
    .map(modifier => {
      if (typeof modifier === 'string') {
        return `${className}--${modifier}`
      }

      if (typeof modifier === 'object') {
        return (
          Object.entries(modifier)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([_, value]) => Boolean(value))
            .map(([key, value]) => {
              if (value === true) {
                return `${className}--${key}`
              }
              return `${className}--${key}-${value}`
            })
            .join(' ')
        )
      }

      return ''
    })
    .filter(Boolean)

  return [className, ...modifierClasses].join(' ')
}

// Component-specific BEM class generators
export const buttonBEM = {
  block: (modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-button', modifiers }),
  element: (element: string, modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-button', element, modifiers }),
}

export const iconBEM = {
  block: (modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-icon', modifiers }),
  element: (element: string, modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-icon', element, modifiers }),
}

export const inputBEM = {
  block: (modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-input', modifiers }),
  element: (element: string, modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-input', element, modifiers }),
}

export const formBEM = {
  block: (modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-form', modifiers }),
  element: (element: string, modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-form', element, modifiers }),
}

export const layoutBEM = {
  block: (modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-layout', modifiers }),
  element: (element: string, modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-layout', element, modifiers }),
}

export const stackBEM = {
  block: (modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-stack', modifiers }),
  element: (element: string, modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-stack', element, modifiers }),
}

export const groupBEM = {
  block: (modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-group', modifiers }),
  element: (element: string, modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-group', element, modifiers }),
}

export const appShellBEM = {
  block: (modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-app-shell', modifiers }),
  element: (element: string, modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-app-shell', element, modifiers }),
}

export const panelBEM = {
  block: (modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-panel', modifiers }),
  element: (element: string, modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-panel', element, modifiers }),
}

export const overlayBEM = {
  block: (modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-overlay', modifiers }),
  element: (element: string, modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-overlay', element, modifiers }),
}

export const tagBEM = {
  block: (modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-tag', modifiers }),
  element: (element: string, modifiers: BEMModifier[] = []) =>
    bemClass({ block: 'tempo-tag', element, modifiers }),
}

// Utility functions for common patterns
export function createComponentBEM(blockName: string) {
  return {
    block: (modifiers: BEMModifier[] = []) =>
      bemClass({ block: blockName, modifiers }),
    element: (element: string, modifiers: BEMModifier[] = []) =>
      bemClass({ block: blockName, element, modifiers }),
  }
}

// Common modifier patterns
export const commonModifiers = {
  size: (size: 'small' | 'medium' | 'large') => ({ size }),
  variant: (variant: string) => ({ variant }),
  color: (color: string) => ({ color }),
  disabled: (disabled: boolean) => ({ disabled }),
  active: (active: boolean) => ({ active }),
  focused: (focused: boolean) => ({ focused }),
  error: (error: boolean) => ({ error }),
  loading: (loading: boolean) => ({ loading }),
  rounded: (rounded: 'none' | 'small' | 'medium' | 'large' | 'full') => ({
    rounded,
  }),
  shadow: (shadow: 'none' | 'small' | 'medium' | 'large') => ({ shadow }),
}

// Theme-aware modifier generators
export function themeModifiers(theme: {
  primaryColor: string
  secondaryColor: string
  neutralColor: string
}) {
  return {
    primary: () => ({ color: theme.primaryColor }),
    secondary: () => ({ color: theme.secondaryColor }),
    neutral: () => ({ color: theme.neutralColor }),
  }
}

// CSS class utilities for working with CSS variables
export function cssVar(name: string): string {
  return `var(${name})`
}

export function colorVar(color: string, shade: string | number): string {
  return cssVar(`--color-${color}-${shade}`)
}

export function spacingVar(size: string | number): string {
  return cssVar(`--spacing-${size}`)
}

export function radiusVar(size: string): string {
  return cssVar(`--radius-${size}`)
}

export function fontSizeVar(size: string): string {
  return cssVar(`--font-size-${size}`)
}

// Generate CSS custom properties for inline styles
export function cssProps(
  props: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {}
  Object.entries(props).forEach(([key, value]) => {
    result[`--${key}`] = value
  })
  return result
}

// Utility for conditional BEM modifiers
export function conditionalModifiers(
  conditions: Record<string, boolean>
): BEMModifier[] {
  return (
    Object.entries(conditions)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, condition]) => condition)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(([modifier, _]) => modifier)
  )
}

// Generate responsive modifiers
export function responsiveModifiers(
  breakpoints: Record<string, boolean | string | number>
): BEMModifier[] {
  return (
    Object.entries(breakpoints)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, value]) => Boolean(value))
      .map(([breakpoint, value]) => {
        if (value === true) {
          return `${breakpoint}`
        }
        return `${breakpoint}-${value}`
      })
  )
}

// State-based modifiers
export function stateModifiers(state: {
  hover?: boolean
  focus?: boolean
  active?: boolean
  disabled?: boolean
  loading?: boolean
  error?: boolean
}): BEMModifier[] {
  return conditionalModifiers(state)
}

// Animation and transition modifiers
export function animationModifiers(animations: {
  fadeIn?: boolean
  fadeOut?: boolean
  slideIn?: boolean
  slideOut?: boolean
  scale?: boolean
  rotate?: boolean
}): BEMModifier[] {
  return conditionalModifiers(animations)
}

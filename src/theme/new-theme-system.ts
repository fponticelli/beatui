// New Layered CSS Theme System
// Replaces BEM-based theme system with layered CSS architecture

import { localStorageProp } from '@tempots/dom'
import { getTokenValue } from '../tokens'

export type Appearance = 'light' | 'dark'
export type AppearancePreference = Appearance | 'system'

export interface ComponentClassOptions {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: string
  state?: string
  [key: string]: string | undefined
}

// Theme system for the new layered CSS architecture
export class LayeredTheme {
  public appearancePreference = localStorageProp<AppearancePreference>({
    key: 'appearance',
    defaultValue: 'system',
  })

  public appearance = this.appearancePreference.map(value => {
    if (value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return value
  })

  constructor() {
    // Apply dark mode class to document
    this.appearance.on(value => {
      document.documentElement.classList.toggle('dark', value === 'dark')
    })

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.appearancePreference.get() === 'system') {
        // Trigger re-computation by setting the same value to force update
        this.appearancePreference.set('system')
      }
    })
  }

  // Appearance management
  setAppearance(value: AppearancePreference) {
    this.appearancePreference.set(value)
  }

  getAppearance() {
    return this.appearance.get()
  }

  getAppearancePreference() {
    return this.appearancePreference.get()
  }

  // Component class generators using new bc-/bu- prefixes
  button(options: any = {}): string {
    const { size = 'md', variant = 'primary', disabled, fill, color, roundedness, ...rest } = options

    const classes = ['bc-button']

    // Map legacy sizes to new sizes
    const sizeMap: Record<string, string> = {
      'small': 'sm',
      'medium': 'md',
      'large': 'lg'
    }

    // Map legacy variants to new variants
    const variantMap: Record<string, string> = {
      'filled': 'primary',
      'light': 'secondary',
      'text': 'ghost',
      'default': 'outline'
    }

    const mappedSize = sizeMap[size] || size
    const mappedVariant = variantMap[variant] || variant

    // Add size variant
    if (mappedSize) {
      classes.push(`bc-button--${mappedSize}`)
    }

    // Add style variant
    if (mappedVariant) {
      classes.push(`bc-button--${mappedVariant}`)
    }

    // Add roundedness if specified
    if (roundedness) {
      const roundednessMap: Record<string, string> = {
        'none': 'rounded-none',
        'small': 'rounded-sm',
        'medium': 'rounded',
        'large': 'rounded-lg',
        'full': 'rounded-full'
      }
      const mappedRoundedness = roundednessMap[roundedness] || roundedness
      classes.push(`bu-${mappedRoundedness}`)
    }

    // Add any additional modifiers
    Object.entries(rest).forEach(([key, value]) => {
      if (value) {
        classes.push(`bc-button--${key}-${value}`)
      }
    })

    return classes.join(' ')
  }

  iconComponent(options: ComponentClassOptions = {}): string {
    const { size = 'md', ...rest } = options

    const classes = ['bc-icon']

    if (size) {
      classes.push(`bc-icon--${size}`)
    }

    Object.entries(rest).forEach(([key, value]) => {
      if (value) {
        classes.push(`bc-icon--${key}-${value}`)
      }
    })

    return classes.join(' ')
  }

  card(options: ComponentClassOptions = {}): string {
    const classes = ['bc-card']

    Object.entries(options).forEach(([key, value]) => {
      if (value) {
        classes.push(`bc-card--${key}-${value}`)
      }
    })

    return classes.join(' ')
  }

  input(options: ComponentClassOptions = {}): string {
    const { variant, state, ...rest } = options

    const classes = ['bc-input']

    if (variant) {
      classes.push(`bc-input--${variant}`)
    }

    if (state) {
      classes.push(`bc-input--${state}`)
    }

    Object.entries(rest).forEach(([key, value]) => {
      if (value) {
        classes.push(`bc-input--${key}-${value}`)
      }
    })

    return classes.join(' ')
  }

  badge(options: ComponentClassOptions = {}): string {
    const { variant = 'neutral', ...rest } = options

    const classes = ['bc-badge']

    if (variant) {
      classes.push(`bc-badge--${variant}`)
    }

    Object.entries(rest).forEach(([key, value]) => {
      if (value) {
        classes.push(`bc-badge--${key}-${value}`)
      }
    })

    return classes.join(' ')
  }

  alert(options: ComponentClassOptions = {}): string {
    const { variant = 'info', ...rest } = options

    const classes = ['bc-alert']

    if (variant) {
      classes.push(`bc-alert--${variant}`)
    }

    Object.entries(rest).forEach(([key, value]) => {
      if (value) {
        classes.push(`bc-alert--${key}-${value}`)
      }
    })

    return classes.join(' ')
  }

  modal(): string {
    return 'bc-modal'
  }

  modalBackdrop(): string {
    return 'bc-modal-backdrop'
  }

  modalContent(): string {
    return 'bc-modal-content'
  }

  nav(): string {
    return 'bc-nav'
  }

  navItem(options: ComponentClassOptions = {}): string {
    const { state, ...rest } = options

    const classes = ['bc-nav-item']

    if (state === 'active') {
      classes.push('bc-nav-item--active')
    }

    Object.entries(rest).forEach(([key, value]) => {
      if (value) {
        classes.push(`bc-nav-item--${key}-${value}`)
      }
    })

    return classes.join(' ')
  }

  // Legacy compatibility methods
  overlay(options: { effect: string; mode: string }): string {
    return `bc-overlay bc-overlay--effect-${options.effect} bc-overlay--mode-${options.mode}`
  }

  fadeInOut(options: { state: string }): string {
    return `bc-fade bc-fade--state-${options.state}`
  }

  iconContainer(options: { size: string; color?: string }): string {
    const { size = 'md', color } = options

    const classes = ['bc-icon']

    if (size) {
      classes.push(`bc-icon--${size}`)
    }

    if (color) {
      classes.push(`bc-icon--color-${color}`)
    }

    return classes.join(' ')
  }

  panel(options: { side: any; color: any; shadow: any }): string {
    const sideStr = Array.isArray(options.side) ? options.side.join('-') : options.side
    return `bc-panel bc-panel--side-${sideStr} bc-panel--color-${options.color} bc-panel--shadow-${options.shadow}`
  }

  label(options: { type: string }): string {
    return `bc-label bc-label--type-${options.type}`
  }

  // Legacy icon property for Theme interface compatibility
  get icon(): string {
    return 'bc-icon'
  }

  // Utility class helpers
  utils = {
    flex: (direction?: 'row' | 'col') => {
      const classes = ['bu-flex']
      if (direction) {
        classes.push(`bu-flex-${direction}`)
      }
      return classes.join(' ')
    },

    gap: (size: string | number) => `bu-gap-${size}`,

    padding: (size: string | number) => `bu-p-${size}`,

    margin: (size: string | number) => `bu-m-${size}`,

    text: (size: string) => `bu-text-${size}`,

    font: (weight: string) => `bu-font-${weight}`,

    rounded: (size: string) => `bu-rounded-${size}`,

    hidden: () => 'bu-hidden',

    block: () => 'bu-block',
  }

  // Runtime token access
  getToken(tokenName: string): string {
    return getTokenValue(tokenName)
  }

  // Cleanup
  dispose() {
    // Clean up any listeners if needed
  }
}

// Create and export default theme instance
export const theme = new LayeredTheme()

// Export for compatibility with existing code
export function createTheme(): [{ theme: LayeredTheme; appearance: any; appearancePreference: any; setAppearance: any }, () => void] {
  const themeInstance = new LayeredTheme()

  return [
    {
      theme: themeInstance,
      appearance: themeInstance.appearance,
      appearancePreference: themeInstance.appearancePreference,
      setAppearance: themeInstance.setAppearance.bind(themeInstance),
    },
    () => themeInstance.dispose(),
  ]
}

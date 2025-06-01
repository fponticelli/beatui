// New Layered CSS Theme System
// Replaces BEM-based theme system with layered CSS architecture

import {
  ButtonStyleOptions,
  OverlayStyleOptions,
  ThemeDefinition,
} from '@/components/theme'

// Theme system for the new layered CSS architecture
export class BeatUITheme implements ThemeDefinition {
  button({ variant, size, color, roundedness }: ButtonStyleOptions): string {
    const classes = [
      'bc-button',
      `bu-text-${size}`,
      `bc-control--padding-${size}`,
      `bc-control--rounded-${roundedness}`,
    ]
    switch (variant) {
      case 'filled':
        classes.push(`bu-bg--${color}`)
        classes.push(`hover:bu-bg--${color}`)
        break
      case 'light':
        classes.push(`bu-bg--light-${color}`)
        classes.push(`hover:bu-bg--light-${color}`)
        break
      case 'outline':
        classes.push(`bu-border--${color}`)
        classes.push(`hover:bu-bg--light-${color}`)
        break
      case 'default':
        classes.push(`bu-bg--light-neutral`)
        classes.push(`bu-text--${color}`)
        classes.push(`hover:bu-bg--light-base`)
        break
      case 'text':
        classes.push(`bu-bg--inherit`)
        classes.push(`bu-text--${color}`)
        classes.push(`hover:bu-underline`)
        break
    }

    return classes.join(' ')
  }

  overlay(options: OverlayStyleOptions): string {
    return `bc-overlay bc-overlay--effect-${options.effect} bc-overlay--mode-${options.mode}`
  }

  fadeInOut(options: { state: string }): string {
    return `bc-fade bc-fade--state-${options.state}`
  }

  iconContainer(options: { size: string; color?: string }): string {
    const classes = ['bc-icon']
    const { size = 'md', color } = options

    // Map old size values to new ones
    const sizeMap: Record<string, 'sm' | 'md' | 'lg' | 'xl'> = {
      small: 'sm',
      medium: 'md',
      large: 'lg',
      xs: 'sm',
      sm: 'sm',
      md: 'md',
      lg: 'lg',
      xl: 'xl',
    }

    const mappedSize = sizeMap[size] || 'md'

    return classes.join(' ')
  }

  panel(options: { side: any; color: any; shadow: any }): string {
    const sideStr = Array.isArray(options.side)
      ? options.side.join('-')
      : options.side
    return `bc-panel bc-panel--side-${sideStr} bc-panel--color-${options.color} bc-panel--shadow-${options.shadow}`
  }

  label(options: { type: string }): string {
    return `bc-label bc-label--type-${options.type}`
  }

  get icon(): string {
    return 'bc-icon'
  }
}

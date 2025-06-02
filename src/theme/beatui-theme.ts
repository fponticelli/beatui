import {
  ButtonStyleOptions,
  FadeInOutStyleOptions,
  IconStyleOptions,
  LabelStyleOptions,
  OverlayStyleOptions,
  PanelStyleOptions,
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

  overlay({ effect, mode }: OverlayStyleOptions): string {
    return `bc-overlay bc-overlay--effect-${effect} bc-overlay--mode-${mode}`
  }

  fadeInOut({ state }: FadeInOutStyleOptions): string {
    return `bc-fade bc-fade--state-${state}`
  }

  icon({ size, color }: IconStyleOptions): string {
    const classes = ['bc-icon', `bc-icon--${size}`]
    if (color) {
      classes.push(`bu-fg--${color}`)
    }
    return classes.join(' ')
  }

  panel({ side, color, shadow }: PanelStyleOptions): string {
    const sideStr = Array.isArray(side) ? side.join('-') : side
    return `bc-panel bc-panel--side-${sideStr} bu-bg--lighter-${color} bc-panel--shadow-${shadow}`
  }

  label(options: LabelStyleOptions): string {
    return `bc-label bc-label--type-${options.type}`
  }
}

// Tempo UI Theme System
// BEM classes with CSS variables for semantic, maintainable styling
// Replaces Tailwind utility classes with component-focused BEM methodology

import { localStorageProp } from '@tempots/dom'
import {
  Appearance,
  AppearancePreference,
  PanelColor,
  PanelShadow,
  Roundedness,
  Side,
  ThemeValue,
  ButtonVariant,
  ButtonSize,
  IconSize,
  LabelType,
  OverlayEffect,
  OverlayMode,
  FadeTranstionState,
} from './types'
import { colorScales } from './css-variables'

export type ThemeColor = keyof typeof colorScales
export type ThemeColorShade =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 950
export type ThemedColor = ThemeColor | 'primary' | 'secondary' | 'neutral'

export const allColors: ThemeColor[] = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
]

export interface ThemeOptions {
  mainShade?: ThemeColorShade
  primaryColor?: ThemeColor
  secondaryColor?: ThemeColor
  neutralColor?: ThemeColor
  outlineColor?: ThemeColor
}

export const shades = {
  lightest: 50,
  lighter: 100,
  light: 200,
  medium: 600,
  dark: 800,
  darker: 900,
  darkest: 950,
} as const

export function darkerShade(
  shade: ThemeColorShade,
  steps = 1
): ThemeColorShade {
  if (steps === 0) return shade
  if (steps < 0) return lighterShade(shade, -steps)
  if (steps > 1) return darkerShade(darkerShade(shade, steps - 1), 1)

  const shadeMap: Record<ThemeColorShade, ThemeColorShade> = {
    50: 100,
    100: 200,
    200: 300,
    300: 400,
    400: 500,
    500: 600,
    600: 700,
    700: 800,
    800: 900,
    900: 950,
    950: 950,
  }
  return shadeMap[shade]
}

export function lighterShade(
  shade: ThemeColorShade,
  steps = 1
): ThemeColorShade {
  if (steps === 0) return shade
  if (steps < 0) return darkerShade(shade, -steps)
  if (steps > 1) return lighterShade(lighterShade(shade, steps - 1), 1)

  const shadeMap: Record<ThemeColorShade, ThemeColorShade> = {
    50: 50,
    100: 50,
    200: 100,
    300: 200,
    400: 300,
    500: 400,
    600: 500,
    700: 600,
    800: 700,
    900: 800,
    950: 900,
  }
  return shadeMap[shade]
}

// BEM class generators
function buttonBEMClass(
  variant: ButtonVariant,
  size: ButtonSize,
  color: ThemeColor,
  roundedness: Roundedness,
  disabled: boolean,
  fill: boolean
): string {
  const classes = [
    'tempo-button',
    `tempo-button--size-${size}`,
    `tempo-button--variant-${variant}`,
    `tempo-button--color-${color}`,
    `tempo-button--rounded-${roundedness}`,
  ]

  if (disabled) classes.push('tempo-button--disabled')
  if (fill) classes.push('tempo-button--fill')

  return classes.join(' ')
}

function iconBEMClass(size: IconSize, color?: string): string {
  const classes = ['tempo-icon', `tempo-icon--size-${size}`]
  if (color) classes.push(`tempo-icon--color-${color}`)
  return classes.join(' ')
}

function overlayBEMClass(effect: OverlayEffect, mode: OverlayMode): string {
  return `tempo-overlay tempo-overlay--effect-${effect} tempo-overlay--mode-${mode}`
}

function fadeInOutBEMClass(state: FadeTranstionState): string {
  return `tempo-fade tempo-fade--state-${state}`
}

function panelBEMClass(
  side: Side,
  color: PanelColor,
  shadow: PanelShadow
): string {
  const sideStr = Array.isArray(side) ? side.join('-') : side
  return `tempo-panel tempo-panel--side-${sideStr} tempo-panel--color-${color} tempo-panel--shadow-${shadow}`
}

function labelBEMClass(type: LabelType): string {
  return `tempo-label tempo-label--type-${type}`
}

export const bemTheme = ({
  mainShade: _mainShade = shades.medium,
  primaryColor = 'sky',
  secondaryColor = 'green',
  neutralColor = 'neutral',
  outlineColor: _outlineColor = 'sky',
}: ThemeOptions = {}): [ThemeValue, () => void] => {
  const appearancePreference = localStorageProp<AppearancePreference>({
    key: 'appearance',
    defaultValue: 'system',
  })

  const setAppearance = (value: Appearance) => {
    appearancePreference.set(value)
  }

  const appearance = appearancePreference.map(value => {
    if (value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return value
  })

  appearance.on(value => {
    document.documentElement.classList.toggle('dark', value === 'dark')
  })

  const dispose = () => appearancePreference.dispose()

  const getColor = (themedColor: ThemedColor): ThemeColor => {
    if (themedColor === 'primary') return primaryColor
    if (themedColor === 'secondary') return secondaryColor
    if (themedColor === 'neutral') return neutralColor
    return themedColor
  }

  const theme = {
    button: ({
      disabled,
      variant,
      size,
      color: colorName = 'primary',
      roundedness = 'medium',
      fill = false,
    }: {
      disabled: boolean
      variant: ButtonVariant
      size: ButtonSize
      color?: string
      roundedness?: Roundedness
      fill?: boolean
    }): string => {
      const color = getColor((colorName || 'primary') as ThemedColor)
      return buttonBEMClass(variant, size, color, roundedness, disabled, fill)
    },

    iconContainer: ({
      size,
      color,
    }: {
      size: IconSize
      color?: string
    }): string => {
      return iconBEMClass(size, color)
    },

    icon: 'tempo-icon__icon',

    overlay: ({
      effect,
      mode,
    }: {
      effect: OverlayEffect
      mode: OverlayMode
    }): string => {
      return overlayBEMClass(effect, mode)
    },

    fadeInOut: ({ state }: { state: FadeTranstionState }): string => {
      return fadeInOutBEMClass(state)
    },

    panel: ({
      side,
      color,
      shadow,
    }: {
      side: Side
      color: PanelColor
      shadow: PanelShadow
    }): string => {
      return panelBEMClass(side, color, shadow)
    },

    label: ({ type }: { type: LabelType }): string => {
      return labelBEMClass(type)
    },
  }

  return [
    {
      appearance,
      appearancePreference,
      setAppearance,
      theme,
    },
    dispose,
  ]
}

// Export for compatibility
export { bemTheme as defaultTheme }

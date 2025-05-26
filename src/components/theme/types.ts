import { Signal } from '@tempots/dom'
import { ThemedColor } from './colors'

export type ButtonVariant = 'filled' | 'light' | 'outline' | 'default' | 'text'
export type ButtonSize = 'small' | 'medium' | 'large'
export type IconSize = 'small' | 'medium' | 'large'
export type Roundedness = 'none' | 'small' | 'medium' | 'large' | 'full'
export type OverlayEffect = 'transparent' | 'visible'
export type OverlayMode = 'capturing' | 'non-capturing'
export type FadeTranstionState =
  | 'initial'
  | 'entering'
  | 'entered'
  | 'exiting'
  | 'exited'

export interface Theme {
  button: (options: {
    disabled: boolean
    variant: ButtonVariant
    size: ButtonSize
    color?: ThemedColor
    roundedness?: Roundedness
    fill?: boolean
  }) => string
  overlay: (options: { effect: OverlayEffect; mode: OverlayMode }) => string
  fadeInOut: (options: { state: FadeTranstionState }) => string
  iconContainer: (options: { size: IconSize; color?: string }) => string
  icon: string
}

export type AppearancePreference = 'light' | 'dark' | 'system'
export type Appearance = 'light' | 'dark'

export interface ThemeValue {
  appearancePreference: Signal<AppearancePreference>
  appearance: Signal<Appearance>
  setAppearance: (appearance: Appearance) => void
  theme: Theme
}

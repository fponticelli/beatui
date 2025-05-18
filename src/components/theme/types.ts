import { Signal } from '@tempots/dom'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text'
export type ButtonSize = 'small' | 'medium' | 'large'

export interface Theme {
  button: (options: {
    disabled: boolean
    variant: ButtonVariant
    size: ButtonSize
  }) => string
}

export type AppearancePreference = 'light' | 'dark' | 'system'
export type Appearance = 'light' | 'dark'

export interface ThemeValue {
  appearancePreference: Signal<AppearancePreference>
  appearance: Signal<Appearance>
  setAppearance: (appearance: Appearance) => void
  theme: Theme
}

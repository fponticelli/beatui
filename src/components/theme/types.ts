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

export type Side =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'none'
  | 'all'
  | ('left' | 'right' | 'top' | 'bottom')[]

export type PanelColor = ThemedColor | 'white' | 'black' | 'transparent'
export type PanelShadow = 'none' | 'small' | 'medium' | 'large'
export type LabelType = 'emphasis' | 'default' | 'muted' | 'error'

export type JustifyContent =
  | 'flex-start'
  | 'flex-end'
  | 'safe flex-end'
  | 'center'
  | 'safe center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'stretch'
  | 'baseline'
  | 'normal'

export type JustifyItems =
  | 'start'
  | 'end'
  | 'safe end'
  | 'center'
  | 'safe center'
  | 'stretch'
  | 'normal'

export type JustifySelf =
  | 'auto'
  | 'start'
  | 'center'
  | 'safe center'
  | 'end'
  | 'safe end'
  | 'stretch'

export type AlignContent =
  | 'normal'
  | 'center'
  | 'flex-start'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'baseline'
  | 'stretch'

export type AlignItems =
  | 'flex-start'
  | 'flex-end'
  | 'safe flex-end'
  | 'center'
  | 'safe-center'
  | 'baseline'
  | 'last-baseline'
  | 'stretch'

export type AlignSelf =
  | 'auto'
  | 'flex-start'
  | 'flex-end'
  | 'safe flex-end'
  | 'center'
  | 'safe center'
  | 'stretch'
  | 'baseline'
  | 'last baseline'

export interface Theme {
  button: (options: {
    disabled?: boolean
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
    size?: 'sm' | 'md' | 'lg' | 'xl'
    color?: string
    roundedness?: Roundedness
    fill?: boolean
  }) => string
  overlay: (options: { effect: OverlayEffect; mode: OverlayMode }) => string
  fadeInOut: (options: { state: FadeTranstionState }) => string
  iconContainer: (options: { size: IconSize; color?: string }) => string
  panel: (options: {
    side: Side
    color: PanelColor
    shadow: PanelShadow
  }) => string
  label: (options: { type: LabelType }) => string
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

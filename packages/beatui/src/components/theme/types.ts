import { BackgroundColorName, ThemeColorName } from '@/tokens'
import { RadiusName } from '@/tokens/radius'
import { Signal } from '@tempots/dom'

export type ButtonVariant = 'filled' | 'light' | 'outline' | 'default' | 'text'
export type ControlSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
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

export type PanelColor =
  | BackgroundColorName
  | ThemeColorName
  | 'white'
  | 'black'
  | 'transparent'
export type PanelShadow = 'none' | 'sm' | 'md' | 'lg'
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

export type OverlayStyleOptions = {
  effect: OverlayEffect
  mode: OverlayMode
}

export type PanelStyleOptions = {
  side: Side
  color: PanelColor
  shadow: PanelShadow
}

export type InputContainerStyleOptions = {
  disabled?: boolean
  hasError?: boolean
}

export type ControlInputWrapperStyleOptions = {
  hasError?: boolean
  disabled?: boolean
}

export type CheckboxInputStyleOptions = {
  disabled?: boolean
}

export type EditableTextStyleOptions = {
  isEditing?: boolean
}

export type NumberInputStyleOptions = {
  disabled?: boolean
}

export type ToggleStyleOptions = {
  disabled?: boolean
  size?: ControlSize
}

export type FadeInOutStyleOptions = {
  state: FadeTranstionState
}

export type CardVariant = 'default' | 'elevated' | 'flat' | 'outlined'

export type CenterGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type SinkVariant = 'default' | 'deep' | 'shallow' | 'flat'

export type SinkStyleOptions = {
  variant?: SinkVariant
  size?: ControlSize
  roundedness?: RadiusName
}

export type SegmentedControlStyleOptions = {
  size?: ControlSize
  disabled?: boolean
}

export interface ThemeDefinition {
  overlay: (options: OverlayStyleOptions) => string
  panel: (options: PanelStyleOptions) => string
  inputContainer: (options: InputContainerStyleOptions) => string
  controlInputWrapper: (options: ControlInputWrapperStyleOptions) => string
  controlInputWrapperLabelText: (
    options: ControlInputWrapperStyleOptions
  ) => string
  checkboxInput: (options: CheckboxInputStyleOptions) => string
  numberInput: (options: NumberInputStyleOptions) => string
  segmentedControl: (options: SegmentedControlStyleOptions) => string
  toggle: (options: ToggleStyleOptions) => string
}

export type AppearancePreference = 'light' | 'dark' | 'system'
export type Appearance = 'light' | 'dark'

export interface ThemeValue {
  setAppearancePreference: (appearance: AppearancePreference) => void
  appearancePreference: Signal<AppearancePreference>
  appearance: Signal<Appearance>
  theme: ThemeDefinition
}

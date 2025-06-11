import {
  CheckboxInputStyleOptions,
  ControlInputWrapperStyleOptions,
  InputContainerStyleOptions,
  NumberInputStyleOptions,
  OverlayStyleOptions,
  PanelStyleOptions,
  SegmentedControlStyleOptions,
  ThemeDefinition,
  ToggleStyleOptions,
} from '@/components/theme'

// Theme system for the new layered CSS architecture
export class BeatUITheme implements ThemeDefinition {
  overlay({ effect, mode }: OverlayStyleOptions): string {
    return `bc-overlay bc-overlay--effect-${effect} bc-overlay--mode-${mode}`
  }

  panel({ side, color, shadow }: PanelStyleOptions): string {
    const sideStr = (Array.isArray(side) ? side : [side])
      .map(s => `bc-panel--side-${s}`)
      .join(' ')
    return `bc-panel ${sideStr} bu-bg--lighter-${color} bc-panel--shadow-${shadow}`
  }

  inputContainer({ disabled, hasError }: InputContainerStyleOptions): string {
    const classes = ['bc-input-container']

    if (disabled) {
      classes.push('bc-input-container--disabled')
    } else {
      classes.push('bc-input-container--default')
    }

    if (hasError) {
      classes.push('bc-input-container--error')
    }

    return classes.join(' ')
  }

  controlInputWrapper(_options?: ControlInputWrapperStyleOptions): string {
    const classes = ['bc-control-input-wrapper']

    // The wrapper itself doesn't have state classes, but we return the base class
    // State-specific styling is handled by child elements
    return classes.join(' ')
  }

  controlInputWrapperLabelText({
    hasError,
    disabled,
  }: ControlInputWrapperStyleOptions): string {
    const classes = ['bc-control-input-wrapper__label-text']

    if (hasError) {
      classes.push('bc-control-input-wrapper__label-text--error')
    } else if (disabled) {
      classes.push('bc-control-input-wrapper__label-text--disabled')
    } else {
      classes.push('bc-control-input-wrapper__label-text--default')
    }

    return classes.join(' ')
  }

  checkboxInput(_options: CheckboxInputStyleOptions): string {
    return 'bc-checkbox-input'
  }

  numberInput(_options: NumberInputStyleOptions): string {
    return 'bc-number-input'
  }

  segmentedControl({
    size = 'sm',
    disabled = false,
  }: SegmentedControlStyleOptions): string {
    const classes = [
      'bc-segmented-control',
      `bu-text-${size}`,
      `bc-segmented-control--${size}`,
    ]

    if (disabled) {
      classes.push('bc-segmented-control--disabled')
    }

    return classes.join(' ')
  }

  toggle({ disabled = false, size = 'md' }: ToggleStyleOptions): string {
    const classes = ['bc-toggle', `bu-text-${size}`, `bc-toggle--${size}`]

    if (disabled) {
      classes.push('bc-toggle--disabled')
    }

    return classes.join(' ')
  }
}

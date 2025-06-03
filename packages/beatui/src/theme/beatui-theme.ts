import {
  ButtonStyleOptions,
  CardStyleOptions,
  CenterStyleOptions,
  CheckboxInputStyleOptions,
  ControlInputWrapperStyleOptions,
  EditableTextStyleOptions,
  IconStyleOptions,
  InputContainerStyleOptions,
  LabelStyleOptions,
  NumberInputStyleOptions,
  OverlayStyleOptions,
  PanelStyleOptions,
  SegmentedControlStyleOptions,
  SinkStyleOptions,
  TagStyleOptions,
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

  icon({ size, color }: IconStyleOptions): string {
    const classes = ['bc-icon', `bc-icon--${size}`]
    if (color) {
      classes.push(`bu-fg--${color}`)
    }
    return classes.join(' ')
  }

  panel({ side, color, shadow }: PanelStyleOptions): string {
    const sideStr = (Array.isArray(side) ? side : [side])
      .map(s => `bc-panel--side-${s}`)
      .join(' ')
    return `bc-panel ${sideStr} bu-bg--lighter-${color} bc-panel--shadow-${shadow}`
  }

  label(options: LabelStyleOptions): string {
    return `bc-label bc-label--${options.type}`
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

  tag({ disabled, color = 'base' }: TagStyleOptions): string {
    const classes = ['bc-tag']

    if (disabled) {
      classes.push('bc-tag--disabled')
    } else {
      classes.push(`bc-tag--${color}`)
    }

    return classes.join(' ')
  }

  checkboxInput(_options: CheckboxInputStyleOptions): string {
    return 'bc-checkbox-input'
  }

  editableText(_options: EditableTextStyleOptions): string {
    return 'bc-editable-text'
  }

  numberInput(_options: NumberInputStyleOptions): string {
    return 'bc-number-input'
  }

  card({
    variant = 'default',
    size = 'md',
    roundedness = 'lg',
  }: CardStyleOptions): string {
    const classes = ['bc-card']

    if (variant !== 'default') {
      classes.push(`bc-card--${variant}`)
    }

    if (size !== 'md') {
      classes.push(`bc-card--padding-${size}`)
    }

    if (roundedness !== 'lg') {
      classes.push(`bc-card--rounded-${roundedness}`)
    }

    return classes.join(' ')
  }

  center({ gap = 'lg' }: CenterStyleOptions): string {
    const classes = ['bc-center']

    if (gap !== 'lg') {
      classes.push(`bc-center--gap-${gap}`)
    }

    return classes.join(' ')
  }

  sink({
    variant = 'default',
    size = 'md',
    roundedness = 'lg',
  }: SinkStyleOptions): string {
    const classes = ['bc-sink']

    if (variant !== 'default') {
      classes.push(`bc-sink--${variant}`)
    }

    if (size !== 'md') {
      classes.push(`bc-sink--padding-${size}`)
    }

    if (roundedness !== 'lg') {
      classes.push(`bc-sink--rounded-${roundedness}`)
    }

    return classes.join(' ')
  }

  segmentedControl({ size = 'sm' }: SegmentedControlStyleOptions): string {
    const classes = ['bc-segmented-control']

    if (size !== 'sm') {
      classes.push(`bc-segmented-control--size-${size}`)
    }

    return classes.join(' ')
  }
}

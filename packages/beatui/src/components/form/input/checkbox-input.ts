import { aria, attr, Empty, html, on, Value, computedOf } from '@tempots/dom'
import { InputContainer } from './input-container'
import { InputOptions } from './input-options'
import { MutedLabel } from '../../typography/label'
import { sessionId } from '../../../utils/session-id'
import { Icon } from '../../data/icon'
import { IconSize } from '../../theme'

export type CheckboxInputOptions = InputOptions<boolean> & {
  checkedIcon?: Value<string | undefined>
  uncheckedIcon?: Value<string | undefined>
  iconSize?: Value<IconSize>
}

export const CheckboxInput = (options: CheckboxInputOptions) => {
  const {
    value,
    onBlur,
    onChange,
    placeholder,
    disabled,
    id,
    checkedIcon,
    uncheckedIcon,
    iconSize = 'lg',
  } = options

  // Generate unique IDs for accessibility
  const checkboxId = id ?? sessionId('checkbox')
  const labelId = `${checkboxId}-label`

  // Handle toggle action
  const handleToggle = () => {
    if (Value.get(disabled ?? false)) return
    const currentValue = Value.get(value)
    onChange?.(!currentValue)
  }

  // Handle keyboard events
  const handleKeyDown = (event: KeyboardEvent) => {
    if (Value.get(disabled ?? false)) return

    // Toggle on Space or Enter key
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault() // Prevent page scroll on Space
      handleToggle()
    }
  }

  return InputContainer(
    {
      baseContainer: true,
      growInput: false,
      ...options,
      input: html.span(
        attr.class('bc-checkbox-input'),
        html.span(
          attr.class('bc-checkbox-input__checkbox'),
          attr.class(
            Value.map(value, (v): string =>
              v
                ? 'bc-checkbox-input__checkbox--checked'
                : 'bc-checkbox-input__checkbox--unchecked'
            )
          ),
          attr.class(
            Value.map(disabled ?? false, (d): string =>
              d ? 'bc-checkbox-input__checkbox--disabled' : ''
            )
          ),
          attr.id(checkboxId),
          attr.role('checkbox'),
          attr.tabindex(
            Value.map(disabled ?? false, (disabled): number =>
              disabled ? -1 : 0
            )
          ),
          aria.checked(value as Value<boolean | 'mixed'>),
          aria.disabled(disabled),
          placeholder != null ? aria.labelledby(labelId) : Empty,
          on.keydown(handleKeyDown),
          onBlur != null ? on.blur(onBlur) : Empty,
          Icon({
            icon: computedOf(
              value,
              checkedIcon,
              uncheckedIcon
            )((isChecked, checkedIconName, uncheckedIconName): string =>
              isChecked
                ? (checkedIconName ?? 'akar-icons/check-box-fill')
                : (uncheckedIconName ?? 'akar-icons/box')
            ),
            accessibility: 'decorative',
            size: iconSize,
          })
        ),
        placeholder != null
          ? html.label(
              attr.class('bc-checkbox-input__label'),
              attr.id(labelId),
              attr.for(checkboxId),
              MutedLabel(placeholder)
            )
          : Empty
      ),
    },
    on.click(handleToggle)
  )
}

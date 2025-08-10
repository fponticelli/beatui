import { aria, attr, Empty, html, on, Value } from '@tempots/dom'
import { InputContainer } from './input-container'
import { InputOptions } from './input-options'
import { MutedLabel } from '../../typography/label'
import { sessionId } from '../../../utils/session-id'

export const CheckboxInput = (options: InputOptions<boolean>) => {
  const { value, onBlur, onChange, placeholder, disabled, id } = options

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

  return InputContainer({
    baseContainer: true,
    growInput: false,
    ...options,
    child: on.click(handleToggle),
    input: html.span(
      attr.class('bc-checkbox-input'),
      html.span(
        attr.class('bc-checkbox-input__checkbox'),
        attr.class(
          Value.map(value, (v): string =>
            v ? 'bc-checkbox-input__checkbox--checked' : ''
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
        onBlur != null ? on.blur(onBlur) : Empty
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
  })
}

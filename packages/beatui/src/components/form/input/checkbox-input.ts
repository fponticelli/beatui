import { aria, attr, Empty, html, on, Value, computedOf } from '@tempots/dom'
import { InputContainer } from './input-container'
import { InputOptions } from './input-options'
import { MutedLabel } from '../../typography/label'
import { sessionId } from '../../../utils/session-id'
import { Icon } from '../../data/icon'
import { IconSize } from '../../theme'

/**
 * Configuration options for the {@link CheckboxInput} component.
 *
 * Extends {@link InputOptions} for boolean values with additional properties to
 * customize the checked/unchecked icons and their size.
 */
export type CheckboxInputOptions = InputOptions<boolean> & {
  /** Icon name to display when the checkbox is checked. @default 'akar-icons/check-box-fill' */
  checkedIcon?: Value<string | undefined>
  /** Icon name to display when the checkbox is unchecked. @default 'akar-icons/box' */
  uncheckedIcon?: Value<string | undefined>
  /** Size of the checkbox icon. @default 'lg' */
  iconSize?: Value<IconSize>
}

/**
 * A custom checkbox input component with icon-based checked/unchecked states.
 *
 * Renders a styled checkbox using icons rather than the native checkbox element,
 * wrapped in an {@link InputContainer}. Supports full keyboard interaction (Space
 * and Enter to toggle), ARIA `role="checkbox"` semantics, and an optional text
 * label rendered from the `placeholder` property. When `placeholder` is set,
 * clicking the label also toggles the checkbox.
 *
 * @param options - Configuration options for the checkbox, including custom icons and icon size
 * @returns A styled checkbox element with optional label, wrapped in an InputContainer
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { CheckboxInput } from '@tempots/beatui'
 *
 * const agreed = prop(false)
 * CheckboxInput({
 *   value: agreed,
 *   onChange: agreed.set,
 *   placeholder: 'I agree to the terms and conditions',
 * })
 * ```
 *
 * @example
 * ```ts
 * // With custom icons and size
 * CheckboxInput({
 *   value: prop(true),
 *   onChange: (v) => console.log('Checked:', v),
 *   checkedIcon: 'mdi:checkbox-marked',
 *   uncheckedIcon: 'mdi:checkbox-blank-outline',
 *   iconSize: 'xl',
 * })
 * ```
 */
export const CheckboxInput = (options: CheckboxInputOptions) => {
  const {
    value,
    onBlur,
    onChange,
    onInput,
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
    onInput?.(!currentValue)
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

import { aria, attr, Empty, html, on, Value, computedOf } from '@tempots/dom'
import { InputContainer } from './input-container'
import { InputOptions } from './input-options'
import { MutedLabel } from '../../typography/label'
import { sessionId } from '../../../utils/session-id'
import { Icon } from '../../data/icon'
import { IconSize } from '../../theme'

/**
 * Represents the three possible states of a tri-state checkbox.
 *
 * - `'checked'` — all items selected
 * - `'unchecked'` — no items selected
 * - `'indeterminate'` — some items selected (shown with a minus icon)
 */
export type CheckboxState = 'checked' | 'unchecked' | 'indeterminate'

/**
 * Configuration options for the {@link TriStateCheckboxInput} component.
 *
 * Extends {@link InputOptions} for {@link CheckboxState} values with additional
 * properties to customize the icons for each state and their size.
 */
export type TriStateCheckboxInputOptions = InputOptions<CheckboxState> & {
  /** Icon name to display when the checkbox is checked. @default 'ri:checkbox-fill' */
  checkedIcon?: Value<string | undefined>
  /** Icon name to display when the checkbox is unchecked. @default 'mdi:checkbox-blank-outline' */
  uncheckedIcon?: Value<string | undefined>
  /** Icon name to display when the checkbox is in the indeterminate state. @default 'ri/checkbox-indeterminate-fill' */
  indeterminateIcon?: Value<string | undefined>
  /** Size of the checkbox icon. */
  iconSize?: Value<IconSize>
}

/**
 * Maps a {@link CheckboxState} to the appropriate `aria-checked` value.
 */
function stateToAriaChecked(
  state: CheckboxState
): boolean | 'true' | 'false' | 'mixed' {
  if (state === 'checked') return true
  if (state === 'indeterminate') return 'mixed'
  return false
}

/**
 * Cycles the toggle state: `unchecked` → `checked` → `indeterminate` → `unchecked`.
 */
function cycleState(current: CheckboxState): CheckboxState {
  if (current === 'unchecked') return 'checked'
  if (current === 'checked') return 'indeterminate'
  return 'unchecked'
}

/**
 * A custom tri-state checkbox input component that supports checked, unchecked,
 * and indeterminate states with icon-based rendering.
 *
 * Renders a styled checkbox using icons for each state, wrapped in an
 * {@link InputContainer}. Supports full keyboard interaction (Space and Enter to
 * toggle), ARIA `role="checkbox"` semantics with `aria-checked="mixed"` for the
 * indeterminate state, and an optional text label rendered from the `placeholder`
 * property. When `placeholder` is set, clicking the label also toggles the checkbox.
 *
 * The default toggle cycle is: `unchecked` → `checked` → `indeterminate` → `unchecked`.
 * Provide a custom `onChange` to override this behavior.
 *
 * @param options - Configuration options for the tri-state checkbox
 * @returns A styled tri-state checkbox element with optional label, wrapped in an InputContainer
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { TriStateCheckboxInput } from '@tempots/beatui'
 *
 * const state = prop<CheckboxState>('unchecked')
 * TriStateCheckboxInput({
 *   value: state,
 *   onChange: state.set,
 *   placeholder: 'Select all',
 * })
 * ```
 *
 * @example
 * ```ts
 * // Drive state from DataSource signals
 * import { computedOf } from '@tempots/dom'
 * import { CheckboxState, TriStateCheckboxInput } from '@tempots/beatui'
 *
 * const checkboxState = computedOf(
 *   dataSource.isAllSelected,
 *   dataSource.isSomeSelected
 * )((isAll, isSome): CheckboxState =>
 *   isAll ? 'checked' : isSome ? 'indeterminate' : 'unchecked'
 * )
 *
 * TriStateCheckboxInput({
 *   value: checkboxState,
 *   onChange: () => {
 *     if (dataSource.isAllSelected.value) {
 *       dataSource.deselectAll()
 *     } else {
 *       dataSource.selectAll()
 *     }
 *   },
 * })
 * ```
 */
export const TriStateCheckboxInput = (
  options: TriStateCheckboxInputOptions
) => {
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
    indeterminateIcon,
    size = 'md',
  } = options

  // Generate unique IDs for accessibility
  const checkboxId = id ?? sessionId('tri-state-checkbox')
  const labelId = `${checkboxId}-label`

  // Handle toggle action — cycles through states by default
  const handleToggle = () => {
    if (Value.get(disabled ?? false)) return
    const currentState = Value.get(value)
    const nextState = cycleState(currentState)
    onChange?.(nextState)
    onInput?.(nextState)
  }

  // Handle keyboard events
  const handleKeyDown = (event: KeyboardEvent) => {
    if (Value.get(disabled ?? false)) return

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      handleToggle()
    }
  }

  // Reactive CSS modifier class based on state
  const stateClass = Value.map(value, (state): string => {
    if (state === 'checked') return 'bc-checkbox-input__checkbox--checked'
    if (state === 'indeterminate')
      return 'bc-checkbox-input__checkbox--indeterminate'
    return 'bc-checkbox-input__checkbox--unchecked'
  })

  // Reactive aria-checked value
  const ariaChecked = Value.map(
    value,
    (state): boolean | 'true' | 'false' | 'mixed' => stateToAriaChecked(state)
  )

  // Reactive icon based on current state and icon overrides
  const iconName = computedOf(
    value,
    checkedIcon,
    uncheckedIcon,
    indeterminateIcon
  )((
    state,
    checkedIconName,
    uncheckedIconName,
    indeterminateIconName
  ): string => {
    if (state === 'checked') {
      return checkedIconName ?? 'ri:checkbox-fill'
    }
    if (state === 'indeterminate') {
      return indeterminateIconName ?? 'mdi:checkbox-indeterminate-outline'
    }
    return uncheckedIconName ?? 'mdi:checkbox-blank-outline'
  })

  return InputContainer(
    {
      baseContainer: true,
      growInput: false,
      ...options,
      input: html.span(
        attr.class('bc-checkbox-input'),
        html.span(
          attr.class('bc-checkbox-input__checkbox'),
          attr.class(stateClass),
          attr.class(
            Value.map(disabled ?? false, (d): string =>
              d ? 'bc-checkbox-input__checkbox--disabled' : ''
            )
          ),
          attr.id(checkboxId),
          attr.role('checkbox'),
          attr.tabindex(
            Value.map(disabled ?? false, (d): number => (d ? -1 : 0))
          ),
          aria.checked(ariaChecked as Value<boolean | 'mixed'>),
          aria.disabled(disabled),
          placeholder != null ? aria.labelledby(labelId) : Empty,
          on.keydown(handleKeyDown),
          onBlur != null ? on.blur(onBlur) : Empty,
          Icon({
            icon: iconName,
            accessibility: 'decorative',
            size: size,
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

import {
  attr,
  emitValue,
  emitValueAsDate,
  Empty,
  input,
  on,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'

/**
 * A date input component wrapping a native `<input type="date">` element.
 *
 * Renders a styled date picker inside an {@link InputContainer} using the browser's
 * native date selection UI. The value is handled as a JavaScript `Date` object and
 * automatically converted to/from the native input's date representation.
 *
 * @param options - Configuration options following the {@link InputOptions} pattern for Date values
 * @returns A styled date input element wrapped in an InputContainer
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { DateInput } from '@tempots/beatui'
 *
 * const birthday = prop(new Date('1990-01-15'))
 * DateInput({
 *   value: birthday,
 *   onChange: birthday.set,
 * })
 * ```
 *
 * @example
 * ```ts
 * // With error state and disabled
 * DateInput({
 *   value: prop(new Date()),
 *   onChange: (d) => console.log('Selected:', d),
 *   hasError: prop(true),
 *   disabled: prop(false),
 * })
 * ```
 */
export const DateInput = (options: InputOptions<Date>) => {
  const { value, onBlur, onChange } = options

  return InputContainer({
    ...options,
    input: input.date(
      CommonInputAttributes(options),
      attr.valueAsDate(value),
      attr.class('bc-input'),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null ? on.change(emitValueAsDate(onChange)) : Empty
    ),
  })
}

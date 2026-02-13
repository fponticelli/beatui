import { attr, emitValue, Empty, input, on, Value } from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'

/**
 * Converts a JavaScript Date object to a local datetime string in the format
 * required by `<input type="datetime-local">` (`YYYY-MM-DDThh:mm`).
 *
 * @param date - The Date object to format
 * @returns A string in `YYYY-MM-DDThh:mm` format using local time
 */
const localDateToString = (date: Date) => {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  const h = date.getHours().toString().padStart(2, '0')
  const min = date.getMinutes().toString().padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}`
}

/**
 * A date and time input component wrapping a native `<input type="datetime-local">` element.
 *
 * Renders a styled date-time picker inside an {@link InputContainer} using the browser's
 * native datetime selection UI. The value is handled as a JavaScript `Date` object and
 * automatically converted to/from the local datetime string format (`YYYY-MM-DDThh:mm`)
 * required by the native input.
 *
 * @param options - Configuration options following the {@link InputOptions} pattern for Date values
 * @returns A styled datetime input element wrapped in an InputContainer
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { DateTimeInput } from '@tempots/beatui'
 *
 * const appointment = prop(new Date())
 * DateTimeInput({
 *   value: appointment,
 *   onChange: appointment.set,
 * })
 * ```
 *
 * @example
 * ```ts
 * // With label via InputWrapper
 * DateTimeInput({
 *   value: prop(new Date()),
 *   onChange: (d) => console.log('Selected:', d.toISOString()),
 *   disabled: false,
 *   size: 'lg',
 * })
 * ```
 */
export const DateTimeInput = (options: InputOptions<Date>) => {
  const { value, onBlur, onChange } = options

  return InputContainer({
    ...options,
    input: input['datetime-local'](
      CommonInputAttributes(options),
      attr.value(Value.map(value, localDateToString)),
      attr.class('bc-input'),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null
        ? on.change(emitValue(v => onChange(new Date(v))))
        : Empty
    ),
  })
}

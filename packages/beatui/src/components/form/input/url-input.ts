import { attr, emitValue, Empty, input, on } from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'

/**
 * A URL input component wrapping a native `<input type="url">` element.
 *
 * Renders a styled URL field inside an {@link InputContainer} with browser-native
 * URL validation support. Accepts all standard {@link InputOptions} properties for
 * string values.
 *
 * @param options - Configuration options following the {@link InputOptions} pattern for string values
 * @returns A styled URL input element wrapped in an InputContainer
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { UrlInput } from '@tempots/beatui'
 *
 * const website = prop('https://')
 * UrlInput({
 *   value: website,
 *   onChange: website.set,
 *   placeholder: 'https://example.com',
 * })
 * ```
 *
 * @example
 * ```ts
 * // With a before icon and error state
 * UrlInput({
 *   value: prop(''),
 *   onChange: (v) => console.log('URL:', v),
 *   before: Icon({ icon: 'line-md:link' }),
 *   hasError: prop(true),
 * })
 * ```
 */
export const UrlInput = (options: InputOptions<string>) => {
  const { value, onBlur, onChange, onInput } = options

  return InputContainer({
    ...options,
    input: input.url(
      CommonInputAttributes(options),
      attr.value(value),
      attr.class('bc-input'),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null ? on.change(emitValue(onChange)) : Empty,
      onInput != null ? on.input(emitValue(onInput)) : Empty
    ),
  })
}

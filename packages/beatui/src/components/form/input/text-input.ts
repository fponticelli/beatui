import { attr, emitValue, Empty, html, on, Value } from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Merge } from '@tempots/std'

/**
 * Configuration options for {@link TextInput}.
 *
 * Extends {@link InputOptions} with an optional `type` attribute to support
 * different HTML input types (e.g., 'text', 'email', 'url', 'tel', 'password').
 */
export type TextInputOptions = Merge<
  InputOptions<string>,
  {
    /**
     * HTML input type attribute.
     * @default 'text'
     */
    type?: Value<string>
  }
>

/**
 * A single-line text input component wrapping a native `<input>` element.
 *
 * Renders a styled text field inside an {@link InputContainer} with support for
 * reactive values, placeholder text, disabled state, and all standard
 * {@link InputOptions} properties.
 *
 * @param options - Configuration options following the {@link TextInputOptions} pattern
 * @returns A styled text input element wrapped in an InputContainer
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { TextInput } from '@tempots/beatui'
 *
 * const name = prop('John')
 * TextInput({
 *   value: name,
 *   onChange: name.set,
 *   placeholder: 'Enter your name',
 *   size: 'md',
 * })
 * ```
 *
 * @example
 * ```ts
 * // With prefix/suffix using InputAdornment
 * TextInput({
 *   value: prop(''),
 *   onInput: (v) => console.log('Typing:', v),
 *   before: InputAdornment({ filled: true }, 'https://'),
 *   placeholder: 'example.com',
 *   type: 'url',
 * })
 * ```
 *
 * @example
 * ```ts
 * // With icon decoration
 * TextInput({
 *   value: prop(''),
 *   onInput: (v) => console.log('Typing:', v),
 *   before: InputIcon({ icon: 'line-md:search' }),
 *   placeholder: 'Search...',
 * })
 * ```
 */
export const TextInput = (options: TextInputOptions) => {
  const { value, onBlur, onChange, onInput, type } = options

  return InputContainer({
    ...options,
    input: html.input(
      attr.type(type ?? 'text'),
      CommonInputAttributes(options),
      attr.value(value),
      attr.class('bc-input'),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null ? on.change(emitValue(onChange)) : Empty,
      onInput != null ? on.input(emitValue(onInput)) : Empty
    ),
  })
}

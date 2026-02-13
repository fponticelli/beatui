import { attr, emitValue, Empty, input, on } from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'

/**
 * A single-line text input component wrapping a native `<input type="text">` element.
 *
 * Renders a styled text field inside an {@link InputContainer} with support for
 * reactive values, placeholder text, disabled state, and all standard
 * {@link InputOptions} properties.
 *
 * @param options - Configuration options following the {@link InputOptions} pattern for string values
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
 * // With before/after decorations
 * TextInput({
 *   value: prop(''),
 *   onInput: (v) => console.log('Typing:', v),
 *   before: Icon({ icon: 'line-md:search' }),
 *   placeholder: 'Search...',
 * })
 * ```
 */
export const TextInput = (options: InputOptions<string>) => {
  const { value, onBlur, onChange, onInput } = options

  return InputContainer({
    ...options,
    input: input.text(
      CommonInputAttributes(options),
      attr.value(value),
      attr.class('bc-input'),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null ? on.change(emitValue(onChange)) : Empty,
      onInput != null ? on.input(emitValue(onInput)) : Empty
    ),
  })
}

import { CommonInputAttributes, InputOptions } from './input-options'
import { coalesce, Empty, Use } from '@tempots/dom'
import { emitValue, on } from '@tempots/dom'
import { input } from '@tempots/dom'
import { attr } from '@tempots/dom'
import { InputContainer, InputIcon } from './input-container'
import { BeatUII18n } from '../../../beatui-i18n'

/**
 * An email input component wrapping a native `<input type="email">` element.
 *
 * Renders a styled email field inside an {@link InputContainer} with an email icon
 * displayed by default in the `before` slot. The autocomplete attribute defaults to
 * `'email'` and the name defaults to `'email'` for browser autofill compatibility.
 * Placeholder text is sourced from the BeatUI i18n system when not explicitly provided.
 *
 * @param options - Configuration options following the {@link InputOptions} pattern for string values
 * @returns A styled email input element with an email icon, wrapped in an InputContainer
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { EmailInput } from '@tempots/beatui'
 *
 * const email = prop('')
 * EmailInput({
 *   value: email,
 *   onChange: email.set,
 * })
 * ```
 *
 * @example
 * ```ts
 * // Override the default before icon
 * EmailInput({
 *   value: prop(''),
 *   onChange: (v) => console.log('Email:', v),
 *   before: Icon({ icon: 'custom-email-icon' }),
 *   placeholder: 'user@example.com',
 * })
 * ```
 */
export const EmailInput = (options: InputOptions<string>) => {
  const updatedOptions = {
    name: 'email',
    autocomplete: 'email',
    ...options,
    type: 'email',
  }
  const {
    value,
    before: beforeOption,
    onBlur,
    onChange,
    onInput,
    placeholder,
  } = updatedOptions
  const before =
    beforeOption ??
    InputIcon({
      icon: 'line-md:email',
      size: options.size,
      color: 'neutral',
    })

  return Use(BeatUII18n, t =>
    InputContainer({
      ...options,
      before,
      input: input.email(
        CommonInputAttributes(updatedOptions),
        attr.placeholder(coalesce(placeholder, t.$.emailPlaceholderText)),
        attr.value(value),
        attr.class('bc-input'),
        onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
        onChange != null ? on.change(emitValue(onChange)) : Empty,
        onInput != null ? on.input(emitValue(onInput)) : Empty
      ),
    })
  )
}

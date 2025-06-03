import { CommonInputAttributes, InputOptions } from './input-options'
import { Empty } from '@tempots/dom'
import { emitValue, on } from '@tempots/dom'
import { input } from '@tempots/dom'
import { attr } from '@tempots/dom'
import { InputContainer } from './input-container'

export const EmailInput = (options: InputOptions<string>) => {
  const updatedOptions = {
    name: 'email',
    autocomplete: 'email',
    placeholder: 'you@company.com',
    ...options,
    type: 'email',
  }
  const { value, onBlur, onChange, onInput } = updatedOptions

  return InputContainer({
    ...options,
    input: input.email(
      CommonInputAttributes(updatedOptions),
      attr.value(value),
      attr.class('bc-input'),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null ? on.change(emitValue(onChange)) : Empty,
      onInput != null ? on.input(emitValue(onInput)) : Empty
    ),
  })
}

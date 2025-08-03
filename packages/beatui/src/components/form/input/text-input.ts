import { attr, emitValue, Empty, input, on, WithElement } from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'

export const TextInput = (options: InputOptions<string>) => {
  const { value, onBlur, onChange, onInput } = options

  return InputContainer({
    ...options,
    input: input.text(
      CommonInputAttributes(options),
      attr.value(value),
      attr.class('bc-input'),
      // Add accessibility attributes from parent wrapper
      WithElement(el => {
        const wrapper = el.closest('[data-describedby]')
        if (wrapper) {
          const describedBy = wrapper.getAttribute('data-describedby')
          const required = wrapper.getAttribute('data-required')
          const invalid = wrapper.getAttribute('data-invalid')

          if (describedBy) {
            el.setAttribute('aria-describedby', describedBy)
          }
          if (required === 'true') {
            el.setAttribute('aria-required', 'true')
          }
          if (invalid === 'true') {
            el.setAttribute('aria-invalid', 'true')
          }
        }
      }),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null ? on.change(emitValue(onChange)) : Empty,
      onInput != null ? on.input(emitValue(onInput)) : Empty
    ),
  })
}

import {
  attr,
  emitValue,
  Empty,
  html,
  on,
  Value,
  WithElement,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Merge } from '@tempots/std'

export type TextAreaOptions = Merge<
  InputOptions<string>,
  {
    rows?: Value<number>
  }
>

export const TextArea = (options: TextAreaOptions) => {
  const { value, onBlur, onChange, onInput, rows } = options

  return InputContainer({
    ...options,
    input: html.textarea(
      CommonInputAttributes(options),
      attr.rows(rows ?? 10),
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

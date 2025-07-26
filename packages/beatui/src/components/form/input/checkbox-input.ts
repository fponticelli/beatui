import {
  attr,
  emitChecked,
  emitValue,
  Empty,
  html,
  input,
  on,
  WithElement,
  aria,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { MutedLabel } from '../../typography/label'

export const CheckboxInput = (options: InputOptions<boolean>) => {
  const { value, onBlur, onChange, placeholder, id } = options

  // Generate unique IDs for accessibility
  const checkboxId =
    id ?? `checkbox-${Math.random().toString(36).substring(2, 11)}`
  const labelId = `${checkboxId}-label`

  return InputContainer({
    growInput: false,
    ...options,
    input: html.span(
      attr.class('bc-checkbox-input'),
      input.checkbox(
        CommonInputAttributes(options),
        attr.checked(value),
        attr.class('bc-checkbox-input__checkbox'),
        attr.id(checkboxId),
        placeholder != null ? aria.labelledby(labelId) : Empty,
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
        onChange != null ? on.change(emitChecked(onChange)) : Empty
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
  })
}

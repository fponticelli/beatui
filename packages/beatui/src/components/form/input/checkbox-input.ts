import {
  attr,
  emitChecked,
  emitValue,
  Empty,
  html,
  input,
  on,
  Use,
  computedOf,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { MutedLabel } from '../../typography/label'
import { Theme } from '../../theme'

export const CheckboxInput = (options: InputOptions<boolean>) => {
  const { value, onBlur, onChange, placeholder, disabled } = options

  return Use(Theme, theme => {
    return InputContainer({
      growInput: false,
      ...options,
      input: html.span(
        attr.class(
          computedOf(
            theme,
            disabled ?? false
          )(({ theme }, disabled) =>
            theme.checkboxInput({
              disabled,
            })
          )
        ),
        input.checkbox(
          CommonInputAttributes(options),
          attr.checked(value),
          attr.class('bc-checkbox-input__checkbox'),
          onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
          onChange != null ? on.change(emitChecked(onChange)) : Empty
        ),
        placeholder != null
          ? html.span(
              attr.class('bc-checkbox-input__label'),
              MutedLabel(placeholder)
            )
          : Empty
      ),
    })
  })
}

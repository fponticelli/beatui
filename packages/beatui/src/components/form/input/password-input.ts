import {
  aria,
  attr,
  emitValue,
  Empty,
  Fragment,
  html,
  computedOf,
  prop,
  on,
  When,
} from '@tempots/dom'

import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Icon } from '../../data/icon'

export const PasswordInput = (options: InputOptions<string>) => {
  const {
    value,
    onBlur,
    onChange,
    onInput,
    before,
    after,
    hasError,
    disabled,
    autocomplete,
    placeholder,
    ...rest
  } = options
  const updatedOptions = {
    name: 'password',
    ...rest,
  }
  const hidePassword = prop(true)
  const autocompleteValue = computedOf(
    hidePassword,
    autocomplete
  )((hp, ac) => (hp ? (ac ?? 'current-password') : 'off'))
  const placeholderValue = computedOf(
    hidePassword,
    placeholder
    // TODO translation
  )((hp, ph) => (hp ? '•••••••••••••••' : (ph ?? 'secret password')))
  return InputContainer({
    before: before,
    disabled: disabled,
    hasError: hasError,
    input: html.input(
      CommonInputAttributes({
        ...updatedOptions,
        autocomplete: autocompleteValue,
        placeholder: placeholderValue,
      }),
      When(
        hidePassword,
        () => Fragment(attr.type('password')),
        () => Fragment(attr.type('text'))
      ),
      attr.class('bc-input'),
      attr.value(value),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null ? on.change(emitValue(onChange)) : Empty,
      onInput != null ? on.input(emitValue(onInput)) : Empty
    ),
    after:
      after ??
      html.button(
        attr.class('bc-input-container__password-toggle'),
        // TODO translation
        aria.label('Toggle password visibility'),
        on.click(() => hidePassword.update(v => !v)),
        When(
          hidePassword,
          () => Icon({ icon: 'line-md--eye' }),
          () => Icon({ icon: 'line-md--eye-off' })
        )
      ),
  })
}

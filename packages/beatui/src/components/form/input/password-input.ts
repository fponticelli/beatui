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
  Use,
} from '@tempots/dom'

import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Icon } from '../../data/icon'
import { BeatUII18n } from '@/beatui-i18n'

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
    disabled,
    ...rest,
  }
  const hidePassword = prop(true)
  const autocompleteValue = computedOf(
    hidePassword,
    autocomplete
  )((hp, ac) => (hp ? (ac ?? 'current-password') : 'off'))
  return Use(BeatUII18n, t => {
    const placeholderText = computedOf(
      t.$.passwordPlaceholderText,
      hidePassword,
      placeholder
    )((t, hp, ph) => (hp ? '•••••••••••••••' : (ph ?? t)))
    const toggle = html.button(
      attr.class('bc-input-container__password-toggle'),
      aria.label(t.$.togglePasswordVisibility),
      on.click(() => hidePassword.update(v => !v)),
      When(
        hidePassword,
        () => Icon({ icon: 'line-md:watch' }),
        () => Icon({ icon: 'line-md:watch-off' })
      )
    )
    return InputContainer({
      before: before,
      disabled: disabled,
      hasError: hasError,
      input: html.input(
        CommonInputAttributes({
          ...updatedOptions,
          autocomplete: autocompleteValue,
          placeholder: placeholderText,
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
      after: after != null ? Fragment(toggle, after) : toggle,
    })
  })
}

import { CommonInputAttributes, InputOptions } from './input-options'
import { coalesce, Empty, Use } from '@tempots/dom'
import { emitValue, on } from '@tempots/dom'
import { input } from '@tempots/dom'
import { attr } from '@tempots/dom'
import { InputContainer } from './input-container'
import { BeatUII18n } from '@/beatui-i18n'

export const EmailInput = (options: InputOptions<string>) => {
  const updatedOptions = {
    name: 'email',
    autocomplete: 'email',
    ...options,
    type: 'email',
  }
  const { value, onBlur, onChange, onInput, placeholder } = updatedOptions

  return Use(BeatUII18n, t =>
    InputContainer({
      ...options,
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

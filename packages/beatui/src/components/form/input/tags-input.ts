import {
  attr,
  emitValue,
  Empty,
  ForEach,
  Fragment,
  input,
  prop,
  on,
  Value,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Tag } from '../../data/tag'
import { Icon } from '@/components/data'

export const TagsInput = (options: InputOptions<string[]>) => {
  const { value, onChange, onBlur, before } = options
  const currentValue = prop('')

  const removeOne = (v: string) => {
    onChange?.(Value.get(value).filter(c => c !== v))
  }

  const addOne = () => {
    const v = currentValue.value.trim()
    const values = Value.get(value)
    if (v === '' || values.includes(v)) return
    currentValue.set('')
    onChange?.([...values, v])
  }

  return InputContainer({
    ...options,
    before: Fragment(
      before,
      Icon({
        icon: 'tabler:tag',
        color: 'neutral',
      })
    ),
    input: Fragment(
      attr.class('bc-input-container__tags'),
      ForEach(value, v =>
        Tag({
          value: v,
          onClose: () => removeOne(v.value),
          disabled: options.disabled,
        })
      ),
      input.text(
        CommonInputAttributes(options),
        attr.value(currentValue),
        attr.class('bc-input bc-input-container__tags-input'),
        on.input(emitValue(currentValue.set)),
        onChange != null ? on.change(addOne) : Empty,
        onBlur != null ? on.blur(onBlur) : Empty
      )
    ),
  })
}

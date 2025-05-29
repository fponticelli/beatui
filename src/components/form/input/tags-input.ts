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

export const TagsInput = (options: InputOptions<string[]>) => {
  const { value, onChange, onBlur } = options
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
    input: Fragment(
      attr.class('flex flex-row flex-wrap gap-2'),
      ForEach(value, v => Tag({ value: v, onClose: () => removeOne(v.value) })),
      input.text(
        CommonInputAttributes(options),
        attr.value(currentValue),
        attr.class('focus:outline-none bg-transparent'),
        attr.class('w-min'),
        on.input(emitValue(currentValue.set)),
        onChange != null ? on.change(addOne) : Empty,
        onBlur != null ? on.blur(onBlur) : Empty
      )
    ),
  })
}

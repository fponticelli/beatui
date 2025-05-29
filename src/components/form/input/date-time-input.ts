import { attr, emitValue, Empty, input, on, Value } from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'

const localDateToString = (date: Date) => {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  const h = date.getHours().toString().padStart(2, '0')
  const min = date.getMinutes().toString().padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}`
}

export const DateTimeInput = (options: InputOptions<Date>) => {
  const { value, onBlur, onChange } = options

  return InputContainer({
    ...options,
    input: input['datetime-local'](
      CommonInputAttributes(options),
      attr.value(Value.map(value, localDateToString)),
      attr.class('focus:outline-none bg-transparent'),
      attr.class('w-full'),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null
        ? on.change(emitValue(v => onChange(new Date(v))))
        : Empty
    ),
  })
}

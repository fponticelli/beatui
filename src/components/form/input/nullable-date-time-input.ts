import {
  attr,
  emitValue,
  emitValueAsNullableDateTime,
  Empty,
  input,
  on,
  Value,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'

const dateToString = (v: Date) => {
  const year = v.getFullYear()
  const month = v.getMonth() + 1
  const day = v.getDate()
  const hours = v.getHours()
  const minutes = v.getMinutes()
  const seconds = v.getSeconds()
  const converted = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  return converted
}

export const NullableDateTimeInput = (options: InputOptions<Date | null>) => {
  const { value, onBlur, onChange } = options
  const date = Value.map(value, v => (v != null ? dateToString(v) : null))
  return InputContainer({
    ...options,
    input: input['datetime-local'](
      CommonInputAttributes(options),
      attr.value(Value.map(date, v => v ?? null)),
      attr.class('focus:outline-none bg-transparent'),
      attr.class('w-full'),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null
        ? on.change(emitValueAsNullableDateTime(onChange))
        : Empty
    ),
  })
}

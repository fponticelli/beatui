import { NullableDateInput } from '../input/nullable-date-input'
import { createMappedControl } from './control-factory'
import { nullableStringToDate, nullableDateToISO } from './date-utils'

export const NullableStringDateControl = createMappedControl(
  NullableDateInput,
  nullableStringToDate,
  nullableDateToISO
)

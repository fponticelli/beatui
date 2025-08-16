import { NullableDateInput } from '../input/nullable-date-input'
import { createMappedControl } from './control-factory'
import { nullableStringToDate, nullableDateToISODate } from './date-utils'

export const NullableStringDateControl = createMappedControl(
  NullableDateInput,
  nullableStringToDate,
  nullableDateToISODate
)

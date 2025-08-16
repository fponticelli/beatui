import { NullableDateTimeInput } from '../input/nullable-date-time-input'
import { createMappedControl } from './control-factory'
import { nullableStringToDate, nullableDateToISOString } from './date-utils'

export const NullableStringDateTimeControl = createMappedControl(
  NullableDateTimeInput,
  nullableStringToDate,
  nullableDateToISOString
)

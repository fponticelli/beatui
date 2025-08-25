import { DateTimeInput } from '../input/date-time-input'
import { createMappedControl } from './control-factory'
import { stringToDate, dateTimeToISO } from './date-utils'

export const StringDateTimeControl = createMappedControl(
  DateTimeInput,
  stringToDate,
  dateTimeToISO
)

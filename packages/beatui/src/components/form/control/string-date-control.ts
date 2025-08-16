import { DateInput } from '../input/date-input'
import { createMappedControl } from './control-factory'
import { stringToDate, dateToISOString } from './date-utils'

export const StringDateControl = createMappedControl(
  DateInput,
  stringToDate,
  dateToISOString
)

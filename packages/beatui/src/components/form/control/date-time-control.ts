import { DateTimeInput } from '../input/date-time-input'
import { ControlOptions } from './control-options'
import { createControl } from './control-factory'

export type DateTimeControlOptions = ControlOptions<Date>

export const DateTimeControl = createControl(DateTimeInput)

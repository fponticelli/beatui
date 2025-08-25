import { DateInput } from '../input/date-input'
import { ControlOptions } from './control-options'
import { createControl } from './control-factory'

export type DateControlOptions = ControlOptions<Date>

export const DateControl = createControl(DateInput)

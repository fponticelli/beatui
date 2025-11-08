import { PlainDateTime } from '@/temporal'
import { createTemporalInput } from './create-temporal-input'

export const PlainDateTimeInput = createTemporalInput<PlainDateTime>({
  inputType: 'datetime-local',
  valueToString: v => v.toJSON(),
  parseValue: (T, v) => T.PlainDateTime.from(v),
})

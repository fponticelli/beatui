import { PlainTime } from '../../../temporal'
import { createTemporalInput } from './create-temporal-input'

export const PlainTimeInput = createTemporalInput<PlainTime>({
  inputType: 'time',
  valueToString: v => v.toString(),
  parseValue: (T, v) => T.PlainTime.from(v),
})

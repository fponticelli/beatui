import { Temporal } from '@js-temporal/polyfill'
export type BeatUITemporal = typeof Temporal
export type Duration = InstanceType<BeatUITemporal['Duration']>
export type Instant = InstanceType<BeatUITemporal['Instant']>
export type PlainDate = InstanceType<BeatUITemporal['PlainDate']>
export type PlainDateTime = InstanceType<BeatUITemporal['PlainDateTime']>
export type PlainMonthDay = InstanceType<BeatUITemporal['PlainMonthDay']>
export type PlainTime = InstanceType<BeatUITemporal['PlainTime']>
export type PlainYearMonth = InstanceType<BeatUITemporal['PlainYearMonth']>
export type ZonedDateTime = InstanceType<BeatUITemporal['ZonedDateTime']>

import { attr, html } from '@tempots/dom'
import { Stack, WithTemporal } from '@tempots/beatui'

export default function TemporalPage() {
  return Stack(
    attr.class('bu-p-4 bu-gap-4'),
    WithTemporal(Temporal => {
      const date = Temporal.Now
      return Stack(
        html.p(`Today: ${date.instant().toString()}`),
        html.p(`Now: ${date.zonedDateTimeISO().toString()}`),
        html.p(`Plain date: ${date.plainDateISO().toString()}`),
        html.p(`Plain time: ${date.plainTimeISO().toString()}`)
      )
    })
  )
}

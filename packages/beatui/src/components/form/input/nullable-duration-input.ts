import { attr, Empty, Fragment, Value, input, on } from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { WithTemporal } from '@/temporal/with-temporal'
import { MaskInput } from './mask-input'
import { durationMaskConfig } from './duration-mask'
import { NullableResetAfter } from './nullable-utils'
import { ensureTemporal } from '@/temporal/runtime'
import type { BeatUITemporal, Duration } from '@/temporal/types'

const tryParseDuration = (
  temporal: BeatUITemporal | undefined,
  value: string
): Duration | null => {
  if (temporal == null) return null
  try {
    return temporal.Duration.from(value) as Duration
  } catch {
    return null
  }
}

export const NullableDurationInput = (
  options: InputOptions<Duration | null>
) => {
  const { value, onChange, after, disabled, onBlur } = options

  const makeAfter = () => {
    const reset = NullableResetAfter(value, disabled, onChange)
    return after != null ? Fragment(reset, after) : reset
  }

  const placeholderAttr =
    options.placeholder != null ? Empty : attr.placeholder('P0DT0H0M0S')

  const pending = () =>
    InputContainer({
      ...options,
      input: input.text(
        CommonInputAttributes(options),
        attr.value(Value.map(value, v => v?.toString() ?? '')),
        attr.class('bc-input'),
        placeholderAttr,
        onBlur != null ? on.blur(() => onBlur()) : Empty,
        onChange != null
          ? on.change(event => {
              const target = event.currentTarget as HTMLInputElement | null
              const next = target?.value ?? ''
              if (next === '') {
                onChange(null)
                return
              }
              const existing = (
                globalThis as {
                  Temporal?: BeatUITemporal
                }
              ).Temporal
              const parsed = tryParseDuration(existing, next)
              if (parsed != null) {
                onChange(parsed)
                return
              }
              ensureTemporal()
                .then(temporal => {
                  const resolved = tryParseDuration(temporal, next)
                  if (resolved != null) onChange(resolved)
                })
                .catch(() => {
                  /* swallow parse errors until mask is available */
                })
            })
          : Empty
      ),
      after: makeAfter(),
    })

  return WithTemporal(
    temporal =>
      MaskInput({
        ...options,
        value: Value.map(value, v => v?.toString() ?? ''),
        onChange: onChange
          ? (v: string) => onChange(v === '' ? null : temporal.Duration.from(v))
          : undefined,
        onInput: undefined,
        ...durationMaskConfig(temporal.Duration.from),
        placeholder: 'P0DT0H0M0S',
        after: makeAfter(),
      }),
    { pending }
  )
}

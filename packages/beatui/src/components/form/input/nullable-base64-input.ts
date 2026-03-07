import { Fragment, Value } from '@tempots/dom'
import { Base64Input, type Base64InputOptions } from './base64-input'
import { NullableResetAfter } from './nullable-utils'
import { mapInputOptions } from './input-options'

/**
 * Options for the {@link NullableBase64Input} component.
 * Extends `Base64InputOptions` but accepts `string | null` for value and callbacks.
 */
export type NullableBase64InputOptions = Omit<
  Base64InputOptions,
  'value' | 'onChange' | 'onInput'
> & {
  /** The current base64 value, which may be `null` (no file) or a base64-encoded string. */
  value: Value<string | null>
  /** Callback invoked on change with `null` (if cleared) or the base64 string. */
  onChange?: (value: string | null) => void
  /** Callback invoked on input with `null` (if cleared) or the base64 string. */
  onInput?: (value: string | null) => void
}

/**
 * A nullable variant of {@link Base64Input} that maps between `string | null` and `string | undefined`.
 *
 * When no file is selected, the value is `null`. Includes a reset button to
 * clear the value back to `null`. Wraps `Base64Input` with null-handling logic.
 *
 * @param options - Configuration options for the nullable base64 input.
 * @returns A renderable nullable base64 input component.
 *
 * @example
 * ```ts
 * NullableBase64Input({
 *   value: prop<string | null>(null),
 *   accept: 'image/*',
 *   onChange: v => console.log('Base64:', v), // null or string
 * })
 * ```
 */
export const NullableBase64Input = (options: NullableBase64InputOptions) => {
  const { after, disabled } = options
  const mapped = mapInputOptions<string | null, string | undefined>(
    options,
    v => v ?? undefined,
    v => v ?? null
  )

  const resetAfter = NullableResetAfter(
    options.value,
    disabled,
    options.onChange ?? options.onInput
  )

  return Base64Input({
    ...mapped,
    after: after != null ? Fragment(resetAfter, after) : resetAfter,
  })
}

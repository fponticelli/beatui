import { Value } from '@tempots/dom'
import { Merge } from '@tempots/std'
import { TextArea, TextAreaOptions } from './text-area'
import { createNullableStringInput } from './create-nullable-string-input'

/**
 * Options for the {@link NullableTextArea} component.
 * Extends `TextAreaOptions` but accepts `null | string` for value and callbacks.
 */
export type NullableTextAreaOptions = Merge<
  Omit<TextAreaOptions, 'value' | 'onChange' | 'onInput'>,
  {
    /** The current value, which may be `null` (empty/unset) or a `string`. */
    value: Value<null | string>
    /** Callback invoked on change with `null` (if emptied) or the new string value. */
    onChange?: (value: null | string) => void
    /** Callback invoked on input with `null` (if emptied) or the new string value. */
    onInput?: (value: null | string) => void
  }
>

/**
 * A nullable variant of {@link TextArea} that maps between `string | null` and `string`.
 *
 * Empty strings are converted to `null` on change, and `null` values are displayed
 * as empty strings. Includes a reset button to clear the value back to `null`.
 * Preserves all `TextAreaOptions` like `rows`, `cols`, and `autoResize`.
 *
 * @param options - Nullable text area options.
 * @returns A renderable nullable text area component.
 *
 * @example
 * ```ts
 * NullableTextArea({
 *   value: prop<string | null>(null),
 *   rows: 4,
 *   placeholder: 'Enter text or leave empty...',
 *   onChange: v => console.log('Value:', v), // null or string
 * })
 * ```
 */
export const NullableTextArea = createNullableStringInput(
  TextArea
) as unknown as (
  options: NullableTextAreaOptions
) => ReturnType<typeof TextArea>

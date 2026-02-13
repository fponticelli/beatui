import {
  attr,
  computedOf,
  emitValue,
  Empty,
  html,
  on,
  Value,
} from '@tempots/dom'
import {
  generateInputContainerInputClasses,
  InputContainer,
} from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Merge } from '@tempots/std'
import { ControlSize } from '../../theme'

/**
 * Configuration options for the {@link TextArea} component.
 *
 * Extends {@link InputOptions} for string values with an additional `rows` property
 * to control the visible height of the textarea.
 */
export type TextAreaOptions = Merge<
  InputOptions<string>,
  {
    /** Number of visible text rows. @default 3 */
    rows?: Value<number>
  }
>

/**
 * A multi-line text input component wrapping a native `<textarea>` element.
 *
 * Renders a styled textarea inside an {@link InputContainer} with support for
 * reactive values, configurable row count, placeholder text, disabled state, and
 * all standard {@link InputOptions} properties. The container uses `baseContainer`
 * mode for proper textarea sizing.
 *
 * @param options - Configuration options for the textarea
 * @returns A styled textarea element wrapped in an InputContainer
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { TextArea } from '@tempots/beatui'
 *
 * const bio = prop('')
 * TextArea({
 *   value: bio,
 *   onChange: bio.set,
 *   placeholder: 'Tell us about yourself...',
 *   rows: 5,
 *   size: 'md',
 * })
 * ```
 *
 * @example
 * ```ts
 * // Minimal usage with default 3 rows
 * TextArea({
 *   value: prop(''),
 *   onInput: (v) => console.log('Typing:', v),
 * })
 * ```
 */
export const TextArea = (options: TextAreaOptions) => {
  const { value, onBlur, onChange, onInput, rows } = options

  return InputContainer({
    baseContainer: true,
    ...options,
    input: html.textarea(
      attr.class(
        computedOf(options.size ?? 'md')(size =>
          generateInputContainerInputClasses(
            false,
            (size ?? 'md') as ControlSize
          )
        )
      ),
      CommonInputAttributes(options),
      attr.rows(rows ?? 3),
      attr.value(value),
      attr.class('bc-input'),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null ? on.change(emitValue(onChange)) : Empty,
      onInput != null ? on.input(emitValue(onInput)) : Empty
    ),
  })
}

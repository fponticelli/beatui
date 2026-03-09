import {
  attr,
  emitValue,
  Empty,
  html,
  input,
  on,
  Renderable,
  Value,
} from '@tempots/dom'
import { CommonInputAttributes, InputOptions } from './input-options'
import { InputContainer } from './input-container'

/**
 * Configuration options for the {@link ColorInput} component.
 *
 * Extends {@link InputOptions} for string color values with an optional size
 * property for the color swatch preview.
 */
export type ColorInputOptions = Omit<InputOptions<string>, 'value'> & {
  /** The current color value as a CSS color string. @default '#000000' */
  value?: Value<string>
  /** Size in pixels of the color swatch preview (square). @default 32 */
  swatchSize?: Value<number>
}

/**
 * Internal color swatch preview component that renders a clickable color square
 * overlaying a hidden native color picker input. Clicking the swatch opens the
 * browser's native color picker dialog.
 *
 * @param props - The swatch properties
 * @param props.value - The current color value as a CSS color string
 * @param props.onChange - Callback for committed color changes
 * @param props.onInput - Callback for real-time color changes while picking
 * @returns A colored square element with embedded native color input
 */
function Swatch({
  value,
  onChange,
  onInput,
}: {
  value: Value<string>
  onChange?: (value: string) => void
  onInput?: (value: string) => void
}) {
  return html.div(
    attr.class('bc-color-input__swatch-container'),
    html.span(
      attr.class('bc-color-input__swatch'),
      input.color(
        attr.class('bc-color-input__swatch-native'),
        attr.value(value),
        onChange != null ? on.change(emitValue(onChange)) : Empty,
        onInput != null ? on.input(emitValue(onInput)) : Empty
      ),
      attr.style(Value.map(value, v => `background-color: ${v}`))
    )
  )
}

/**
 * A color input component combining a text field with a clickable color swatch preview.
 *
 * Renders a styled text input for typing color values alongside a {@link Swatch} component
 * that displays the current color and opens the browser's native color picker on click.
 * The text input and swatch stay synchronized through the shared `value` signal. Accepts
 * any valid CSS color string.
 *
 * @param options - Configuration options for the color input
 * @returns A styled color input element with swatch preview, wrapped in an InputContainer
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { ColorInput } from '@tempots/beatui'
 *
 * const color = prop('#ff6600')
 * ColorInput({
 *   value: color,
 *   onChange: color.set,
 *   placeholder: '#rrggbb',
 * })
 * ```
 *
 * @example
 * ```ts
 * // With before icon and error state
 * ColorInput({
 *   value: prop('#000000'),
 *   onInput: (v) => console.log('Picking:', v),
 *   before: Icon({ icon: 'line-md:paint-drop' }),
 *   hasError: prop(false),
 * })
 * ```
 */
export function ColorInput(options: ColorInputOptions): Renderable {
  const {
    value = '#000000',
    onBlur,
    onChange,
    onInput,
    swatchSize: _swatchSize,
    ...containerOptions
  } = options
  return InputContainer(
    {
      ...containerOptions,
      input: input.text(
        CommonInputAttributes(options),
        attr.value(value),
        onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
        onChange != null ? on.change(emitValue(onChange)) : Empty,
        onInput != null ? on.input(emitValue(onInput)) : Empty
      ),
    },
    attr.class('bc-color-input'),
    Swatch({ value, onChange: options.onChange, onInput: options.onInput })
  )
}

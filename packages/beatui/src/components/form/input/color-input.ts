import {
  attr,
  emitValue,
  Empty,
  html,
  input,
  on,
  Renderable,
  style,
  Value,
  WithElement,
} from '@tempots/dom'
import { CommonInputAttributes, InputOptions } from './input-options'
import { InputContainer } from './input-container'

export type ColorInputOptions = InputOptions<string> & {
  // Size in pixels of the blob preview (square). Defaults to 32
  size?: Value<number>
}

function Swatch({
  value,
  onChange,
  onInput,
}: {
  value: Value<string>
  onChange?: (value: string) => void
  onInput?: (value: string) => void
}) {
  let inputEl: HTMLInputElement | null = null
  return html.span(
    attr.class('bc-color-input__swatch'),
    on.click(() => inputEl?.showPicker()),
    input.color(
      WithElement(el => {
        inputEl = el as HTMLInputElement
        return Empty
      }),
      attr.value(value),
      style.width('4px'),
      style.height('4px'),
      onChange != null ? on.change(emitValue(onChange)) : Empty,
      onInput != null ? on.input(emitValue(onInput)) : Empty
    ),
    attr.style(Value.map(value, v => `background-color: ${v}`))
  )
}

export function ColorInput(options: ColorInputOptions): Renderable {
  const { value, onBlur, onChange, onInput } = options
  return InputContainer(
    {
      ...options,
      input: input.text(
        CommonInputAttributes(options),
        attr.value(value),
        attr.class('bc-input'),
        onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
        onChange != null ? on.change(emitValue(onChange)) : Empty,
        onInput != null ? on.input(emitValue(onInput)) : Empty
      ),
    },
    Swatch({ value, onChange: options.onChange, onInput: options.onInput })
  )
}

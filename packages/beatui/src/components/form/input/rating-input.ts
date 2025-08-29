import {
  attr,
  html,
  on,
  Value,
  Repeat,
  ElementPosition,
  style,
  emit,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { InputOptions } from './input-options'
import { Icon } from '@/components/data'
import { ThemeColorName } from '@/tokens'

type RatingInputOptions = InputOptions<number> & {
  max?: Value<number>
  fullColor?: Value<ThemeColorName>
  emptyColor?: Value<ThemeColorName>
  fullIcon?: Value<string>
  emptyIcon?: Value<string>
  // Step size for rounding up the selected value (e.g., 0.25 -> quarter steps)
  rounding?: number
}

const DEFAULT_FULL_ICON = 'line-md:star-alt-filled'
const DEFAULT_EMPTY_ICON = 'line-md:star-alt'

export const RatingInput = (options: RatingInputOptions) => {
  const {
    value,
    onChange,
    disabled,
    max = 5,
    fullColor = 'yellow',
    emptyColor = 'neutral',
    fullIcon = DEFAULT_FULL_ICON,
    emptyIcon = DEFAULT_EMPTY_ICON,
    onBlur: _onBlur,
    rounding = 1,
  } = options

  const handleClick = (event: MouseEvent, counter: number) => {
    if (Value.get(disabled ?? false)) return
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const fraction = (event.clientX - rect.left) / rect.width
    const newValue = counter - 1 + fraction
    const step = rounding > 0 ? rounding : 1
    const rounded = Math.ceil(newValue / step) * step
    const clamped = Math.min(Math.max(rounded, 0), Value.get(max))
    onChange?.(clamped)
  }

  const RenderIcon = ({ index, counter }: ElementPosition) => {
    return html.span(
      attr.class('bc-rating-input__icon-container'),
      Icon(
        { icon: emptyIcon },
        attr.class('bc-rating-input__icon-empty'),
        attr.class(Value.map(emptyColor, c => `bu-fg-soft-${c}`))
      ),
      html.span(
        attr.class('bc-rating-input__icon-clipper'),
        attr.class(Value.map(fullColor, c => `bu-fg-soft-${c}`)),
        style.width(
          Value.map(value, v => {
            const rounded = Math.floor(v)
            if (rounded > index) return '100%'
            if (rounded < index) return '0%'
            return `${(v - index) * 100}%`
          })
        ),
        Icon({ icon: fullIcon }, attr.class('bc-rating-input__icon-full'))
      ),
      on.click(
        emit(e => handleClick(e as MouseEvent, counter), {
          preventDefault: true,
          stopPropagation: true,
        })
      )
    )
  }

  return InputContainer({
    baseContainer: true,
    growInput: false,
    ...options,
    input: html.div(attr.class('bc-rating-input'), Repeat(max, RenderIcon)),
  })
}

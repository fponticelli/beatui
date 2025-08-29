import {
  attr,
  html,
  on,
  Value,
  aria,
  ForEach,
  Repeat,
  ElementPosition,
  When,
  style,
  emit,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { InputOptions } from './input-options'
import { Icon } from '@/components/data'
import { ThemeColorName } from '@/tokens'

type RatingInputOptions = InputOptions<number> & {
  max?: Value<number>
  fillColor?: Value<ThemeColorName>
  emptyColor?: Value<ThemeColorName>
  fullIcon?: Value<string>
  emptyIcon?: Value<string>
  roundingDigits?: number
}

const DEFAULT_FULL_ICON = 'line-md:star-alt-filled'
const DEFAULT_EMPTY_ICON = 'line-md:star-alt'

export const RatingInput = (options: RatingInputOptions) => {
  const {
    value,
    onChange,
    disabled,
    max = 5,
    fillColor = 'yellow',
    emptyColor = 'neutral',
    fullIcon = DEFAULT_FULL_ICON,
    emptyIcon = DEFAULT_EMPTY_ICON,
    onBlur,
    roundingDigits = 0,
  } = options

  const handleClick = (event: MouseEvent, counter: number) => {
    if (Value.get(disabled ?? false)) return
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const fraction = (event.clientX - rect.left) / rect.width
    const newValue = counter - 1 + fraction
    const rounded =
      Math.ceil(newValue * Math.pow(10, roundingDigits)) /
      Math.pow(10, roundingDigits)
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
        attr.class(Value.map(fillColor, c => `bu-fg-soft-${c}`)),
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
    // const i = position.index
    // const fillWidth = Value.map(value, v => {
    //   const fill = Math.max(0, Math.min(v - i, 1))
    //   return `width: ${fill * 100}%`
    // })

    // return html.span(
    //   attr.class('bc-rating-input__icon'),
    //   attr.tabindex(
    //     Value.map(disabled ?? false, d => (d ? -1 : 0)) as Value<number>
    //   ),
    //   aria.disabled(disabled),
    //   aria.checked(
    //     Value.map(value, v =>
    //       v >= i + 1 ? true : v > i ? 'mixed' : false
    //     ) as Value<boolean | 'mixed'>
    //   ),
    //   attr.role('radio'),
    //   on.click(e => handleClick(e, i + 1)),
    //   on.keydown(e => {
    //     if (e.key === 'Enter' || e.key === ' ') {
    //       e.preventDefault()
    //       handleClick(e as unknown as MouseEvent, i + 1)
    //     }
    //   }),
    //   onBlur != null ? on.blur(onBlur) : null,
    //   html.span(attr.class('bc-rating-input__icon-base')),
    //   html.span(
    //     attr.class('bc-rating-input__icon-fill'),
    //     attr.style(fillWidth),
    //     html.span(attr.class('bc-rating-input__icon-fill-inner'))
    //   )
    // )
  }

  return InputContainer({
    baseContainer: true,
    growInput: false,
    ...options,
    input: html.div(attr.class('bc-rating-input'), Repeat(max, RenderIcon)),
  })
}

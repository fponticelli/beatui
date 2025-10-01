import {
  aria,
  attr,
  html,
  on,
  Value,
  Repeat,
  ElementPosition,
  style,
  emit,
  computedOf,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Icon } from '@/components/data'
import { ThemeColorName } from '@/tokens'
import { ControlSize } from '../../theme/types'

type RatingInputOptions = InputOptions<number> & {
  max?: Value<number>
  fullColor?: Value<ThemeColorName>
  emptyColor?: Value<ThemeColorName>
  fullIcon?: Value<string>
  emptyIcon?: Value<string>
  size?: Value<ControlSize>
  // Step size for rounding for keyboard interactions (e.g., 0.25 -> quarter steps)
  rounding?: Value<number>
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
    size = 'md',
    onBlur,
    rounding = 1,
  } = options

  const getStep = () => {
    const r = Value.get(rounding)
    if (r > 0) {
      return r
    } else {
      return 1
    }
  }
  const clamp = (v: number) => Math.min(Math.max(v, 0), Value.get(max))

  const handleClick = (event: MouseEvent, counter: number) => {
    if (Value.get(disabled ?? false)) return
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const fraction = (event.clientX - rect.left) / rect.width
    const newValue = counter - 1 + fraction
    const step = getStep()
    const rounded = Math.ceil(newValue / step) * step
    const clamped = clamp(rounded)
    onChange?.(clamped)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (Value.get(disabled ?? false)) return
    const step = getStep()
    const current = Value.get(value) ?? 0
    let next: number | undefined

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = clamp(current + step)
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        next = clamp(current - step)
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = Value.get(max)
        break
      default:
        return
    }

    event.preventDefault()
    onChange?.(next)
  }

  const iconSize = Value.map(size, (s): string => `bc-icon--${s}`)

  const RenderIcon = ({ index, counter }: ElementPosition) => {
    return html.span(
      attr.class('bc-rating-input__icon-container'),
      attr.class(iconSize),
      Icon(
        { icon: emptyIcon, size, color: emptyColor, tone: 'soft' },
        attr.class('bc-rating-input__icon-empty')
      ),
      html.span(
        attr.class('bc-rating-input__icon-clipper'),
        attr.class(iconSize),
        style.width(
          Value.map(value, v => {
            const rounded = Math.floor(v)
            if (rounded > index) return '100%'
            if (rounded < index) return '0%'
            return `${(v - index) * 100}%`
          })
        ),
        Icon(
          { icon: fullIcon, size, color: fullColor, tone: 'soft' },
          attr.class('bc-rating-input__icon-full')
        )
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
    focusableSelector: '[role="slider"]',
    ...options,
    input: html.div(
      // Common input attributes (id, required, invalid, custom classes, etc.)
      CommonInputAttributes(options),
      attr.class('bc-rating-input'),
      // ARIA slider semantics
      attr.role('slider'),
      attr.tabindex(Value.map(disabled ?? false, (d): number => (d ? -1 : 0))),
      aria.disabled(disabled ?? false),
      aria.valuemin(0),
      aria.valuemax(Value.map(max, m => m ?? 0)),
      aria.valuenow(Value.map(value, v => v ?? 0)),
      aria.valuetext(
        computedOf(
          value,
          max
        )((current, maxValue) => {
          const currentValue = current ?? 0
          const maxResolved = maxValue ?? 0
          return `${String(currentValue)} / ${String(maxResolved)}`
        })
      ),
      // Keyboard & focus handlers
      on.keydown(handleKeyDown),
      onBlur != null ? on.blur(onBlur) : null,
      Repeat(max, RenderIcon)
    ),
  })
}

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
import { Icon } from '../../data'
import { ThemeColorName } from '../../../tokens'
import { ControlSize } from '../../theme/types'

/**
 * Configuration options for the {@link RatingInput} component.
 *
 * Extends {@link InputOptions} for numeric values with properties to control the
 * maximum rating, icon appearance, theme colors, and rounding precision.
 */
type RatingInputOptions = InputOptions<number> & {
  /** Maximum number of rating icons (stars). @default 5 */
  max?: Value<number>
  /** Theme color for filled (active) icons. @default 'yellow' */
  fullColor?: Value<ThemeColorName>
  /** Theme color for empty (inactive) icons. @default 'neutral' */
  emptyColor?: Value<ThemeColorName>
  /** Icon name for filled (active) rating icons. @default 'line-md:star-alt-filled' */
  fullIcon?: Value<string>
  /** Icon name for empty (inactive) rating icons. @default 'line-md:star-alt' */
  emptyIcon?: Value<string>
  /** Visual size of the rating icons. @default 'md' */
  size?: Value<ControlSize>
  /** Step size for rounding during keyboard interactions (e.g., 0.25 for quarter steps). @default 1 */
  rounding?: Value<number>
}

const DEFAULT_FULL_ICON = 'line-md:star-alt-filled'
const DEFAULT_EMPTY_ICON = 'line-md:star-alt'

/**
 * A star rating input component with fractional precision support and ARIA slider semantics.
 *
 * Renders a row of rating icons (stars by default) inside an {@link InputContainer} that
 * supports click-based fractional rating (the click position within each icon determines
 * the fractional value) and full keyboard navigation via arrow keys, Home, and End.
 * Each icon uses a CSS clip mask to show the precise fill level, enabling half-star or
 * quarter-star precision based on the `rounding` option.
 *
 * Uses ARIA `role="slider"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`,
 * and `aria-valuetext` for accessibility.
 *
 * @param options - Configuration options for the rating input
 * @returns A styled rating input element with interactive icons, wrapped in an InputContainer
 *
 * @example
 * ```ts
 * import { prop } from '@tempots/dom'
 * import { RatingInput } from '@tempots/beatui'
 *
 * const rating = prop(3.5)
 * RatingInput({
 *   value: rating,
 *   onChange: rating.set,
 *   max: 5,
 *   rounding: 0.5,
 * })
 * ```
 *
 * @example
 * ```ts
 * // Custom heart icons with quarter-step precision
 * RatingInput({
 *   value: prop(0),
 *   onChange: (v) => console.log('Rating:', v),
 *   max: 10,
 *   fullIcon: 'mdi:heart',
 *   emptyIcon: 'mdi:heart-outline',
 *   fullColor: 'red',
 *   rounding: 0.25,
 *   size: 'lg',
 * })
 * ```
 */
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
        {
          icon: emptyIcon,
          size,
          color: emptyColor as Value<ThemeColorName>,
          tone: 'soft',
        },
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
          {
            icon: fullIcon,
            size,
            color: fullColor as Value<ThemeColorName>,
            tone: 'soft',
          },
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

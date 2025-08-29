import { attr, html, on, Value, aria, ForEach } from '@tempots/dom'
import { InputContainer } from './input-container'
import { InputOptions } from './input-options'

type RatingInputOptions = InputOptions<number> & {
  max?: number
  fillColor?: string
  fullIcon?: string
  emptyIcon?: string
}

const DEFAULT_FULL_ICON = 'https://api.iconify.design/mdi/star.svg'
const DEFAULT_EMPTY_ICON = 'https://api.iconify.design/mdi/star-outline.svg'

export const RatingInput = (options: RatingInputOptions) => {
  const {
    value,
    onChange,
    disabled,
    max = 5,
    fillColor,
    fullIcon,
    emptyIcon,
    onBlur,
  } = options

  const handleClick = (event: MouseEvent, index: number) => {
    if (Value.get(disabled ?? false)) return
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const fraction = (event.clientX - rect.left) / rect.width
    const newValue = index - 1 + fraction
    onChange?.(Math.min(Math.max(newValue, 0), max))
  }

  const renderIcon = (_: unknown, position: { index: number }) => {
    const i = position.index
    const fillWidth = Value.map(value, v => {
      const fill = Math.max(0, Math.min(v - i, 1))
      return `width: ${fill * 100}%`
    })

    return html.span(
      attr.class('bc-rating-input__icon'),
      attr.tabindex(
        Value.map(disabled ?? false, d => (d ? -1 : 0)) as Value<number>
      ),
      aria.disabled(disabled),
      aria.checked(
        Value.map(value, v =>
          v >= i + 1 ? true : v > i ? 'mixed' : false
        ) as Value<boolean | 'mixed'>
      ),
      attr.role('radio'),
      on.click(e => handleClick(e, i + 1)),
      on.keydown(e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick(e as unknown as MouseEvent, i + 1)
        }
      }),
      onBlur != null ? on.blur(onBlur) : null,
      html.span(attr.class('bc-rating-input__icon-base')),
      html.span(
        attr.class('bc-rating-input__icon-fill'),
        attr.style(fillWidth),
        html.span(attr.class('bc-rating-input__icon-fill-inner'))
      )
    )
  }

  const styleString =
    `--rating-fill-color: ${fillColor ?? 'var(--color-warning-500)'}; ` +
    `--rating-icon-full: url("${fullIcon ?? DEFAULT_FULL_ICON}"); ` +
    `--rating-icon-empty: url("${emptyIcon ?? DEFAULT_EMPTY_ICON}");`

  return InputContainer({
    baseContainer: true,
    growInput: false,
    ...options,
    input: html.div(
      attr.class('bc-rating-input'),
      attr.style(styleString),
      ForEach(Array.from({ length: max }), renderIcon)
    ),
  })
}

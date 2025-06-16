import { attr, Empty, html, on, Value, computedOf } from '@tempots/dom'
import { ThemeColorName } from '@/tokens'

function generateTagClasses(disabled: boolean, color: string): string {
  const classes = ['bc-tag']

  if (disabled) {
    classes.push('bc-tag--disabled')
  } else {
    classes.push(`bc-tag--${color}`)
  }

  return classes.join(' ')
}

export const Tag = ({
  disabled,
  value,
  color = 'base',
  onClose,
}: {
  value: Value<string>
  disabled?: Value<boolean>
  color?: Value<ThemeColorName>
  onClose?: (value: string) => void
}) => {
  const isDisabled = Value.map(disabled ?? false, d => d)
  const tagColor = Value.map(color ?? 'base', c => c)

  return html.span(
    attr.class(
      computedOf(
        isDisabled,
        tagColor
      )((disabled, color) =>
        generateTagClasses(disabled ?? false, color ?? 'base')
      )
    ),
    html.span(attr.class('bc-tag__text'), value),
    onClose != null
      ? html.button(
          attr.disabled(disabled),
          attr.class('bc-tag__close'),
          html.span('×'),
          on.click(() => onClose?.(Value.get(value)))
        )
      : Empty
  )
}

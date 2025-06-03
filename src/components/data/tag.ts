import { attr, Empty, html, on, Value, Use, computedOf } from '@tempots/dom'
import { Theme } from '../theme'
import { ThemeColorName } from '@/tokens'

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

  return Use(Theme, theme => {
    return html.span(
      attr.class(
        computedOf(
          theme,
          isDisabled,
          tagColor
        )(({ theme }, disabled, color) =>
          theme.tag({
            disabled,
            color,
          })
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
  })
}

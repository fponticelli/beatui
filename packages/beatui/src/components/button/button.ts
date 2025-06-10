import { attr, computedOf, html, on, TNode, Use, Value } from '@tempots/dom'
import { ControlSize, ButtonVariant, Theme } from '../theme'
import { ThemeColorName } from '@/tokens'
import { RadiusName } from '@/tokens/radius'

export interface ButtonOptions {
  type?: Value<'submit' | 'reset' | 'button'>
  disabled?: Value<boolean>
  variant?: Value<ButtonVariant>
  size?: Value<ControlSize>
  color?: Value<ThemeColorName>
  roundedness?: Value<RadiusName>
  onClick?: () => void
}

export function Button(
  {
    type = 'button',
    disabled,
    variant = 'filled',
    size = 'md',
    color = 'base',
    roundedness = 'sm',
    onClick = () => {},
  }: ButtonOptions,
  ...children: TNode[]
) {
  return Use(Theme, theme => {
    return html.button(
      attr.type(type as Value<string>),
      attr.disabled(disabled),
      attr.class(
        computedOf(
          theme,
          variant ?? 'primary',
          size ?? 'md',
          color,
          roundedness,
          disabled
        )(({ theme }, variant, size, color, roundedness, disabled) =>
          theme.button({
            variant,
            size,
            color,
            roundedness,
            disabled,
          })
        )
      ),
      on.click(onClick),
      ...children
    )
  })
}

import { attr, computedOf, html, on, TNode, Use, Value } from '@tempots/dom'
import {
  ButtonSize,
  ButtonVariant,
  Roundedness,
  ThemedColor,
  ThemeProvider,
} from '../theme'

export interface ButtonOptions {
  type?: Value<'submit' | 'reset' | 'button'>
  disabled?: Value<boolean>
  variant?: Value<ButtonVariant>
  color?: Value<ThemedColor>
  size?: Value<ButtonSize>
  roundedness?: Value<Roundedness>
  onClick?: () => void
}

export function Button(
  {
    type = 'button',
    disabled,
    variant = 'filled',
    size = 'medium',
    color,
    roundedness = 'medium',
    onClick = () => {},
  }: ButtonOptions,
  ...children: TNode[]
) {
  return Use(ThemeProvider, theme => {
    return html.button(
      attr.type(type as Value<string>),
      attr.disabled(disabled),
      attr.class(
        computedOf(
          theme,
          disabled ?? false,
          variant ?? 'primary',
          size ?? 'medium',
          color,
          roundedness ?? 'medium'
        )(
          (
            { theme: { button } },
            disabled,
            variant,
            size,
            color,
            roundedness
          ) =>
            button({
              disabled,
              variant,
              size,
              color,
              roundedness,
            })
        )
      ),
      on.click(onClick),
      ...children
    )
  })
}

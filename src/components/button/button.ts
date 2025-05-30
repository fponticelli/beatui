import { attr, computedOf, html, on, TNode, Use, Value } from '@tempots/dom'
import { ThemeProvider } from '../theme'

export interface ButtonOptions {
  type?: Value<'submit' | 'reset' | 'button'>
  disabled?: Value<boolean>
  variant?: Value<'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'>
  size?: Value<'sm' | 'md' | 'lg' | 'xl'>
  color?: Value<string>
  roundedness?: Value<'none' | 'small' | 'medium' | 'large' | 'full'>
  onClick?: () => void
}

export function Button(
  {
    type = 'button',
    disabled,
    variant = 'primary',
    size = 'md',
    color,
    roundedness,
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
          size ?? 'md',
          color,
          roundedness
        )(({ theme }, disabled, variant, size, color, roundedness) =>
          theme.button({
            variant,
            size,
            disabled,
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

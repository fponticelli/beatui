import { attr, computedOf, html, on, TNode, Use, Value } from '@tempots/dom'
import { ThemeProvider } from './theme'

export interface ButtonOptions {
  type?: Value<'submit' | 'reset' | 'button'>
  disabled?: Value<boolean>
  variant?: Value<'primary' | 'secondary' | 'outline' | 'text'>
  size?: Value<'small' | 'medium' | 'large'>
  onClick?: () => void
}

export function Button(
  {
    type = 'button',
    disabled,
    variant = 'primary',
    size = 'medium',
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
          size ?? 'medium'
        )(({ theme: { button } }, disabled, variant, size) =>
          button({ disabled, variant, size })
        )
      ),
      on.click(onClick),
      ...children
    )
  })
}

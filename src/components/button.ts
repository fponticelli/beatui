import { attr, html, TNode, Use, Value } from '@tempots/dom'
import { ThemeProvider } from './theme'

export interface ButtonOptions {
  type?: Value<'submit' | 'reset' | 'button'>
  disabled?: Value<boolean>
}

export function Button(
  { type = 'button', disabled }: ButtonOptions,
  ...children: TNode[]
) {
  return Use(ThemeProvider, theme =>
    html.button(
      attr.type(Value.map(type, String)),
      attr.disabled(disabled),
      ...children
    )
  )
}

import { attr, html, on, TNode, Use, Value } from '@tempots/dom'
import { ThemeProvider } from './theme'

export interface ButtonOptions {
  type?: Value<'submit' | 'reset' | 'button'>
  disabled?: Value<boolean>
  onClick?: () => void
}

export function Button(
  { type = 'button', disabled, onClick }: ButtonOptions,
  ...children: TNode[]
) {
  return Use(ThemeProvider, theme =>
    html.button(
      attr.type(Value.map(type, String)),
      attr.disabled(disabled),
      on.click(onClick ?? (() => {})),
      ...children
    )
  )
}

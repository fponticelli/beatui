import { attr, computedOf, html, TNode, Use, Value } from '@tempots/dom'
import { ThemeProvider } from './theme'
import { IconSize } from './theme/types'

export interface IconOptions {
  icon: Value<string>
  size?: Value<IconSize>
  color?: Value<string>
  title?: Value<string>
}

export function Icon(
  { icon, size = 'medium', color, title }: IconOptions,
  ...children: TNode[]
) {
  return Use(ThemeProvider, ({ theme }) => {
    return html.span(
      attr.class(
        computedOf(
          theme,
          size,
          color
        )(({ iconContainer: iconTheme }, size, color) =>
          iconTheme({ size, color })
        )
      ),
      html.i(
        attr.class(theme.icon),
        attr.class(icon as Value<string>),
        attr.title(title)
      ),
      ...children
    )
  })
}

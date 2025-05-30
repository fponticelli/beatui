import { attr, computedOf, html, TNode, Use, Value } from '@tempots/dom'
import { IconSize, ThemeProvider } from '../theme'

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
      // Use iconify-icon web component for modern Iconify support
      html.div(
        attr.style('display: contents;'),
        attr.innerHTML(
          computedOf(
            icon,
            title
          )((iconName, titleText) => {
            const titleAttr = titleText ? ` title="${titleText}"` : ''
            return `<iconify-icon icon="${iconName}"${titleAttr}></iconify-icon>`
          })
        )
      ),
      ...children
    )
  })
}

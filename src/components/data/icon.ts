import { attr, computedOf, html, TNode, Use, Value } from '@tempots/dom'
import { IconSize, ThemeProvider } from '../theme'

export interface IconOptions {
  icon: Value<string>
  size?: Value<IconSize>
  color?: Value<string>
  title?: Value<string>
}

export function Icon(
  { icon, size = 'md', color, title }: IconOptions,
  ...children: TNode[]
) {
  return Use(ThemeProvider, ({ theme }) => {
    return html.span(
      attr.class(
        computedOf(
          theme,
          size,
          color
        )((theme, size, color) => theme.iconContainer({ size, color }))
      ),
      // Use pure CSS solution with icon-[collection:name] classes
      html.span(
        attr.class(
          computedOf(icon)(iconName => {
            // Convert iconify format (collection:name) to CSS class (icon-[collection:name])
            return `icon-[${iconName}]`
          })
        ),
        attr.title(title || ''),
        attr.role('img')
      ),
      ...children
    )
  })
}

import { attr, computedOf, html, TNode, Use, Value } from '@tempots/dom'
import { CardVariant, ControlSize, Theme } from '../theme'
import { RadiusName } from '@/tokens/radius'

export interface CardOptions {
  variant?: Value<CardVariant>
  size?: Value<ControlSize>
  roundedness?: Value<RadiusName>
}

export function Card(
  { variant = 'default', size = 'md', roundedness = 'lg' }: CardOptions = {},
  ...children: TNode[]
) {
  return Use(Theme, theme => {
    return html.div(
      attr.class(
        computedOf(
          theme,
          variant,
          size,
          roundedness
        )(({ theme }, variant, size, roundedness) =>
          theme.card({
            variant,
            size,
            roundedness,
          })
        )
      ),
      ...children
    )
  })
}

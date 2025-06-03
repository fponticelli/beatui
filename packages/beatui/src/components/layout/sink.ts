import { attr, computedOf, html, TNode, Use, Value } from '@tempots/dom'
import { SinkVariant, ControlSize, Theme } from '../theme'
import { RadiusName } from '@/tokens/radius'

export interface SinkOptions {
  variant?: Value<SinkVariant>
  size?: Value<ControlSize>
  roundedness?: Value<RadiusName>
}

export function Sink(
  { variant = 'default', size = 'md', roundedness = 'lg' }: SinkOptions = {},
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
          theme.sink({
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

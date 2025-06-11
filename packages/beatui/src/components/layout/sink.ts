import { attr, computedOf, html, TNode, Value } from '@tempots/dom'
import { SinkVariant, ControlSize } from '../theme'
import { RadiusName } from '@/tokens/radius'

export interface SinkOptions {
  variant?: Value<SinkVariant>
  size?: Value<ControlSize>
  roundedness?: Value<RadiusName>
}

function generateSinkClasses(
  variant: SinkVariant,
  size: ControlSize,
  roundedness: RadiusName
): string {
  const classes = ['bc-sink']

  if (variant !== 'default') {
    classes.push(`bc-sink--${variant}`)
  }

  if (size !== 'md') {
    classes.push(`bc-sink--padding-${size}`)
  }

  if (roundedness !== 'lg') {
    classes.push(`bc-sink--rounded-${roundedness}`)
  }

  return classes.join(' ')
}

export function Sink(
  { variant = 'default', size = 'md', roundedness = 'lg' }: SinkOptions = {},
  ...children: TNode[]
) {
  return html.div(
    attr.class(
      computedOf(
        variant,
        size,
        roundedness
      )((variant, size, roundedness) =>
        generateSinkClasses(
          variant ?? 'default',
          size ?? 'md',
          roundedness ?? 'lg'
        )
      )
    ),
    ...children
  )
}

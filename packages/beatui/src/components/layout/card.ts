import { attr, computedOf, html, TNode, Value } from '@tempots/dom'
import { CardVariant, ControlSize } from '../theme'
import { RadiusName } from '@/tokens/radius'

export interface CardOptions {
  variant?: Value<CardVariant>
  size?: Value<ControlSize>
  roundedness?: Value<RadiusName>
}

function generateCardClasses(
  variant: CardVariant,
  size: ControlSize,
  roundedness: RadiusName
): string {
  const classes = ['bc-card']

  if (variant !== 'default') {
    classes.push(`bc-card--${variant}`)
  }

  if (size !== 'md') {
    classes.push(`bc-card--padding-${size}`)
  }

  if (roundedness !== 'lg') {
    classes.push(`bc-card--rounded-${roundedness}`)
  }

  return classes.join(' ')
}

export function Card(
  { variant = 'default', size = 'md', roundedness = 'lg' }: CardOptions = {},
  ...children: TNode[]
) {
  return html.div(
    attr.class(
      computedOf(
        variant,
        size,
        roundedness
      )((variant, size, roundedness) =>
        generateCardClasses(
          variant ?? 'default',
          size ?? 'md',
          roundedness ?? 'lg'
        )
      )
    ),
    ...children
  )
}

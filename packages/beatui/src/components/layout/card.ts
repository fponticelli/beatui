import { attr, computedOf, html, TNode, Value } from '@tempots/dom'
import { CardVariant, ControlSize } from '../theme'
import { RadiusName } from '../../tokens/radius'

/** Configuration options for the {@link Card} component. */
export interface CardOptions {
  /** The visual style variant of the card. @default 'default' */
  variant?: Value<CardVariant>
  /** Controls the internal padding size. @default 'md' */
  size?: Value<ControlSize>
  /** The border radius of the card. @default 'lg' */
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

/**
 * A container component that groups content with visual separation using
 * elevation, borders, or background color depending on the variant.
 *
 * @param options - Configuration options for appearance and sizing
 * @param children - Content to render inside the card
 * @returns A styled div element
 *
 * @example
 * ```typescript
 * Card(
 *   { variant: 'elevated', size: 'lg' },
 *   html.h2('Card Title'),
 *   html.p('Card content goes here.')
 * )
 * ```
 *
 * @example
 * ```typescript
 * // Card with default options
 * Card({}, html.p('Simple card'))
 * ```
 */
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

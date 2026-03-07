import { attr, computedOf, html, style, TNode, Value } from '@tempots/dom'
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

/** Options for {@link CardHeader}, {@link CardBody}, and {@link CardFooter}. */
export interface CardSectionOptions {
  /** Additional CSS classes. */
  class?: Value<string>
}

/** Options for {@link CardCoverImage}. */
export interface CardCoverImageOptions {
  /** Image source URL. */
  src: Value<string>
  /** Alt text for accessibility. */
  alt?: Value<string>
  /** Fixed height for the image (e.g. `'200px'`). Defaults to auto. */
  height?: Value<string>
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

/**
 * A header section for a {@link Card}, typically containing a title and actions.
 * Renders with a bottom border separator.
 *
 * @example
 * ```ts
 * Card({},
 *   CardHeader({}, html.h3('Title')),
 *   CardBody({}, html.p('Content')),
 * )
 * ```
 */
export function CardHeader(
  { class: className }: CardSectionOptions = {},
  ...children: TNode[]
) {
  return html.div(
    attr.class(
      className != null
        ? Value.map(className, c => `bc-card__header ${c}`)
        : 'bc-card__header'
    ),
    ...children
  )
}

/**
 * The main content area of a {@link Card}.
 * Expands to fill available space with scrollable overflow.
 *
 * @example
 * ```ts
 * Card({},
 *   CardBody({}, html.p('Main content here.'))
 * )
 * ```
 */
export function CardBody(
  { class: className }: CardSectionOptions = {},
  ...children: TNode[]
) {
  return html.div(
    attr.class(
      className != null
        ? Value.map(className, c => `bc-card__body ${c}`)
        : 'bc-card__body'
    ),
    ...children
  )
}

/**
 * A footer section for a {@link Card}, typically containing action buttons.
 * Renders with a top border separator and right-aligned content.
 *
 * @example
 * ```ts
 * Card({},
 *   CardBody({}, html.p('Content')),
 *   CardFooter({}, Button({ variant: 'filled' }, 'Save')),
 * )
 * ```
 */
export function CardFooter(
  { class: className }: CardSectionOptions = {},
  ...children: TNode[]
) {
  return html.div(
    attr.class(
      className != null
        ? Value.map(className, c => `bc-card__footer ${c}`)
        : 'bc-card__footer'
    ),
    ...children
  )
}

/**
 * A full-bleed cover image for a {@link Card}.
 * Automatically inherits the card's border radius at the appropriate corners
 * based on its position (first child = top corners, last child = bottom corners).
 *
 * @example
 * ```ts
 * Card({},
 *   CardCoverImage({ src: 'https://example.com/photo.jpg', alt: 'Photo', height: '200px' }),
 *   CardBody({}, html.p('Description')),
 * )
 * ```
 */
export function CardCoverImage({
  src,
  alt,
  height,
}: CardCoverImageOptions) {
  return html.img(
    attr.class('bc-card__cover-image'),
    attr.src(src),
    alt != null ? attr.alt(alt) : null,
    height != null ? style.height(height) : null
  )
}

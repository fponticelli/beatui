import { attr, computedOf, html, TNode, Value } from '@tempots/dom'
import { SinkVariant, ControlSize } from '../theme'
import { RadiusName } from '../../tokens/radius'

/**
 * Configuration options for the {@link Sink} component.
 */
export interface SinkOptions {
  /**
   * The visual depth variant controlling the inset shadow appearance.
   *
   * - `'default'` - Standard inset effect
   * - `'deep'` - Stronger inset shadow for more depth
   * - `'shallow'` - Subtle inset shadow
   * - `'flat'` - No inset shadow
   *
   * @default 'default'
   */
  variant?: Value<SinkVariant>
  /**
   * Padding size applied to the sink container.
   * @default 'md'
   */
  size?: Value<ControlSize>
  /**
   * Border radius token controlling corner roundedness.
   * @default 'lg'
   */
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

/**
 * Renders a sunken/inset container with configurable depth, padding, and
 * border radius. A sink provides a recessed visual appearance, useful for
 * grouping content in a visually distinct area (e.g., code blocks, input
 * areas, or nested sections).
 *
 * @param options - Configuration options for the sink.
 * @param children - Content nodes rendered inside the sink container.
 * @returns A `<div>` element with the appropriate sink styling classes.
 *
 * @example
 * ```typescript
 * // Default sink with content
 * Sink({}, html.p('This content appears in a recessed area'))
 *
 * // Deep sink with small padding
 * Sink(
 *   { variant: 'deep', size: 'sm', roundedness: 'md' },
 *   html.pre('const x = 42;')
 * )
 *
 * // Flat sink (no inset effect)
 * Sink({ variant: 'flat' }, html.div('Flat container'))
 * ```
 */
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

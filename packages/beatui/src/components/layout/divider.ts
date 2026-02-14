import { attr, computedOf, html, TNode, Value } from '@tempots/dom'

/**
 * Orientation of the divider line.
 *
 * - `'horizontal'` - Horizontal separator (default)
 * - `'vertical'` - Vertical separator
 */
export type DividerOrientation = 'horizontal' | 'vertical'

/**
 * Visual style variant of the divider line.
 *
 * - `'solid'` - Solid line (default)
 * - `'dashed'` - Dashed line
 * - `'dotted'` - Dotted line
 */
export type DividerVariant = 'solid' | 'dashed' | 'dotted'

/**
 * Visual weight/prominence of the divider.
 *
 * - `'subtle'` - Lighter, less prominent
 * - `'default'` - Standard prominence
 * - `'strong'` - Darker, more prominent
 */
export type DividerTone = 'subtle' | 'default' | 'strong'

/**
 * Alignment of the label text in a labeled divider.
 *
 * - `'left'` - Label aligned to the left
 * - `'center'` - Label centered (default)
 * - `'right'` - Label aligned to the right
 */
export type DividerLabelAlign = 'left' | 'center' | 'right'

/**
 * Configuration options for the {@link Divider} component.
 */
export interface DividerOptions {
  /** Orientation of the divider. @default 'horizontal' */
  orientation?: Value<DividerOrientation>
  /** Line style variant. @default 'solid' */
  variant?: Value<DividerVariant>
  /** Visual prominence level. @default 'default' */
  tone?: Value<DividerTone>
  /** Optional label to display in the middle of the divider. */
  label?: TNode
  /** Alignment of the label text. @default 'center' */
  labelAlign?: Value<DividerLabelAlign>
}

/**
 * Generates CSS class names for the divider based on its configuration.
 *
 * @param orientation - The divider orientation
 * @param variant - The line style
 * @param tone - The visual prominence
 * @param hasLabel - Whether the divider has a label
 * @param labelAlign - The label alignment
 * @returns Space-separated CSS class string
 */
function generateDividerClasses(
  orientation: DividerOrientation,
  variant: DividerVariant,
  tone: DividerTone,
  hasLabel: boolean,
  labelAlign: DividerLabelAlign
): string {
  const classes = ['bc-divider']

  if (orientation === 'vertical') {
    classes.push('bc-divider--vertical')
  }

  if (variant !== 'solid') {
    classes.push(`bc-divider--${variant}`)
  }

  if (tone !== 'default') {
    classes.push(`bc-divider--tone-${tone}`)
  }

  if (hasLabel) {
    classes.push('bc-divider--labeled')
    if (labelAlign !== 'center') {
      classes.push(`bc-divider--labeled-${labelAlign}`)
    }
  }

  return classes.join(' ')
}

/**
 * A visual separator component for dividing content sections.
 * Can be horizontal or vertical, with optional label text centered (or aligned)
 * within the divider line.
 *
 * @param options - Configuration for orientation, style, tone, and label
 * @returns A semantic `<hr>` element or a labeled container with divider lines
 *
 * @example
 * ```typescript
 * // Simple horizontal divider
 * Divider()
 * ```
 *
 * @example
 * ```typescript
 * // Divider with centered label
 * Divider({ label: 'OR' })
 * ```
 *
 * @example
 * ```typescript
 * // Vertical divider
 * Divider({ orientation: 'vertical' })
 * ```
 *
 * @example
 * ```typescript
 * // Dashed divider with label aligned left
 * Divider({
 *   variant: 'dashed',
 *   label: 'Section Break',
 *   labelAlign: 'left'
 * })
 * ```
 */
export function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  tone = 'default',
  label,
  labelAlign = 'center',
}: DividerOptions = {}) {
  const hasLabel = label != null

  if (!hasLabel) {
    // Simple divider without label
    return html.hr(
      attr.class(
        computedOf(
          orientation,
          variant,
          tone
        )((orientation, variant, tone) =>
          generateDividerClasses(
            orientation ?? 'horizontal',
            variant ?? 'solid',
            tone ?? 'default',
            false,
            'center'
          )
        )
      ),
      attr.role('separator')
    )
  }

  // Labeled divider with lines on both sides
  return html.div(
    attr.class(
      computedOf(
        orientation,
        variant,
        tone,
        labelAlign
      )((orientation, variant, tone, labelAlign) =>
        generateDividerClasses(
          orientation ?? 'horizontal',
          variant ?? 'solid',
          tone ?? 'default',
          true,
          labelAlign ?? 'center'
        )
      )
    ),
    attr.role('separator'),
    html.span(attr.class('bc-divider__line')),
    html.span(attr.class('bc-divider__label'), label),
    html.span(attr.class('bc-divider__line'))
  )
}

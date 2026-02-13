import {
  aria,
  attr,
  computedOf,
  html,
  Repeat,
  style,
  TNode,
  Value,
  When,
} from '@tempots/dom'
import { RadiusName } from '../../tokens/radius'

/**
 * Configuration options for the {@link Skeleton} component.
 */
export interface SkeletonOptions {
  /** Visual style variant for the skeleton shape. @default 'text' */
  variant?: Value<'text' | 'rect' | 'circle'>
  /** CSS width value (e.g., '100px', '50%'). Default is 100% for text/rect. */
  width?: Value<string | undefined>
  /** CSS height value (e.g., '100px', '2rem'). Default varies by variant. */
  height?: Value<string | undefined>
  /** Number of text lines to render (only applies to text variant). @default 1 */
  lines?: Value<number>
  /** Whether to show the shimmer animation. @default true */
  animate?: Value<boolean>
  /** Border radius preset for the skeleton. @default 'sm' */
  roundedness?: Value<RadiusName>
}

/**
 * Generates CSS class names for the skeleton based on variant and animation state.
 *
 * @param variant - Shape variant (text, rect, or circle)
 * @param animate - Whether shimmer animation is enabled
 * @param roundedness - Border radius preset
 * @returns Space-separated CSS class string
 */
export function generateSkeletonClasses(
  variant: 'text' | 'rect' | 'circle',
  animate: boolean,
  roundedness: RadiusName
): string {
  const classes = [
    'bc-skeleton',
    `bc-skeleton--${variant}`,
    `bc-control--rounded-${roundedness}`,
  ]

  if (animate) {
    classes.push('bc-skeleton--animate')
  }

  if (variant === 'circle') {
    classes.push('bc-skeleton--circle')
  }

  return classes.join(' ')
}

/**
 * Generates inline CSS styles for the skeleton based on width and height.
 *
 * @param width - CSS width value
 * @param height - CSS height value
 * @param variant - Shape variant
 * @returns Semicolon-separated CSS property declarations
 */
export function generateSkeletonStyles(
  width: string | undefined,
  height: string | undefined,
  variant: 'text' | 'rect' | 'circle'
): string {
  const styles: string[] = []

  if (width !== undefined) {
    styles.push(`width: ${width}`)
  }

  if (height !== undefined) {
    styles.push(`height: ${height}`)
  } else {
    // Default heights based on variant
    if (variant === 'text') {
      styles.push('height: 1em')
    } else if (variant === 'circle' && width !== undefined) {
      // For circles, if width is set but height isn't, match the height to width
      styles.push(`height: ${width}`)
    }
  }

  return styles.join('; ')
}

/**
 * A loading placeholder component that shows a shimmer animation.
 * Supports text (single or multi-line), rectangular, and circular variants.
 * Used to indicate that content is loading while maintaining layout structure.
 *
 * @param options - Configuration for variant, dimensions, animation, and shape
 * @returns A styled div element with shimmer animation
 *
 * @example
 * ```typescript
 * // Single line text skeleton
 * Skeleton({ variant: 'text' })
 * ```
 *
 * @example
 * ```typescript
 * // Multi-line text skeleton
 * Skeleton({ variant: 'text', lines: 3 })
 * ```
 *
 * @example
 * ```typescript
 * // Circle skeleton for avatar
 * Skeleton({ variant: 'circle', width: '48px', height: '48px', roundedness: 'full' })
 * ```
 *
 * @example
 * ```typescript
 * // Rectangle skeleton with custom dimensions
 * Skeleton({ variant: 'rect', width: '200px', height: '120px', roundedness: 'md' })
 * ```
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  animate = true,
  roundedness = 'sm',
}: SkeletonOptions): TNode {
  const shouldRenderLines = computedOf(
    variant,
    lines
  )((v, l) => v === 'text' && (l ?? 1) > 1)

  return When(
    shouldRenderLines,
    // Multi-line text skeleton
    () =>
      html.div(
        attr.class('bc-skeleton__lines-container'),
        Repeat(lines, pos =>
          html.div(
            attr.class(
              computedOf(
                animate,
                roundedness
              )(
                (a, r) =>
                  generateSkeletonClasses('text', a ?? true, r ?? 'sm') +
                  ' bc-skeleton__line'
              )
            ),
            style.width(
              computedOf(
                pos.isLast,
                width
              )((last, w) =>
                last && w === undefined ? '80%' : w !== undefined ? w : ''
              )
            )
          )
        )
      ),
    // Single skeleton element
    () =>
      html.div(
        attr.class(
          computedOf(
            variant,
            animate,
            roundedness
          )((v, a, r) =>
            generateSkeletonClasses(v ?? 'text', a ?? true, r ?? 'sm')
          )
        ),
        attr.style(
          computedOf(
            width,
            height,
            variant
          )((w, h, v) => generateSkeletonStyles(w, h, v ?? 'text'))
        ),
        aria.hidden('true')
      )
  )
}

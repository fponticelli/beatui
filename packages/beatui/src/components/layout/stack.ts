import { attr, html, TNode } from '@tempots/dom'

/**
 * Vertical stack layout that arranges children in a column with consistent spacing.
 * Uses the `bc-stack` CSS class for flexbox column layout with gap.
 *
 * @param children - Child nodes to stack vertically
 * @returns A div element with vertical stack layout
 *
 * @example
 * ```typescript
 * Stack(
 *   html.h1('Page Title'),
 *   html.p('Some introductory text'),
 *   Button({ variant: 'filled' }, 'Get Started')
 * )
 * ```
 */
export function Stack(...children: TNode[]) {
  return html.div(attr.class('bc-stack'), ...children)
}

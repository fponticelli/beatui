import { attr, html, TNode } from '@tempots/dom'

/**
 * Horizontal group layout that arranges children in a row with consistent spacing.
 * Uses the `bc-group` CSS class for flexbox row layout with gap.
 *
 * @param children - Child nodes to arrange horizontally
 * @returns A div element with horizontal group layout
 *
 * @example
 * ```typescript
 * Group(
 *   Button({ variant: 'outline' }, 'Cancel'),
 *   Button({ variant: 'filled', color: 'primary' }, 'Save')
 * )
 * ```
 */
export function Group(...children: TNode[]) {
  return html.div(attr.class('bc-group'), ...children)
}

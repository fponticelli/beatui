import { attr, TNode } from '@tempots/dom'

/**
 * Shared flex modifier helpers that return TNode class attributes.
 * Use these composable helpers inside Stack or Group to control layout.
 *
 * @example
 * ```typescript
 * Stack(Gap('md'), Align('center'), child1, child2)
 * Group(Gap('sm'), Justify('between'), Wrap, child1, child2)
 * ```
 */

export type FlexGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type FlexJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around'
  | 'evenly'

/** Set the gap between flex children. */
export function Gap(size: FlexGap): TNode {
  return attr.class(`bc-flex--gap-${size}`)
}

/** Set cross-axis alignment (align-items). */
export function Align(align: FlexAlign): TNode {
  return attr.class(`bc-flex--align-${align}`)
}

/** Set main-axis distribution (justify-content). */
export function Justify(justify: FlexJustify): TNode {
  return attr.class(`bc-flex--justify-${justify}`)
}

/** Allow items to wrap to the next line. */
export const Wrap: TNode = attr.class('bc-flex--wrap')

/** Prevent items from wrapping. */
export const NoWrap: TNode = attr.class('bc-flex--nowrap')

/** Allow the container to grow (flex-grow: 1). */
export const Grow: TNode = attr.class('bc-flex--grow')

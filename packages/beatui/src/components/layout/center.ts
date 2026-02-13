import { attr, computedOf, html, TNode, Value } from '@tempots/dom'
import { CenterGap } from '../theme'

/** Configuration options for the {@link Center} component. */
export interface CenterOptions {
  /** Gap size between centered content and surrounding elements. @default 'lg' */
  gap?: Value<CenterGap>
}

/**
 * Horizontally centers its children within a container.
 * Uses the `bc-center-h` CSS class for horizontal centering only.
 *
 * @param children - Child nodes to center horizontally
 * @returns A div element with horizontally centered content
 *
 * @example
 * ```typescript
 * CenterH(
 *   html.h1('Centered Heading'),
 *   html.p('This paragraph is horizontally centered.')
 * )
 * ```
 */
export function CenterH(...children: TNode[]) {
  return html.div(
    attr.class('bc-center-h'),
    html.div(attr.class('bc-center__content'), ...children)
  )
}

function generateCenterClasses(gap: CenterGap): string {
  const classes = ['bc-center']

  if (gap !== 'lg') {
    classes.push(`bc-center--gap-${gap}`)
  }

  return classes.join(' ')
}

/**
 * Centers its children both horizontally and vertically within a container.
 * Supports configurable gap spacing between content and the container edges.
 *
 * @param options - Configuration options for gap spacing
 * @param children - Child nodes to center
 * @returns A div element with centered content
 *
 * @example
 * ```typescript
 * Center(
 *   { gap: 'md' },
 *   html.div('This content is centered on the page')
 * )
 * ```
 *
 * @example
 * ```typescript
 * // Center with default gap
 * Center({}, Icon({ icon: 'line-md:loading-twotone-loop', size: 'xl' }))
 * ```
 */
export function Center(
  { gap = 'lg' }: CenterOptions = {},
  ...children: TNode[]
) {
  return html.div(
    attr.class(computedOf(gap)(gap => generateCenterClasses(gap ?? 'lg'))),
    ...children
  )
}

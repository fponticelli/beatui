import { attr, computedOf, html, TNode, Value } from '@tempots/dom'
import { CenterGap } from '../theme'

export interface CenterOptions {
  gap?: Value<CenterGap>
}

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

export function Center(
  { gap = 'lg' }: CenterOptions = {},
  ...children: TNode[]
) {
  return html.div(
    attr.class(computedOf(gap)(gap => generateCenterClasses(gap ?? 'lg'))),
    ...children
  )
}

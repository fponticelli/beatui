import { attr, computedOf, TNode, Value } from '@tempots/dom'
import { Anchor } from '@tempots/ui'

export type LinkVariant = 'default' | 'plain' | 'hover'

export interface LinkOptions {
  href: Value<string>
  variant?: Value<LinkVariant>
  withViewTransition?: boolean
  target?: Value<string>
  rel?: Value<string>
}

export function generateLinkClasses(variant: LinkVariant): string {
  const classes = ['bc-link']

  switch (variant) {
    case 'plain':
      classes.push('bc-link--plain')
      break
    case 'hover':
      classes.push('bc-link--hover')
      break
    case 'default':
    default:
      classes.push('bc-link--default')
      break
  }

  return classes.join(' ')
}

export function Link(
  {
    href,
    variant = 'default',
    withViewTransition = true,
    target,
    rel,
  }: LinkOptions,
  ...children: TNode[]
) {
  return Anchor(
    {
      href,
      withViewTransition,
    },
    attr.class(
      computedOf(variant)(variant => generateLinkClasses(variant ?? 'default'))
    ),
    target ? attr.target(target) : null,
    rel ? attr.rel(rel) : null,
    ...children
  )
}

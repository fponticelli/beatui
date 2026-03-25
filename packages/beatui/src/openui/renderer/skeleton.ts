import { html, attr } from '@tempots/dom'
import type { TNode } from '@tempots/dom'

export function OpenUISkeleton(): TNode {
  return html.div(
    attr.class('bc-skeleton bc-skeleton--text'),
    attr.style('min-height: 1.5em; width: 100%;')
  )
}

import { html, attr, TNode } from '@tempots/dom'
import { Icon } from '@tempots/beatui'
import { Anchor } from '@tempots/ui'
import { getAdjacentWidgets, widgets } from '../data/widget-registry'

export interface WidgetPageOptions {
  id: string
  title: string
  description?: string
  controls?: TNode
  body: TNode
}

export function WidgetPage(opts: WidgetPageOptions): TNode {
  const { prev, next } = getAdjacentWidgets(opts.id)
  const widget = widgets.find(w => w.id === opts.id)
  const category = widget?.category ?? ''

  return html.div(
    attr.style('display: flex; flex-direction: column; height: 100%'),
    // Header: title + category + prev/next
    html.div(
      attr.class('sc-page-header'),
      html.div(
        html.h1(attr.class('sc-page-title'), opts.title),
        html.span(attr.class('sc-page-category'), category)
      ),
      html.div(
        attr.style('display: flex; gap: 6px'),
        ...(prev
          ? [
              Anchor(
                { href: prev.route, viewTransition: true },
                attr.class('sc-nav-btn'),
                Icon({ icon: 'lucide:arrow-left', size: 'xs' }),
                'Prev'
              ),
            ]
          : []),
        ...(next
          ? [
              Anchor(
                { href: next.route, viewTransition: true },
                attr.class('sc-nav-btn'),
                'Next',
                Icon({ icon: 'lucide:arrow-right', size: 'xs' })
              ),
            ]
          : [])
      )
    ),
    // Controls bar (optional)
    ...(opts.controls ? [opts.controls] : []),
    // Content
    html.div(attr.class('sc-page-content'), opts.body)
  )
}

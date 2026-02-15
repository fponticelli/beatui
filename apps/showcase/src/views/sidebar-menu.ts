import { html, attr, on, prop, When } from '@tempots/dom'
import { StandaloneAppearanceSelector } from '@tempots/beatui'
import { Anchor } from '@tempots/ui'
import {
  categories,
  getWidgetsByCategory,
  widgets,
} from '../data/widget-registry'

export function SidebarMenu() {
  const search = prop('')
  const lowerSearch = search.map(s => s.toLowerCase())

  return html.div(
    attr.class('sc-sidebar'),
    // Header with logo + search
    html.div(
      attr.class('sc-sidebar-header'),
      html.div(
        attr.style(
          'display: flex; align-items: center; gap: 8px; margin-bottom: 10px'
        ),
        html.div(
          attr.style(
            'width: 24px; height: 24px; border-radius: 3px; background: #2563eb; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 700; flex-shrink: 0'
          ),
          'B'
        ),
        html.span(
          attr.style('font-size: 12px; font-weight: 600'),
          'Widget Showcase'
        ),
        html.div(
          attr.style('margin-left: auto'),
          StandaloneAppearanceSelector()
        )
      ),
      html.input(
        attr.type('text'),
        attr.placeholder('Search widgets\u2026'),
        attr.value(search),
        on.input(e => search.set((e.target as HTMLInputElement).value)),
        attr.class('sc-search-input')
      )
    ),
    // Nav items
    html.div(
      attr.class('sc-sidebar-nav'),
      ...categories.map(category => {
        const allWidgets = getWidgetsByCategory(category)
        return html.div(
          attr.style('margin-bottom: 8px'),
          html.div(attr.class('sc-category-header'), category),
          ...allWidgets.map(w =>
            When(
              lowerSearch.map(
                s => s === '' || w.label.toLowerCase().includes(s)
              ),
              () =>
                Anchor(
                  { href: w.route, viewTransition: true },
                  attr.class('sc-nav-item'),
                  w.label
                )
            )
          )
        )
      })
    ),
    // Footer
    html.div(
      attr.class('sc-sidebar-footer'),
      `${widgets.length} widgets \u00b7 BeatUI Design System`
    )
  )
}

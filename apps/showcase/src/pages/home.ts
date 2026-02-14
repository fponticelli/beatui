import { html, attr } from '@tempots/dom'
import { Anchor } from '@tempots/ui'
import { categories, getWidgetsByCategory } from '../data/widget-registry'
import { Section } from '../views/section'

export default function HomePage() {
  return html.div(
    attr.style('padding: 24px 32px'),
    html.div(
      attr.style('display: flex; flex-direction: column; gap: 24px'),
      html.p(
        attr.style(
          'font-size: 13px; color: #6B7280; line-height: 1.5; margin: 0'
        ),
        'Visually compare and interact with BeatUI components. Select a widget from the sidebar or browse by category below.'
      ),
      html.div(
        attr.style('display: flex; flex-direction: column; gap: 4px'),
        ...categories.map(category =>
          Section(
            category,
            ...getWidgetsByCategory(category).map(w =>
              Anchor(
                { href: w.route, viewTransition: true },
                attr.class(
                  'text-sm px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors no-underline text-gray-700 dark:text-gray-300'
                ),
                w.label
              )
            )
          )
        )
      )
    )
  )
}

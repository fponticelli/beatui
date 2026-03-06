import { ScrollablePanel } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'ScrollablePanel',
  category: 'Layout',
  component: 'ScrollablePanel',
  description:
    'A panel with a scrollable body and optional fixed header and footer. Displays scroll shadow indicators when content overflows.',
  icon: 'lucide:panel-top',
  order: 9,
}

function makeItems(count: number) {
  return Array.from({ length: count }, (_, i) =>
    html.div(
      attr.class(
        'px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
      ),
      `Item ${i + 1}`
    )
  )
}

export default function ScrollablePanelPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('ScrollablePanel', signals =>
      html.div(
        attr.class('h-64 border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700'),
        ScrollablePanel({
          shadowOnScroll: signals.shadowOnScroll as never,
          header: html.div(
            attr.class(
              'px-4 py-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-sm'
            ),
            'Panel Header'
          ),
          body: html.div(...makeItems(12)),
          footer: html.div(
            attr.class(
              'px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400'
            ),
            '12 items'
          ),
        })
      )
    ),
    sections: [
      Section(
        'Basic Scrollable Panel',
        () =>
          html.div(
            attr.class('h-48 border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700'),
            ScrollablePanel({
              body: html.div(...makeItems(10)),
            })
          ),
        'A panel with only a scrollable body. Scroll shadows appear automatically when content overflows.'
      ),
      Section(
        'With Header and Footer',
        () =>
          html.div(
            attr.class('h-64 border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700'),
            ScrollablePanel({
              header: html.div(
                attr.class(
                  'px-4 py-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-sm'
                ),
                'File Browser'
              ),
              body: html.div(...makeItems(15)),
              footer: html.div(
                attr.class(
                  'px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400'
                ),
                '15 files'
              ),
            })
          ),
        'The header and footer remain fixed while the body content scrolls.'
      ),
      Section(
        'Without Scroll Shadows',
        () =>
          html.div(
            attr.class('h-48 border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700'),
            ScrollablePanel({
              shadowOnScroll: false,
              header: html.div(
                attr.class(
                  'px-4 py-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-sm'
                ),
                'No Shadow Indicators'
              ),
              body: html.div(...makeItems(10)),
            })
          ),
        'Set shadowOnScroll to false to disable the scroll position shadow indicators.'
      ),
      Section(
        'Short Content (no scroll)',
        () =>
          html.div(
            attr.class('h-48 border rounded-lg overflow-hidden border-gray-200 dark:border-gray-700'),
            ScrollablePanel({
              header: html.div(
                attr.class(
                  'px-4 py-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-sm'
                ),
                'Short List'
              ),
              body: html.div(...makeItems(3)),
              footer: html.div(
                attr.class(
                  'px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400'
                ),
                '3 items'
              ),
            })
          ),
        'When content fits without scrolling, no shadow indicators are displayed.'
      ),
      Section(
        'Scroll Shadow Behavior',
        () =>
          html.div(
            attr.class('flex flex-col gap-2'),
            html.p(
              attr.class('text-sm text-gray-600 dark:text-gray-400'),
              'The scroll shadow state updates reactively based on scroll position:'
            ),
            html.ul(
              attr.class('text-sm text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1'),
              html.li('No shadow — content fits without scrolling'),
              html.li('Bottom shadow — scrolled to top (more content below)'),
              html.li('Top shadow — scrolled to bottom (more content above)'),
              html.li('Both shadows — scrolled to the middle')
            )
          ),
        'Shadows indicate when scrollable content is hidden above or below the visible area.'
      ),
    ],
  })
}

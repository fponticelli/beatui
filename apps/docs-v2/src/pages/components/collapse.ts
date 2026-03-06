import { Collapse, Button } from '@tempots/beatui'
import { html, attr, prop, on, Value } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Collapse',
  category: 'Layout',
  component: 'Collapse',
  description:
    'Animated collapsible container that smoothly expands and contracts content with CSS height transitions.',
  icon: 'lucide:chevron-down',
  order: 2,
}

export default function CollapsePage() {
  return ComponentPage(meta, {
    playground: (() => {
      const open = prop(false)
      return html.div(
        attr.class('flex flex-col gap-3 w-full max-w-sm'),
        Button(
          {
            variant: 'outline',
            onClick: () => open.set(!open.value),
            fullWidth: true,
          },
          Value.map(open, (o): string => (o ? 'Collapse' : 'Expand'))
        ),
        html.div(
          Collapse(
            { open },
            html.div(
              attr.class(
                'p-4 rounded-lg border border-gray-200 dark:border-gray-700'
              ),
              html.p(
                attr.class('text-sm text-gray-600 dark:text-gray-400'),
                'This content animates in and out smoothly when toggled.'
              )
            )
          )
        )
      )
    })(),
    sections: [
      Section(
        'Basic Collapse',
        () => {
          const open = prop(false)
          return html.div(
            attr.class('flex flex-col gap-2 w-full max-w-sm'),
            Button(
              { variant: 'outline', onClick: () => open.set(!open.value) },
              'Toggle Content'
            ),
            html.div(
              Collapse(
                { open },
                html.div(
                  attr.class(
                    'p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mt-2'
                  ),
                  html.p(
                    attr.class('text-sm'),
                    'Hidden content that expands and collapses with animation.'
                  )
                )
              )
            )
          )
        },
        'Use a boolean signal to control open/closed state.'
      ),
      Section(
        'Initially Open',
        () => {
          const open = prop(true)
          return html.div(
            attr.class('flex flex-col gap-2 w-full max-w-sm'),
            Button(
              { variant: 'light', onClick: () => open.set(!open.value) },
              'Toggle'
            ),
            html.div(
              Collapse(
                { open },
                html.div(
                  attr.class('p-4 border rounded-lg mt-2'),
                  html.p('This panel starts expanded.'),
                  html.p(
                    attr.class('text-sm text-gray-500 mt-1'),
                    'Click the button above to collapse it.'
                  )
                )
              )
            )
          )
        },
        'Set the open signal to true initially to start expanded.'
      ),
      Section(
        'Multiple Panels',
        () => {
          const open1 = prop(false)
          const open2 = prop(false)
          const open3 = prop(false)

          const panels = [
            {
              label: 'What is BeatUI?',
              open: open1,
              content:
                'BeatUI is a component library built on the Tempo reactive DOM framework. It provides accessible, themeable UI components.',
            },
            {
              label: 'How does Collapse work?',
              open: open2,
              content:
                'Collapse measures the natural content height and applies CSS transitions to animate between 0 and that height.',
            },
            {
              label: 'Can I nest Collapse panels?',
              open: open3,
              content:
                'Yes, Collapse panels can be nested. Each panel manages its own height independently.',
            },
          ]

          return html.div(
            attr.class(
              'flex flex-col gap-1 w-full max-w-sm border rounded-lg overflow-hidden'
            ),
            ...panels.map(({ label, open, content }) =>
              html.div(
                html.button(
                  attr.class(
                    'w-full text-left px-4 py-3 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between'
                  ),
                  attr.type('button'),
                  on.click(() => open.set(!open.value)),
                  label,
                  Value.map(open, (o): string => (o ? '−' : '+'))
                ),
                html.div(
                  Collapse(
                    { open },
                    html.div(
                      attr.class(
                        'px-4 pb-3 text-sm text-gray-600 dark:text-gray-400'
                      ),
                      content
                    )
                  )
                )
              )
            )
          )
        },
        'Multiple independent Collapse panels can create an accordion-like pattern.'
      ),
    ],
  })
}

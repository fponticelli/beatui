import { Accordion } from '@tempots/beatui'
import { html, attr, Value } from '@tempots/dom'
import {
  ComponentPage,
  autoPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Accordion',
  category: 'Layout',
  component: 'Accordion',
  description:
    'Expandable content sections with single or multiple open item support.',
  icon: 'lucide:chevrons-down',
  order: 1,
}

const sampleItems = [
  {
    key: 'getting-started',
    header: 'Getting Started',
    body: html.p('Install BeatUI with: pnpm add @tempots/beatui'),
  },
  {
    key: 'features',
    header: 'Features',
    body: html.p('Reactive, accessible, themeable components.'),
  },
  {
    key: 'usage',
    header: 'Usage',
    body: html.p('Import and use components in your Tempo app.'),
  },
]

export default function AccordionPage() {
  return ComponentPage(meta, {
    playground: autoPlayground('Accordion', props =>
      html.div(
        attr.class('w-full max-w-xl'),
        Accordion({
          ...(props as Record<string, Value<unknown>>),
          items: sampleItems,
        })
      )
    ),
    sections: [
      ...AutoSections('Accordion', props =>
        html.div(
          attr.class('w-full max-w-md'),
          Accordion({
            ...props,
            items: [
              { key: '1', header: 'Section 1', body: html.p('Content 1') },
              { key: '2', header: 'Section 2', body: html.p('Content 2') },
            ],
          })
        )
      ),
      Section(
        'Default Open',
        () =>
          html.div(
            attr.class('w-full max-w-xl'),
            Accordion({
              items: [
                {
                  key: 'open',
                  header: 'Open by default',
                  body: html.p('This section starts expanded.'),
                  defaultOpen: true,
                },
                {
                  key: 'closed',
                  header: 'Closed by default',
                  body: html.p('This section starts collapsed.'),
                },
              ],
            })
          ),
        'Items can be expanded by default.'
      ),
      Section(
        'Disabled Items',
        () =>
          html.div(
            attr.class('w-full max-w-xl'),
            Accordion({
              items: [
                {
                  key: 'active',
                  header: 'Active Section',
                  body: html.p('This can be toggled.'),
                },
                {
                  key: 'disabled',
                  header: 'Disabled Section',
                  body: html.p('This cannot be toggled.'),
                  disabled: true,
                },
              ],
            })
          ),
        'Individual items can be disabled.'
      ),
    ],
  })
}

import { Divider, Stack, Group } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Divider',
  category: 'Layout',
  component: 'Divider',
  description: 'A visual separator between content sections.',
  icon: 'lucide:minus',
  order: 3,
}

export default function DividerPage() {
  return ComponentPage(meta, {
    playground: html.div(
      attr.class(
        'w-full p-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
      ),
      Stack(
        attr.class('gap-4'),
        html.p('Content above'),
        Divider({}),
        html.p('Content below')
      )
    ),
    sections: [
      ...AutoSections('Divider', props =>
        html.div(attr.class('w-full'), Divider(props))
      ),
      Section(
        'With Label',
        () =>
          Stack(
            attr.class('gap-6 w-full'),
            Divider({ label: 'OR' }),
            Divider({ label: 'Section', labelAlign: 'left' }),
            Divider({ label: 'Section', labelAlign: 'right' })
          ),
        'Dividers can include centered or aligned label text.'
      ),
      Section(
        'Vertical',
        () =>
          Group(
            attr.class('gap-4 h-24 items-stretch'),
            html.span('Left'),
            Divider({ orientation: 'vertical' }),
            html.span('Center'),
            Divider({ orientation: 'vertical', variant: 'dashed' }),
            html.span('Right')
          ),
        'Vertical dividers separate inline content.'
      ),
    ],
  })
}

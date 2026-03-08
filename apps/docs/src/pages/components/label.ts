import { Label, EmphasisLabel, MutedLabel, DangerLabel } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Label',
  category: 'Data Display',
  component: 'Label',
  description:
    'Inline text labels with semantic styling variants for emphasis, muted, and danger states.',
  icon: 'lucide:tag',
  order: 20,
}

export default function LabelPage() {
  return ComponentPage(meta, {
    playground: html.div(
      attr.class('flex flex-wrap gap-4 items-center'),
      Label('Default label'),
      EmphasisLabel('Emphasis label'),
      MutedLabel('Muted label'),
      DangerLabel('Danger label')
    ),
    sections: [
      Section(
        'Variants',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            html.div(
              attr.class('flex items-center gap-3'),
              html.code(attr.class('text-xs font-mono text-gray-500 w-32'), 'Label'),
              Label('Default label text')
            ),
            html.div(
              attr.class('flex items-center gap-3'),
              html.code(attr.class('text-xs font-mono text-gray-500 w-32'), 'EmphasisLabel'),
              EmphasisLabel('Emphasized label text')
            ),
            html.div(
              attr.class('flex items-center gap-3'),
              html.code(attr.class('text-xs font-mono text-gray-500 w-32'), 'MutedLabel'),
              MutedLabel('Muted label text')
            ),
            html.div(
              attr.class('flex items-center gap-3'),
              html.code(attr.class('text-xs font-mono text-gray-500 w-32'), 'DangerLabel'),
              DangerLabel('Danger label text')
            )
          ),
        'Four label variants for different semantic meanings. Each renders a styled <span>.'
      ),
      Section(
        'Inline Usage',
        () =>
          html.p(
            attr.class('text-sm leading-relaxed'),
            'This paragraph contains a ',
            Label('default label'),
            ', an ',
            EmphasisLabel('emphasized label'),
            ', a ',
            MutedLabel('muted label'),
            ', and a ',
            DangerLabel('danger label'),
            ' inline with regular text.'
          ),
        'Labels are inline elements designed to be used within paragraphs, table cells, or any text context.'
      ),
    ],
  })
}

import { ProgressBar, Stack } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, autoPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'ProgressBar',
  category: 'Data Display',
  component: 'ProgressBar',
  description: 'A horizontal bar indicating progress or loading state.',
  icon: 'lucide:loader',
  order: 3,
}

export default function ProgressBarPage() {
  return ComponentPage(meta, {
    playground: autoPlayground('ProgressBar', props =>
      html.div(
        attr.class('w-full max-w-md'),
        ProgressBar({ ...props, value: 65 } as never)
      )
    ),
    sections: [
      ...AutoSections('ProgressBar', props =>
        html.div(
          attr.class('w-full max-w-xs'),
          ProgressBar({ ...props, value: 65 } as never)
        )
      ),
      Section(
        'Values',
        () =>
          Stack(
            attr.class('gap-4 w-full max-w-md'),
            ...[0, 25, 50, 75, 100].map(value =>
              html.div(
                attr.class('flex items-center gap-3'),
                html.span(
                  attr.class('text-xs font-mono text-gray-500 w-8'),
                  `${value}%`
                ),
                html.div(
                  attr.class('flex-1'),
                  ProgressBar({ value })
                )
              )
            )
          ),
        'Progress bars at different fill levels.'
      ),
      Section(
        'With Label',
        () =>
          Stack(
            attr.class('gap-4 w-full max-w-md'),
            ProgressBar({ value: 42, showLabel: true }),
            ProgressBar({ value: 87, showLabel: true, color: 'success' })
          ),
        'Display the current value as a label inside the bar.'
      ),
      Section(
        'Indeterminate',
        () =>
          Stack(
            attr.class('gap-4 w-full max-w-md'),
            ProgressBar({ indeterminate: true }),
            ProgressBar({ indeterminate: true, color: 'info' })
          ),
        'Use indeterminate mode when the progress amount is unknown.'
      ),
    ],
  })
}

import { Sink } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, autoPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Sink',
  category: 'Layout',
  component: 'Sink',
  description:
    'A sunken/inset container with configurable depth, padding, and border radius. Useful for code blocks, input areas, or nested content that needs a recessed visual appearance.',
  icon: 'lucide:square-dashed',
  order: 7,
}

export default function SinkPage() {
  return ComponentPage(meta, {
    playground: autoPlayground('Sink', props =>
      Sink(
        props as never,
        html.p(
          attr.class('text-sm text-gray-600 dark:text-gray-400'),
          'Content inside the sink container.'
        )
      )
    ),
    sections: [
      ...AutoSections('Sink', props =>
        Sink(
          props as never,
          html.p(attr.class('text-sm text-gray-500'), 'Sink content')
        )
      ),
      Section(
        'Depth Variants',
        () =>
          html.div(
            attr.class('flex flex-col gap-4 max-w-sm'),
            ...(['flat', 'shallow', 'default', 'deep'] as const).map(variant =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 dark:text-gray-400 mb-1'), variant),
                Sink(
                  { variant },
                  html.p(
                    attr.class('text-sm text-gray-600 dark:text-gray-400'),
                    `Variant: ${variant}`
                  )
                )
              )
            )
          ),
        'Four depth variants control the intensity of the inset shadow effect.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-4 max-w-sm'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 dark:text-gray-400 mb-1'), size),
                Sink(
                  { size },
                  html.p(
                    attr.class('text-sm text-gray-600 dark:text-gray-400'),
                    `Padding size: ${size}`
                  )
                )
              )
            )
          ),
        'Five padding sizes match the standard BeatUI control size scale.'
      ),
      Section(
        'Roundedness',
        () =>
          html.div(
            attr.class('flex flex-col gap-4 max-w-sm'),
            ...(['none', 'sm', 'md', 'lg', 'xl', 'full'] as const).map(roundedness =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 dark:text-gray-400 mb-1'), roundedness),
                Sink(
                  { roundedness },
                  html.p(
                    attr.class('text-sm text-gray-600 dark:text-gray-400'),
                    `Roundedness: ${roundedness}`
                  )
                )
              )
            )
          ),
        'Border radius tokens from the design system control corner roundedness.'
      ),
      Section(
        'Code Block Use Case',
        () =>
          Sink(
            { variant: 'deep', size: 'sm', roundedness: 'md' },
            html.pre(
              attr.class('text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto'),
              'const greeting = "Hello, World!"\nconsole.log(greeting)'
            )
          ),
        'Deep variant with small padding is ideal for code block presentation.'
      ),
      Section(
        'Nested Content',
        () =>
          Sink(
            {},
            html.h3(attr.class('text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'), 'Statistics'),
            html.div(
              attr.class('flex gap-6'),
              html.div(
                html.div(attr.class('text-2xl font-bold text-sky-600 dark:text-sky-400'), '1,234'),
                html.div(attr.class('text-xs text-gray-500'), 'Total users')
              ),
              html.div(
                html.div(attr.class('text-2xl font-bold text-success-600 dark:text-success-400'), '98%'),
                html.div(attr.class('text-xs text-gray-500'), 'Uptime')
              ),
              html.div(
                html.div(attr.class('text-2xl font-bold text-warning-600 dark:text-warning-400'), '42ms'),
                html.div(attr.class('text-xs text-gray-500'), 'Avg response')
              )
            )
          ),
        'Sinks work well as containers for data summaries and stat panels.'
      ),
    ],
  })
}

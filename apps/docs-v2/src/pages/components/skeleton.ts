import { Skeleton, Stack, Group } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, autoPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Skeleton',
  category: 'Data Display',
  component: 'Skeleton',
  description: 'Placeholder loading indicators for content that is still loading.',
  icon: 'lucide:layout',
  order: 4,
}

export default function SkeletonPage() {
  return ComponentPage(meta, {
    playground: autoPlayground('Skeleton', props =>
      html.div(attr.class('w-full max-w-sm'), Skeleton(props as never))
    ),
    sections: [
      Section(
        'Variants',
        () =>
          html.div(
            attr.class('flex flex-wrap items-start gap-6'),
            html.div(
              attr.class('flex flex-col items-center gap-2'),
              html.div(
                attr.class('w-64'),
                Skeleton({ variant: 'text', lines: 3 })
              ),
              html.span(attr.class('text-xs text-gray-500 font-mono'), 'text')
            ),
            html.div(
              attr.class('flex flex-col items-center gap-2'),
              Skeleton({ variant: 'rect', width: '200px', height: '120px' }),
              html.span(attr.class('text-xs text-gray-500 font-mono'), 'rect')
            ),
            html.div(
              attr.class('flex flex-col items-center gap-2'),
              Skeleton({ variant: 'circle', width: '64px', height: '64px' }),
              html.span(
                attr.class('text-xs text-gray-500 font-mono'),
                'circle'
              )
            )
          ),
        'Text, rectangle, and circle skeleton variants.'
      ),
      Section(
        'Card Placeholder',
        () =>
          html.div(
            attr.class(
              'w-full max-w-sm p-4 rounded-lg border border-gray-200 dark:border-gray-700'
            ),
            Stack(
              attr.class('gap-3'),
              Group(
                attr.class('gap-3 items-center'),
                Skeleton({
                  variant: 'circle',
                  width: '40px',
                  height: '40px',
                }),
                html.div(
                  attr.class('flex-1'),
                  Stack(
                    attr.class('gap-1'),
                    Skeleton({ variant: 'text', width: '60%' }),
                    Skeleton({ variant: 'text', width: '40%' })
                  )
                )
              ),
              Skeleton({ variant: 'rect', height: '160px' }),
              Skeleton({ variant: 'text', lines: 2 })
            )
          ),
        'Combine skeleton variants to create content placeholders.'
      ),
      Section(
        'Without Animation',
        () =>
          Stack(
            attr.class('gap-3 w-full max-w-sm'),
            Skeleton({ variant: 'text', lines: 3, animate: false })
          ),
        'Disable the shimmer animation.'
      ),
    ],
  })
}

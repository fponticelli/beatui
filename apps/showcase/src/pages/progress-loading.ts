import { html, attr, prop, When, Value } from '@tempots/dom'
import {
  ProgressBar,
  Skeleton,
  Button,
  Group,
  Icon,
  ThemeColorName,
} from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { SectionStack } from '../views/section'

export default function ProgressLoadingPage() {
  const progress = prop(65)
  const isLoading = prop(true)

  return WidgetPage({
    id: 'progress-loading',
    title: 'Progress & Loading',
    description: 'Progress bars and skeleton loading states.',
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

      // Progress values
      SectionStack(
        'Progress Bar',
        html.div(
          attr.class('space-y-1'),
          html.span(attr.class('text-sm'), '25%'),
          ProgressBar({ value: 25 })
        ),
        html.div(
          attr.class('space-y-1'),
          html.span(attr.class('text-sm'), '50%'),
          ProgressBar({ value: 50 })
        ),
        html.div(
          attr.class('space-y-1'),
          html.span(attr.class('text-sm'), '75%'),
          ProgressBar({ value: 75 })
        ),
        html.div(
          attr.class('space-y-1'),
          html.span(attr.class('text-sm'), '100%'),
          ProgressBar({ value: 100 })
        )
      ),

      // With labels
      SectionStack(
        'With Labels',
        ProgressBar({ value: 30, showLabel: true }),
        ProgressBar({ value: 60, showLabel: true, color: 'success' }),
        ProgressBar({ value: 90, showLabel: true, color: 'warning' })
      ),

      // Colors
      SectionStack(
        'Colors',
        ...(
          [
            'primary',
            'success',
            'warning',
            'danger',
            'info',
          ] as ThemeColorName[]
        ).map(color =>
          html.div(
            attr.class('space-y-1'),
            html.span(attr.class('text-sm capitalize'), color),
            ProgressBar({ value: 70, color })
          )
        )
      ),

      // Sizes
      SectionStack(
        'Sizes',
        html.div(
          attr.class('space-y-1'),
          html.span(attr.class('text-sm'), 'Small'),
          ProgressBar({ value: 60, size: 'sm' })
        ),
        html.div(
          attr.class('space-y-1'),
          html.span(attr.class('text-sm'), 'Medium'),
          ProgressBar({ value: 60, size: 'md' })
        ),
        html.div(
          attr.class('space-y-1'),
          html.span(attr.class('text-sm'), 'Large'),
          ProgressBar({ value: 60, size: 'lg' })
        )
      ),

      // Indeterminate
      SectionStack(
        'Indeterminate',
        ProgressBar({ indeterminate: true }),
        ProgressBar({ indeterminate: true, color: 'success', size: 'lg' })
      ),

      // Interactive
      SectionStack(
        'Interactive',
        Group(
          { gap: 'sm' },
          Button(
            { onClick: () => progress.set(Math.max(0, progress.value - 10)) },
            Icon({ icon: 'lucide:minus' })
          ),
          Button({ onClick: () => progress.set(0) }, 'Reset'),
          Button(
            { onClick: () => progress.set(Math.min(100, progress.value + 10)) },
            Icon({ icon: 'lucide:plus' })
          )
        ),
        ProgressBar({ value: progress, showLabel: true, size: 'lg' })
      ),

      // Skeleton variants
      SectionStack(
        'Skeleton',
        html.div(
          attr.class('space-y-1'),
          html.span(attr.class('text-sm'), 'Text'),
          Skeleton({ variant: 'text' })
        ),
        html.div(
          attr.class('space-y-1'),
          html.span(attr.class('text-sm'), 'Multi-line'),
          Skeleton({ variant: 'text', lines: 3 })
        ),
        html.div(
          attr.class('space-y-1'),
          html.span(attr.class('text-sm'), 'Rectangle'),
          Skeleton({ variant: 'rect', height: '100px' })
        ),
        html.div(
          attr.class('space-y-1'),
          html.span(attr.class('text-sm'), 'Circle'),
          Skeleton({ variant: 'circle', width: '64px', height: '64px' })
        )
      ),

      // Skeleton patterns
      SectionStack(
        'Loading Patterns',
        Group(
          { gap: 'sm' },
          Button(
            { onClick: () => isLoading.update(v => !v) },
            Value.map(isLoading, v => (v ? 'Show Content' : 'Show Loading'))
          )
        ),
        When(
          isLoading,
          () =>
            html.div(
              attr.class('space-y-3'),
              html.div(
                attr.class('flex gap-4 items-start'),
                Skeleton({ variant: 'circle', width: '48px', height: '48px' }),
                html.div(
                  attr.class('flex-1 space-y-2'),
                  Skeleton({ variant: 'text', width: '200px' }),
                  Skeleton({ variant: 'text', width: '150px' })
                )
              ),
              Skeleton({ variant: 'rect', height: '120px', roundedness: 'md' }),
              Skeleton({ variant: 'text', lines: 3 })
            ),
          () =>
            html.div(
              attr.class('space-y-3'),
              html.div(
                attr.class('flex gap-4 items-start'),
                html.div(attr.class('w-12 h-12 rounded-full bg-primary-500')),
                html.div(
                  attr.class('flex-1 space-y-1'),
                  html.div(attr.class('font-semibold'), 'John Doe'),
                  html.div(
                    attr.class('text-sm text-gray-500'),
                    'Software Engineer'
                  )
                )
              ),
              html.div(
                attr.class('p-4 rounded-md bg-primary-50 dark:bg-primary-900'),
                html.p(attr.class('text-lg font-semibold'), 'Content Loaded!')
              ),
              html.p(
                attr.class('text-gray-700 dark:text-gray-300'),
                'The skeleton provides a pleasant loading experience.'
              )
            )
        )
      )
    ),
  })
}

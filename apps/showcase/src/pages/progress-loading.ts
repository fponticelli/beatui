import { html, attr, prop, When, Value, on } from '@tempots/dom'
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

      // Progress values with range slider
      SectionStack(
        'Progress Bar',
        html.div(
          attr.style(
            'display: flex; align-items: center; gap: 10px; margin-bottom: 8px'
          ),
          html.input(
            attr.type('range'),
            attr.min(0),
            attr.max(100),
            attr.value(progress.map(String)),
            attr.style('width: 100%; accent-color: var(--color-primary-500)'),
            on.input((e: Event) =>
              progress.set(Number((e.target as HTMLInputElement).value))
            )
          )
        ),
        html.div(
          attr.style('max-width: 400px'),
          ProgressBar({ value: progress, showLabel: true })
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
        ...[
          { label: 'Accent', color: 'primary' as ThemeColorName },
          { label: 'Success', color: 'success' as ThemeColorName },
          { label: 'Warning', color: 'warning' as ThemeColorName },
          { label: 'Error', color: 'danger' as ThemeColorName },
        ].map(s =>
          html.div(
            attr.style(
              'display: flex; align-items: center; gap: 10px; margin-bottom: 8px; max-width: 400px'
            ),
            html.span(
              attr.style(
                'width: 52px; font-size: 11px; color: var(--color-base-400)'
              ),
              s.label
            ),
            html.div(
              attr.style('flex: 1'),
              ProgressBar({ value: progress, color: s.color })
            )
          )
        )
      ),

      // Sizes
      SectionStack(
        'Sizes',
        ...[
          { label: 'Thin', height: 'sm' as const },
          { label: 'Default', height: 'md' as const },
          { label: 'Thick', height: 'lg' as const },
        ].map(s =>
          html.div(
            attr.style(
              'display: flex; align-items: center; gap: 10px; margin-bottom: 8px; max-width: 400px'
            ),
            html.span(
              attr.style(
                'width: 52px; font-size: 11px; color: var(--color-base-400)'
              ),
              s.label
            ),
            html.div(
              attr.style('flex: 1'),
              ProgressBar({ value: progress, size: s.height })
            )
          )
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
          attr.class('gap-2'),
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
          attr.class('gap-2'),
          Button(
            { onClick: () => isLoading.update(v => !v) },
            Value.map(isLoading, (v): string =>
              v ? 'Show Content' : 'Show Loading'
            )
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
                    attr.class('text-sm text-gray-500 dark:text-gray-400'),
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

import { NavigationProgress, Button, Stack } from '@tempots/beatui'
import type { NavigationProgressController } from '@tempots/beatui'
import { html, attr, on, prop, Value } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'NavigationProgress',
  category: 'Navigation',
  component: 'NavigationProgress',
  description:
    'A thin progress bar fixed to the top or bottom of the viewport, indicating navigation or loading progress. Inspired by NProgress.',
  icon: 'lucide:minus',
  order: 10,
}

function ControlButtons(ctrl: NavigationProgressController) {
  return html.div(
    attr.class('flex flex-wrap gap-2'),
    Button(
      { variant: 'filled', color: 'primary', onClick: () => ctrl.start() },
      'Start'
    ),
    Button(
      { variant: 'filled', color: 'success', onClick: () => ctrl.done() },
      'Done'
    ),
    Button(
      { variant: 'outline', onClick: () => ctrl.set(25) },
      'Set 25%'
    ),
    Button(
      { variant: 'outline', onClick: () => ctrl.set(50) },
      'Set 50%'
    ),
    Button(
      { variant: 'outline', onClick: () => ctrl.set(75) },
      'Set 75%'
    ),
    Button(
      { variant: 'subtle', color: 'danger', onClick: () => ctrl.reset() },
      'Reset'
    )
  )
}

export default function NavigationProgressPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('NavigationProgress', (signals) => {
      const [bar, ctrl] = NavigationProgress(signals)
      return html.div(
        attr.class('flex flex-col gap-4 w-full'),
        bar,
        html.p(
          attr.class('text-sm text-gray-500'),
          Value.map(ctrl.isActive, a =>
            a ? 'Progress bar is active — look at the top of the page.' : 'Click Start to begin.'
          ) as Value<string>
        ),
        ControlButtons(ctrl)
      )
    }),
    sections: [
      Section(
        'Basic Start / Done',
        () => {
          const [bar, ctrl] = NavigationProgress({})
          return html.div(
            attr.class('flex flex-col gap-4 w-full'),
            bar,
            html.div(
              attr.class('flex gap-2'),
              Button(
                { variant: 'filled', color: 'primary', onClick: () => ctrl.start() },
                'Start Loading'
              ),
              Button(
                { variant: 'filled', color: 'success', onClick: () => ctrl.done() },
                'Complete'
              )
            )
          )
        },
        'Call start() to begin and done() to finish. The bar auto-increments and smoothly completes.'
      ),
      Section(
        'Manual Progress Control',
        () => {
          const [bar, ctrl] = NavigationProgress({ color: 'info' })
          const currentValue = prop(0)
          return html.div(
            attr.class('flex flex-col gap-4 w-full'),
            bar,
            html.div(
              attr.class('flex items-center gap-4'),
              html.input(
                attr.type('range'),
                attr.min(0),
                attr.max(100),
                attr.value('0'),
                attr.class('flex-1'),
                on.input((e) => {
                  const v = Number((e.target as HTMLInputElement).value)
                  currentValue.set(v)
                  ctrl.set(v)
                })
              ),
              html.span(
                attr.class('text-sm font-mono w-12 text-right'),
                Value.map(currentValue, v => `${v}%`) as Value<string>
              )
            )
          )
        },
        'Use set(value) to manually control progress from 0 to 100.'
      ),
      Section(
        'Trickle Speed',
        () => {
          const [barFast, ctrlFast] = NavigationProgress({ trickleSpeed: 100, color: 'warning' })
          const [barSlow, ctrlSlow] = NavigationProgress({ trickleSpeed: 500, color: 'info' })
          return html.div(
            attr.class('flex flex-col gap-4 w-full'),
            barFast,
            barSlow,
            Stack(
              attr.class('gap-3'),
              html.div(
                attr.class('flex gap-2 items-center'),
                html.span(attr.class('text-sm w-32'), 'Fast (100ms):'),
                Button(
                  { variant: 'outline', size: 'sm', onClick: () => ctrlFast.start() },
                  'Start'
                ),
                Button(
                  { variant: 'outline', size: 'sm', onClick: () => ctrlFast.done() },
                  'Done'
                )
              ),
              html.div(
                attr.class('flex gap-2 items-center'),
                html.span(attr.class('text-sm w-32'), 'Slow (500ms):'),
                Button(
                  { variant: 'outline', size: 'sm', onClick: () => ctrlSlow.start() },
                  'Start'
                ),
                Button(
                  { variant: 'outline', size: 'sm', onClick: () => ctrlSlow.done() },
                  'Done'
                )
              )
            )
          )
        },
        'Adjust trickleSpeed to control how fast the bar auto-increments.'
      ),
      Section(
        'Custom Styling',
        () => {
          const colors = ['primary', 'success', 'warning', 'danger', 'info'] as const
          const controllers: NavigationProgressController[] = []
          const bars: ReturnType<typeof NavigationProgress>[0][] = []

          for (const color of colors) {
            const [bar, ctrl] = NavigationProgress({ color, height: 4 })
            bars.push(bar)
            controllers.push(ctrl)
          }

          return html.div(
            attr.class('flex flex-col gap-4 w-full'),
            ...bars,
            html.div(
              attr.class('flex flex-wrap gap-2'),
              ...colors.map((color, i) =>
                Button(
                  {
                    variant: 'filled',
                    color,
                    size: 'sm',
                    onClick: () => {
                      controllers[i].start()
                      setTimeout(() => controllers[i].done(), 2000)
                    },
                  },
                  color
                )
              )
            )
          )
        },
        'Use the color and height props to customize appearance.'
      ),
      Section(
        'Spinner Indicator',
        () => {
          const [bar, ctrl] = NavigationProgress({ showSpinner: true, color: 'primary' })
          return html.div(
            attr.class('flex flex-col gap-4 w-full'),
            bar,
            html.p(
              attr.class('text-sm text-gray-500'),
              'A spinner appears in the top-right corner alongside the progress bar.'
            ),
            html.div(
              attr.class('flex gap-2'),
              Button(
                { variant: 'filled', color: 'primary', onClick: () => ctrl.start() },
                'Start with Spinner'
              ),
              Button(
                { variant: 'outline', onClick: () => ctrl.done() },
                'Done'
              )
            )
          )
        },
        'Enable showSpinner to display a circular spinner indicator alongside the progress bar.'
      ),
    ],
  })
}

import { AdvancedSlider } from '@tempots/beatui'
import { html, attr, prop, type Prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'AdvancedSlider',
  category: 'Specialized Inputs',
  component: 'AdvancedSlider',
  description: 'An advanced slider supporting single value, range selection, and multi-point modes with tick marks, value labels, and customizable theme colors.',
  icon: 'lucide:sliders-vertical',
  order: 15,
}

export default function AdvancedSliderPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('AdvancedSlider', signals => {
      const value = signals.value as Prop<number>
      return AdvancedSlider({
        ...signals,
        value,
        onChange: (v: number) => value.set(v),
      } as never)
    }),
    sections: [
      ...AutoSections('AdvancedSlider', props =>
        AdvancedSlider({ ...props, value: 50, onChange: () => {} } as never)
      ),
      Section(
        'Single Value',
        () => {
          const value = prop(40)
          return html.div(
            attr.class('flex flex-col gap-2 w-full max-w-md'),
            AdvancedSlider({
              value,
              onChange: value.set,
              min: 0,
              max: 100,
              showValue: true,
            })
          )
        },
        'The basic single-thumb slider. Pass value and onChange for a controlled input.'
      ),
      Section(
        'Range Mode',
        () => {
          const range = prop<[number, number]>([20, 75])
          return html.div(
            attr.class('flex flex-col gap-2 w-full max-w-md'),
            AdvancedSlider({
              range,
              onRangeChange: range.set,
              min: 0,
              max: 100,
              showValue: true,
            })
          )
        },
        'Pass range and onRangeChange to render two thumbs for selecting a low and high value.'
      ),
      Section(
        'Multi-Point Mode',
        () => {
          const points = prop([10, 40, 70])
          return html.div(
            attr.class('flex flex-col gap-2 w-full max-w-md'),
            AdvancedSlider({
              points,
              onPointsChange: points.set,
              min: 0,
              max: 100,
              showValue: true,
              color: 'success',
            })
          )
        },
        'Pass points and onPointsChange to render an arbitrary number of thumbs. The thumb count is fixed at creation time.'
      ),
      Section(
        'Tick Marks',
        () =>
          html.div(
            attr.class('flex flex-col gap-6 w-full max-w-md'),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-3'), 'Automatic ticks (ticks: true)'),
              AdvancedSlider({
                value: 50,
                onChange: () => {},
                min: 0,
                max: 100,
                step: 10,
                ticks: true,
                showValue: true,
              })
            ),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-3'), 'Custom ticks with labels'),
              AdvancedSlider({
                value: 50,
                onChange: () => {},
                min: 0,
                max: 100,
                ticks: [
                  { value: 0, label: 'Low' },
                  { value: 50, label: 'Mid' },
                  { value: 100, label: 'High' },
                ],
                showValue: true,
              })
            )
          ),
        'Use ticks: true for automatic step-based tick marks, or pass an array of SliderTick objects for custom labels.'
      ),
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-col gap-4 w-full max-w-md'),
            ...(['primary', 'success', 'danger', 'warning', 'info'] as const).map(color =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), color),
                AdvancedSlider({
                  value: 60,
                  onChange: () => {},
                  min: 0,
                  max: 100,
                  color,
                  showValue: true,
                })
              )
            )
          ),
        'The color prop controls the filled track and thumb color.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-4 w-full max-w-md'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                AdvancedSlider({
                  value: 50,
                  onChange: () => {},
                  min: 0,
                  max: 100,
                  size,
                  showValue: true,
                })
              )
            )
          ),
        'AdvancedSlider is available in five sizes.'
      ),
      Section(
        'Custom Value Format',
        () =>
          html.div(
            attr.class('flex flex-col gap-4 w-full max-w-md'),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'Currency'),
              AdvancedSlider({
                value: 250,
                onChange: () => {},
                min: 0,
                max: 1000,
                step: 10,
                showValue: true,
                formatValue: (v: number) => `$${v}`,
              })
            ),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'Percentage'),
              AdvancedSlider({
                value: 75,
                onChange: () => {},
                min: 0,
                max: 100,
                showValue: true,
                formatValue: (v: number) => `${v}%`,
              })
            )
          ),
        'Use formatValue to customize how the value label is displayed above each thumb.'
      ),
      Section(
        'Segment Colors (Multi-Point)',
        () => {
          const points = prop([25, 60])
          return html.div(
            attr.class('flex flex-col gap-2 w-full max-w-md'),
            AdvancedSlider({
              points,
              onPointsChange: points.set,
              min: 0,
              max: 100,
              showValue: true,
              segmentColors: ['success', 'warning'],
            })
          )
        },
        'In multi-point mode, use segmentColors to color individual track segments between consecutive thumbs.'
      ),
      Section(
        'Disabled',
        () =>
          html.div(
            attr.class('flex flex-col gap-4 w-full max-w-md'),
            AdvancedSlider({
              value: 60,
              onChange: () => {},
              min: 0,
              max: 100,
              disabled: true,
              showValue: true,
            })
          ),
        'A disabled slider renders with reduced opacity and ignores all pointer and keyboard interactions.'
      ),
    ],
  })
}

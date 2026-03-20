import { RangeSlider } from '@tempots/beatui'
import { html, attr, prop, MapSignal, Value, type Prop } from '@tempots/dom'
import {
  ComponentPage,
  manualPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'RangeSlider',
  category: 'Inputs',
  component: 'RangeSlider',
  description:
    'A range slider supporting single-value, dual-thumb range, and multi-point modes with customizable thumbs, segment styles, tick marks, and keyboard accessibility.',
  icon: 'lucide:git-commit-horizontal',
  order: 16,
}

export default function RangeSliderPage() {
  return ComponentPage(meta, {
    playground: manualPlayground(
      'RangeSlider',
      signals => {
        const value = signals.value as Prop<number>
        const orientation = signals.orientation as Value<string>
        // Re-mount component when orientation changes (it's read once at creation)
        return MapSignal(orientation, (o: string) =>
          html.div(
            attr.style(
              o === 'vertical' ? 'height: 250px' : 'width: 100%'
            ),
            RangeSlider({
              ...signals,
              value,
              orientation: o as 'horizontal' | 'vertical',
              onChange: (v: number) => value.set(v),
            })
          )
        )
      },
      {
        defaults: {
          value: 50,
          min: 0,
          max: 100,
          step: 1,
          showValue: true,
          orientation: 'horizontal',
        },
      }
    ),
    sections: [
      ...AutoSections('RangeSlider', props =>
        RangeSlider({ ...props, value: 50, onChange: () => {} })
      ),
      Section(
        'Single Value',
        () => {
          const value = prop(40)
          return html.div(
            attr.class('flex flex-col gap-2 w-full max-w-md'),
            RangeSlider({
              value,
              onChange: value.set,
              min: 0,
              max: 100,
              showValue: true,
            })
          )
        },
        'A basic single-thumb slider. Pass value and onChange for a controlled input.'
      ),
      Section(
        'Dual-Thumb Range',
        () => {
          const range = prop<[number, number]>([20, 75])
          return html.div(
            attr.class('flex flex-col gap-2 w-full max-w-md'),
            RangeSlider({
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
            RangeSlider({
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
        'Vertical Orientation',
        () => {
          const value = prop(60)
          const range = prop<[number, number]>([25, 75])
          return html.div(
            attr.class('flex gap-8 items-start'),
            html.div(
              attr.class('flex flex-col items-center gap-1'),
              html.div(attr.class('text-xs font-mono text-gray-500'), 'Single'),
              html.div(
                attr.style('height: 250px'),
                RangeSlider({
                  value,
                  onChange: value.set,
                  min: 0,
                  max: 100,
                  showValue: true,
                  orientation: 'vertical',
                })
              )
            ),
            html.div(
              attr.class('flex flex-col items-center gap-1'),
              html.div(attr.class('text-xs font-mono text-gray-500'), 'Range'),
              html.div(
                attr.style('height: 250px'),
                RangeSlider({
                  range,
                  onRangeChange: range.set,
                  min: 0,
                  max: 100,
                  showValue: true,
                  orientation: 'vertical',
                  color: 'success',
                })
              )
            )
          )
        },
        'Set orientation to "vertical" for a vertical slider. The container must have a defined height.'
      ),
      Section(
        'Custom Thumbs',
        () => {
          const range = prop<[number, number]>([30, 70])
          return html.div(
            attr.class('flex flex-col gap-2 w-full max-w-md'),
            RangeSlider({
              range,
              onRangeChange: range.set,
              min: 0,
              max: 100,
              showValue: true,
              renderThumb: (index: number) =>
                html.span(
                  attr.style(
                    'font-size: 1.2em; line-height: 1; pointer-events: none;'
                  ),
                  index === 0 ? '\u25C0' : '\u25B6'
                ),
            })
          )
        },
        'Use renderThumb to replace the default circular thumb with custom content like icons or symbols.'
      ),
      Section(
        'Segment Styles',
        () => {
          const range = prop<[number, number]>([25, 75])
          return html.div(
            attr.class('flex flex-col gap-2 w-full max-w-md'),
            RangeSlider({
              range,
              onRangeChange: range.set,
              min: 0,
              max: 100,
              showValue: true,
              segmentStyles: [
                { color: 'danger', pattern: 'dashed' },
                { color: 'success' },
                { color: 'warning', pattern: 'dotted' },
              ],
            })
          )
        },
        'Use segmentStyles to customize the color and pattern of individual track segments. For range mode: before-low, between-thumbs, after-high.'
      ),
      Section(
        'Segment Styles (Multi-Point)',
        () => {
          const points = prop([25, 60])
          return html.div(
            attr.class('flex flex-col gap-2 w-full max-w-md'),
            RangeSlider({
              points,
              onPointsChange: points.set,
              min: 0,
              max: 100,
              showValue: true,
              segmentStyles: [
                { color: 'danger' },
                { color: 'success' },
                { color: 'warning' },
              ],
            })
          )
        },
        'In multi-point mode, segmentStyles colors individual segments between the sorted thumb boundaries (including before-first and after-last).'
      ),
      Section(
        'Tick Marks',
        () =>
          html.div(
            attr.class('flex flex-col gap-6 w-full max-w-md'),
            html.div(
              html.div(
                attr.class('text-xs font-mono text-gray-500 mb-3'),
                'Automatic ticks (ticks: true)'
              ),
              RangeSlider({
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
              html.div(
                attr.class('text-xs font-mono text-gray-500 mb-3'),
                'Custom ticks with labels'
              ),
              RangeSlider({
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
        'Use ticks: true for automatic step-based tick marks, or pass an array of RangeSliderTick objects for custom labels.'
      ),
      Section(
        'Markers',
        () =>
          html.div(
            attr.class('flex flex-col gap-6 w-full max-w-md'),
            html.div(
              html.div(
                attr.class('text-xs font-mono text-gray-500 mb-3'),
                'Automatic markers (markers: true)'
              ),
              RangeSlider({
                value: 50,
                onChange: () => {},
                min: 0,
                max: 100,
                step: 20,
                markers: true,
                showValue: true,
              })
            ),
            html.div(
              html.div(
                attr.class('text-xs font-mono text-gray-500 mb-3'),
                'Custom markers with labels'
              ),
              RangeSlider({
                value: 50,
                onChange: () => {},
                min: 0,
                max: 100,
                markers: [
                  { value: 0, label: '0%' },
                  { value: 20, label: '20%' },
                  { value: 50, label: '50%' },
                  { value: 80, label: '80%' },
                  { value: 100, label: '100%' },
                ],
                showValue: true,
              })
            ),
            html.div(
              html.div(
                attr.class('text-xs font-mono text-gray-500 mb-3'),
                'Markers with ticks combined'
              ),
              RangeSlider({
                value: 50,
                onChange: () => {},
                min: 0,
                max: 100,
                step: 25,
                ticks: true,
                markers: [
                  { value: 0, label: '0%' },
                  { value: 50, label: '50%' },
                  { value: 100, label: '100%' },
                ],
                showValue: true,
              })
            )
          ),
        'Markers are small dots rendered on the track surface. Use markers: true for automatic step-based dots, or pass an array of RangeSliderMarker objects with optional labels. Markers can be combined with ticks.'
      ),
      Section(
        'Custom Value Format',
        () =>
          html.div(
            attr.class('flex flex-col gap-4 w-full max-w-md'),
            html.div(
              html.div(
                attr.class('text-xs font-mono text-gray-500 mb-1'),
                'Currency'
              ),
              RangeSlider({
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
              html.div(
                attr.class('text-xs font-mono text-gray-500 mb-1'),
                'Percentage'
              ),
              RangeSlider({
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
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-col gap-4 w-full max-w-md'),
            ...(['primary', 'success', 'danger', 'warning', 'info'] as const).map(
              color =>
                html.div(
                  html.div(
                    attr.class('text-xs font-mono text-gray-500 mb-1'),
                    color
                  ),
                  RangeSlider({
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
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-1'),
                  size
                ),
                RangeSlider({
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
        'RangeSlider is available in five sizes.'
      ),
      Section(
        'Disabled',
        () =>
          html.div(
            attr.class('flex flex-col gap-4 w-full max-w-md'),
            RangeSlider({
              value: 60,
              onChange: () => {},
              min: 0,
              max: 100,
              disabled: true,
              showValue: true,
            })
          ),
        'A disabled slider renders with reduced opacity and ignores all interactions.'
      ),
      Section(
        'Readonly',
        () =>
          html.div(
            attr.class('flex flex-col gap-4 w-full max-w-md'),
            RangeSlider({
              range: [30, 80],
              onRangeChange: () => {},
              min: 0,
              max: 100,
              readonly: true,
              showValue: true,
            })
          ),
        'A readonly slider displays values but cannot be changed. Unlike disabled, it maintains full visual contrast.'
      ),
    ],
  })
}

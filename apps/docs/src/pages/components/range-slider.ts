import { RangeSlider } from '@tempots/beatui'
import { html, attr, prop, type Prop } from '@tempots/dom'
import {
  ComponentPage,
  manualPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'RangeSlider',
  category: 'Specialized Inputs',
  component: 'RangeSlider',
  description:
    'A range slider supporting single-value and dual-thumb range selection with vertical/horizontal orientation, customizable thumbs and segment styles, tick marks, and keyboard accessibility.',
  icon: 'lucide:git-commit-horizontal',
  order: 16,
}

export default function RangeSliderPage() {
  return ComponentPage(meta, {
    playground: manualPlayground(
      'RangeSlider',
      signals => {
        const value = signals.value as Prop<number>
        return RangeSlider({
          ...signals,
          value,
          onChange: (v: number) => value.set(v),
        })
      },
      {
        defaults: {
          value: 50,
          min: 0,
          max: 100,
          step: 1,
          showValue: true,
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
        'Vertical Orientation',
        () => {
          const value = prop(60)
          const range = prop<[number, number]>([30, 70])
          return html.div(
            attr.class('flex gap-8 items-start'),
            html.div(
              attr.style('height: 200px'),
              RangeSlider({
                value,
                onChange: value.set,
                orientation: 'vertical',
                min: 0,
                max: 100,
                showValue: true,
              })
            ),
            html.div(
              attr.style('height: 200px'),
              RangeSlider({
                range,
                onRangeChange: range.set,
                orientation: 'vertical',
                min: 0,
                max: 100,
                showValue: true,
                color: 'success',
              })
            )
          )
        },
        'Set orientation to "vertical" for a vertical slider. The container must have a defined height.'
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

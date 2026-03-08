import { ColorSwatchInput } from '@tempots/beatui'
import { html, attr, type Prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'ColorSwatchInput',
  category: 'Dropdowns',
  component: 'ColorSwatchInput',
  description:
    'A color picker that renders a unique organic SVG blob swatch for each color. Supports alpha channel control and multiple color format outputs.',
  icon: 'lucide:droplets',
  order: 12,
}

export default function ColorSwatchInputPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('ColorSwatchInput', signals => {
      const value = signals.value as Prop<string>
      return ColorSwatchInput({
        ...signals,
        value,
        onChange: (v: string) => value.set(v),
        onInput: (v: string) => value.set(v),
      })
    }),
    sections: [
      ...AutoSections('ColorSwatchInput', props =>
        ColorSwatchInput({ ...props, value: '#3498db' })
      ),
      Section(
        'Display Value',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4'),
            ...['#e74c3c', '#2ecc71', '#3498db', '#9b59b6', '#f39c12'].map(color =>
              ColorSwatchInput({
                value: color,
                onChange: () => {},
                displayValue: true,
              })
            )
          ),
        'Enable displayValue to show the formatted color text alongside the blob swatch.'
      ),
      Section(
        'Color Formats',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            ...(['hex', 'rgb', 'hsl', 'hwb', 'oklch'] as const).map(fmt =>
              html.div(
                attr.class('flex items-center gap-3'),
                html.div(attr.class('text-xs font-mono text-gray-500 w-14'), fmt),
                ColorSwatchInput({
                  value: '#3498db',
                  onChange: () => {},
                  displayValue: true,
                  colorTextFormat: fmt,
                })
              )
            )
          ),
        'Use colorTextFormat to control both the displayed label and the emitted value format.'
      ),
      Section(
        'With Alpha Channel',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4'),
            ColorSwatchInput({
              value: '#e74c3c',
              onChange: () => {},
              withAlpha: true,
              displayValue: true,
              colorTextFormat: 'rgb',
            }),
            ColorSwatchInput({
              value: '#2ecc71',
              onChange: () => {},
              withAlpha: true,
              displayValue: true,
              colorTextFormat: 'hsl',
            })
          ),
        'Enable withAlpha to show an opacity slider below the swatch for transparent color support.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-wrap items-end gap-4'),
            ...[20, 28, 36, 48, 64].map(size =>
              html.div(
                attr.class('flex flex-col items-center gap-2'),
                html.div(attr.class('text-xs font-mono text-gray-500'), `${size}px`),
                ColorSwatchInput({
                  value: '#3498db',
                  onChange: () => {},
                  swatchSize: size,
                })
              )
            )
          ),
        'The size prop controls the width and height of the blob swatch in pixels.'
      ),
      Section(
        'States',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4'),
            html.div(
              attr.class('flex flex-col items-center gap-1'),
              html.div(attr.class('text-xs font-mono text-gray-500'), 'Default'),
              ColorSwatchInput({ value: '#3498db', onChange: () => {} })
            ),
            html.div(
              attr.class('flex flex-col items-center gap-1'),
              html.div(attr.class('text-xs font-mono text-gray-500'), 'Disabled'),
              ColorSwatchInput({ value: '#3498db', onChange: () => {}, disabled: true })
            )
          ),
        'ColorSwatchInput supports a disabled state that prevents interaction.'
      ),
    ],
  })
}

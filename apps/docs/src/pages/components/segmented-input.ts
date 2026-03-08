import { SegmentedInput } from '@tempots/beatui'
import { html, attr, prop, type Prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'SegmentedInput',
  category: 'Selection',
  component: 'SegmentedInput',
  description:
    'A segmented control for selecting one option from a set, with an animated sliding indicator.',
  icon: 'lucide:layout-list',
  order: 6,
}

const sampleOptions = {
  a: 'Option A',
  b: 'Option B',
  c: 'Option C',
}

export default function SegmentedInputPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('SegmentedInput', signals => {
      const value = signals.value as Prop<string>
      return SegmentedInput({
        ...signals,
        options: sampleOptions,
        value,
        onChange: (v: string) => value.set(v),
      })
    }),
    sections: [
      ...AutoSections('SegmentedInput', props =>
        SegmentedInput({
          ...props,
          options: sampleOptions,
          value: 'a',
        })
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-4'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => {
              const value = prop<'a' | 'b' | 'c'>('a')
              return html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                SegmentedInput({
                  options: sampleOptions,
                  value,
                  onChange: (v: string) => value.set(v as 'a' | 'b' | 'c'),
                  size,
                })
              )
            })
          ),
        'SegmentedInput supports five size variants.'
      ),
      Section(
        'Squared Variant',
        () => {
          const value = prop<'a' | 'b' | 'c'>('b')
          return SegmentedInput({
            options: sampleOptions,
            value,
            onChange: (v: string) => value.set(v as 'a' | 'b' | 'c'),
            variant: 'squared',
          })
        },
        'The squared variant matches the height of standard inputs like TextInput.'
      ),
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-col gap-4'),
            ...(['primary', 'success', 'danger', 'warning'] as const).map(color => {
              const value = prop<'a' | 'b' | 'c'>('a')
              return html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), color),
                SegmentedInput({
                  options: sampleOptions,
                  value,
                  onChange: (v: string) => value.set(v as 'a' | 'b' | 'c'),
                  color,
                })
              )
            })
          ),
        'Theme colors can be applied to the active segment indicator.'
      ),
    ],
  })
}

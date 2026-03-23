import { SegmentedSelect, Option } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'SegmentedSelect',
  category: 'Inputs',
  component: 'SegmentedSelect',
  description:
    'A segmented control that selects from typed option values, combining the visual style of SegmentedInput with the option model of NativeSelect.',
  icon: 'lucide:columns-3',
  order: 3,
}

export default function SegmentedSelectPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('SegmentedSelect', signals => {
      const value = prop('list')
      return SegmentedSelect<string>({
        ...signals,
        options: [
          Option.value('list', 'List'),
          Option.value('grid', 'Grid'),
          Option.value('table', 'Table'),
        ],
        value,
        onChange: v => value.set(v),
      })
    }),
    sections: [
      Section(
        'Basic Usage',
        () => {
          const view = prop('list')
          return SegmentedSelect({
            options: [
              Option.value('list', 'List'),
              Option.value('grid', 'Grid'),
              Option.value('table', 'Table'),
            ],
            value: view,
            onChange: v => view.set(v),
          })
        },
        'Select from typed string values using the same `Option.value()` factory as NativeSelect and DropdownInput.'
      ),
      Section(
        'With Disabled Options',
        () => {
          const status = prop('active')
          return SegmentedSelect({
            options: [
              Option.value('active', 'Active'),
              Option.value('inactive', 'Inactive'),
              Option.value('archived', 'Archived', { disabled: true }),
            ],
            value: status,
            onChange: v => status.set(v),
          })
        },
        'Individual options can be disabled while the rest remain interactive.'
      ),
      Section(
        'Squared Variant',
        () => {
          const value = prop('monthly')
          return SegmentedSelect({
            options: [
              Option.value('monthly', 'Monthly'),
              Option.value('quarterly', 'Quarterly'),
              Option.value('yearly', 'Yearly'),
            ],
            value,
            onChange: v => value.set(v),
            variant: 'squared',
          })
        },
        'The `squared` variant matches the height and border-radius of standard form inputs.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => {
              const value = prop('a')
              return html.div(
                html.div(
                  attr.class('text-xs font-mono text-gray-500 mb-1'),
                  size
                ),
                SegmentedSelect({
                  options: [
                    Option.value('a', 'Option A'),
                    Option.value('b', 'Option B'),
                    Option.value('c', 'Option C'),
                  ],
                  value,
                  onChange: v => value.set(v),
                  size,
                })
              )
            })
          ),
        'Available in five sizes.'
      ),
      Section(
        'With Color',
        () => {
          const value = prop('yes')
          return SegmentedSelect({
            options: [
              Option.value('yes', 'Yes'),
              Option.value('no', 'No'),
              Option.value('maybe', 'Maybe'),
            ],
            value,
            onChange: v => value.set(v),
            color: 'success',
          })
        },
        'Use the `color` prop to apply a themed color to the active indicator.'
      ),
    ],
  })
}

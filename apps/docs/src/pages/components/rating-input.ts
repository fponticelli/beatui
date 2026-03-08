import { RatingInput, NullableRatingInput } from '@tempots/beatui'
import { html, attr, prop, type Prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'RatingInput',
  category: 'Specialized Inputs',
  component: 'NullableRatingInput',
  description:
    'A star rating input with fractional precision, keyboard navigation, and customizable icons and colors.',
  icon: 'lucide:star',
  order: 15,
}

export default function RatingInputPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('NullableRatingInput', signals => {
      const value = signals.value as Prop<number | null>
      return NullableRatingInput({
        ...signals,
        value,
        onChange: (v: number | null) => value.set(v),
      } as never)
    }),
    sections: [
      ...AutoSections('NullableRatingInput', props =>
        RatingInput({ ...props, value: 3, max: 5 } as never)
      ),
      Section(
        'Basic Rating',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            ...[1, 2, 3, 4, 5].map(v => {
              const value = prop<number>(v)
              return html.div(
                attr.class('flex items-center gap-3'),
                RatingInput({ value, onChange: (n: number) => value.set(n), max: 5 }),
                html.span(attr.class('text-xs font-mono text-gray-500'), `${v} / 5`)
              )
            })
          ),
        'Click on a star to set the rating value. The fill level reflects the current value.'
      ),
      Section(
        'Fractional Precision',
        () => {
          const value = prop(2.5)
          return html.div(
            attr.class('flex flex-col gap-2'),
            RatingInput({
              value,
              onChange: (v: number) => value.set(v),
              max: 5,
              rounding: 0.5,
            }),
            html.div(
              attr.class('text-xs text-gray-500'),
              value.map(v => `Value: ${v} (rounding: 0.5)`)
            )
          )
        },
        'Set rounding to 0.5 for half-star precision or 0.25 for quarter-star precision.'
      ),
      Section(
        'Custom Max',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'max: 10'),
              RatingInput({ value: 7, max: 10, onChange: () => {} })
            ),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'max: 3'),
              RatingInput({ value: 2, max: 3, onChange: () => {} })
            )
          ),
        'Use the max prop to set a custom maximum number of rating icons.'
      ),
      Section(
        'Custom Icons and Colors',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'Hearts (mdi:heart)'),
              RatingInput({
                value: 3,
                max: 5,
                onChange: () => {},
                activeIcon: 'mdi:heart',
                inactiveIcon: 'mdi:heart-outline',
                fullColor: 'red',
              })
            ),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'Thumbs up'),
              RatingInput({
                value: 4,
                max: 5,
                onChange: () => {},
                activeIcon: 'mdi:thumb-up',
                inactiveIcon: 'mdi:thumb-up-outline',
                fullColor: 'blue',
              })
            )
          ),
        'Customize the icons and colors using activeIcon, inactiveIcon, fullColor, and emptyColor props.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                attr.class('flex items-center gap-3'),
                html.div(attr.class('text-xs font-mono text-gray-500 w-6'), size),
                RatingInput({ value: 3, max: 5, onChange: () => {}, size })
              )
            )
          ),
        'RatingInput is available in five sizes.'
      ),
      Section(
        'States',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'Default'),
              RatingInput({ value: 3, max: 5, onChange: () => {} })
            ),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'Disabled'),
              RatingInput({ value: 3, max: 5, onChange: () => {}, disabled: true })
            )
          ),
        'RatingInput supports a disabled state which prevents interaction.'
      ),
      Section(
        'Nullable Rating',
        () => {
          const value = prop<number | null>(null)
          return html.div(
            attr.class('flex flex-col gap-2'),
            NullableRatingInput({
              value,
              onChange: (v: number | null) => value.set(v),
              max: 5,
            }),
            html.div(
              attr.class('text-xs text-gray-500'),
              value.map(v => (v == null ? 'Value: null (no rating)' : `Value: ${v}`))
            )
          )
        },
        'NullableRatingInput supports null as a valid value representing no rating, with a reset button to clear the selection.'
      ),
    ],
  })
}

import { html, attr, prop, Value } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, RadioGroup } from '@tempots/beatui'

export default function RadioGroupPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-4 p-4 h-full overflow-auto'),

      // Basic radio group
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-xl font-semibold'), 'RadioGroup – Basic'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Select one option from a list of mutually exclusive choices.'
          ),
          (() => {
            const selected = prop<string>('option1')
            return html.div(
              attr.class('space-y-3'),
              RadioGroup({
                options: [
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ],
                value: selected,
                onChange: selected.set,
              }),
              html.p(
                attr.class('text-sm text-gray-600 dark:text-gray-400'),
                'Selected: ',
                html.span(
                  attr.class('font-medium'),
                  Value.map(selected, v => v)
                )
              )
            )
          })()
        )
      ),

      // With descriptions
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'With Descriptions'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Add descriptions to provide more context for each option.'
          ),
          (() => {
            const plan = prop<string>('basic')
            return RadioGroup({
              options: [
                {
                  value: 'basic',
                  label: 'Basic Plan',
                  description: '$10/month - Essential features for individuals',
                },
                {
                  value: 'pro',
                  label: 'Pro Plan',
                  description:
                    '$30/month - Advanced features for professionals',
                },
                {
                  value: 'enterprise',
                  label: 'Enterprise Plan',
                  description:
                    'Custom pricing - Full feature set with priority support',
                },
              ],
              value: plan,
              onChange: plan.set,
            })
          })()
        )
      ),

      // Orientation and sizes
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Orientation & Sizes'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Display options horizontally or vertically in different sizes.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Horizontal'),
              RadioGroup({
                options: [
                  { value: 'left', label: 'Left' },
                  { value: 'center', label: 'Center' },
                  { value: 'right', label: 'Right' },
                ],
                value: prop('center'),
                orientation: 'horizontal',
              })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Small size'),
              RadioGroup({
                options: [
                  { value: 'xs', label: 'Extra Small' },
                  { value: 'sm', label: 'Small' },
                  { value: 'md', label: 'Medium' },
                ],
                value: prop('md'),
                size: 'sm',
              })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), 'Large size'),
              RadioGroup({
                options: [
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'auto', label: 'Auto' },
                ],
                value: prop('light'),
                size: 'lg',
              })
            )
          )
        )
      ),

      // Disabled options
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Disabled Options'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Disable specific options or the entire radio group.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.p(
                attr.class('text-sm font-medium'),
                'Specific options disabled'
              ),
              RadioGroup({
                options: [
                  { value: 'available', label: 'Available' },
                  { value: 'comingsoon', label: 'Coming Soon', disabled: true },
                  { value: 'disabled', label: 'Not Available', disabled: true },
                ],
                value: prop('available'),
              })
            ),
            html.div(
              attr.class('space-y-2'),
              html.p(
                attr.class('text-sm font-medium'),
                'Entire group disabled'
              ),
              RadioGroup({
                options: [
                  { value: 'opt1', label: 'Option 1' },
                  { value: 'opt2', label: 'Option 2' },
                  { value: 'opt3', label: 'Option 3' },
                ],
                value: prop('opt1'),
                disabled: true,
              })
            )
          )
        )
      )
    ),
  })
}

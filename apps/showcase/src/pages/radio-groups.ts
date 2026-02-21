import { html, attr, prop, Value } from '@tempots/dom'
import {
  RadioGroup,
  SegmentedInput,
  InputWrapper,
  ControlSize,
} from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { ControlsHeader } from '../views/controls-header'
import { ControlSwitch } from '../views/control-helpers'
import { SectionBlock } from '../views/section'

export default function RadioGroupsPage() {
  const disabled = prop(false)

  const basic = prop('option1')
  const plan = prop('basic')
  const alignment = prop('center')

  return WidgetPage({
    id: 'radio-groups',
    title: 'Radio Groups',
    description:
      'Radio groups and segmented inputs for single-choice selection.',
    controls: ControlsHeader(ControlSwitch('Disabled', disabled)),
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

      // Basic radio group
      SectionBlock(
        'Basic Radio Group',
        RadioGroup({
          options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ],
          value: basic,
          onChange: v => basic.set(v),
          disabled,
        }),
        html.p(
          attr.class('text-sm text-gray-500 dark:text-gray-400'),
          'Selected: ',
          html.span(
            attr.class('font-medium'),
            Value.map(basic, v => v)
          )
        )
      ),

      // With descriptions
      SectionBlock(
        'With Descriptions',
        RadioGroup({
          options: [
            {
              value: 'basic',
              label: 'Basic Plan',
              description: '$10/month — Essential features',
            },
            {
              value: 'pro',
              label: 'Pro Plan',
              description: '$30/month — Advanced features',
            },
            {
              value: 'enterprise',
              label: 'Enterprise',
              description: 'Custom pricing — Full suite',
            },
          ],
          value: plan,
          onChange: v => plan.set(v),
          disabled,
        })
      ),

      // Orientation
      SectionBlock(
        'Horizontal Orientation',
        RadioGroup({
          options: [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ],
          value: alignment,
          onChange: v => alignment.set(v),
          orientation: 'horizontal',
          disabled,
        })
      ),

      // Sizes
      SectionBlock(
        'Sizes',
        html.div(
          attr.class('space-y-4'),
          ...(['sm', 'md', 'lg'] as ControlSize[]).map(sz =>
            html.div(
              attr.class('space-y-2'),
              html.p(attr.class('text-sm font-medium'), sz.toUpperCase()),
              RadioGroup({
                options: [
                  { value: 'a', label: 'Option A' },
                  { value: 'b', label: 'Option B' },
                ],
                value: prop('a'),
                size: sz,
                orientation: 'horizontal',
                disabled,
              })
            )
          )
        )
      ),

      // Segmented input
      SectionBlock(
        'Segmented Input',
        html.p(
          attr.class('text-sm text-gray-500 dark:text-gray-400'),
          'An alternative to radio groups for compact selections.'
        ),
        html.div(
          attr.class('space-y-4'),
          (() => {
            const seg = prop<'daily' | 'weekly' | 'monthly'>('daily')
            return InputWrapper({
              label: 'Frequency',
              content: SegmentedInput({
                options: {
                  daily: 'Daily',
                  weekly: 'Weekly',
                  monthly: 'Monthly',
                },
                value: seg,
                onChange: v => seg.set(v),
                disabled,
              }),
              description: seg.map((v): string => v),
            })
          })(),
          (() => {
            const view = prop<'list' | 'grid' | 'kanban'>('grid')
            return InputWrapper({
              label: 'View Mode',
              content: SegmentedInput({
                options: { list: 'List', grid: 'Grid', kanban: 'Kanban' },
                value: view,
                onChange: v => view.set(v),
                size: 'sm',
                disabled,
              }),
              description: view.map((v): string => v),
            })
          })()
        )
      ),

      // Disabled
      SectionBlock(
        'Disabled Options',
        RadioGroup({
          options: [
            { value: 'available', label: 'Available' },
            { value: 'coming-soon', label: 'Coming Soon', disabled: true },
            { value: 'unavailable', label: 'Not Available', disabled: true },
          ],
          value: prop('available'),
        })
      )
    ),
  })
}

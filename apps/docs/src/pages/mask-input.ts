import { html, attr, prop } from '@tempots/dom'
import {
  Card,
  Group,
  InputWrapper,
  MaskInput,
  Control,
  ScrollablePanel,
  Switch,
  useForm,
  Stack,
  TextInput,
} from '@tempots/beatui'
import { z } from 'zod/v4'
import { ControlsHeader } from '../elements/controls-header'

export default function MaskInputPage() {
  // Reactive controls for demo
  const showGuide = prop(true)
  const disabled = prop(false)

  // Basic reactive value
  const phone = prop('')

  // Form example
  const { controller } = useForm({
    schema: z.object({
      phone: z.string().min(10),
    }),
    initialValue: { phone: '' },
  })

  return ScrollablePanel({
    header: ControlsHeader('Mask Input'),
    body: Stack(
      attr.class('gap-4 p-4'),

      Card(
        {},
        Group(
          attr.class('gap-4 items-center'),
          Switch({
            value: showGuide,
            onChange: showGuide.set,
            label: 'Show guide (no-op placeholder demo)',
          }),
          Switch({ value: disabled, onChange: disabled.set, label: 'Disabled' })
        )
      ),

      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.h2(attr.class('text-xl font-semibold'), 'Static mask'),
          html.p(
            attr.class('text-gray-600-600'),
            'US phone number: (999) 999-9999'
          ),
          MaskInput({
            value: phone,
            disabled,
            placeholder: showGuide.map((v): string =>
              v ? '(123) 456-7890' : ''
            ),
            mask: '(999) 999-9999',
          })
        )
      ),

      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.h2(attr.class('text-xl font-semibold'), 'Dynamic mask'),
          html.p(
            attr.class('text-gray-600-600'),
            'Switch between 5-digit zip and SSN when length > 5'
          ),
          InputWrapper({
            label: 'Zip or SSN',
            content: MaskInput({
              value: phone,
              disabled,
              placeholder: showGuide.map((s): string =>
                s ? '999-99-9999 or 99999' : ''
              ),
              mask: raw => (raw.length <= 5 ? '99999' : '999-99-9999'),
            }),
          })
        )
      ),

      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.h2(attr.class('text-xl font-semibold'), 'Form integration'),
          html.form(
            attr.class('space-y-4'),
            Control(TextInput, {
              controller: controller.field('phone'),
              label: 'Name',
              placeholder: 'John Doe',
            }),
            Control(MaskInput, {
              controller: controller.field('phone'),
              label: 'Phone',
              placeholder: '(123) 456-7890',
              mask: '(999) 999-9999',
            })
          )
        )
      ),

      // Extra examples
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.h2(attr.class('text-xl font-semibold'), 'Date mask (MM/YY)'),
          MaskInput({
            value: prop(''),
            // Enforce valid month (01–12) using a dynamic mask so second digit depends on the first
            mask: raw => {
              const digits = raw.replace(/[^0-9]/g, '')
              const first = digits[0]
              const secondPattern = first === '0' ? /[1-9]/ : /[0-2]/
              return [
                { type: 'pattern', pattern: /[0-1]/ },
                { type: 'pattern', pattern: secondPattern },
                '/',
                '9',
                '9',
              ]
            },
            placeholder: 'MM/YY',
          })
        )
      ),

      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.h2(attr.class('text-xl font-semibold'), 'License plate'),
          MaskInput({
            value: prop(''),
            mask: 'AAA-999',
            placeholder: 'ABC-123',
          })
        )
      ),

      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.h2(
            attr.class('text-xl font-semibold'),
            'Custom token: hex color (#RRGGBB)'
          ),
          MaskInput({
            value: prop(''),
            mask: [
              '#',
              { type: 'pattern', pattern: /[0-9A-Fa-f]/ },
              { type: 'pattern', pattern: /[0-9A-Fa-f]/ },
              { type: 'pattern', pattern: /[0-9A-Fa-f]/ },
              { type: 'pattern', pattern: /[0-9A-Fa-f]/ },
              { type: 'pattern', pattern: /[0-9A-Fa-f]/ },
              { type: 'pattern', pattern: /[0-9A-Fa-f]/ },
            ],
            placeholder: '#A1B2C3',
          })
        )
      )
    ),
  })
}

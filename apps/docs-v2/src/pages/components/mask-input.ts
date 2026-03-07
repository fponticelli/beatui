import { MaskInput } from '@tempots/beatui'
import { html, attr, prop, type Prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'MaskInput',
  category: 'Text Inputs',
  component: 'MaskInput',
  description: 'A text input with configurable input masking. Supports static and dynamic masks, custom token definitions, cursor behavior, completion detection, and unmask strategies.',
  icon: 'lucide:shield-check',
  order: 11,
}

export default function MaskInputPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('MaskInput', signals => {
      const value = signals.value as Prop<string>
      return MaskInput({
        ...signals,
        value,
        onChange: (v: string) => value.set(v),
        onInput: (v: string) => value.set(v),
      } as never)
    }),
    sections: [
      ...AutoSections('MaskInput', props =>
        MaskInput({ ...props, value: '', mask: '(999) 999-9999' } as never)
      ),
      Section(
        'Common Masks',
        () =>
          html.div(
            attr.class('flex flex-col gap-4 max-w-sm'),
            ...[
              { label: 'Phone', mask: '(999) 999-9999', placeholder: '(___) ___-____' },
              { label: 'Date', mask: '99/99/9999', placeholder: 'MM/DD/YYYY' },
              { label: 'Credit Card', mask: '9999 9999 9999 9999', placeholder: '____ ____ ____ ____' },
              { label: 'ZIP Code', mask: '99999-9999', placeholder: '_____-____' },
            ].map(({ label, mask, placeholder }) =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), label),
                MaskInput({
                  value: '',
                  onChange: () => {},
                  mask,
                  placeholder,
                })
              )
            )
          ),
        'MaskInput ships with built-in token definitions: 9 for digits, A for uppercase letters, and * for any character.'
      ),
      Section(
        'Custom Token Definitions',
        () =>
          html.div(
            attr.class('flex flex-col gap-4 max-w-sm'),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'Hex color (#RRGGBB)'),
              MaskInput({
                value: '',
                onChange: () => {},
                mask: '#AAAAAA',
                definitions: {
                  A: { pattern: /^[0-9A-Fa-f]$/, transform: (c: string) => c.toUpperCase() },
                },
                placeholder: '#______',
              })
            ),
            html.div(
              html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), 'License plate (AA-9999)'),
              MaskInput({
                value: '',
                onChange: () => {},
                mask: 'AA-9999',
                placeholder: '__-____',
              })
            )
          ),
        'Pass a definitions object to map custom characters to regular expression patterns with optional transforms.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                MaskInput({
                  value: '',
                  onChange: () => {},
                  mask: '(999) 999-9999',
                  placeholder: '(___) ___-____',
                  size,
                })
              )
            )
          ),
        'MaskInput is available in five sizes.'
      ),
      Section(
        'States',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            MaskInput({
              value: '',
              onChange: () => {},
              mask: '(999) 999-9999',
              placeholder: 'Default',
            }),
            MaskInput({
              value: '',
              onChange: () => {},
              mask: '(999) 999-9999',
              disabled: true,
              placeholder: 'Disabled',
            }),
            MaskInput({
              value: '',
              onChange: () => {},
              mask: '(999) 999-9999',
              hasError: true,
              placeholder: 'Error',
            })
          ),
        'MaskInput supports disabled and error states.'
      ),
    ],
  })
}

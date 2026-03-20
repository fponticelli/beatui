import { PasswordInput } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'PasswordInput',
  category: 'Inputs',
  component: 'PasswordInput',
  description:
    'A password input with a built-in visibility toggle button, automatic autocomplete handling, and masked placeholder.',
  icon: 'lucide:lock',
  order: 5,
}

export default function PasswordInputPage() {
  return ComponentPage(meta, {
    playground: html.div(
      attr.class('max-w-sm'),
      PasswordInput({
        value: prop(''),
        onInput: () => {},
      })
    ),
    sections: [
      Section(
        'Toggle Visibility',
        () => {
          const value = prop('secret123')
          return html.div(
            attr.class('flex flex-col gap-2 max-w-sm'),
            PasswordInput({ value, onInput: (v: string) => value.set(v) }),
            html.p(
              attr.class('text-xs text-gray-500'),
              'Click the eye icon to toggle password visibility.'
            )
          )
        },
        'The built-in toggle switches between masked and plain text display, updating the autocomplete attribute accordingly.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                PasswordInput({ value: '', size })
              )
            )
          ),
        'PasswordInput is available in five sizes.'
      ),
      Section(
        'States',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            PasswordInput({ value: '' }),
            PasswordInput({ value: '', disabled: true, placeholder: 'Disabled' }),
            PasswordInput({ value: 'error', hasError: true })
          ),
        'Supports disabled and error states.'
      ),
    ],
  })
}

import { EmailInput } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'EmailInput',
  category: 'Text Inputs',
  component: 'EmailInput',
  description:
    'An email input with a default email icon, browser-native email validation, and autocomplete support.',
  icon: 'lucide:mail',
  order: 6,
}

export default function EmailInputPage() {
  return ComponentPage(meta, {
    playground: html.div(
      attr.class('max-w-sm'),
      EmailInput({
        value: prop(''),
        onInput: () => {},
      })
    ),
    sections: [
      Section(
        'With Default Icon',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            EmailInput({ value: '' }),
            EmailInput({ value: 'user@example.com' })
          ),
        'EmailInput renders an email icon in the before slot by default. The input type is set to "email" for browser-native validation.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                EmailInput({ value: '', size })
              )
            )
          ),
        'EmailInput is available in five sizes.'
      ),
      Section(
        'States',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            EmailInput({ value: '' }),
            EmailInput({ value: '', disabled: true, placeholder: 'Disabled' }),
            EmailInput({ value: 'invalid', hasError: true })
          ),
        'Supports disabled and error states.'
      ),
    ],
  })
}

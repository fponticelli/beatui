import { UrlInput } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ComponentPage, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'UrlInput',
  category: 'Text Inputs',
  component: 'UrlInput',
  description:
    'A URL input with browser-native URL validation via type="url".',
  icon: 'lucide:link',
  order: 7,
}

export default function UrlInputPage() {
  return ComponentPage(meta, {
    playground: html.div(
      attr.class('max-w-sm'),
      UrlInput({
        value: prop(''),
        onInput: () => {},
        placeholder: 'https://example.com',
      })
    ),
    sections: [
      Section(
        'Basic Usage',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            UrlInput({ value: '', placeholder: 'https://example.com' }),
            UrlInput({ value: 'https://beatui.dev' })
          ),
        'UrlInput renders a native type="url" input. The browser provides built-in URL format validation.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                UrlInput({ value: '', placeholder: 'https://...', size })
              )
            )
          ),
        'UrlInput is available in five sizes.'
      ),
      Section(
        'States',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            UrlInput({ value: '', placeholder: 'Default' }),
            UrlInput({ value: '', placeholder: 'Disabled', disabled: true }),
            UrlInput({ value: 'not-a-url', hasError: true })
          ),
        'Supports disabled and error states.'
      ),
    ],
  })
}

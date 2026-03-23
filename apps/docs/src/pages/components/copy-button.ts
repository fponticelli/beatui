import { CopyButton, TextInput, Field } from '@tempots/beatui'
import { html, attr, prop, Value } from '@tempots/dom'
import {
  ComponentPage,
  autoPlayground,
  AutoSections,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'CopyButton',
  category: 'Buttons',
  component: 'CopyButton',
  description:
    'A button that copies text to the clipboard with visual feedback. Shows a checkmark icon briefly after a successful copy.',
  icon: 'lucide:copy',
  order: 10,
}

export default function CopyButtonPage() {
  return ComponentPage(meta, {
    playground: autoPlayground(
      'CopyButton',
      props =>
        CopyButton({ ...props } as Record<string, Value<unknown>> & {
          text: Value<string>
        }),
      { childrenCode: '' }
    ),
    sections: [
      ...AutoSections('CopyButton', props =>
        CopyButton({ ...props, text: 'Sample text' })
      ),
      Section(
        'Basic',
        () =>
          html.div(
            attr.class('flex items-center gap-3'),
            html.code(
              attr.class(
                'px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono'
              ),
              'npm install @tempots/beatui'
            ),
            CopyButton({ text: 'npm install @tempots/beatui' })
          ),
        'Click the button to copy text. A checkmark appears briefly to confirm.'
      ),
      Section(
        'With Label',
        () =>
          html.div(
            attr.class('flex items-center gap-3'),
            CopyButton(
              { text: 'sk-abc123', variant: 'outline', color: 'primary' },
              'Copy Key'
            )
          ),
        'Pass children to add a text label alongside the icon.'
      ),
      Section(
        'Interactive',
        () => {
          const text = prop('Edit me, then copy!')
          return html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            Field({
              label: 'Text to copy',
              content: TextInput({ value: text, onChange: text.set }),
            }),
            html.div(
              attr.class('flex items-center gap-2'),
              html.span(attr.class('text-sm text-gray-500 font-mono'), text),
              CopyButton({ text })
            )
          )
        },
        'The text source is reactive — edit the field and copy the updated value.'
      ),
      Section(
        'Variants',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            ...(['subtle', 'outline', 'filled', 'light', 'text'] as const).map(
              variant =>
                html.div(
                  attr.class('flex flex-col items-center gap-1'),
                  CopyButton({
                    text: 'copied!',
                    variant,
                    color: 'primary',
                  }),
                  html.span(attr.class('text-xs text-gray-500'), variant)
                )
            )
          ),
        'Supports all standard button variants.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex items-center gap-3'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              CopyButton({ text: 'hello', size })
            )
          ),
        'Available in all standard sizes.'
      ),
    ],
  })
}

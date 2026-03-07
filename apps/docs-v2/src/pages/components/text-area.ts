import { TextArea } from '@tempots/beatui'
import { html, attr, prop, type Prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'TextArea',
  category: 'Text Inputs',
  component: 'TextArea',
  description: 'A multi-line text input with configurable row count, placeholder, and all standard input states.',
  icon: 'lucide:align-left',
  order: 13,
}

export default function TextAreaPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('TextArea', signals => {
      const value = signals.value as Prop<string>
      return TextArea({
        size: signals.size,
        disabled: signals.disabled,
        hasError: signals.hasError,
        placeholder: signals.placeholder,
        before: signals.before,
        after: signals.after,
        value,
        onInput: (v: string) => value.set(v),
      } as never)
    }),
    sections: [
      ...AutoSections('TextArea', props =>
        TextArea({ ...props, value: 'Sample text' } as never)
      ),
      Section(
        'Row Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            ...([2, 4, 6] as const).map(rows =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), `rows: ${rows}`),
                TextArea({
                  value: 'Sample text content',
                  rows,
                  placeholder: `${rows} rows`,
                })
              )
            )
          ),
        'Use the rows prop to control the visible height of the textarea.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-1'), size),
                TextArea({
                  value: '',
                  placeholder: `Size ${size}`,
                  size,
                  rows: 2,
                })
              )
            )
          ),
        'TextArea is available in five sizes.'
      ),
      Section(
        'States',
        () =>
          html.div(
            attr.class('flex flex-col gap-3 max-w-sm'),
            TextArea({ value: '', placeholder: 'Default', rows: 3 }),
            TextArea({ value: '', placeholder: 'Disabled', disabled: true, rows: 3 }),
            TextArea({ value: 'Error state content', hasError: true, rows: 3 }),
            TextArea({ value: 'Read only content', rows: 3 })
          ),
        'TextArea supports disabled, error, and read-only states.'
      ),
    ],
  })
}

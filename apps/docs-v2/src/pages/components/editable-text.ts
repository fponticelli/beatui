import { EditableText } from '@tempots/beatui'
import { html, attr, prop, type Prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, AutoSections, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'EditableText',
  category: 'Text Inputs',
  component: 'EditableText',
  description: 'An inline editable text that toggles between display and input modes on click.',
  icon: 'lucide:pencil-line',
  order: 12,
}

export default function EditableTextPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('EditableText', signals => {
      const value = signals.value as Prop<string>
      return EditableText({
        ...signals,
        value,
        onChange: (v: string) => value.set(v),
      } as never)
    }),
    sections: [
      ...AutoSections('EditableText', props =>
        EditableText({
          ...props,
          value: 'Editable text',
          onChange: () => {},
        } as never)
      ),
      Section(
        'With Placeholder',
        () => {
          const value = prop('')
          return EditableText({
            value,
            onChange: (v: string) => value.set(v),
            placeholder: 'Click to add a title...',
          })
        },
        'When the value is empty, a placeholder is shown in display mode.'
      ),
      Section(
        'Multiple Instances',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            ...[
              { initial: 'Project Name', placeholder: 'Enter project name' },
              { initial: 'Description', placeholder: 'Enter description' },
              { initial: '', placeholder: 'Add a note...' },
            ].map(({ initial, placeholder }) => {
              const value = prop(initial)
              return EditableText({ value, onChange: (v: string) => value.set(v), placeholder })
            })
          ),
        'Multiple independent editable text fields can coexist.'
      ),
      Section(
        'Disabled',
        () =>
          html.div(
            attr.class('flex flex-col gap-3'),
            EditableText({
              value: 'This text cannot be edited',
              onChange: () => {},
              disabled: true,
            })
          ),
        'Disabled EditableText does not respond to click events.'
      ),
      Section(
        'Start in Edit Mode',
        () => {
          const value = prop('Focused on mount')
          return EditableText({
            value,
            onChange: (v: string) => value.set(v),
            startEditing: true,
          })
        },
        'Pass startEditing to begin in edit mode immediately.'
      ),
    ],
  })
}

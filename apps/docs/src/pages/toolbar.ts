import { attr, html } from '@tempots/dom'
import {
  Stack,
  Icon,
  TextInput,
  NativeSelect,
  Option,
  SelectOption,
} from '@tempots/beatui'
import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarGroup,
  ToolbarSpacer,
} from '@tempots/beatui'

export default function ToolbarPage() {
  return Stack(
    attr.class('gap-6 p-6 items-start'),
    Toolbar(
      ToolbarGroup(
        ToolbarButton({}, Icon({ icon: 'mdi:home' }), html.span('Home')),
        ToolbarButton(
          {},
          Icon({ icon: 'mdi:file-document' }),
          html.span('File')
        ),
        ToolbarButton({}, Icon({ icon: 'mdi:content-copy' }), html.span('Copy'))
      ),
      ToolbarDivider(),
      ToolbarGroup(
        ToolbarButton({}, Icon({ icon: 'mdi:magnify' })),
        NativeSelect({
          options: [
            Option.value('apple', 'Apple'),
            Option.value('banana', 'Banana'),
            Option.value('cherry', 'Cherry'),
          ] as SelectOption<string>[],
          value: '',
          onChange: () => {},
        }),
        ToolbarButton({}, Icon({ icon: 'mdi:filter' }), html.span('Filter'))
      ),
      ToolbarSpacer(),
      TextInput({
        placeholder: 'Search...',
        value: '',
        after: Icon({ icon: 'mdi:magnify' }),
      }),
      ToolbarGroup(
        ToolbarButton({}, Icon({ icon: 'mdi:cog' }), html.span('Settings'))
      )
    ),
    Toolbar(
      ToolbarButton({}, Icon({ icon: 'mdi:format-bold' })),
      ToolbarButton({}, Icon({ icon: 'mdi:format-italic' })),
      ToolbarButton({}, Icon({ icon: 'mdi:format-underline' }))
    )
  )
}

import { attr, html } from '@tempots/dom'
import {
  Stack,
  Icon,
  TextInput,
  NativeSelect,
  SelectOption,
} from '@tempots/beatui'
import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarGroup,
  ToolbarSpacer,
} from '@tempots/beatui'

export const ToolbarPage = () =>
  Stack(
    attr.class('bu-gap-6 bu-p-6 bu-items-start'),
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
            SelectOption.value('apple', 'Apple'),
            SelectOption.value('banana', 'Banana'),
            SelectOption.value('cherry', 'Cherry'),
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

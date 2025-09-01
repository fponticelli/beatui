import {
  Button,
  Menu,
  MenuItem,
  MenuSeparator,
  Option,
  Stack,
  Label,
  Icon,
  NativeSelect,
  SelectOption,
  MenuTrigger,
  ScrollablePanel,
} from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ControlsHeader } from '../elements/controls-header'
import { Placement } from '@tempots/ui'

export const MenuPage = () => {
  const placement = prop<Placement>('bottom-start')
  const showOn = prop<MenuTrigger>('click')

  return ScrollablePanel({
    header: ControlsHeader(
      Stack(
        Label('Placement'),
        NativeSelect({
          options: [
            Option.value('top', 'Top'),
            Option.value('top-start', 'Top Start'),
            Option.value('top-end', 'Top End'),
            Option.value('right', 'Right'),
            Option.value('right-start', 'Right Start'),
            Option.value('right-end', 'Right End'),
            Option.value('bottom', 'Bottom'),
            Option.value('bottom-start', 'Bottom Start'),
            Option.value('bottom-end', 'Bottom End'),
            Option.value('left', 'Left'),
            Option.value('left-start', 'Left Start'),
            Option.value('left-end', 'Left End'),
          ] as SelectOption<Placement>[],
          value: placement,
          onChange: placement.set,
        })
      ),
      Stack(
        Label('Show On'),
        NativeSelect({
          options: [
            Option.value('click', 'Click'),
            Option.value('hover', 'Hover'),
            Option.value('hover-focus', 'Hover + Focus'),
          ] as SelectOption<MenuTrigger>[],
          value: showOn,
          onChange: showOn.set,
        })
      )
    ),
    body: Stack(
      attr.class('bu-gap-4 bu-p-4'),

      html.div(
        attr.class('bu-p-lg bu-space-y-lg'),

        // Basic Menu Example
        html.section(
          html.h2(
            attr.class('bu-text-xl bu-font-semibold bu-mb-md'),
            'Basic Menu'
          ),
          html.p(
            attr.class('bu-text-muted bu-mb-md'),
            'A simple menu with basic items and actions.'
          ),
          html.div(
            attr.class('bu-flex bu-gap-md bu-items-center'),
            Button(
              { onClick: () => {} },
              'Actions',
              Menu({
                items: () => [
                  MenuItem({
                    content: 'Edit',
                    startContent: Icon({ icon: 'line-md:edit' }),
                    onClick: () => alert('Edit clicked'),
                  }),
                  MenuItem({
                    content: 'Copy',
                    startContent: Icon({
                      icon: 'line-md:clipboard-arrow-twotone',
                    }),
                    onClick: () => alert('Copy clicked'),
                  }),
                  MenuItem({
                    content: 'Delete',
                    startContent: Icon({ icon: 'line-md:trash' }),
                    onClick: () => alert('Delete clicked'),
                  }),
                ],
                placement,
                showOn,
              })
            )
          )
        ),

        // Menu with Separators
        html.section(
          html.h2(
            attr.class('bu-text-xl bu-font-semibold bu-mb-md'),
            'Menu with Separators'
          ),
          html.p(
            attr.class('bu-text-muted bu-mb-md'),
            'Organize menu items into logical groups using separators.'
          ),
          html.div(
            attr.class('bu-flex bu-gap-md bu-items-center'),
            Button(
              { onClick: () => {} },
              'File',
              Menu({
                items: () => [
                  MenuItem({
                    content: 'New',
                    startContent: Icon({ icon: 'line-md:plus' }),
                    endContent: html.span(
                      attr.class('bu-text-xs bu-opacity-70'),
                      '⌘N'
                    ),
                  }),
                  MenuItem({
                    content: 'Open',
                    startContent: Icon({ icon: 'line-md:file-export-twotone' }),
                    endContent: html.span(
                      attr.class('bu-text-xs bu-opacity-70'),
                      '⌘O'
                    ),
                  }),
                  MenuSeparator(),
                  MenuItem({
                    content: 'Save',
                    startContent: Icon({ icon: 'line-md:file-download' }),
                    endContent: html.span(
                      attr.class('bu-text-xs bu-opacity-70'),
                      '⌘S'
                    ),
                  }),
                  MenuItem({
                    content: 'Save As...',
                    startContent: Icon({
                      icon: 'line-md:file-download-twotone',
                    }),
                    endContent: html.span(
                      attr.class('bu-text-xs bu-opacity-70'),
                      '⌘⇧S'
                    ),
                  }),
                  MenuSeparator(),
                  MenuItem({
                    content: 'Exit',
                    startContent: Icon({ icon: 'line-md:logout' }),
                    endContent: html.span(
                      attr.class('bu-text-xs bu-opacity-70'),
                      '⌘Q'
                    ),
                  }),
                ],
                placement,
                showOn,
              })
            )
          )
        ),

        // Menu with Disabled Items
        html.section(
          html.h2(
            attr.class('bu-text-xl bu-font-semibold bu-mb-md'),
            'Menu with Disabled Items'
          ),
          html.p(
            attr.class('bu-text-muted bu-mb-md'),
            'Some menu items can be disabled to indicate unavailable actions.'
          ),
          html.div(
            attr.class('bu-flex bu-gap-md bu-items-center'),
            Button(
              { onClick: () => {} },
              'Edit',
              Menu({
                items: () => [
                  MenuItem({
                    content: 'Undo',
                    endContent: html.span(
                      attr.class('bu-text-xs bu-opacity-70'),
                      '⌘Z'
                    ),
                    disabled: true,
                  }),
                  MenuItem({
                    content: 'Redo',
                    endContent: html.span(
                      attr.class('bu-text-xs bu-opacity-70'),
                      '⌘Y'
                    ),
                    disabled: true,
                  }),
                  MenuSeparator(),
                  MenuItem({
                    content: 'Cut',
                    endContent: html.span(
                      attr.class('bu-text-xs bu-opacity-70'),
                      '⌘X'
                    ),
                  }),
                  MenuItem({
                    content: 'Copy',
                    endContent: html.span(
                      attr.class('bu-text-xs bu-opacity-70'),
                      '⌘C'
                    ),
                  }),
                  MenuItem({
                    content: 'Paste',
                    endContent: html.span(
                      attr.class('bu-text-xs bu-opacity-70'),
                      '⌘V'
                    ),
                  }),
                ],
                placement,
                showOn,
              })
            )
          )
        ),

        // Submenu Example
        html.section(
          html.h2(
            attr.class('bu-text-xl bu-font-semibold bu-mb-md'),
            'Menu with Submenus'
          ),
          html.p(
            attr.class('bu-text-muted bu-mb-md'),
            'Create nested menu structures with submenus.'
          ),
          html.div(
            attr.class('bu-flex bu-gap-md bu-items-center'),
            Button(
              { onClick: () => {} },
              'Format',
              Menu({
                items: () => [
                  MenuItem({
                    content: 'Text',
                    submenu: () => [
                      MenuItem({
                        content: 'Bold',
                        endContent: html.span('⌘B'),
                      }),
                      MenuItem({
                        content: 'Italic',
                        endContent: html.span('⌘I'),
                      }),
                      MenuItem({
                        content: 'Underline',
                        endContent: html.span('⌘U'),
                      }),
                    ],
                  }),
                  MenuItem({
                    content: 'Align',
                    submenu: () => [
                      MenuItem({ content: 'Left' }),
                      MenuItem({ content: 'Center' }),
                      MenuItem({ content: 'Right' }),
                      MenuItem({ content: 'Justify' }),
                    ],
                  }),
                  MenuSeparator(),
                  MenuItem({
                    content: 'Clear Formatting',
                  }),
                ],
                placement,
                showOn,
              })
            )
          )
        ),

        // Accessibility Information
        html.section(
          html.h2(
            attr.class('bu-text-xl bu-font-semibold bu-mb-md'),
            'Accessibility'
          ),
          html.div(
            attr.class('bu-bg-neutral-50 bu-p-md bu-rounded-md bu-space-y-sm'),
            html.h3(attr.class('bu-font-medium'), 'Keyboard Navigation'),
            html.ul(
              attr.class('bu-list-disc bu-list-inside bu-space-y-1 bu-text-sm'),
              html.li('Arrow keys: Navigate between menu items'),
              html.li('Enter/Space: Activate the focused menu item'),
              html.li('Escape: Close the menu'),
              html.li('Home/End: Jump to first/last menu item'),
              html.li('Left/Right arrows: Navigate submenus (when available)')
            ),
            html.h3(
              attr.class('bu-font-medium bu-mt-md'),
              'Screen Reader Support'
            ),
            html.ul(
              attr.class('bu-list-disc bu-list-inside bu-space-y-1 bu-text-sm'),
              html.li('Proper ARIA roles and attributes'),
              html.li('Live region announcements for focus changes'),
              html.li('Support for aria-label and aria-labelledby'),
              html.li('Disabled items are properly announced')
            )
          )
        )
      )
    ),
  })
}

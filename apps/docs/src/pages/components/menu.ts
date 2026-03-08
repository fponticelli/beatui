import { Menu, MenuItem, MenuSeparator, Button, Icon } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Menu',
  category: 'Navigation',
  component: 'Menu',
  description:
    'A dropdown action menu with keyboard navigation, submenus, disabled items, and accessible ARIA markup. Placed as a child of the trigger element.',
  icon: 'lucide:list',
  order: 5,
}

export default function MenuPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Menu', signals =>
      Button(
        { variant: 'outline' },
        'Actions',
        Menu({
          placement: signals.placement,
          closable: signals.closable,
          items: () => [
            MenuItem({
              key: 'edit',
              content: 'Edit',
              before: Icon({ icon: 'lucide:pencil', size: 'sm' }),
              onClick: () => console.log('edit'),
            }),
            MenuItem({
              key: 'duplicate',
              content: 'Duplicate',
              before: Icon({ icon: 'lucide:copy', size: 'sm' }),
              onClick: () => console.log('duplicate'),
            }),
            MenuSeparator(),
            MenuItem({
              key: 'delete',
              content: 'Delete',
              before: Icon({ icon: 'lucide:trash-2', size: 'sm' }),
              onClick: () => console.log('delete'),
            }),
          ],
          onAction: (key: string) => console.log('Action:', key),
        } as never)
      )
    ),
    sections: [
      Section(
        'Basic Menu',
        () =>
          Button(
            { variant: 'filled', color: 'primary' },
            'Open Menu',
            Menu({
              items: () => [
                MenuItem({ content: 'New File', key: 'new' }),
                MenuItem({ content: 'Open...', key: 'open' }),
                MenuItem({ content: 'Save', key: 'save' }),
              ],
              onAction: key => console.log(key),
            })
          ),
        'Place Menu as a child of the trigger element.'
      ),
      Section(
        'With Icons and Shortcuts',
        () =>
          Button(
            { variant: 'outline' },
            'Edit',
            Menu({
              items: () => [
                MenuItem({
                  key: 'cut',
                  content: 'Cut',
                  before: Icon({ icon: 'lucide:scissors', size: 'sm' }),
                  after: html.span(
                    attr.class('text-xs text-gray-400'),
                    'Ctrl+X'
                  ),
                }),
                MenuItem({
                  key: 'copy',
                  content: 'Copy',
                  before: Icon({ icon: 'lucide:copy', size: 'sm' }),
                  after: html.span(
                    attr.class('text-xs text-gray-400'),
                    'Ctrl+C'
                  ),
                }),
                MenuItem({
                  key: 'paste',
                  content: 'Paste',
                  before: Icon({ icon: 'lucide:clipboard', size: 'sm' }),
                  after: html.span(
                    attr.class('text-xs text-gray-400'),
                    'Ctrl+V'
                  ),
                }),
              ],
            })
          ),
        'Menu items support before and after content for icons and keyboard shortcuts.'
      ),
      Section(
        'With Separator and Disabled Items',
        () =>
          Button(
            { variant: 'light' },
            'More Options',
            Menu({
              items: () => [
                MenuItem({ key: 'view', content: 'View Details' }),
                MenuItem({ key: 'share', content: 'Share' }),
                MenuSeparator(),
                MenuItem({
                  key: 'archive',
                  content: 'Archive',
                  disabled: true,
                }),
                MenuSeparator({ label: 'Danger Zone' }),
                MenuItem({ key: 'delete', content: 'Delete' }),
              ],
            })
          ),
        'Use MenuSeparator to group items, with an optional label for section headings.'
      ),
      Section(
        'With Submenu',
        () =>
          Button(
            { variant: 'outline' },
            'Export',
            Menu({
              items: () => [
                MenuItem({
                  key: 'export-as',
                  content: 'Export as...',
                  before: Icon({ icon: 'lucide:download', size: 'sm' }),
                  submenu: () => [
                    MenuItem({ content: 'PDF', onClick: () => console.log('pdf') }),
                    MenuItem({ content: 'CSV', onClick: () => console.log('csv') }),
                    MenuItem({ content: 'PNG', onClick: () => console.log('png') }),
                  ],
                }),
                MenuItem({
                  key: 'print',
                  content: 'Print',
                  before: Icon({ icon: 'lucide:printer', size: 'sm' }),
                }),
              ],
            })
          ),
        'Menu items can have nested submenus that appear on hover.'
      ),
      Section(
        'Placements',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-4'),
            ...(['bottom-start', 'bottom-end', 'top-start', 'right-start'] as const).map(
              placement =>
                Button(
                  { variant: 'light', size: 'sm' },
                  placement,
                  Menu({
                    placement,
                    items: () => [
                      MenuItem({ content: 'Option A' }),
                      MenuItem({ content: 'Option B' }),
                      MenuItem({ content: 'Option C' }),
                    ],
                  })
                )
            )
          ),
        'Control where the menu appears relative to its trigger with placement.'
      ),
    ],
  })
}

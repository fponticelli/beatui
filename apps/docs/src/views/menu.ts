import {
  Group,
  Sidebar,
  SidebarGroup,
  SidebarLink,
  Stack,
  Tag,
} from '@tempots/beatui'
import { attr } from '@tempots/dom'

const TodoTag = () => Tag({ value: 'TODO', color: 'red', size: 'xs' })

const Todo = (content: string) =>
  Group(attr.class('bu-justify-between'), content, TodoTag())

export function Menu() {
  return Stack(
    attr.class('bu-h-full bu-overflow-y-auto'),
    Sidebar(
      {},
      // Authentication Section
      SidebarGroup(
        { header: 'Authentication', rail: true },
        SidebarLink({ href: '/authentication', content: 'Overview' }),
        SidebarLink({
          href: '/authentication/components',
          content: 'Components',
        })
      ),
      // Form Controls
      SidebarGroup(
        { header: 'Form Controls', rail: true },
        SidebarLink({ href: '/button', content: 'Button' }),
        SidebarLink({ href: '/switch', content: 'Switch' }),
        SidebarLink({
          href: '/segmented-control',
          content: 'Segmented Control',
        }),
        SidebarLink({ href: '/combobox', content: 'Combobox' }),
        SidebarLink({ href: '/color-picker', content: 'Color Picker' }),
        SidebarLink({ href: '/file-input', content: 'File Input' }),
        SidebarLink({ href: '/editable-text', content: Todo('Editable Text') }),
        SidebarLink({ href: '/form', content: 'Form' })
      ),
      // Navigation
      SidebarGroup(
        { header: 'Navigation', rail: true },
        SidebarLink({ href: '/link', content: 'Link' }),
        SidebarLink({ href: '/menu', content: 'Menu' }),
        SidebarLink({ href: '/sidebar', content: 'Sidebar' }),
        SidebarLink({ href: '/tabs', content: 'Tabs' })
      ),
      // Layout
      SidebarGroup(
        { header: 'Layout', rail: true },
        SidebarLink({ href: '/collapse', content: 'Collapse' }),
        SidebarLink({ href: '/scrollable-panel', content: 'Scrollable Panel' }),
        SidebarLink({
          href: '/nine-slice-scroll-view',
          content: Todo('Nine Slice Scroll View'),
        })
      ),
      // Overlays
      SidebarGroup(
        { header: 'Overlays', rail: true },
        SidebarLink({ href: '/modal', content: 'Modal' }),
        SidebarLink({ href: '/drawer', content: 'Drawer' }),
        SidebarLink({ href: '/tooltip', content: 'Tooltip' }),
        SidebarLink({ href: '/flyout', content: 'Flyout' })
      ),
      // Data Display
      SidebarGroup(
        { header: 'Data Display', rail: true },
        SidebarLink({ href: '/icon', content: 'Icon' }),
        SidebarLink({
          href: '/tags',
          content: Todo('Tags'),
        })
      ),
      // Utilities
      SidebarGroup(
        { header: 'Utilities', rail: true },
        SidebarLink({ href: '/breakpoint', content: 'Breakpoint' }),
        SidebarLink({ href: '/rtl-ltr', content: 'RTL/LTR Support' })
      )
    )
  )
}

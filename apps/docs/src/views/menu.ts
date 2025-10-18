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
  Group(attr.class('justify-between'), content, TodoTag())

export function Menu() {
  return Stack(
    attr.class('h-full overflow-y-auto bg-gray-100 dark:bg-gray-900'),
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
        SidebarLink({ href: '/inputs', content: 'Inputs' }),
        SidebarLink({ href: '/button', content: 'Button' }),
        SidebarLink({ href: '/switch', content: 'Switch' }),
        SidebarLink({
          href: '/segmented-control',
          content: 'Segmented Control',
        }),
        SidebarLink({ href: '/dropdown', content: 'Dropdown' }),
        SidebarLink({ href: '/combobox', content: 'Combobox' }),
        SidebarLink({ href: '/color-picker', content: 'Color Picker' }),
        SidebarLink({ href: '/file-input', content: 'File Input' }),
        SidebarLink({ href: '/mask-input', content: 'Mask Input' }),
        SidebarLink({ href: '/editable-text', content: 'Editable Text' }),
        SidebarLink({ href: '/form', content: 'Form' }),
        SidebarLink({ href: '/json-schema-form', content: 'JSON Schema Form' }),
        SidebarLink({ href: '/monaco-editor', content: 'Monaco Editor' }),
        SidebarLink({
          href: '/prosemirror-editor',
          content: 'ProseMirror Editor',
        }),
        SidebarLink({
          href: '/tags-input',
          content: 'Tags Input',
        })
      ),
      // Navigation
      SidebarGroup(
        { header: 'Navigation', rail: true },
        SidebarLink({ href: '/link', content: 'Link' }),
        SidebarLink({ href: '/menu', content: 'Menu' }),
        SidebarLink({ href: '/sidebar', content: 'Sidebar' }),
        SidebarLink({ href: '/tabs', content: 'Tabs' }),
        SidebarLink({ href: '/toolbar', content: 'Toolbar' })
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
        SidebarLink({ href: '/notice', content: 'Notice' }),
        SidebarLink({
          href: '/tags',
          content: 'Tags',
        }),
        SidebarLink({ href: '/markdown', content: 'Markdown' })
      ),
      // Docs
      SidebarGroup(
        { header: 'Docs', rail: true },
        SidebarLink({ href: '/x-ui-usage', content: 'x:ui Usage' })
      ),
      // Utilities
      SidebarGroup(
        { header: 'Utilities', rail: true },
        SidebarLink({ href: '/breakpoint', content: 'Breakpoint' }),
        SidebarLink({ href: '/temporal', content: 'Temporal' }),
        SidebarLink({ href: '/rtl-ltr', content: 'RTL/LTR Support' })
      )
    )
  )
}

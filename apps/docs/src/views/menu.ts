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
        SidebarLink({ href: '/control', content: 'Control' }),
        SidebarLink({ href: '/button', content: 'Button' }),
        SidebarLink({ href: '/switch', content: 'Switch' }),
        SidebarLink({
          href: '/segmented-control',
          content: 'Segmented Control',
        }),
        SidebarLink({ href: '/dropdown', content: 'Dropdown' }),
        SidebarLink({ href: '/combobox', content: 'Combobox' }),
        SidebarLink({ href: '/color-input', content: 'Color Input' }),
        SidebarLink({ href: '/color-swatch', content: 'Color Swatch' }),
        SidebarLink({ href: '/file-input', content: 'File Input' }),
        SidebarLink({ href: '/page-drop-zone', content: 'Page Drop Zone' }),
        SidebarLink({ href: '/mask-input', content: 'Mask Input' }),
        SidebarLink({ href: '/editable-text', content: 'Editable Text' }),
        SidebarLink({ href: '/form', content: 'Form' }),
        SidebarLink({ href: '/json-schema-form', content: 'JSON Schema Form' }),
        SidebarLink({
          href: '/json-schema-custom-widgets',
          content: 'JSON Schema Custom Widgets',
        }),
        SidebarLink({
          href: '/json-schema-display',
          content: 'JSON Schema Display',
        }),
        SidebarLink({
          href: '/json-structure-form',
          content: 'JSON Structure Form',
        }),
        SidebarLink({
          href: '/json-structure-custom-widgets',
          content: 'JSON Structure Custom Widgets',
        }),
        SidebarLink({ href: '/monaco-editor', content: 'Monaco Editor' }),
        SidebarLink({
          href: '/prosemirror-editor',
          content: 'ProseMirror Editor',
        }),
        SidebarLink({
          href: '/lexical-editor',
          content: 'Lexical Editor',
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
        SidebarLink({ href: '/action-card', content: 'Action Card' }),
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
        SidebarLink({ href: '/lightbox', content: 'Lightbox' }),
        SidebarLink({ href: '/drawer', content: 'Drawer' }),
        SidebarLink({ href: '/tooltip', content: 'Tooltip' }),
        SidebarLink({ href: '/flyout', content: 'Flyout' }),
        SidebarLink({ href: '/announcement-bar', content: 'Announcement Bar' })
      ),
      // Data Display
      SidebarGroup(
        { header: 'Data Display', rail: true },
        SidebarLink({ href: '/badge', content: 'Badge' }),
        SidebarLink({ href: '/icon', content: 'Icon' }),
        SidebarLink({ href: '/notice', content: 'Notice' }),
        SidebarLink({ href: '/notification', content: 'Notification' }),
        SidebarLink({
          href: '/notification-service',
          content: 'Notification Service',
        }),
        SidebarLink({ href: '/table', content: 'Table' }),
        SidebarLink({
          href: '/tags',
          content: 'Tags',
        }),
        SidebarLink({ href: '/ribbon', content: 'Ribbon' }),
        SidebarLink({ href: '/markdown', content: 'Markdown' }),
        SidebarLink({ href: '/video-player', content: 'Video Player' }),
        SidebarLink({ href: '/pdf-preview', content: 'PDF Preview' }),
        SidebarLink({ href: '/pdf-page-viewer', content: 'PDF Page Viewer' })
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
      ),
      // API Reference
      SidebarGroup(
        { header: 'API Reference', rail: true },
        SidebarLink({ href: '/api', content: 'Overview' }),
        SidebarLink({ href: '/api/main', content: 'Main' }),
        SidebarLink({ href: '/api/auth', content: 'Auth' }),
        SidebarLink({ href: '/api/better-auth', content: 'Better Auth' }),
        SidebarLink({ href: '/api/json-schema', content: 'JSON Schema' }),
        SidebarLink({
          href: '/api/json-schema-display',
          content: 'JSON Schema Display',
        }),
        SidebarLink({
          href: '/api/json-structure',
          content: 'JSON Structure',
        }),
        SidebarLink({ href: '/api/monaco', content: 'Monaco' }),
        SidebarLink({ href: '/api/markdown', content: 'Markdown' }),
        SidebarLink({ href: '/api/prosemirror', content: 'ProseMirror' }),
        SidebarLink({ href: '/api/lexical', content: 'Lexical' }),
        SidebarLink({ href: '/api/tailwind', content: 'Tailwind' })
      )
    )
  )
}

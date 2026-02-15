import {
  Group,
  Icon,
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

const SectionHeader = (icon: string, label: string) =>
  Group(attr.class('gap-1'), Icon({ icon, size: 'xs' }), label)

export function Menu() {
  return Stack(
    attr.class('h-full overflow-y-auto bg-gray-100 beatui-dark:bg-gray-900'),
    Sidebar(
      {},
      // ── Authentication ──
      SidebarGroup(
        {
          header: SectionHeader('lucide:shield', 'Authentication'),
          rail: true,
        },
        SidebarLink({ href: '/authentication', content: 'Overview' }),
        SidebarLink({
          href: '/authentication/components',
          content: 'Components',
        })
      ),

      // ── Form Inputs ──
      SidebarGroup(
        {
          header: SectionHeader('lucide:text-cursor-input', 'Form Inputs'),
          rail: true,
        },
        SidebarLink({ href: '/inputs', content: 'Inputs' }),
        SidebarLink({ href: '/control', content: 'Control' }),
        SidebarLink({ href: '/button', content: 'Button' }),
        SidebarLink({ href: '/toggle-button', content: 'Toggle Button' }),
        SidebarLink({
          href: '/toggle-button-group',
          content: 'Toggle Button Group',
        }),
        SidebarLink({ href: '/switch', content: 'Switch' }),
        SidebarLink({
          href: '/segmented-control',
          content: 'Segmented Control',
        }),
        SidebarLink({ href: '/radio-group', content: 'Radio Group' }),
        SidebarLink({ href: '/dropdown', content: 'Dropdown' }),
        SidebarLink({ href: '/combobox', content: 'Combobox' }),
        SidebarLink({ href: '/color-input', content: 'Color Input' }),
        SidebarLink({ href: '/color-swatch', content: 'Color Swatch' }),
        SidebarLink({ href: '/tags-input', content: 'Tags Input' }),
        SidebarLink({ href: '/file-input', content: 'File Input' }),
        SidebarLink({ href: '/page-drop-zone', content: 'Page Drop Zone' }),
        SidebarLink({ href: '/mask-input', content: 'Mask Input' }),
        SidebarLink({ href: '/otp-input', content: 'OTP Input' }),
        SidebarLink({ href: '/advanced-slider', content: 'Advanced Slider' }),
        SidebarLink({ href: '/editable-text', content: 'Editable Text' }),
        SidebarLink({ href: '/form', content: 'Form' })
      ),

      // ── Rich Editors ──
      SidebarGroup(
        {
          header: SectionHeader('lucide:pen-line', 'Rich Editors'),
          rail: true,
        },
        SidebarLink({ href: '/monaco-editor', content: 'Monaco Editor' }),
        SidebarLink({
          href: '/prosemirror-editor',
          content: 'ProseMirror Editor',
        }),
        SidebarLink({ href: '/lexical-editor', content: 'Lexical Editor' })
      ),

      // ── Schema Forms ──
      SidebarGroup(
        { header: SectionHeader('lucide:braces', 'Schema Forms'), rail: true },
        SidebarLink({
          href: '/json-schema-form',
          content: 'JSON Schema Form',
        }),
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
        })
      ),

      // ── Navigation ──
      SidebarGroup(
        { header: SectionHeader('lucide:compass', 'Navigation'), rail: true },
        SidebarLink({ href: '/link', content: 'Link' }),
        SidebarLink({ href: '/menu', content: 'Menu' }),
        SidebarLink({ href: '/sidebar', content: 'Sidebar' }),
        SidebarLink({ href: '/tabs', content: 'Tabs' }),
        SidebarLink({ href: '/toolbar', content: 'Toolbar' }),
        SidebarLink({ href: '/breadcrumbs', content: 'Breadcrumbs' }),
        SidebarLink({ href: '/pagination', content: 'Pagination' }),
        SidebarLink({ href: '/tree-view', content: 'Tree View' })
      ),

      // ── Layout ──
      SidebarGroup(
        { header: SectionHeader('lucide:layout', 'Layout'), rail: true },
        SidebarLink({ href: '/accordion', content: 'Accordion' }),
        SidebarLink({ href: '/action-card', content: 'Action Card' }),
        SidebarLink({ href: '/collapse', content: 'Collapse' }),
        SidebarLink({ href: '/divider', content: 'Divider' }),
        SidebarLink({
          href: '/scrollable-panel',
          content: 'Scrollable Panel',
        }),
        SidebarLink({
          href: '/nine-slice-scroll-view',
          content: Todo('Nine Slice Scroll View'),
        })
      ),

      // ── Overlays ──
      SidebarGroup(
        { header: SectionHeader('lucide:layers', 'Overlays'), rail: true },
        SidebarLink({ href: '/modal', content: 'Modal' }),
        SidebarLink({ href: '/lightbox', content: 'Lightbox' }),
        SidebarLink({ href: '/drawer', content: 'Drawer' }),
        SidebarLink({ href: '/tooltip', content: 'Tooltip' }),
        SidebarLink({ href: '/flyout', content: 'Flyout' }),
        SidebarLink({
          href: '/announcement-bar',
          content: 'Announcement Bar',
        }),
        SidebarLink({ href: '/command-palette', content: 'Command Palette' }),
        SidebarLink({ href: '/dialogs', content: 'Dialogs' })
      ),

      // ── Data Display ──
      SidebarGroup(
        {
          header: SectionHeader('lucide:bar-chart-3', 'Data Display'),
          rail: true,
        },
        SidebarLink({ href: '/avatar', content: 'Avatar' }),
        SidebarLink({ href: '/badge', content: 'Badge' }),
        SidebarLink({ href: '/calendar', content: 'Calendar' }),
        SidebarLink({ href: '/icon', content: 'Icon' }),
        SidebarLink({ href: '/tags', content: 'Tags' }),
        SidebarLink({ href: '/kbd', content: 'Kbd' }),
        SidebarLink({ href: '/progress-bar', content: 'Progress Bar' }),
        SidebarLink({ href: '/ribbon', content: 'Ribbon' }),
        SidebarLink({ href: '/skeleton', content: 'Skeleton' }),
        SidebarLink({ href: '/empty-state', content: 'Empty State' }),
        SidebarLink({ href: '/table', content: 'Table' })
      ),

      // ── Feedback ──
      SidebarGroup(
        { header: SectionHeader('lucide:bell', 'Feedback'), rail: true },
        SidebarLink({ href: '/notice', content: 'Notice' }),
        SidebarLink({ href: '/notification', content: 'Notification' }),
        SidebarLink({
          href: '/notification-service',
          content: 'Notification Service',
        })
      ),

      // ── Media ──
      SidebarGroup(
        { header: SectionHeader('lucide:play', 'Media'), rail: true },
        SidebarLink({ href: '/markdown', content: 'Markdown' }),
        SidebarLink({ href: '/video-player', content: 'Video Player' }),
        SidebarLink({ href: '/pdf-preview', content: 'PDF Preview' }),
        SidebarLink({ href: '/pdf-page-viewer', content: 'PDF Page Viewer' })
      ),

      // ── Utilities ──
      SidebarGroup(
        { header: SectionHeader('lucide:wrench', 'Utilities'), rail: true },
        SidebarLink({ href: '/breakpoint', content: 'Breakpoint' }),
        SidebarLink({ href: '/temporal', content: 'Temporal' }),
        SidebarLink({ href: '/rtl-ltr', content: 'RTL/LTR Support' }),
        SidebarLink({ href: '/x-ui-usage', content: 'x:ui Usage' })
      ),

      // ── API Reference ──
      SidebarGroup(
        {
          header: SectionHeader('lucide:book-open', 'API Reference'),
          rail: true,
        },
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

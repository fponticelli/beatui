import { html, attr } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Icon, Badge } from '@tempots/beatui'
import { categories } from '../registry/page-registry'
import { Anchor } from '@tempots/ui'

export default function HomePage() {
  const totalComponents = categories.reduce((sum, cat) => sum + cat.pages.length, 0)

  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-5xl mx-auto'),
      html.div(
        attr.class('space-y-3'),
        html.h1(attr.class('text-3xl font-bold'), 'BeatUI Components'),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400 max-w-2xl'),
          'A comprehensive UI component library built on the Tempo ecosystem with fine-grained reactivity, theme support, and full accessibility.'
        ),
        html.div(
          attr.class('flex gap-3 items-center'),
          Badge({ variant: 'light', color: 'primary', size: 'sm' }, `${totalComponents} components`),
          Badge({ variant: 'light', color: 'secondary', size: 'sm' }, `${categories.length} categories`),
        )
      ),
      // Quick start links
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:book-text', size: 'sm' }),
            html.h2(attr.class('text-lg font-semibold'), 'Guides')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Learn how to install, theme, and customize BeatUI.'
          ),
          html.div(
            attr.class('flex flex-wrap gap-2'),
            ...[
              { href: '/guides/getting-started', label: 'Getting Started' },
              { href: '/guides/theming', label: 'Theming' },
              { href: '/guides/customization', label: 'Customization' },
              { href: '/guides/css-variables', label: 'CSS Variables' },
              { href: '/guides/forms', label: 'Forms' },
              { href: '/guides/rtl-ltr', label: 'RTL & LTR' },
              { href: '/guides/data-source', label: 'DataSource' },
              { href: '/guides/authentication', label: 'Authentication' },
              { href: '/guides/lexical-editor', label: 'Lexical Editor' },
              { href: '/guides/monaco-editor', label: 'Monaco Editor' },
              { href: '/guides/prosemirror-editor', label: 'ProseMirror' },
              { href: '/guides/markdown-renderer', label: 'Markdown' },
              { href: '/guides/json-schema-forms', label: 'JSON Schema Forms' },
              { href: '/guides/json-structure-forms', label: 'JSON Structure Forms' },
              { href: '/guides/json-schema-display', label: 'JSON Schema Display' },
            ].map(({ href, label }) =>
              Anchor(
                { href, viewTransition: true },
                attr.class(
                  'px-3 py-1 text-sm rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                ),
                label
              )
            )
          )
        )
      ),

      // Category cards with descriptions and component links
      html.div(
        attr.class('grid grid-cols-1 md:grid-cols-2 gap-4'),
        ...categories.map(cat =>
          Card(
            {},
            html.div(
              attr.class('space-y-3'),
              html.div(
                attr.class('flex items-center gap-2'),
                Icon({ icon: cat.icon, size: 'sm' }),
                html.h2(attr.class('text-lg font-semibold'), cat.name),
                Badge(
                  { variant: 'outline', size: 'xs', color: 'base' },
                  `${cat.pages.length}`
                )
              ),
              html.p(
                attr.class('text-sm text-gray-600 dark:text-gray-400'),
                getCategoryDescription(cat.name)
              ),
              html.div(
                attr.class('flex flex-wrap gap-1.5'),
                ...cat.pages.map(page =>
                  Anchor(
                    {
                      href: `/components/${page.slug}`,
                      viewTransition: true,
                    },
                    attr.class(
                      'px-2 py-0.5 text-xs rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                    ),
                    page.name
                  )
                )
              )
            )
          )
        )
      )
    ),
  })
}

function getCategoryDescription(name: string): string {
  const descriptions: Record<string, string> = {
    'Form Inputs':
      'Interactive controls for user input — buttons, toggles, dropdowns, sliders, and specialized inputs like OTP and color pickers.',
    Navigation:
      'Components for moving between views — menus, tabs, breadcrumbs, toolbars, sidebars, and tree navigation.',
    Layout:
      'Structural components for organizing content — accordions, cards, dividers, collapsible panels, and scrollable areas.',
    Overlays:
      'Floating UI layers — modals, drawers, tooltips, flyouts, lightboxes, and command palettes.',
    'Data Display':
      'Components for presenting data — tables, badges, avatars, progress bars, date pickers, and skeleton loaders.',
    Feedback:
      'User feedback components — notices, notifications, and toast-style notification services.',
    Media:
      'Rich content rendering — markdown display, video players, and PDF viewers.',
    'Rich Editors':
      'Integrated text editors — Monaco (code), ProseMirror (rich text), and Lexical (extensible).',
    'Schema Forms':
      'Auto-generated forms from JSON Schema definitions with validation and custom widget support.',
    Authentication:
      'Pre-built authentication UI — sign-in/sign-up forms, social login, two-factor, and passkey support.',
    Utilities:
      'Development helpers — CSS variable inspector, breakpoint detection, temporal formatting, and RTL support.',
  }
  return descriptions[name] ?? `Components in the ${name} category.`
}

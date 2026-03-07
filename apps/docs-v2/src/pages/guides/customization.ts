import {
  ScrollablePanel,
  Stack,
  Card,
  Button,
  Badge,
  Icon,
  TextInput,
  Notice,
} from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { CodeBlock } from '../../framework/code-block'

export const meta = {
  title: 'Customization',
  description: 'Override CSS properties, use reactive props, compose components, and tree-shake with entry points.',
}

const CSS_CUSTOM_PROPERTIES_CODE = `.bc-button {
  --bc-button-border-radius: 9999px;
}

.bc-card {
  --bc-card-padding: 2rem;
}`

const COMPONENT_OPTIONS_CODE = `Button({
  variant: 'filled',
  size: 'lg',
  color: 'primary',
  loading: true,
}, 'Save Changes')`

const REACTIVE_PROPS_CODE = `import { prop, Value } from '@tempots/dom'

const size = prop<'sm' | 'md' | 'lg'>('md')

Button({ size, variant: 'filled' }, 'Dynamic Size')

// Later: size.set('lg') — button updates automatically`

const OVERRIDE_STYLES_CODE = `/* Make all cards have a blue left border */
.bc-card {
  border-left: 3px solid var(--color-primary-500);
}

/* Custom notice variant */
.bc-notice--variant-custom {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}`

const COMPOSING_CODE = `function UserCard(user: { name: string; role: string }) {
  return Card(
    {},
    Stack(
      attr.class('gap-2'),
      html.h3(attr.class('font-semibold'), user.name),
      Badge({ variant: 'light', color: 'primary' }, user.role)
    )
  )
}`

const ENTRY_POINTS_CODE = `// Core components
import { Button, Card, TextInput } from '@tempots/beatui'

// Authentication UI
import { SignInForm } from '@tempots/beatui/auth'

// Monaco code editor
import { MonacoEditor } from '@tempots/beatui/monaco'

// Markdown rendering
import { Markdown } from '@tempots/beatui/markdown'

// ProseMirror rich text
import { ProseMirrorEditor } from '@tempots/beatui/prosemirror'

// Lexical extensible editor
import { LexicalEditor } from '@tempots/beatui/lexical'

// JSON Schema auto-forms
import { SchemaForm } from '@tempots/beatui/json-schema'

// Tailwind preset and Vite plugin
import beatuiPreset from '@tempots/beatui/tailwind'`

export default function CustomizationPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-4xl mx-auto'),

      // Page header
      html.div(
        attr.class('space-y-3'),
        html.h1(attr.class('text-3xl font-bold'), 'Customization'),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400 max-w-2xl'),
          'BeatUI is designed to be fully customizable. Override styles with CSS custom properties, pass reactive signals as props, compose components freely, and import only what you need.'
        ),
        html.div(
          attr.class('flex gap-3 items-center'),
          Badge({ variant: 'light', color: 'primary', size: 'sm' }, 'CSS Overrides'),
          Badge({ variant: 'light', color: 'secondary', size: 'sm' }, 'Reactive Props'),
          Badge({ variant: 'light', color: 'success', size: 'sm' }, 'Tree-shakeable')
        )
      ),

      // Section 1: CSS Custom Properties
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:paintbrush', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'CSS Custom Properties')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Every component exposes CSS custom properties that control its appearance. Override them globally or scope them to a specific container for fine-grained control without writing complex selectors.'
          ),
          Notice(
            { variant: 'info', title: 'Naming convention' },
            'Component-level custom properties follow the pattern ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              '--bc-{component}-{property}'
            ),
            '. For example, ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              '--bc-button-border-radius'
            ),
            '.'
          ),
          CodeBlock(CSS_CUSTOM_PROPERTIES_CODE, 'css'),
          html.div(
            attr.class('flex flex-wrap gap-2 items-center pt-1'),
            html.span(
              attr.class('text-sm text-gray-600 dark:text-gray-400'),
              'Live preview — pill-shaped buttons via CSS override:'
            ),
            html.div(
              attr.class('flex gap-2'),
              html.div(
                attr.style('--bc-button-border-radius: 9999px'),
                Button({ variant: 'filled', size: 'sm' }, 'Pill Button'),
              ),
              html.div(
                attr.style('--bc-button-border-radius: 9999px'),
                Button({ variant: 'outline', size: 'sm' }, 'Pill Outline'),
              )
            )
          )
        )
      ),

      // Section 2: Component Options
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:sliders-horizontal', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Component Options')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'All components accept a typed options object as their first argument. Common props include ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'variant'
            ),
            ', ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'size'
            ),
            ', ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'color'
            ),
            ', ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'disabled'
            ),
            ', and ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'loading'
            ),
            '. Children are passed as subsequent arguments.'
          ),
          CodeBlock(COMPONENT_OPTIONS_CODE, 'typescript'),
          html.div(
            attr.class('space-y-2 pt-1'),
            html.p(
              attr.class('text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide'),
              'Variant examples'
            ),
            html.div(
              attr.class('flex flex-wrap gap-2 items-center'),
              Button({ variant: 'filled', size: 'sm' }, 'filled'),
              Button({ variant: 'light', size: 'sm' }, 'light'),
              Button({ variant: 'outline', size: 'sm' }, 'outline'),
              Button({ variant: 'dashed', size: 'sm' }, 'dashed'),
              Button({ variant: 'default', size: 'sm' }, 'default'),
              Button({ variant: 'subtle', size: 'sm' }, 'subtle'),
              Button({ variant: 'text', size: 'sm' }, 'text'),
            ),
            html.p(
              attr.class('text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mt-2'),
              'Size examples'
            ),
            html.div(
              attr.class('flex flex-wrap gap-2 items-center'),
              Button({ variant: 'filled', size: 'xs' }, 'xs'),
              Button({ variant: 'filled', size: 'sm' }, 'sm'),
              Button({ variant: 'filled', size: 'md' }, 'md'),
              Button({ variant: 'filled', size: 'lg' }, 'lg'),
              Button({ variant: 'filled', size: 'xl' }, 'xl'),
            )
          )
        )
      ),

      // Section 3: Reactive Props with Value<T>
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:zap', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Reactive Props with Value\u003cT\u003e')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Every component prop can accept either a static value or a reactive ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'Value\u003cT\u003e'
            ),
            ' signal created with ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'prop()'
            ),
            '. When the signal changes, only the affected DOM attribute or text node is updated — no component re-render required.'
          ),
          CodeBlock(REACTIVE_PROPS_CODE, 'typescript'),
          Notice(
            { variant: 'success', title: 'Fine-grained reactivity' },
            'Because BeatUI is built on ',
            html.code(
              attr.class('font-mono text-xs bg-green-100 dark:bg-green-900 px-1 rounded'),
              '@tempots/dom'
            ),
            ', signal changes patch only the exact DOM node that depends on that signal — no virtual DOM diffing, no full subtree re-renders.'
          )
        )
      ),

      // Section 4: Overriding Component Styles
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:pencil-ruler', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Overriding Component Styles')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Every component root element carries a ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'bc-'
            ),
            ' prefixed CSS class. Target these classes in your own stylesheet to override defaults, add dark-mode rules, or create entirely new variant skins.'
          ),
          CodeBlock(OVERRIDE_STYLES_CODE, 'css'),
          html.div(
            attr.class('flex flex-wrap gap-2 pt-1'),
            Badge({ variant: 'light', color: 'primary', size: 'sm' }, 'bc-button'),
            Badge({ variant: 'light', color: 'secondary', size: 'sm' }, 'bc-card'),
            Badge({ variant: 'light', color: 'success', size: 'sm' }, 'bc-notice'),
            Badge({ variant: 'light', color: 'warning', size: 'sm' }, 'bc-badge'),
            Badge({ variant: 'light', color: 'danger', size: 'sm' }, 'bc-text-input'),
          )
        )
      ),

      // Section 5: Composing Components
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:blocks', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Composing Components')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'BeatUI components are plain TypeScript functions that return a ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'TNode'
            ),
            '. Compose them freely inside your own functions — no class inheritance, no JSX transforms, and no framework-specific wrappers needed.'
          ),
          CodeBlock(COMPOSING_CODE, 'typescript'),
          html.div(
            attr.class('pt-1 max-w-xs'),
            html.p(
              attr.class('text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-2'),
              'Composed example'
            ),
            Card(
              {},
              Stack(
                attr.class('gap-2'),
                html.h3(attr.class('font-semibold'), 'Jane Doe'),
                Badge({ variant: 'light', color: 'primary' }, 'Administrator'),
                TextInput({ value: '', placeholder: 'Search users...' })
              )
            )
          )
        )
      ),

      // Section 6: Entry Points
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:package', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Entry Points')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'BeatUI is split into focused entry points so you only ship the code your app actually uses. Each entry point is tree-shakeable — import the specific exports you need and your bundler will drop the rest.'
          ),
          CodeBlock(ENTRY_POINTS_CODE, 'typescript'),
          html.div(
            attr.class('grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1'),
            ...[
              { pkg: '@tempots/beatui', desc: 'Core components — buttons, forms, layout, overlays, and more.' },
              { pkg: '@tempots/beatui/auth', desc: 'Pre-built sign-in, sign-up, and two-factor authentication UI.' },
              { pkg: '@tempots/beatui/monaco', desc: 'Monaco-based code editor with syntax highlighting.' },
              { pkg: '@tempots/beatui/markdown', desc: 'Markdown renderer with code highlighting support.' },
              { pkg: '@tempots/beatui/prosemirror', desc: 'ProseMirror rich-text editor integration.' },
              { pkg: '@tempots/beatui/lexical', desc: 'Lexical extensible editor integration.' },
              { pkg: '@tempots/beatui/json-schema', desc: 'Auto-generated forms driven by JSON Schema definitions.' },
              { pkg: '@tempots/beatui/tailwind', desc: 'Tailwind CSS v4 preset and Vite token-generation plugin.' },
            ].map(({ pkg, desc }) =>
              html.div(
                attr.class('flex flex-col gap-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700'),
                html.code(
                  attr.class('font-mono text-xs text-primary-600 dark:text-primary-400 font-medium'),
                  pkg
                ),
                html.p(
                  attr.class('text-xs text-gray-600 dark:text-gray-400'),
                  desc
                )
              )
            )
          )
        )
      )
    ),
  })
}

import { html, attr } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Badge } from '@tempots/beatui'
import { Anchor } from '@tempots/ui'
import { CodeBlock } from '../../framework/code-block'

export const meta = {
  title: 'Getting Started',
  description: 'Install BeatUI, set up Tailwind or standalone CSS, and build your first component.',
}

const INSTALL_CODE = `pnpm add @tempots/beatui @tempots/dom @tempots/ui @tempots/std`

const TAILWIND_INSTALL_CODE = `pnpm add -D tailwindcss @tailwindcss/vite`

const TAILWIND_VITE_CONFIG_CODE = `import tailwindcss from '@tailwindcss/vite'
import { beatuiTailwindPlugin } from '@tempots/beatui/tailwind/vite-plugin'

export default defineConfig({
  plugins: [
    tailwindcss(),
    beatuiTailwindPlugin({
      semanticColors: {
        primary: 'sky',
        secondary: 'cyan',
      },
    }),
  ],
})`

const TAILWIND_CSS_CODE = `@import 'tailwindcss';
@custom-variant dark (&:is(.dark *));`

const STANDALONE_CSS_CODE = `import '@tempots/beatui/styles'`

const APP_SETUP_CODE = `import { render } from '@tempots/dom'
import { BeatUI } from '@tempots/beatui'
import { html } from '@tempots/dom'

render(
  BeatUI({}, html.div('Hello BeatUI!')),
  document.getElementById('app')!
)`

const FIRST_COMPONENT_CODE = `import { Button, Stack, TextInput } from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'

const name = prop('')

Stack(
  attr.class('gap-4 p-6 max-w-sm'),
  TextInput({
    value: name,
    placeholder: 'Enter your name',
    onInput: (v) => name.set(v),
  }),
  Button(
    { variant: 'filled', color: 'primary' },
    'Say Hello'
  )
)`

export default function GettingStartedPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-4xl mx-auto'),

      // Page header
      html.div(
        attr.class('space-y-3'),
        html.h1(attr.class('text-3xl font-bold'), 'Getting Started'),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400 max-w-2xl'),
          'Get up and running with BeatUI in minutes. This guide walks you through installation, setup, and building your first component.'
        ),
        html.div(
          attr.class('flex gap-3 items-center'),
          Badge({ variant: 'light', color: 'primary', size: 'sm' }, 'Tailwind v4'),
          Badge({ variant: 'light', color: 'secondary', size: 'sm' }, 'Standalone CSS'),
          Badge({ variant: 'light', color: 'success', size: 'sm' }, 'TypeScript')
        )
      ),

      // Section 1: Installation
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-xl font-semibold'), '1. Installation'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Install BeatUI and its peer dependencies from the Tempo ecosystem.'
          ),
          CodeBlock(INSTALL_CODE)
        )
      ),

      // Section 2: Tailwind CSS Setup
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.h2(
            attr.class('text-xl font-semibold'),
            '2. Tailwind CSS Setup'
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'The recommended setup uses Tailwind CSS v4 with the BeatUI Vite plugin, which wires up semantic color tokens and component styles automatically.'
          ),

          html.div(
            attr.class('space-y-2'),
            html.h3(
              attr.class('text-sm font-semibold text-gray-700 dark:text-gray-300'),
              'Install Tailwind and the Vite plugin'
            ),
            CodeBlock(TAILWIND_INSTALL_CODE)
          ),

          html.div(
            attr.class('space-y-2'),
            html.h3(
              attr.class('text-sm font-semibold text-gray-700 dark:text-gray-300'),
              'Add the BeatUI plugin to vite.config.ts'
            ),
            html.p(
              attr.class('text-xs text-gray-500 dark:text-gray-500'),
              'The beatuiTailwindPlugin generates CSS variables for BeatUI\'s semantic color system. Map primary and secondary to any Tailwind color palette.'
            ),
            CodeBlock(TAILWIND_VITE_CONFIG_CODE)
          ),

          html.div(
            attr.class('space-y-2'),
            html.h3(
              attr.class('text-sm font-semibold text-gray-700 dark:text-gray-300'),
              'Configure main.css'
            ),
            html.p(
              attr.class('text-xs text-gray-500 dark:text-gray-500'),
              'The @custom-variant line enables dark mode support using the .dark class on a parent element.'
            ),
            CodeBlock(TAILWIND_CSS_CODE)
          )
        )
      ),

      // Section 3: Standalone CSS Setup
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(
            attr.class('text-xl font-semibold'),
            '3. Standalone CSS Setup'
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'If you prefer not to use Tailwind, BeatUI ships a pre-built stylesheet you can import directly into your entry point. This includes all component styles and the default design tokens.'
          ),
          CodeBlock(STANDALONE_CSS_CODE)
        )
      ),

      // Section 4: App Setup
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-xl font-semibold'), '4. App Setup'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Wrap your application in the BeatUI provider. This single call sets up routing, theming (light/dark), locale, i18n, and notifications automatically — no manual context wiring required.'
          ),
          CodeBlock(APP_SETUP_CODE)
        )
      ),

      // Section 5: Your First Component
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(
            attr.class('text-xl font-semibold'),
            '5. Your First Component'
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'BeatUI components are plain TypeScript functions that return reactive DOM nodes. Use ',
            html.code(attr.class('text-xs font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded'), 'prop()'),
            ' to create reactive state, and pass signals directly to component props — no JSX or templating needed.'
          ),
          CodeBlock(FIRST_COMPONENT_CODE)
        )
      ),

      // Section 6: Next Steps
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.h2(attr.class('text-xl font-semibold'), '6. Next Steps'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Now that your app is running, explore the rest of the documentation.'
          ),
          html.ul(
            attr.class('space-y-3'),
            html.li(
              attr.class('flex items-start gap-3'),
              html.div(
                attr.class('mt-0.5 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0')
              ),
              html.div(
                attr.class('space-y-0.5'),
                Anchor(
                  { href: '/guides/theming', viewTransition: true },
                  attr.class('text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline'),
                  'Theming'
                ),
                html.p(
                  attr.class('text-xs text-gray-500 dark:text-gray-500'),
                  'Customize colors, typography, and dark mode behavior using CSS variables and the BeatUI Vite plugin.'
                )
              )
            ),
            html.li(
              attr.class('flex items-start gap-3'),
              html.div(
                attr.class('mt-0.5 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0')
              ),
              html.div(
                attr.class('space-y-0.5'),
                Anchor(
                  { href: '/', viewTransition: true },
                  attr.class('text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline'),
                  'Components'
                ),
                html.p(
                  attr.class('text-xs text-gray-500 dark:text-gray-500'),
                  'Browse all available components, interactive playgrounds, and prop documentation in the sidebar.'
                )
              )
            ),
            html.li(
              attr.class('flex items-start gap-3'),
              html.div(
                attr.class('mt-0.5 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0')
              ),
              html.div(
                attr.class('space-y-0.5'),
                Anchor(
                  { href: '/api', viewTransition: true },
                  attr.class('text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline'),
                  'API Reference'
                ),
                html.p(
                  attr.class('text-xs text-gray-500 dark:text-gray-500'),
                  'Full TypeScript API documentation for every component, utility, and type exported from BeatUI.'
                )
              )
            )
          )
        )
      )
    ),
  })
}

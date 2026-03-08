import { html, attr, Use } from '@tempots/dom'
import {
  ScrollablePanel,
  Stack,
  Card,
  Badge,
  Icon,
  Button,
  StandaloneAppearanceSelector,
  Theme,
} from '@tempots/beatui'
import { Anchor } from '@tempots/ui'
import { CodeBlock } from '../../framework/code-block'

export const meta = {
  title: 'Theming',
  description:
    'Configure light/dark mode, customize semantic color tokens, fonts, and access theme state programmatically.',
}

export default function ThemingPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-4xl mx-auto'),

      // Page header
      html.div(
        attr.class('space-y-3'),
        html.h1(attr.class('text-3xl font-bold'), 'Theming'),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400 max-w-2xl'),
          'BeatUI ships with a fully-featured theme system built on CSS custom properties. Light and dark modes, semantic color tokens, custom palettes, and custom fonts are all supported out of the box.'
        ),
        html.div(
          attr.class('flex gap-3 items-center'),
          Badge(
            { variant: 'light', color: 'primary', size: 'sm' },
            'CSS Variables'
          ),
          Badge(
            { variant: 'light', color: 'secondary', size: 'sm' },
            'Tailwind Plugin'
          ),
          Badge({ variant: 'light', color: 'success', size: 'sm' }, 'Dark Mode')
        )
      ),

      // Section 1: Light & Dark Mode
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:sun-moon', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Light & Dark Mode')
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'BeatUI ships with light and dark themes. The ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              'BeatUI()'
            ),
            ' root component enables appearance toggling automatically. The classes ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              'dark'
            ),
            ' and ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              'light'
            ),
            ' are applied to the ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              '<html>'
            ),
            ' element, and all BeatUI components adapt automatically.'
          ),
          html.div(
            attr.class('space-y-2'),
            html.h3(
              attr.class(
                'text-sm font-semibold text-gray-700 dark:text-gray-300'
              ),
              'Try it live'
            ),
            html.div(
              attr.class(
                'flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
              ),
              html.span(
                attr.class('text-sm text-gray-600 dark:text-gray-400'),
                'Toggle appearance:'
              ),
              StandaloneAppearanceSelector({ size: 'sm' })
            )
          ),
          CodeBlock(
            `import { BeatUI } from '@tempots/beatui'

// Wrap your app with BeatUI to enable theming
BeatUI(
  {},
  YourApp()
)`,
            'typescript'
          )
        )
      ),

      // Section 2: Semantic Color Tokens
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:palette', size: 'sm' }),
            html.h2(
              attr.class('text-xl font-semibold'),
              'Semantic Color Tokens'
            )
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'BeatUI uses semantic color tokens — CSS custom properties that automatically adjust their values between light and dark themes. Use these tokens in your own styles for seamless theme integration.'
          ),

          // Text tokens
          html.div(
            attr.class('space-y-2'),
            html.h3(
              attr.class(
                'text-sm font-semibold text-gray-700 dark:text-gray-300'
              ),
              'Text'
            ),
            html.div(
              attr.class('flex flex-wrap gap-3'),
              ...[
                { token: '--text-normal', label: 'normal' },
                { token: '--text-muted', label: 'muted' },
                { token: '--text-inverted', label: 'inverted' },
              ].map(({ token, label }) =>
                html.div(
                  attr.class('flex items-center gap-2'),
                  html.div(
                    attr.class(
                      'w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 flex-shrink-0'
                    ),
                    attr.style(`background-color: var(${token})`)
                  ),
                  html.span(
                    attr.class(
                      'font-mono text-xs text-gray-600 dark:text-gray-400'
                    ),
                    token
                  ),
                  Badge(
                    { variant: 'outline', size: 'xs', color: 'base' },
                    label
                  )
                )
              )
            )
          ),

          // Background tokens
          html.div(
            attr.class('space-y-2'),
            html.h3(
              attr.class(
                'text-sm font-semibold text-gray-700 dark:text-gray-300'
              ),
              'Background'
            ),
            html.div(
              attr.class('flex flex-wrap gap-3'),
              ...[
                { token: '--bg-background', label: 'background' },
                { token: '--bg-surface', label: 'surface' },
                { token: '--bg-subtle', label: 'subtle' },
                { token: '--bg-elevated', label: 'elevated' },
              ].map(({ token, label }) =>
                html.div(
                  attr.class('flex items-center gap-2'),
                  html.div(
                    attr.class(
                      'w-6 h-6 rounded border border-gray-200 dark:border-gray-700 flex-shrink-0'
                    ),
                    attr.style(`background-color: var(${token})`)
                  ),
                  html.span(
                    attr.class(
                      'font-mono text-xs text-gray-600 dark:text-gray-400'
                    ),
                    token
                  ),
                  Badge(
                    { variant: 'outline', size: 'xs', color: 'base' },
                    label
                  )
                )
              )
            )
          ),

          // Border tokens
          html.div(
            attr.class('space-y-2'),
            html.h3(
              attr.class(
                'text-sm font-semibold text-gray-700 dark:text-gray-300'
              ),
              'Border'
            ),
            html.div(
              attr.class('flex flex-wrap gap-3'),
              ...[
                { token: '--border-default', label: 'default' },
                { token: '--border-subtle', label: 'subtle' },
                { token: '--border-input', label: 'input' },
              ].map(({ token, label }) =>
                html.div(
                  attr.class('flex items-center gap-2'),
                  html.div(
                    attr.class(
                      'w-6 h-6 rounded border-2 flex-shrink-0 bg-transparent'
                    ),
                    attr.style(`border-color: var(${token})`)
                  ),
                  html.span(
                    attr.class(
                      'font-mono text-xs text-gray-600 dark:text-gray-400'
                    ),
                    token
                  ),
                  Badge(
                    { variant: 'outline', size: 'xs', color: 'base' },
                    label
                  )
                )
              )
            )
          ),

          // Interactive tokens
          html.div(
            attr.class('space-y-2'),
            html.h3(
              attr.class(
                'text-sm font-semibold text-gray-700 dark:text-gray-300'
              ),
              'Interactive'
            ),
            html.div(
              attr.class('flex flex-wrap gap-3'),
              ...[
                { token: '--interactive-focus', label: 'focus' },
                { token: '--interactive-hover', label: 'hover' },
                { token: '--interactive-active', label: 'active' },
              ].map(({ token, label }) =>
                html.div(
                  attr.class('flex items-center gap-2'),
                  html.div(
                    attr.class('w-6 h-6 rounded flex-shrink-0'),
                    attr.style(`background-color: var(${token})`)
                  ),
                  html.span(
                    attr.class(
                      'font-mono text-xs text-gray-600 dark:text-gray-400'
                    ),
                    token
                  ),
                  Badge(
                    { variant: 'outline', size: 'xs', color: 'base' },
                    label
                  )
                )
              )
            )
          ),

          html.p(
            attr.class('text-sm text-gray-500 dark:text-gray-500'),
            'Use these tokens directly in your CSS to ensure your custom styles adapt to both themes automatically.'
          )
        )
      ),

      // Section 3: Customizing Theme Colors
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:swatchbook', size: 'sm' }),
            html.h2(
              attr.class('text-xl font-semibold'),
              'Customizing Theme Colors'
            )
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'With the Tailwind plugin, you map semantic color roles to any Tailwind color palette. BeatUI generates all the required CSS custom properties and dark-mode variants automatically.'
          ),
          CodeBlock(
            `import { beatuiTailwindPlugin } from '@tempots/beatui/tailwind'

// tailwind.config.ts
export default {
  plugins: [
    beatuiTailwindPlugin({
      semanticColors: {
        primary: 'sky',       // or 'blue', 'indigo', 'emerald', etc.
        secondary: 'cyan',
        success: 'green',
        warning: 'amber',
        danger: 'red',
        info: 'blue',
      },
    }),
  ],
}`,
            'typescript'
          ),
          html.div(
            attr.class('flex flex-wrap gap-2 items-center'),
            html.span(
              attr.class('text-sm text-gray-600 dark:text-gray-400'),
              'Supported palettes:'
            ),
            ...[
              'slate',
              'gray',
              'zinc',
              'red',
              'orange',
              'amber',
              'yellow',
              'lime',
              'green',
              'emerald',
              'teal',
              'cyan',
              'sky',
              'blue',
              'indigo',
              'violet',
              'purple',
              'fuchsia',
              'pink',
              'rose',
            ].map(color =>
              Badge({ variant: 'subtle', size: 'xs', color: 'base' }, color)
            )
          )
        )
      ),

      // Section 4: Custom Fonts
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:type', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Custom Fonts')
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            "The Tailwind plugin can load Google Fonts and wire them to BeatUI's semantic font roles. The ",
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              'heading'
            ),
            ' and ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              'body'
            ),
            ' roles map to the ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              '--font-heading'
            ),
            ' and ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              '--font-body'
            ),
            ' CSS variables used throughout BeatUI.'
          ),
          CodeBlock(
            `import { beatuiTailwindPlugin } from '@tempots/beatui/tailwind'

// tailwind.config.ts
export default {
  plugins: [
    beatuiTailwindPlugin({
      googleFonts: [
        { family: 'Inter', weights: [400, 500, 600, 700] },
      ],
      semanticFonts: {
        heading: '"Inter"',
        body: '"Inter"',
      },
    }),
  ],
}`,
            'typescript'
          ),
          html.p(
            attr.class('text-sm text-gray-500 dark:text-gray-500'),
            'Google Fonts are loaded automatically via a ',
            html.code(
              attr.class(
                'px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs'
              ),
              '<link>'
            ),
            ' tag injected into the document head. No manual setup required.'
          )
        )
      ),

      // Section 5: CSS Architecture
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:layers', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'CSS Architecture')
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'BeatUI uses a layered CSS architecture that keeps specificity predictable and styles overridable at every level.'
          ),
          html.div(
            attr.class('space-y-2'),
            html.div(
              attr.class(
                'flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
              ),
              Badge({ variant: 'filled', color: 'primary', size: 'sm' }, '1'),
              html.div(
                html.p(attr.class('font-medium text-sm'), 'base layer'),
                html.p(
                  attr.class('text-xs text-gray-500 dark:text-gray-400 mt-0.5'),
                  'CSS reset + all design tokens as custom properties. Everything below inherits from here.'
                )
              )
            ),
            html.div(
              attr.class(
                'flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
              ),
              Badge({ variant: 'filled', color: 'secondary', size: 'sm' }, '2'),
              html.div(
                html.p(attr.class('font-medium text-sm'), 'components layer'),
                html.p(
                  attr.class('text-xs text-gray-500 dark:text-gray-400 mt-0.5'),
                  'Component styles using the ',
                  html.code(attr.class('font-mono'), 'bc-'),
                  ' prefix with BEM-like naming (e.g. ',
                  html.code(attr.class('font-mono'), 'bc-button'),
                  ', ',
                  html.code(attr.class('font-mono'), 'bc-card'),
                  ').'
                )
              )
            )
          ),
          html.div(
            attr.class('space-y-2'),
            html.h3(
              attr.class(
                'text-sm font-semibold text-gray-700 dark:text-gray-300'
              ),
              'Overriding component styles'
            ),
            html.p(
              attr.class('text-sm text-gray-600 dark:text-gray-400'),
              'All component styles are overridable via CSS specificity or by redefining custom properties on a parent element. Dark mode uses ',
              html.code(
                attr.class(
                  'px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs'
                ),
                '.dark .bc-component'
              ),
              ' selectors, so you can scope overrides to either theme.'
            ),
            CodeBlock(
              `/* Override card background in your own CSS */
.my-custom-card.bc-card {
  --bc-card-bg: var(--bg-elevated);
}

/* Override only in dark mode */
.dark .bc-button.bc-button--primary {
  --bc-button-bg: #1e40af;
}`,
              'css'
            )
          )
        )
      ),

      // Section 6: Programmatic Theme Access
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:code-2', size: 'sm' }),
            html.h2(
              attr.class('text-xl font-semibold'),
              'Programmatic Theme Access'
            )
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'Access and react to the current theme appearance from anywhere in your component tree using ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              'Use(Theme, ...)'
            ),
            '. The ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              'appearance'
            ),
            ' signal reflects the resolved theme (',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              '"light"'
            ),
            ' or ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              '"dark"'
            ),
            ') and updates reactively as the user switches.'
          ),
          CodeBlock(
            `import { Use } from '@tempots/dom'
import { Theme } from '@tempots/beatui'

Use(Theme, ({ appearance }) =>
  html.div(
    appearance.map(a => \`Current theme: \${a}\`)
  )
)`,
            'typescript'
          ),
          html.div(
            attr.class('space-y-2'),
            html.h3(
              attr.class(
                'text-sm font-semibold text-gray-700 dark:text-gray-300'
              ),
              'Live example'
            ),
            html.div(
              attr.class(
                'p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center gap-3'
              ),
              Use(Theme, ({ appearance }) =>
                html.div(
                  attr.class('flex items-center gap-3'),
                  Icon({
                    icon: appearance.map((a): string =>
                      a === 'dark' ? 'lucide:moon' : 'lucide:sun'
                    ),
                    size: 'sm',
                  }),
                  html.span(
                    attr.class('text-sm font-mono'),
                    'appearance = ',
                    html.span(
                      attr.class(
                        'text-primary-600 dark:text-primary-400 font-semibold'
                      ),
                      appearance.map(a => `"${a}"`)
                    )
                  )
                )
              )
            )
          )
        )
      ),

      // Footer note
      html.div(
        attr.class(
          'pb-2 flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400'
        ),
        Icon({ icon: 'lucide:info', size: 'xs' }),
        html.p(
          'For the full list of available CSS custom properties, see the ',
          Anchor(
            { href: '/api', viewTransition: true },
            attr.class(
              'text-primary-600 dark:text-primary-400 hover:underline'
            ),
            'API reference'
          ),
          " or inspect the generated CSS variables in your browser's DevTools."
        )
      )
    ),
  })
}

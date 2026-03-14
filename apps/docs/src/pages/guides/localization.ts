import { html, attr } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Icon, Notice, Badge } from '@tempots/beatui'
import { Anchor } from '@tempots/ui'
import { CodeBlock } from '../../framework/code-block'

export const meta = {
  title: 'Localization',
  description:
    'Translate UI strings, create custom i18n providers, and integrate your own translations with BeatUI components.',
}

const BASIC_SETUP_CODE = `import { Provide } from '@tempots/dom'
import { BeatUI, Locale, BeatUII18n } from '@tempots/beatui'

BeatUI(
  {},
  // BeatUI() already sets up Locale + BeatUII18n providers.
  // Component labels, placeholders, and ARIA text
  // automatically update when the locale changes.
  YourApp()
)`

const LOCALE_SELECTOR_CODE = `import { LocaleSelector } from '@tempots/beatui'

// Provide a list of locales your app supports
LocaleSelector({
  locales: [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  ],
})`

const READING_BUILTIN_CODE = `import { Use } from '@tempots/dom'
import { BeatUII18n } from '@tempots/beatui'

// Access any built-in translation string reactively
Use(BeatUII18n, t =>
  html.div(
    html.button(t.$.confirm),         // "Confirm" / "Confirmar" / ...
    html.button(t.$.cancel),          // "Cancel" / "Cancelar" / ...
    html.span(t.$.loadingShort),      // "Loading..." / "Cargando..." / ...
  )
)`

const DEFINE_MESSAGES_CODE = `// src/i18n/locales/en.ts
const en = {
  appTitle: 'My Application',
  welcome: (name: string) => \`Welcome, \${name}!\`,
  dashboard: {
    title: 'Dashboard',
    noData: 'No data available',
    itemCount: (count: number) =>
      count === 1 ? '1 item' : \`\${count} items\`,
  },
}

export default en`

const DEFINE_LOCALE_CODE = `// src/i18n/locales/es.ts
import type { AppMessages } from '../default'

const es: AppMessages = {
  appTitle: 'Mi Aplicación',
  welcome: (name: string) => \`¡Bienvenido, \${name}!\`,
  dashboard: {
    title: 'Panel',
    noData: 'No hay datos disponibles',
    itemCount: (count: number) =>
      count === 1 ? '1 elemento' : \`\${count} elementos\`,
  },
}

export default es`

const DEFINE_DEFAULT_CODE = `// src/i18n/default.ts
import en from './locales/en'

export const defaultMessages = en
export const defaultLocale = 'en'
export type AppMessages = typeof defaultMessages`

const CREATE_PROVIDER_CODE = `// src/i18n/translations.ts
import { makeI18nProvider } from '@tempots/beatui'
import { defaultLocale, defaultMessages, type AppMessages } from './default'

const localeLoaders = import.meta.glob(
  ['./locales/*.ts', '!./locales/en.ts'],
  { import: 'default' }
) as Record<string, () => Promise<AppMessages>>

export const AppI18n = makeI18nProvider<AppMessages>({
  defaultLocale,
  defaultMessages,
  localeLoader: async locale => {
    if (locale === defaultLocale) return defaultMessages
    const load = localeLoaders[\`./locales/\${locale}.ts\`]
    return load ? await load() : defaultMessages
  },
  providerName: 'AppI18n',
})`

const USE_PROVIDER_CODE = `import { Provide, Use, html, attr } from '@tempots/dom'
import { BeatUI, Locale } from '@tempots/beatui'
import { AppI18n } from './i18n/translations'

BeatUI(
  {},
  // Nest your provider inside BeatUI (which already provides Locale)
  Provide(AppI18n, {}, () =>
    Use(AppI18n, t =>
      html.div(
        html.h1(t.$.appTitle),
        html.p(t.map(m => m.welcome('Alice'))),
        html.p(t.map(m => m.dashboard.itemCount(42))),
      )
    )
  )
)`

const FALLBACK_CODE = `// Fallback chain when locale is 'es-AR':
// 1. Try to load './locales/es-AR.ts'
// 2. Fall back to base language './locales/es.ts'
// 3. Fall back to defaultMessages (English)
//
// You only need to provide locale files for
// languages you actually support.`

const AUTH_I18N_CODE = `import { Provide, Use } from '@tempots/dom'
import { AuthI18n } from '@tempots/beatui'

// AuthI18n provides translations for sign-in/sign-up forms
Provide(AuthI18n, {}, () =>
  Use(AuthI18n, t =>
    html.form(
      html.label(t.$.emailLabel),
      html.button(t.$.signInButton),
    )
  )
)`

export default function LocalizationPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-4xl mx-auto'),

      // Page header
      html.div(
        attr.class('space-y-3'),
        html.h1(attr.class('text-3xl font-bold'), 'Localization'),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400 max-w-2xl'),
          'BeatUI ships with a reactive i18n system that translates all built-in component strings automatically. You can also create your own i18n providers to manage application-level translations using the same pattern.'
        ),
        html.div(
          attr.class('flex gap-3 items-center'),
          Badge(
            { variant: 'light', color: 'primary', size: 'sm' },
            '19 Locales'
          ),
          Badge(
            { variant: 'light', color: 'secondary', size: 'sm' },
            'Reactive'
          ),
          Badge(
            { variant: 'light', color: 'success', size: 'sm' },
            'Lazy Loading'
          )
        )
      ),

      // Section 1: Built-in Translations
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:globe', size: 'sm' }),
            html.h2(
              attr.class('text-xl font-semibold'),
              'Built-in Translations'
            )
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'BeatUI components — buttons, modals, form inputs, data tables, editors, and more — all use a centralized ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              'BeatUII18n'
            ),
            ' provider for their UI strings. The ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              'BeatUI()'
            ),
            ' root component sets this up automatically, so all labels, placeholders, and accessibility text translate when the locale changes.'
          ),
          CodeBlock(BASIC_SETUP_CODE, 'typescript'),
          html.div(
            attr.class('space-y-2'),
            html.h3(
              attr.class(
                'text-sm font-semibold text-gray-700 dark:text-gray-300'
              ),
              'Supported locales'
            ),
            html.div(
              attr.class('flex flex-wrap gap-2'),
              ...[
                { code: 'en', name: 'English' },
                { code: 'es', name: 'Spanish' },
                { code: 'fr', name: 'French' },
                { code: 'de', name: 'German' },
                { code: 'it', name: 'Italian' },
                { code: 'pt', name: 'Portuguese' },
                { code: 'ja', name: 'Japanese' },
                { code: 'zh', name: 'Chinese' },
                { code: 'ko', name: 'Korean' },
                { code: 'ru', name: 'Russian' },
                { code: 'ar', name: 'Arabic' },
                { code: 'nl', name: 'Dutch' },
                { code: 'pl', name: 'Polish' },
                { code: 'tr', name: 'Turkish' },
                { code: 'vi', name: 'Vietnamese' },
                { code: 'hi', name: 'Hindi' },
                { code: 'fa', name: 'Persian' },
                { code: 'he', name: 'Hebrew' },
                { code: 'ur', name: 'Urdu' },
              ].map(({ code, name }) =>
                Badge(
                  { variant: 'outline', size: 'xs', color: 'base' },
                  `${code} — ${name}`
                )
              )
            )
          )
        )
      ),

      // Section 2: Switching Locale
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:languages', size: 'sm' }),
            html.h2(
              attr.class('text-xl font-semibold'),
              'Switching Locale'
            )
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'Use the ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              'LocaleSelector'
            ),
            ' component to let users pick their language, or call ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              'setLocale()'
            ),
            ' programmatically. The selected locale is persisted in ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              'localStorage'
            ),
            ' and restored on the next visit.'
          ),
          CodeBlock(LOCALE_SELECTOR_CODE, 'typescript'),
          Notice(
            { variant: 'info', title: 'Automatic direction' },
            'When the locale changes to an RTL language (Arabic, Hebrew, Persian, Urdu, etc.), text direction switches automatically. See the ',
            Anchor(
              { href: '/guides/rtl-ltr', viewTransition: true },
              attr.class(
                'text-primary-600 dark:text-primary-400 hover:underline'
              ),
              'RTL & LTR guide'
            ),
            ' for details.'
          )
        )
      ),

      // Section 3: Reading Built-in Strings
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:book-open', size: 'sm' }),
            html.h2(
              attr.class('text-xl font-semibold'),
              'Reading Built-in Strings'
            )
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'You can read BeatUI\'s built-in translations directly from the ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              'BeatUII18n'
            ),
            ' provider. The ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              't'
            ),
            ' value is a reactive signal — access the current messages with ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              't.$'
            ),
            ' and your UI updates automatically when the locale changes.'
          ),
          CodeBlock(READING_BUILTIN_CODE, 'typescript')
        )
      ),

      // Section 4: Creating Your Own i18n Provider
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:wrench', size: 'sm' }),
            html.h2(
              attr.class('text-xl font-semibold'),
              'Creating Your Own i18n Provider'
            )
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'For your application-level strings, create a custom i18n provider using ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              'makeI18nProvider'
            ),
            '. This gives you the same reactive, lazy-loaded translations that BeatUI components use internally.'
          ),

          // Step 1
          html.div(
            attr.class('space-y-2'),
            html.div(
              attr.class('flex items-center gap-2'),
              Badge({ variant: 'filled', color: 'primary', size: 'sm' }, '1'),
              html.h3(
                attr.class(
                  'text-sm font-semibold text-gray-700 dark:text-gray-300'
                ),
                'Define your default messages'
              )
            ),
            html.p(
              attr.class('text-sm text-gray-600 dark:text-gray-400'),
              'Create a locale file with all your application strings. This serves as both the fallback translation and the type definition for all other locales. Messages can be plain strings or functions for dynamic text.'
            ),
            CodeBlock(DEFINE_MESSAGES_CODE, 'typescript')
          ),

          // Step 2
          html.div(
            attr.class('space-y-2'),
            html.div(
              attr.class('flex items-center gap-2'),
              Badge({ variant: 'filled', color: 'primary', size: 'sm' }, '2'),
              html.h3(
                attr.class(
                  'text-sm font-semibold text-gray-700 dark:text-gray-300'
                ),
                'Export the type and defaults'
              )
            ),
            CodeBlock(DEFINE_DEFAULT_CODE, 'typescript')
          ),

          // Step 3
          html.div(
            attr.class('space-y-2'),
            html.div(
              attr.class('flex items-center gap-2'),
              Badge({ variant: 'filled', color: 'primary', size: 'sm' }, '3'),
              html.h3(
                attr.class(
                  'text-sm font-semibold text-gray-700 dark:text-gray-300'
                ),
                'Add translation files'
              )
            ),
            html.p(
              attr.class('text-sm text-gray-600 dark:text-gray-400'),
              'Each locale file must satisfy the ',
              html.code(
                attr.class(
                  'px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs'
                ),
                'AppMessages'
              ),
              ' type. TypeScript will flag any missing keys at compile time.'
            ),
            CodeBlock(DEFINE_LOCALE_CODE, 'typescript')
          ),

          // Step 4
          html.div(
            attr.class('space-y-2'),
            html.div(
              attr.class('flex items-center gap-2'),
              Badge({ variant: 'filled', color: 'primary', size: 'sm' }, '4'),
              html.h3(
                attr.class(
                  'text-sm font-semibold text-gray-700 dark:text-gray-300'
                ),
                'Create the provider'
              )
            ),
            html.p(
              attr.class('text-sm text-gray-600 dark:text-gray-400'),
              'Use ',
              html.code(
                attr.class(
                  'px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs'
                ),
                'import.meta.glob'
              ),
              ' to lazy-load locale files on demand. Only the active locale is loaded — other locales are fetched when the user switches.'
            ),
            CodeBlock(CREATE_PROVIDER_CODE, 'typescript')
          )
        )
      ),

      // Section 5: Using Your Provider
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:plug', size: 'sm' }),
            html.h2(
              attr.class('text-xl font-semibold'),
              'Using Your Provider'
            )
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'Nest your provider inside ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              'BeatUI()'
            ),
            ' (which already provides the ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              'Locale'
            ),
            ' context). Both BeatUI\'s built-in translations and your custom translations react to the same locale signal — switching locale updates everything at once.'
          ),
          CodeBlock(USE_PROVIDER_CODE, 'typescript'),
          html.div(
            attr.class('space-y-2'),
            html.h3(
              attr.class(
                'text-sm font-semibold text-gray-700 dark:text-gray-300'
              ),
              'Accessing messages'
            ),
            html.div(
              attr.class('grid grid-cols-1 sm:grid-cols-2 gap-2'),
              ...[
                {
                  pattern: 't.$.key',
                  desc: 'Read a string property directly as a reactive binding.',
                },
                {
                  pattern: 't.map(m => m.fn(arg))',
                  desc: 'Call a message function by mapping over the signal.',
                },
                {
                  pattern: 't.$.nested.key',
                  desc: 'Access nested message objects with dot notation.',
                },
              ].map(({ pattern, desc }) =>
                html.div(
                  attr.class(
                    'p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-1'
                  ),
                  html.code(
                    attr.class(
                      'font-mono text-xs font-semibold text-primary-600 dark:text-primary-400'
                    ),
                    pattern
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

      // Section 6: Locale Fallback Chain
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:arrow-down-to-line', size: 'sm' }),
            html.h2(
              attr.class('text-xl font-semibold'),
              'Locale Fallback Chain'
            )
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'When a locale is requested, BeatUI attempts to load the exact match first, then falls back to the base language, and finally to the default messages. This means you only need to provide locale files for the languages you want to support — unsupported locales gracefully fall back to the default.'
          ),
          html.div(
            attr.class('space-y-2'),
            ...[
              {
                step: '1',
                label: 'Exact locale',
                example: 'es-AR.ts',
                color: 'primary' as const,
              },
              {
                step: '2',
                label: 'Base language',
                example: 'es.ts',
                color: 'secondary' as const,
              },
              {
                step: '3',
                label: 'Default messages',
                example: 'en.ts',
                color: 'success' as const,
              },
            ].map(({ step, label, example, color }) =>
              html.div(
                attr.class(
                  'flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
                ),
                Badge({ variant: 'filled', color, size: 'sm' }, step),
                html.div(
                  html.p(attr.class('font-medium text-sm'), label),
                  html.p(
                    attr.class(
                      'text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono'
                    ),
                    example
                  )
                )
              )
            )
          ),
          CodeBlock(FALLBACK_CODE, 'typescript')
        )
      ),

      // Section 7: Auth i18n
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:lock', size: 'sm' }),
            html.h2(
              attr.class('text-xl font-semibold'),
              'Authentication Form Translations'
            )
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'If you use BeatUI\'s authentication components (sign-in, sign-up, password reset), a separate ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              'AuthI18n'
            ),
            ' provider handles their specific strings. It follows the same pattern and reacts to the same ',
            html.code(
              attr.class(
                'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm'
              ),
              'Locale'
            ),
            ' signal.'
          ),
          CodeBlock(AUTH_I18N_CODE, 'typescript')
        )
      ),

      // Section 8: Recommended File Structure
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:folder-tree', size: 'sm' }),
            html.h2(
              attr.class('text-xl font-semibold'),
              'Recommended File Structure'
            )
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'Organize your translations in a dedicated directory. Each locale is a separate file that is lazy-loaded on demand.'
          ),
          CodeBlock(
            `src/
  i18n/
    default.ts          # Re-exports defaults + AppMessages type
    translations.ts     # AppI18n provider (makeI18nProvider)
    locales/
      en.ts             # Default / fallback messages
      es.ts             # Spanish
      fr.ts             # French
      de.ts             # German
      ...               # Add more as needed`,
            'text'
          ),
          Notice(
            { variant: 'info', title: 'Type safety' },
            'All locale files import the ',
            html.code(
              attr.class(
                'font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'
              ),
              'AppMessages'
            ),
            ' type from your default module. TypeScript catches missing or mistyped keys at compile time, so translations stay in sync with your default messages.'
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
          'For direction-aware layout support, see the ',
          Anchor(
            { href: '/guides/rtl-ltr', viewTransition: true },
            attr.class(
              'text-primary-600 dark:text-primary-400 hover:underline'
            ),
            'RTL & LTR guide'
          ),
          '. For the full list of built-in message keys, see the ',
          Anchor(
            { href: '/api', viewTransition: true },
            attr.class(
              'text-primary-600 dark:text-primary-400 hover:underline'
            ),
            'API reference'
          ),
          '.'
        )
      )
    ),
  })
}

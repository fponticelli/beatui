import { html, attr } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Icon, Notice } from '@tempots/beatui'
import { CodeBlock } from '../../framework/code-block'

export const meta = {
  title: 'RTL & LTR',
  description:
    'Automatic direction detection, locale switching, logical properties, and bidirectional content support.',
}

const LOCALE_PROVIDER_CODE = `import { Use, Locale } from '@tempots/beatui'

Use(Locale, ({ locale, setLocale, direction, directionPreference, setDirectionPreference }) => {
  // locale: Signal<string> — current locale (e.g., 'en-US', 'ar-SA')
  // direction: Signal<'ltr' | 'rtl'> — computed from locale + preference
  // directionPreference: Signal<'auto' | 'ltr' | 'rtl'>
  // setLocale: (locale: string) => void
  // setDirectionPreference: (pref: 'auto' | 'ltr' | 'rtl') => void
})`

const DIRECTION_DETECTION_CODE = `// Direction is automatically set based on locale
setLocale('ar-SA') // → direction becomes 'rtl'
setLocale('en-US') // → direction becomes 'ltr'

// Override direction manually
setDirectionPreference('rtl') // Force RTL regardless of locale
setDirectionPreference('auto') // Back to automatic detection`

const LOGICAL_PROPERTIES_CSS_CODE = `/* Use logical properties instead of physical ones */
.my-component {
  padding-inline-start: 1rem;  /* Instead of padding-left */
  margin-inline-end: 0.5rem;   /* Instead of margin-right */
  text-align: start;            /* Instead of text-align: left */
}`

const DRAWER_CODE = `// Drawer opens from the correct side based on direction
Drawer(open => Button({
  onClick: () => open({
    side: 'left', // In RTL, 'left' stays left; use logical anchoring for adaptive behavior
    body: Stack(attr.class('p-4'), html.p('Direction-aware drawer content'))
  })
}, 'Open Drawer'))`

export default function RtlLtrGuidePage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-4xl mx-auto'),

      // Page header
      html.div(
        attr.class('space-y-3'),
        html.h1(
          attr.class('text-3xl font-bold'),
          'RTL & LTR Internationalization'
        ),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400 max-w-2xl'),
          'BeatUI supports right-to-left and left-to-right layouts out of the box. Text direction is detected automatically from the active locale, and all layout components adapt accordingly using CSS logical properties.'
        )
      ),

      // Section 1: Overview
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:globe', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Overview')
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'BeatUI provides three complementary mechanisms for bidirectional layout support:'
          ),
          html.ul(
            attr.class('space-y-2 text-sm text-gray-600 dark:text-gray-400'),
            html.li(
              attr.class('flex items-start gap-2'),
              html.span(
                attr.class(
                  'mt-1 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0'
                )
              ),
              html.span(
                html.strong('Automatic direction detection'),
                ' — the ',
                html.code(
                  attr.class(
                    'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
                  ),
                  'Locale'
                ),
                ' provider resolves the writing direction from the active locale string and exposes it as a reactive signal.'
              )
            ),
            html.li(
              attr.class('flex items-start gap-2'),
              html.span(
                attr.class(
                  'mt-1 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0'
                )
              ),
              html.span(
                html.strong('Direction preference override'),
                ' — users or developers can force a specific direction with ',
                html.code(
                  attr.class(
                    'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
                  ),
                  "setDirectionPreference('rtl' | 'ltr' | 'auto')"
                ),
                ' without changing the locale.'
              )
            ),
            html.li(
              attr.class('flex items-start gap-2'),
              html.span(
                attr.class(
                  'mt-1 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0'
                )
              ),
              html.span(
                html.strong('CSS logical properties'),
                ' — all BeatUI components use ',
                html.code(
                  attr.class(
                    'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
                  ),
                  'padding-inline-start'
                ),
                ', ',
                html.code(
                  attr.class(
                    'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
                  ),
                  'margin-inline-end'
                ),
                ', etc., so layouts flip automatically when direction changes.'
              )
            )
          ),
          Notice(
            { variant: 'info', title: 'RTL language detection' },
            'BeatUI detects text direction automatically from the locale. RTL languages include Arabic (',
            html.code(
              attr.class(
                'font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'
              ),
              'ar'
            ),
            '), Hebrew (',
            html.code(
              attr.class(
                'font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'
              ),
              'he'
            ),
            '), Persian (',
            html.code(
              attr.class(
                'font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'
              ),
              'fa'
            ),
            '), Urdu (',
            html.code(
              attr.class(
                'font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'
              ),
              'ur'
            ),
            '), and others.'
          )
        )
      ),

      // Section 2: Using the Locale Provider
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:settings', size: 'sm' }),
            html.h2(
              attr.class('text-xl font-semibold'),
              'Using the Locale Provider'
            )
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'Access locale and direction state anywhere in your component tree using ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded'
              ),
              'Use(Locale, ...)'
            ),
            '. All values are reactive signals — your UI updates automatically whenever the locale or direction changes.'
          ),
          CodeBlock(LOCALE_PROVIDER_CODE, 'typescript'),
          html.div(
            attr.class('space-y-2'),
            html.h3(
              attr.class(
                'text-sm font-semibold text-gray-700 dark:text-gray-300'
              ),
              'Available context values'
            ),
            html.div(
              attr.class('grid grid-cols-1 sm:grid-cols-2 gap-2'),
              ...[
                {
                  name: 'locale',
                  type: "Signal<string>",
                  desc: "Current locale tag, e.g. 'en-US' or 'ar-SA'.",
                },
                {
                  name: 'setLocale',
                  type: '(locale: string) => void',
                  desc: 'Change the active locale; direction is recomputed automatically.',
                },
                {
                  name: 'direction',
                  type: "Signal<'ltr' | 'rtl'>",
                  desc: 'Resolved direction — derived from locale and directionPreference.',
                },
                {
                  name: 'directionPreference',
                  type: "Signal<'auto' | 'ltr' | 'rtl'>",
                  desc: "Manual override. 'auto' defers to the locale.",
                },
                {
                  name: 'setDirectionPreference',
                  type: "(pref: 'auto' | 'ltr' | 'rtl') => void",
                  desc: 'Force a direction without changing the locale.',
                },
              ].map(({ name, type, desc }) =>
                html.div(
                  attr.class(
                    'p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-1'
                  ),
                  html.div(
                    attr.class('flex items-center gap-2'),
                    html.code(
                      attr.class(
                        'font-mono text-xs font-semibold text-primary-600 dark:text-primary-400'
                      ),
                      name
                    ),
                    html.code(
                      attr.class(
                        'font-mono text-xs text-gray-500 dark:text-gray-400'
                      ),
                      type
                    )
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

      // Section 3: Direction Detection
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:compass', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Direction Detection')
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'Direction is computed automatically from the BCP 47 locale tag. You never need to specify a direction manually — just set the locale and BeatUI does the rest.'
          ),
          html.div(
            attr.class('space-y-2'),
            html.h3(
              attr.class(
                'text-sm font-semibold text-gray-700 dark:text-gray-300'
              ),
              'Supported RTL locales'
            ),
            html.div(
              attr.class('grid grid-cols-1 sm:grid-cols-2 gap-2'),
              ...[
                {
                  locale: 'ar-SA',
                  language: 'Arabic',
                  native: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629',
                },
                {
                  locale: 'he-IL',
                  language: 'Hebrew',
                  native: '\u05e2\u05d1\u05e8\u05d9\u05ea',
                },
                {
                  locale: 'fa-IR',
                  language: 'Persian',
                  native: '\u0641\u0627\u0631\u0633\u06cc',
                },
                {
                  locale: 'ur-PK',
                  language: 'Urdu',
                  native: '\u0627\u0631\u062f\u0648',
                },
              ].map(({ locale, language, native }) =>
                html.div(
                  attr.class(
                    'flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700'
                  ),
                  html.div(
                    attr.class('flex-1'),
                    html.p(
                      attr.class(
                        'text-sm font-medium text-gray-800 dark:text-gray-200'
                      ),
                      language
                    ),
                    html.code(
                      attr.class(
                        'font-mono text-xs text-gray-500 dark:text-gray-400'
                      ),
                      locale
                    )
                  ),
                  html.p(
                    attr.class(
                      'text-sm text-gray-600 dark:text-gray-400 font-medium'
                    ),
                    attr.dir('rtl'),
                    native
                  )
                )
              )
            )
          ),
          CodeBlock(DIRECTION_DETECTION_CODE, 'typescript')
        )
      ),

      // Section 4: CSS Logical Properties
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:arrow-left-right', size: 'sm' }),
            html.h2(
              attr.class('text-xl font-semibold'),
              'CSS Logical Properties'
            )
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'BeatUI components use CSS logical properties internally, so spacing and alignment flip automatically with the text direction. Use the same logical utilities in your own styles to achieve the same behaviour.'
          ),
          html.div(
            attr.class('grid grid-cols-1 sm:grid-cols-2 gap-3'),
            ...[
              {
                title: 'Direction Override',
                items: [
                  html.code(
                    attr.class(
                      'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
                    ),
                    '.ltr'
                  ),
                  ' forces left-to-right layout; ',
                  html.code(
                    attr.class(
                      'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
                    ),
                    '.rtl'
                  ),
                  ' forces right-to-left on any element.',
                ],
              },
              {
                title: 'Text Alignment',
                items: [
                  html.code(
                    attr.class(
                      'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
                    ),
                    '.text-start'
                  ),
                  ' and ',
                  html.code(
                    attr.class(
                      'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
                    ),
                    '.text-end'
                  ),
                  ' are direction-aware alternatives to text-left and text-right.',
                ],
              },
              {
                title: 'Logical Spacing',
                items: [
                  html.code(
                    attr.class(
                      'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
                    ),
                    '.ps-4'
                  ),
                  ' (padding-inline-start), ',
                  html.code(
                    attr.class(
                      'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
                    ),
                    '.pe-4'
                  ),
                  ', ',
                  html.code(
                    attr.class(
                      'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
                    ),
                    '.ms-4'
                  ),
                  ', ',
                  html.code(
                    attr.class(
                      'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
                    ),
                    '.me-4'
                  ),
                  ' mirror in RTL automatically.',
                ],
              },
              {
                title: 'Mixed Content',
                items: [
                  html.code(
                    attr.class(
                      'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
                    ),
                    '.bidi-isolate'
                  ),
                  ' applies ',
                  html.code(
                    attr.class(
                      'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
                    ),
                    'unicode-bidi: isolate'
                  ),
                  ' to prevent RTL/LTR bleed across adjacent text runs.',
                ],
              },
            ].map(({ title, items }) =>
              html.div(
                attr.class(
                  'p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-1.5'
                ),
                html.p(
                  attr.class(
                    'text-sm font-semibold text-gray-700 dark:text-gray-300'
                  ),
                  title
                ),
                html.p(
                  attr.class('text-xs text-gray-600 dark:text-gray-400'),
                  ...items
                )
              )
            )
          ),
          CodeBlock(LOGICAL_PROPERTIES_CSS_CODE, 'css')
        )
      ),

      // Section 5: Component Adaptation
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:layout', size: 'sm' }),
            html.h2(
              attr.class('text-xl font-semibold'),
              'Component Adaptation'
            )
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'All BeatUI layout components — ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
              ),
              'Stack'
            ),
            ', ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
              ),
              'Group'
            ),
            ', ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
              ),
              'Drawer'
            ),
            ', ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
              ),
              'Modal'
            ),
            ', and ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
              ),
              'Sidebar'
            ),
            ' — automatically adapt their internal spacing and alignment to the active text direction through CSS logical properties.'
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
              ),
              'Drawer'
            ),
            ' also supports semantic side anchoring. Using ',
            html.code(
              attr.class(
                'font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'
              ),
              "'inline-start'"
            ),
            ' always opens from the reading start edge regardless of whether the layout is LTR or RTL, eliminating the need for conditional logic in your components.'
          ),
          CodeBlock(DRAWER_CODE, 'typescript'),
          Notice(
            { variant: 'info', title: 'Physical vs. logical anchoring' },
            "Use ",
            html.code(
              attr.class(
                'font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'
              ),
              "'inline-start'"
            ),
            " / ",
            html.code(
              attr.class(
                'font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'
              ),
              "'inline-end'"
            ),
            " for direction-adaptive drawers and sidebars. Physical values like ",
            html.code(
              attr.class(
                'font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'
              ),
              "'left'"
            ),
            " and ",
            html.code(
              attr.class(
                'font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'
              ),
              "'right'"
            ),
            " are supported for cases where a fixed physical edge is intentional."
          )
        )
      ),

      // Section 6: Sample Multilingual Text
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:languages', size: 'sm' }),
            html.h2(
              attr.class('text-xl font-semibold'),
              'Sample Multilingual Text'
            )
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'The examples below demonstrate how the same semantic container renders LTR and RTL text correctly without any additional configuration.'
          ),
          html.div(
            attr.class('space-y-2'),
            ...[
              {
                label: 'English (LTR)',
                dir: 'ltr' as const,
                text: 'This text flows from left to right.',
                locale: 'en-US',
              },
              {
                label: 'Arabic (RTL)',
                dir: 'rtl' as const,
                text: '\u0647\u0630\u0627 \u0627\u0644\u0646\u0635 \u064a\u062a\u062f\u0641\u0642 \u0645\u0646 \u0627\u0644\u064a\u0645\u064a\u0646 \u0625\u0644\u0649 \u0627\u0644\u064a\u0633\u0627\u0631.',
                locale: 'ar-SA',
              },
              {
                label: 'Hebrew (RTL)',
                dir: 'rtl' as const,
                text: '\u05d4\u05d8\u05e7\u05e1\u05d8 \u05d4\u05d6\u05d4 \u05d6\u05d5\u05e8\u05dd \u05de\u05d9\u05de\u05d9\u05df \u05dc\u05e9\u05de\u05d0\u05dc.',
                locale: 'he-IL',
              },
            ].map(({ label, dir, text, locale }) =>
              html.div(
                attr.class(
                  'flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700'
                ),
                html.div(
                  attr.class('flex-1 space-y-1'),
                  html.div(
                    attr.class('flex items-center gap-2'),
                    html.span(
                      attr.class(
                        'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'
                      ),
                      label
                    ),
                    html.code(
                      attr.class(
                        'font-mono text-xs text-gray-400 dark:text-gray-500'
                      ),
                      locale
                    )
                  ),
                  html.p(
                    attr.class(
                      'text-sm text-gray-800 dark:text-gray-200 font-medium'
                    ),
                    attr.dir(dir),
                    text
                  )
                )
              )
            )
          )
        )
      ),

      // Section 7: Migration Checklist
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:check-square', size: 'sm' }),
            html.h2(
              attr.class('text-xl font-semibold'),
              'Migration Checklist'
            )
          ),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            'Follow these steps to add RTL support to an existing BeatUI application.'
          ),
          html.ol(
            attr.class('space-y-3'),
            ...[
              {
                step: 1,
                title: 'Update to the latest version of BeatUI',
                detail:
                  'RTL support and logical property utilities are available from BeatUI v1.0 onwards. Run pnpm update @tempots/beatui to get the latest release.',
              },
              {
                step: 2,
                title:
                  'Replace directional spacing utilities with logical ones',
                detail:
                  'Swap ms-* / me-* / ps-* / pe-* for their physical ml-* / mr-* / pl-* / pr-* counterparts throughout your markup.',
              },
              {
                step: 3,
                title: 'Replace text-left / text-right with text-start / text-end',
                detail:
                  'Direction-aware alignment utilities ensure text anchor points flip automatically in RTL contexts.',
              },
              {
                step: 4,
                title: 'Test with RTL locales',
                detail:
                  'Call setLocale("ar-SA"), setLocale("he-IL"), and setLocale("fa-IR") in your dev environment and visually inspect each page for layout regressions.',
              },
              {
                step: 5,
                title:
                  'Use direction override utilities for mixed-direction content',
                detail:
                  'Wrap inline code snippets, URLs, or product names with bidi-isolate to prevent bidirectional bleed into surrounding RTL text.',
              },
            ].map(({ step, title, detail }) =>
              html.li(
                attr.class(
                  'flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700'
                ),
                html.div(
                  attr.class(
                    'flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center'
                  ),
                  html.span(
                    attr.class(
                      'text-xs font-bold text-primary-700 dark:text-primary-300'
                    ),
                    String(step)
                  )
                ),
                html.div(
                  attr.class('space-y-0.5'),
                  html.p(
                    attr.class(
                      'text-sm font-medium text-gray-800 dark:text-gray-200'
                    ),
                    title
                  ),
                  html.p(
                    attr.class('text-xs text-gray-500 dark:text-gray-400'),
                    detail
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

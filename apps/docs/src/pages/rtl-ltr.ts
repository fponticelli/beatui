import { html, attr, Signal } from '@tempots/dom'
import {
  ScrollablePanel,
  Stack,
  Group,
  Button,
  SegmentedInput,
  Label,
  Drawer,
  Modal,
  Card,
  Use,
  Locale,
} from '@tempots/beatui'
import { ControlsHeader } from '../elements/controls-header'

export default function RTLLTRPage() {
  return Use(
    Locale,
    ({
      locale,
      setLocale,
      direction,
      directionPreference,
      setDirectionPreference,
    }) =>
      ScrollablePanel({
        header: ControlsHeader(
          Group(
            attr.class('gap-4'),
            Stack(
              Label('Locale'),
              SegmentedInput({
                value: locale as Signal<'en-US' | 'ar-SA' | 'he-IL' | 'fa-IR'>,
                options: {
                  'en-US': 'English',
                  'ar-SA': 'العربية',
                  'he-IL': 'עברית',
                  'fa-IR': 'فارسی',
                },
                onChange: setLocale,
              })
            ),
            Stack(
              Label('Direction Preference'),
              SegmentedInput({
                value: directionPreference,
                options: {
                  auto: 'Auto',
                  ltr: 'LTR',
                  rtl: 'RTL',
                },
                onChange: setDirectionPreference,
              })
            ),
            Stack(
              Label('Current Direction'),
              html.span(
                attr.class('font-bold text-primary'),
                direction.map(d => d.toUpperCase())
              )
            )
          )
        ),
        body: Stack(
          attr.class('p-6 gap-6'),

          // Introduction
          Card(
            { variant: 'outlined' },
            Stack(
              attr.class('gap-4'),
              html.h1(
                attr.class('text-2xl font-bold'),
                'RTL/LTR Internationalization'
              ),
              html.p(
                attr.class('text-gray-600'),
                'BeatUI provides comprehensive support for right-to-left (RTL) and left-to-right (LTR) text directions. The system automatically detects direction from locale and provides utilities for mixed-direction content.'
              )
            )
          ),

          // Direction Detection
          Card(
            { variant: 'outlined' },
            Stack(
              attr.class('gap-4'),
              html.h2(
                attr.class('text-xl font-semibold'),
                'Automatic Direction Detection'
              ),
              html.p(
                'BeatUI automatically detects text direction based on the locale. RTL languages include Arabic (ar), Hebrew (he), Persian (fa), Urdu (ur), and others.'
              ),
              html.div(
                attr.class('p-4 bg-gray-200 rounded'),
                html.code('Current locale: '),
                locale,
                html.br(),
                html.code('Detected direction: '),
                direction.map(String),
                html.br(),
                html.code('Direction preference: '),
                directionPreference.map(String)
              )
            )
          ),

          // Layout Components
          Card(
            { variant: 'outlined' },
            Stack(
              attr.class('gap-4'),
              html.h2(attr.class('text-xl font-semibold'), 'Layout Components'),
              html.p(
                'Layout components automatically adapt to text direction:'
              ),

              Group(
                attr.class('gap-4'),
                Drawer((open, _close) =>
                  Button(
                    {
                      onClick: () =>
                        open({
                          side: 'left',
                          body: Stack(
                            attr.class('p-4 gap-4'),
                            html.h3(
                              attr.class('font-semibold'),
                              'Direction-Aware Drawer'
                            ),
                            html.p(
                              'This drawer opens from the left side. With semantic anchoring support, you can use "inline-start" and "inline-end" for RTL-aware positioning.'
                            )
                          ),
                        }),
                    },
                    'Open Drawer'
                  )
                ),
                Modal({ position: 'center' }, (open, _close) =>
                  Button(
                    {
                      onClick: () =>
                        open({
                          body: Stack(
                            attr.class('gap-4'),
                            html.p(
                              'This modal is positioned at the center and adapts to text direction.'
                            )
                          ),
                        }),
                    },
                    'Open Modal'
                  )
                )
              ),

              // Sample text in different directions
              html.div(
                attr.class('p-4 border rounded'),
                html.h3(attr.class('font-semibold mb-2'), 'Sample Text'),
                html.p(
                  attr.class('mb-2'),
                  'English text (LTR): This text flows from left to right.'
                ),
                html.p(
                  attr.class('mb-2 rtl'),
                  'Arabic text (RTL): هذا النص يتدفق من اليمين إلى اليسار.'
                ),
                html.p(
                  attr.class('mb-2 rtl'),
                  'Hebrew text (RTL): הטקסט הזה זורם מימין לשמאל.'
                )
              )
            )
          ),

          // Utility Classes
          Card(
            { variant: 'outlined' },
            Stack(
              attr.class('gap-4'),
              html.h2(
                attr.class('text-xl font-semibold'),
                'Direction Utilities'
              ),
              html.p('BeatUI provides utility classes for direction control:'),

              html.div(
                attr.class('grid grid-cols-1 md:grid-cols-2 gap-4'),

                // Direction Override
                html.div(
                  attr.class('p-4 border rounded'),
                  html.h4(
                    attr.class('font-semibold mb-2'),
                    'Direction Override'
                  ),
                  html.div(
                    attr.class('space-y-2'),
                    html.div(attr.class('ltr'), '.ltr - Force LTR'),
                    html.div(attr.class('rtl'), '.rtl - Force RTL')
                  )
                ),

                // Text Alignment
                html.div(
                  attr.class('p-4 border rounded'),
                  html.h4(attr.class('font-semibold mb-2'), 'Text Alignment'),
                  html.div(
                    attr.class('space-y-2'),
                    html.div(
                      attr.class('text-start'),
                      '.text-start - Align to start'
                    ),
                    html.div(attr.class('text-end'), '.text-end - Align to end')
                  )
                ),

                // Logical Properties
                html.div(
                  attr.class('p-4 border rounded'),
                  html.h4(
                    attr.class('font-semibold mb-2'),
                    'Logical Properties'
                  ),
                  html.div(
                    attr.class('space-y-2'),
                    html.div(
                      attr.class('ps-4 bg-gray-200'),
                      '.ps-4 - Padding inline start'
                    ),
                    html.div(
                      attr.class('pe-4 bg-gray-200'),
                      '.pe-4 - Padding inline end'
                    ),
                    html.div(
                      attr.class('ms-4 bg-gray-200'),
                      '.ms-4 - Margin inline start'
                    ),
                    html.div(
                      attr.class('me-4 bg-gray-200'),
                      '.me-4 - Margin inline end'
                    )
                  )
                ),

                // Mixed Content
                html.div(
                  attr.class('p-4 border rounded'),
                  html.h4(attr.class('font-semibold mb-2'), 'Mixed Content'),
                  html.div(
                    attr.class('space-y-2'),
                    html.div(
                      attr.class('isolate-ltr'),
                      '.isolate-ltr - Isolate LTR content'
                    ),
                    html.div(
                      attr.class('isolate-rtl'),
                      '.isolate-rtl - Isolate RTL content'
                    ),
                    html.div(
                      attr.class('bidi-isolate'),
                      '.bidi-isolate - Bidirectional isolation'
                    )
                  )
                )
              )
            )
          ),

          // Migration Guide
          Card(
            { variant: 'outlined' },
            Stack(
              attr.class('gap-4'),
              html.h2(attr.class('text-xl font-semibold'), 'Migration Guide'),
              html.p('To add RTL support to existing BeatUI projects:'),
              html.ol(
                attr.class('list-decimal list-inside space-y-2'),
                html.li('Update to the latest version of BeatUI'),
                html.li(
                  'Use logical property utilities (ms-*, me-*, ps-*, pe-*) instead of directional ones'
                ),
                html.li(
                  'Replace text-left/right with text-start/end for direction-aware alignment'
                ),
                html.li(
                  'Test your components with RTL locales (ar-SA, he-IL, fa-IR)'
                ),
                html.li(
                  'Use direction override utilities for mixed-direction content'
                )
              )
            )
          )
        ),
      })
  )
}

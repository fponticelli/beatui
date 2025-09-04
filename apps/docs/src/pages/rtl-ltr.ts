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
            attr.class('bu-gap-4'),
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
                attr.class('bu-font-bold bu-text-primary'),
                direction.map(d => d.toUpperCase())
              )
            )
          )
        ),
        body: Stack(
          attr.class('bu-p-6 bu-gap-6'),

          // Introduction
          Card(
            { variant: 'outlined' },
            Stack(
              attr.class('bu-gap-4'),
              html.h1(
                attr.class('bu-text-2xl bu-font-bold'),
                'RTL/LTR Internationalization'
              ),
              html.p(
                attr.class('bu-text-gray'),
                'BeatUI provides comprehensive support for right-to-left (RTL) and left-to-right (LTR) text directions. The system automatically detects direction from locale and provides utilities for mixed-direction content.'
              )
            )
          ),

          // Direction Detection
          Card(
            { variant: 'outlined' },
            Stack(
              attr.class('bu-gap-4'),
              html.h2(
                attr.class('bu-text-xl bu-font-semibold'),
                'Automatic Direction Detection'
              ),
              html.p(
                'BeatUI automatically detects text direction based on the locale. RTL languages include Arabic (ar), Hebrew (he), Persian (fa), Urdu (ur), and others.'
              ),
              html.div(
                attr.class('bu-p-4 bu-bg-light-gray bu-rounded'),
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
              attr.class('bu-gap-4'),
              html.h2(
                attr.class('bu-text-xl bu-font-semibold'),
                'Layout Components'
              ),
              html.p(
                'Layout components automatically adapt to text direction:'
              ),

              Group(
                attr.class('bu-gap-4'),
                Drawer((open, _close) =>
                  Button(
                    {
                      onClick: () =>
                        open({
                          side: 'left',
                          body: Stack(
                            attr.class('bu-p-4 bu-gap-4'),
                            html.h3(
                              attr.class('bu-font-semibold'),
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
                            attr.class('bu-gap-4'),
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
                attr.class('bu-p-4 bu-border bu-rounded'),
                html.h3(attr.class('bu-font-semibold bu-mb-2'), 'Sample Text'),
                html.p(
                  attr.class('bu-mb-2'),
                  'English text (LTR): This text flows from left to right.'
                ),
                html.p(
                  attr.class('bu-mb-2 bu-dir-rtl'),
                  'Arabic text (RTL): هذا النص يتدفق من اليمين إلى اليسار.'
                ),
                html.p(
                  attr.class('bu-mb-2 bu-dir-rtl'),
                  'Hebrew text (RTL): הטקסט הזה זורם מימין לשמאל.'
                )
              )
            )
          ),

          // Utility Classes
          Card(
            { variant: 'outlined' },
            Stack(
              attr.class('bu-gap-4'),
              html.h2(
                attr.class('bu-text-xl bu-font-semibold'),
                'Direction Utilities'
              ),
              html.p('BeatUI provides utility classes for direction control:'),

              html.div(
                attr.class('bu-grid bu-grid-cols-1 md:bu-grid-cols-2 bu-gap-4'),

                // Direction Override
                html.div(
                  attr.class('bu-p-4 bu-border bu-rounded'),
                  html.h4(
                    attr.class('bu-font-semibold bu-mb-2'),
                    'Direction Override'
                  ),
                  html.div(
                    attr.class('bu-space-y-2'),
                    html.div(
                      attr.class('bu-dir-ltr'),
                      '.bu-dir-ltr - Force LTR'
                    ),
                    html.div(
                      attr.class('bu-dir-rtl'),
                      '.bu-dir-rtl - Force RTL'
                    )
                  )
                ),

                // Text Alignment
                html.div(
                  attr.class('bu-p-4 bu-border bu-rounded'),
                  html.h4(
                    attr.class('bu-font-semibold bu-mb-2'),
                    'Text Alignment'
                  ),
                  html.div(
                    attr.class('bu-space-y-2'),
                    html.div(
                      attr.class('bu-text-start'),
                      '.bu-text-start - Align to start'
                    ),
                    html.div(
                      attr.class('bu-text-end'),
                      '.bu-text-end - Align to end'
                    )
                  )
                ),

                // Logical Properties
                html.div(
                  attr.class('bu-p-4 bu-border bu-rounded'),
                  html.h4(
                    attr.class('bu-font-semibold bu-mb-2'),
                    'Logical Properties'
                  ),
                  html.div(
                    attr.class('bu-space-y-2'),
                    html.div(
                      attr.class('bu-ps-4 bu-bg-light-gray'),
                      '.bu-ps-4 - Padding inline start'
                    ),
                    html.div(
                      attr.class('bu-pe-4 bu-bg-light-gray'),
                      '.bu-pe-4 - Padding inline end'
                    ),
                    html.div(
                      attr.class('bu-ms-4 bu-bg-light-gray'),
                      '.bu-ms-4 - Margin inline start'
                    ),
                    html.div(
                      attr.class('bu-me-4 bu-bg-light-gray'),
                      '.bu-me-4 - Margin inline end'
                    )
                  )
                ),

                // Mixed Content
                html.div(
                  attr.class('bu-p-4 bu-border bu-rounded'),
                  html.h4(
                    attr.class('bu-font-semibold bu-mb-2'),
                    'Mixed Content'
                  ),
                  html.div(
                    attr.class('bu-space-y-2'),
                    html.div(
                      attr.class('bu-isolate-ltr'),
                      '.bu-isolate-ltr - Isolate LTR content'
                    ),
                    html.div(
                      attr.class('bu-isolate-rtl'),
                      '.bu-isolate-rtl - Isolate RTL content'
                    ),
                    html.div(
                      attr.class('bu-bidi-isolate'),
                      '.bu-bidi-isolate - Bidirectional isolation'
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
              attr.class('bu-gap-4'),
              html.h2(
                attr.class('bu-text-xl bu-font-semibold'),
                'Migration Guide'
              ),
              html.p('To add RTL support to existing BeatUI projects:'),
              html.ol(
                attr.class('bu-list-decimal bu-list-inside bu-space-y-2'),
                html.li('Update to the latest version of BeatUI'),
                html.li(
                  'Use logical property utilities (bu-ms-*, bu-me-*, bu-ps-*, bu-pe-*) instead of directional ones'
                ),
                html.li(
                  'Replace bu-text-left/right with bu-text-start/end for direction-aware alignment'
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

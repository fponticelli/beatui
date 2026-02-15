import { html, attr, style } from '@tempots/dom'
import {
  Stack,
  Card,
  OpenGraph,
  colors,
  colorShades,
  semanticColors,
  semanticColorNames,
  bgColors,
  textColors,
  borderColors,
  interactiveColors,
  normalizeColorName,
  spacing,
  semanticSpacingNames,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  fontFamily,
  semanticFontNames,
  radius,
  semanticRadiusNames,
  shadows,
  semanticShadowNames,
  textShadows,
  semanticTextShadowNames,
  motionDurations,
  motionEasings,
  semanticMotionNames,
  zIndex,
  breakpoints,
} from '@tempots/beatui'

// ─── Constants ───

const colorNames = Object.keys(colors) as (keyof typeof colors)[]

const spacingPx: Record<string, string> = {
  none: '0',
  px: '1px',
  base: '4px',
  xs: '2px',
  sm: '4px',
  smh: '6px',
  md: '8px',
  mdh: '12px',
  lg: '16px',
  lgh: '20px',
  xl: '24px',
  '2xl': '32px',
  '2xlh': '40px',
  '3xl': '48px',
  '4xl': '64px',
  full: '2000px',
}

const fontSizePx: Record<string, string> = {
  '3xs': '8px',
  '2xs': '10px',
  xs: '12px',
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
  '5xl': '48px',
  '6xl': '60px',
  '7xl': '72px',
  '8xl': '96px',
  '9xl': '128px',
}

const radiusPx: Record<string, string> = {
  none: '0',
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
}

// ─── Helpers ───

function resolveColorValue(colorName: string, shade: number): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolved = normalizeColorName(colorName as any)
  if (resolved === 'white') return 'white'
  if (resolved === 'black') return 'black'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const palette = (colors as any)[resolved]
  return palette?.[shade] ?? 'transparent'
}

function Swatch(color: string, size = '20px') {
  return html.span(
    attr.class('inline-block rounded-sm'),
    style.width(size),
    style.height(size),
    style.backgroundColor(color),
    style.boxShadow('inset 0 0 0 1px rgba(0,0,0,0.1)')
  )
}

function SectionCard(title: string, ...children: unknown[]) {
  return Card(
    { variant: 'outlined' },
    attr.class('p-5'),
    Stack(
      attr.class('gap-3'),
      html.h2(attr.class('text-xl font-semibold'), title),
      ...children
    )
  )
}

function Th(...children: unknown[]) {
  return html.th(
    attr.class(
      'text-left p-2 border-b-2 border-gray-200 dark:border-gray-700 font-medium text-sm'
    ),
    ...children
  )
}

function Td(...children: unknown[]) {
  return html.td(
    attr.class('p-2 border-b border-gray-100 dark:border-gray-800'),
    ...children
  )
}

function Code(text: string) {
  return html.code(
    attr.class(
      'text-xs font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded'
    ),
    text
  )
}

function Desc(text: string) {
  return html.p(attr.class('text-sm text-gray-600 dark:text-gray-400'), text)
}

function SubHeading(text: string) {
  return html.h3(attr.class('text-base font-medium mt-4'), text)
}

// ─── Sections ───

function ArchitectureSection() {
  return SectionCard(
    'Architecture Overview',
    Desc(
      "BeatUI's design tokens flow through a pipeline: TypeScript definitions \u2192 Vite build plugin \u2192 CSS custom properties on :root \u2192 theme classes (.light / .dark) for mode-specific overrides."
    ),
    html.div(
      attr.class('flex flex-wrap gap-2 items-center text-sm'),
      html.span(
        attr.class(
          'px-3 py-1.5 bg-blue-100 dark:bg-blue-900 rounded font-medium'
        ),
        'TypeScript tokens'
      ),
      html.span(attr.class('text-gray-400'), '\u2192'),
      html.span(
        attr.class(
          'px-3 py-1.5 bg-green-100 dark:bg-green-900 rounded font-medium'
        ),
        'Vite plugin'
      ),
      html.span(attr.class('text-gray-400'), '\u2192'),
      html.span(
        attr.class(
          'px-3 py-1.5 bg-purple-100 dark:bg-purple-900 rounded font-medium'
        ),
        'CSS :root vars'
      ),
      html.span(attr.class('text-gray-400'), '\u2192'),
      html.span(
        attr.class(
          'px-3 py-1.5 bg-orange-100 dark:bg-orange-900 rounded font-medium'
        ),
        '.light / .dark classes'
      )
    )
  )
}

function ColorPaletteSection() {
  return SectionCard(
    'Color Palettes',
    Desc(
      `${colorNames.length} palettes with ${colorShades.length} shades each (OKLCH color space). Hover swatches for CSS variable names.`
    ),
    html.div(
      attr.class('overflow-x-auto'),
      html.div(
        attr.class('inline-flex flex-col gap-0.5'),
        // Shade header
        html.div(
          attr.class('flex items-center'),
          html.span(style.width('72px'), style.flexShrink('0')),
          html.div(
            attr.class('flex gap-px'),
            ...colorShades.map(shade =>
              html.span(
                attr.class('text-xs font-mono text-gray-400 text-center'),
                style.width('28px'),
                String(shade)
              )
            )
          )
        ),
        // Color rows
        ...colorNames.map(name =>
          html.div(
            attr.class('flex items-center'),
            html.span(
              attr.class('text-xs font-mono text-right pr-2'),
              style.width('72px'),
              style.flexShrink('0'),
              name
            ),
            html.div(
              attr.class('flex gap-px'),
              ...colorShades.map(shade => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const value = (colors as any)[name][shade] as string
                return html.div(
                  style.backgroundColor(value),
                  style.width('28px'),
                  style.height('20px'),
                  style.borderRadius('3px'),
                  attr.title(`--color-${name}-${shade}: ${value}`)
                )
              })
            )
          )
        )
      )
    )
  )
}

function SemanticColorsSection() {
  return SectionCard(
    'Semantic Colors',
    Desc(
      'Semantic colors map role names to base palette colors. Override these to theme your application.'
    ),
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(
          html.tr(Th('Semantic Name'), Th('Maps to'), Th('Preview'))
        ),
        html.tbody(
          ...semanticColorNames.map(name => {
            const baseColor = semanticColors[name]
            return html.tr(
              Td(Code(`--color-${name}-*`)),
              Td(Code(baseColor)),
              Td(
                html.div(
                  attr.class('flex gap-px'),
                  ...[100, 300, 500, 700, 900].map(shade => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const value = (colors as any)[baseColor]?.[shade] as string
                    return html.div(
                      style.backgroundColor(value ?? 'transparent'),
                      style.width('20px'),
                      style.height('20px'),
                      style.borderRadius('3px')
                    )
                  })
                )
              )
            )
          })
        )
      )
    )
  )
}

function ThemeColorsSection() {
  function renderThemeTable(
    title: string,
    varPrefix: string,
    lightMap: Record<string, readonly [string, number]>,
    darkMap: Record<string, readonly [string, number]>
  ) {
    const entries = Object.entries(lightMap)
    return html.div(
      attr.class('space-y-2'),
      html.h3(attr.class('text-base font-medium'), title),
      html.div(
        attr.class('overflow-x-auto'),
        html.table(
          attr.class('w-full text-sm'),
          html.thead(html.tr(Th('Name'), Th('Light'), Th('Dark'))),
          html.tbody(
            ...entries.map(([name, lightTuple]) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const darkTuple = ((darkMap as any)[name] ??
                lightTuple) as readonly [string, number]
              return html.tr(
                Td(Code(`--${varPrefix}-${name}`)),
                Td(
                  html.div(
                    attr.class('flex items-center gap-2'),
                    Swatch(
                      resolveColorValue(lightTuple[0], lightTuple[1]),
                      '18px'
                    ),
                    html.span(
                      attr.class('text-xs font-mono'),
                      `${lightTuple[0]}-${lightTuple[1]}`
                    )
                  )
                ),
                Td(
                  html.div(
                    attr.class('flex items-center gap-2'),
                    Swatch(
                      resolveColorValue(darkTuple[0], darkTuple[1]),
                      '18px'
                    ),
                    html.span(
                      attr.class('text-xs font-mono'),
                      `${darkTuple[0]}-${darkTuple[1]}`
                    )
                  )
                )
              )
            })
          )
        )
      )
    )
  }

  return SectionCard(
    'Theme Colors',
    Desc(
      'Theme-aware colors that change between light and dark modes. Each variable resolves to a base color at a specific shade.'
    ),
    renderThemeTable(
      'Background',
      'bg',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bgColors.light as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bgColors.dark as any
    ),
    renderThemeTable(
      'Text',
      'text',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      textColors.light as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      textColors.dark as any
    ),
    renderThemeTable(
      'Border',
      'border',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      borderColors.light as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      borderColors.dark as any
    ),
    renderThemeTable(
      'Interactive',
      'interactive',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      interactiveColors.light as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      interactiveColors.dark as any
    )
  )
}

function SpacingSection() {
  return SectionCard(
    'Spacing',
    Desc(
      'Spacing scale based on a 0.25rem (4px) base unit. All values are computed as multiples of --spacing-base.'
    ),
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(
          html.tr(
            Th('Name'),
            Th('CSS Variable'),
            Th('Value'),
            Th('Approx'),
            Th('Preview')
          )
        ),
        html.tbody(
          ...Object.entries(spacing).map(([name, value]) =>
            html.tr(
              Td(html.span(attr.class('font-medium'), name)),
              Td(Code(`--spacing-${name}`)),
              Td(html.span(attr.class('text-xs font-mono'), value)),
              Td(html.span(attr.class('text-xs'), spacingPx[name] ?? '')),
              Td(
                html.div(
                  style.width(spacingPx[name] ?? '0'),
                  style.height('12px'),
                  style.backgroundColor('var(--color-primary-500)'),
                  style.borderRadius('2px'),
                  style.minWidth('1px')
                )
              )
            )
          )
        )
      )
    ),
    SubHeading('Semantic Spacing'),
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(html.tr(Th('Name'), Th('CSS Variable'))),
        html.tbody(
          ...semanticSpacingNames.map(name =>
            html.tr(
              Td(html.span(attr.class('font-medium'), name)),
              Td(Code(`--spacing-${name}`))
            )
          )
        )
      )
    )
  )
}

function TypographySection() {
  return SectionCard(
    'Typography',
    // Font Sizes
    html.h3(attr.class('text-base font-medium'), 'Font Sizes'),
    Desc('All sizes are relative to --base-font-size (1rem = 16px).'),
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(
          html.tr(Th('Name'), Th('CSS Variable'), Th('Approx'), Th('Preview'))
        ),
        html.tbody(
          ...Object.keys(fontSize).map(name =>
            html.tr(
              Td(html.span(attr.class('font-medium'), name)),
              Td(Code(`--font-size-${name}`)),
              Td(html.span(attr.class('text-xs'), fontSizePx[name] ?? '')),
              Td(
                html.span(
                  style.fontSize(`var(--font-size-${name})`),
                  style.lineHeight(`var(--font-size-${name}-lh)`),
                  'Aa'
                )
              )
            )
          )
        )
      )
    ),
    // Font Weights
    SubHeading('Font Weights'),
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(
          html.tr(
            Th('Name'),
            Th('CSS Variable'),
            Th('Value'),
            Th('Preview')
          )
        ),
        html.tbody(
          ...Object.entries(fontWeight).map(([name, value]) =>
            html.tr(
              Td(html.span(attr.class('font-medium'), name)),
              Td(Code(`--font-weight-${name}`)),
              Td(html.span(attr.class('text-xs font-mono'), value)),
              Td(
                html.span(
                  style.fontWeight(value),
                  'The quick brown fox'
                )
              )
            )
          )
        )
      )
    ),
    // Line Heights
    SubHeading('Line Heights'),
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(html.tr(Th('Name'), Th('CSS Variable'), Th('Value'))),
        html.tbody(
          ...Object.entries(lineHeight).map(([name, value]) =>
            html.tr(
              Td(html.span(attr.class('font-medium'), name)),
              Td(Code(`--line-height-${name}`)),
              Td(html.span(attr.class('text-xs font-mono'), value))
            )
          )
        )
      )
    ),
    // Letter Spacing
    SubHeading('Letter Spacing'),
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(
          html.tr(Th('Name'), Th('CSS Variable'), Th('Value'), Th('Preview'))
        ),
        html.tbody(
          ...Object.entries(letterSpacing).map(([name, value]) =>
            html.tr(
              Td(html.span(attr.class('font-medium'), name)),
              Td(Code(`--letter-spacing-${name}`)),
              Td(html.span(attr.class('text-xs font-mono'), value)),
              Td(
                html.span(style.letterSpacing(value), 'LETTER SPACING')
              )
            )
          )
        )
      )
    ),
    // Font Families
    SubHeading('Font Families'),
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(html.tr(Th('Name'), Th('CSS Variable'), Th('Stack'))),
        html.tbody(
          ...Object.entries(fontFamily).map(([name, stack]) =>
            html.tr(
              Td(html.span(attr.class('font-medium'), name)),
              Td(Code(`--font-family-${name}`)),
              Td(
                html.span(
                  attr.class('text-xs font-mono break-all'),
                  (stack as readonly string[]).join(', ')
                )
              )
            )
          )
        )
      )
    ),
    // Semantic Fonts
    SubHeading('Semantic Fonts'),
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(html.tr(Th('Role'), Th('CSS Variable'), Th('Default'))),
        html.tbody(
          ...semanticFontNames.map(name => {
            const defaults: Record<string, string> = {
              body: 'sans',
              heading: 'sans',
              display: 'sans',
              mono: 'mono',
              ui: 'sans',
              prose: 'serif',
            }
            return html.tr(
              Td(html.span(attr.class('font-medium'), name)),
              Td(Code(`--font-${name}`)),
              Td(
                html.span(
                  attr.class('text-xs font-mono'),
                  defaults[name] ?? ''
                )
              )
            )
          })
        )
      )
    )
  )
}

function RadiusSection() {
  return SectionCard(
    'Border Radius',
    Desc('Radius scale based on multiples of the spacing base unit.'),
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(
          html.tr(Th('Name'), Th('CSS Variable'), Th('Approx'), Th('Preview'))
        ),
        html.tbody(
          ...Object.entries(radius).map(([name, _value]) =>
            html.tr(
              Td(html.span(attr.class('font-medium'), name)),
              Td(Code(`--radius-${name}`)),
              Td(html.span(attr.class('text-xs'), radiusPx[name] ?? '')),
              Td(
                html.div(
                  style.width('40px'),
                  style.height('40px'),
                  style.backgroundColor('var(--color-primary-500)'),
                  style.borderRadius(radiusPx[name] ?? '0')
                )
              )
            )
          )
        )
      )
    ),
    SubHeading('Semantic Radius'),
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(html.tr(Th('Role'), Th('CSS Variable'), Th('Default'))),
        html.tbody(
          ...semanticRadiusNames.map(name => {
            const defaults: Record<string, string> = {
              control: 'md',
              'control-sm': 'sm',
              'control-xs': 'xs',
              button: 'md',
              surface: 'lg',
              overlay: 'lg',
              popover: 'md',
              pill: 'full',
              focus: 'sm',
            }
            return html.tr(
              Td(html.span(attr.class('font-medium'), name)),
              Td(Code(`--radius-${name}`)),
              Td(
                html.span(
                  attr.class('text-xs font-mono'),
                  defaults[name] ?? ''
                )
              )
            )
          })
        )
      )
    )
  )
}

function ShadowsSection() {
  const standardShadows = Object.entries(shadows).filter(
    ([name]) => !name.startsWith('top-')
  )
  const topShadows = Object.entries(shadows).filter(([name]) =>
    name.startsWith('top-')
  )

  return SectionCard(
    'Box Shadows',
    html.h3(attr.class('text-base font-medium'), 'Standard Shadows'),
    html.div(
      attr.class('space-y-3'),
      ...standardShadows.map(([name, value]) =>
        html.div(
          attr.class('flex items-center gap-4'),
          html.span(attr.class('w-28 shrink-0'), Code(`--shadow-${name}`)),
          html.div(
            attr.class('bg-white dark:bg-gray-800'),
            style.width('120px'),
            style.height('40px'),
            style.boxShadow(value),
            style.borderRadius('8px')
          )
        )
      )
    ),
    SubHeading('Top Shadows'),
    Desc('Upward-facing variants for bottom-anchored elements.'),
    html.div(
      attr.class('space-y-3'),
      ...topShadows.map(([name, value]) =>
        html.div(
          attr.class('flex items-center gap-4'),
          html.span(attr.class('w-28 shrink-0'), Code(`--shadow-${name}`)),
          html.div(
            attr.class('bg-white dark:bg-gray-800'),
            style.width('120px'),
            style.height('40px'),
            style.boxShadow(value),
            style.borderRadius('8px')
          )
        )
      )
    ),
    SubHeading('Semantic Shadows'),
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(html.tr(Th('Role'), Th('CSS Variable'), Th('Default'))),
        html.tbody(
          ...semanticShadowNames.map(name => {
            const defaults: Record<string, string> = {
              surface: 'sm',
              'surface-elevated': 'md',
              popover: 'lg',
              overlay: 'xl',
              button: 'xs',
            }
            return html.tr(
              Td(html.span(attr.class('font-medium'), name)),
              Td(Code(`--shadow-${name}`)),
              Td(
                html.span(
                  attr.class('text-xs font-mono'),
                  defaults[name] ?? ''
                )
              )
            )
          })
        )
      )
    )
  )
}

function TextShadowsSection() {
  return SectionCard(
    'Text Shadows',
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(
          html.tr(Th('Name'), Th('CSS Variable'), Th('Preview'))
        ),
        html.tbody(
          ...Object.entries(textShadows).map(([name, value]) =>
            html.tr(
              Td(html.span(attr.class('font-medium'), name)),
              Td(Code(`--text-shadow-${name}`)),
              Td(
                html.span(
                  style.textShadow(value),
                  style.fontSize('18px'),
                  style.fontWeight('600'),
                  'Sample Text'
                )
              )
            )
          )
        )
      )
    ),
    SubHeading('Semantic Text Shadows'),
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(html.tr(Th('Role'), Th('CSS Variable'), Th('Default'))),
        html.tbody(
          ...semanticTextShadowNames.map(name => {
            const defaults: Record<string, string> = {
              'button-filled': 'sm',
              'button-light': 'xs',
              'button-default': '2xs',
            }
            return html.tr(
              Td(html.span(attr.class('font-medium'), name)),
              Td(Code(`--text-shadow-${name}`)),
              Td(
                html.span(
                  attr.class('text-xs font-mono'),
                  defaults[name] ?? ''
                )
              )
            )
          })
        )
      )
    )
  )
}

function MotionSection() {
  const durationApprox: Record<string, string> = {
    instant: '0s',
    fast: '~120ms',
    base: '200ms',
    slow: '~320ms',
    relaxed: '~480ms',
  }

  return SectionCard(
    'Motion',
    html.h3(attr.class('text-base font-medium'), 'Durations'),
    Desc('All durations derive from --motion-duration-base (200ms).'),
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(html.tr(Th('Name'), Th('CSS Variable'), Th('Default'))),
        html.tbody(
          ...Object.entries(motionDurations).map(([name, _value]) =>
            html.tr(
              Td(html.span(attr.class('font-medium'), name)),
              Td(Code(`--motion-duration-${name}`)),
              Td(
                html.span(
                  attr.class('text-xs font-mono'),
                  durationApprox[name] ?? ''
                )
              )
            )
          )
        )
      )
    ),
    SubHeading('Easing Curves'),
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(html.tr(Th('Name'), Th('CSS Variable'), Th('Value'))),
        html.tbody(
          ...Object.entries(motionEasings).map(([name, value]) =>
            html.tr(
              Td(html.span(attr.class('font-medium'), name)),
              Td(Code(`--motion-easing-${name}`)),
              Td(html.span(attr.class('text-xs font-mono'), value))
            )
          )
        )
      )
    ),
    SubHeading('Semantic Motion'),
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(html.tr(Th('Role'), Th('CSS Variable'))),
        html.tbody(
          ...semanticMotionNames.map(name =>
            html.tr(
              Td(html.span(attr.class('font-medium'), name)),
              Td(Code(`--motion-${name}`))
            )
          )
        )
      )
    )
  )
}

function ZIndexSection() {
  const useCases: Record<string, string> = {
    base: 'Default stacking',
    raised: 'Slightly elevated items',
    navigation: 'Nav bars, headers',
    sidebar: 'Side navigation',
    overlay: 'Backdrop overlays',
    modal: 'Modal dialogs',
    tooltip: 'Tooltip content',
    popover: 'Popover menus',
    notification: 'Toast notifications',
    maximum: 'Highest priority',
  }

  return SectionCard(
    'Z-Index',
    Desc('Consistent layering system for stacking context management.'),
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(
          html.tr(Th('Name'), Th('CSS Variable'), Th('Value'), Th('Use Case'))
        ),
        html.tbody(
          ...Object.entries(zIndex).map(([name, value]) =>
            html.tr(
              Td(html.span(attr.class('font-medium'), name)),
              Td(Code(`--z-index-${name}`)),
              Td(html.span(attr.class('text-xs font-mono'), String(value))),
              Td(
                html.span(
                  attr.class('text-xs text-gray-500'),
                  useCases[name] ?? ''
                )
              )
            )
          )
        )
      )
    )
  )
}

function BreakpointsSection() {
  const pxValues: Record<string, string> = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }

  return SectionCard(
    'Breakpoints',
    Desc('Mobile-first breakpoints using rem units for accessibility.'),
    html.div(
      attr.class('overflow-x-auto'),
      html.table(
        attr.class('w-full text-sm'),
        html.thead(
          html.tr(Th('Name'), Th('CSS Variable'), Th('Value'), Th('Pixels'))
        ),
        html.tbody(
          ...Object.entries(breakpoints).map(([name, value]) =>
            html.tr(
              Td(html.span(attr.class('font-medium'), name)),
              Td(Code(`--breakpoint-${name}`)),
              Td(html.span(attr.class('text-xs font-mono'), value)),
              Td(html.span(attr.class('text-xs'), pxValues[name] ?? ''))
            )
          )
        )
      )
    )
  )
}

function CustomizationSection() {
  return SectionCard(
    'Customization',
    Desc(
      'Override design tokens via CSS custom properties or the SemanticTokenOverrideOptions interface.'
    ),
    html.h3(attr.class('text-base font-medium'), 'CSS Custom Properties'),
    Desc('Override any token by redefining the CSS variable:'),
    html.pre(
      attr.class(
        'text-xs font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto'
      ),
`:root {
  --spacing-base: 0.3rem;        /* Scale all spacing */
  --base-font-size: 1.125rem;    /* Scale all typography */
  --motion-duration-base: 150ms; /* Adjust animation speed */
}

.light {
  --color-primary-500: oklch(0.6 0.25 270); /* Custom primary */
}`
    ),
    SubHeading('TypeScript API'),
    Desc(
      'Use SemanticTokenOverrideOptions to override semantic mappings programmatically:'
    ),
    html.pre(
      attr.class(
        'text-xs font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto'
      ),
`import { generateSemanticTokenVariables } from '@tempots/beatui'

const vars = generateSemanticTokenVariables({
  colors: { primary: 'indigo', danger: 'rose' },
  fonts: { heading: 'var(--font-family-serif)' },
  radii: { button: 'var(--radius-full)' },
})`
    )
  )
}

// ─── Page Export ───

export default function CssVariablesPage() {
  return html.div(
    OpenGraph({
      title: 'CSS Variables - BeatUI Design Tokens',
      description:
        "Complete reference for BeatUI's CSS custom properties including colors, spacing, typography, shadows, motion, and more.",
      type: 'website',
      url: 'https://beatui.dev/css-variables',
      siteName: 'BeatUI',
    }),
    attr.class('p-6'),
    Stack(
      attr.class('gap-4 max-w-280 mx-auto'),
      html.h1(attr.class('text-3xl font-bold'), 'CSS Variables'),
      html.p(
        attr.class('text-gray-500 dark:text-gray-400'),
        "BeatUI's design token system generates 550+ CSS custom properties for colors, spacing, typography, shadows, motion, and more. All tokens are defined in TypeScript and converted to CSS variables at build time."
      ),
      ArchitectureSection(),
      ColorPaletteSection(),
      SemanticColorsSection(),
      ThemeColorsSection(),
      SpacingSection(),
      TypographySection(),
      RadiusSection(),
      ShadowsSection(),
      TextShadowsSection(),
      MotionSection(),
      ZIndexSection(),
      BreakpointsSection(),
      CustomizationSection()
    )
  )
}

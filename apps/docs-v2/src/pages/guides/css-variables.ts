import { html, attr, style, TNode } from '@tempots/dom'
import { ScrollablePanel, Stack, Card } from '@tempots/beatui'
import {
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
import { CodeBlock } from '../../framework/code-block'

export const meta = {
  title: 'CSS Variables',
  description:
    'A full interactive reference for all BeatUI design tokens — colors, spacing, typography, radius, shadows, motion, z-index, and breakpoints — exposed as CSS custom properties.',
}

// ---------------------------------------------------------------------------
// Lookup maps
// ---------------------------------------------------------------------------

const spacingPx: Record<string, string> = {
  none: '0px',
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
  none: '0px',
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
}

const durationApprox: Record<string, string> = {
  instant: '0ms',
  fast: '120ms',
  base: '200ms',
  slow: '320ms',
  relaxed: '480ms',
}

const breakpointPx: Record<string, string> = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

const zIndexUseCases: Record<string, string> = {
  base: 'Default stacking context',
  raised: 'Slightly elevated items (sticky cells, floating badges)',
  navigation: 'Top nav bars, fixed headers',
  sidebar: 'Side navigation drawers',
  overlay: 'Backdrop overlays behind modals',
  modal: 'Modal dialogs',
  tooltip: 'Tooltip content',
  popover: 'Dropdown menus, popovers',
  notification: 'Toast notifications',
  maximum: 'Highest-priority layer (command palettes, spotlight)',
}

const semanticRadiusDefaults: Record<string, string> = {
  control: 'var(--radius-md) = 6px',
  'control-sm': 'var(--radius-sm) = 4px',
  'control-xs': 'var(--radius-xs) = 2px',
  button: 'var(--radius-md) = 6px',
  surface: 'var(--radius-lg) = 8px',
  overlay: 'var(--radius-lg) = 8px',
  popover: 'var(--radius-md) = 6px',
  pill: 'var(--radius-full) = 9999px',
  focus: 'var(--radius-sm) = 4px',
}

const semanticShadowDefaults: Record<string, string> = {
  surface: 'var(--shadow-sm)',
  'surface-elevated': 'var(--shadow-md)',
  popover: 'var(--shadow-lg)',
  overlay: 'var(--shadow-xl)',
  button: 'var(--shadow-xs)',
}

const semanticFontDefaults: Record<string, string> = {
  body: 'var(--font-family-sans)',
  heading: 'var(--font-family-sans)',
  display: 'var(--font-family-sans)',
  mono: 'var(--font-family-mono)',
  ui: 'var(--font-family-sans)',
  prose: 'var(--font-family-serif)',
}

const semanticTextShadowDefaults: Record<string, string> = {
  'button-filled': 'var(--text-shadow-sm)',
  'button-light': 'var(--text-shadow-xs)',
  'button-default': 'var(--text-shadow-2xs)',
}

const semanticSpacingDefaults: Record<string, string> = {
  'stack-2xs': 'var(--spacing-xs) = 2px',
  'stack-xs': 'var(--spacing-sm) = 4px',
  'stack-sm': 'var(--spacing-md) = 8px',
  'stack-md': 'var(--spacing-mdh) = 12px',
  'stack-lg': 'var(--spacing-lg) = 16px',
  'stack-xl': 'var(--spacing-xl) = 24px',
}

const semanticMotionDefaults: Record<string, string> = {
  'transition-fast': 'var(--motion-duration-fast) = 120ms',
  'transition-medium': 'var(--motion-duration-base) = 200ms',
  'transition-slow': 'var(--motion-duration-slow) = 320ms',
  'transition-overlay': 'var(--motion-duration-relaxed) = 480ms',
  'transition-emphasis': 'var(--motion-duration-fast) = 120ms',
  'easing-standard': 'var(--motion-easing-standard)',
  'easing-emphasis': 'var(--motion-easing-emphasized)',
  'easing-entrance': 'var(--motion-easing-entrance)',
  'easing-exit': 'var(--motion-easing-exit)',
}

// ---------------------------------------------------------------------------
// Local helper components
// ---------------------------------------------------------------------------

function Swatch(color: string, size = '20px'): TNode {
  return html.span(
    attr.class('inline-block rounded-sm flex-shrink-0'),
    style.width(size),
    style.height(size),
    style.backgroundColor(color),
    style.boxShadow('inset 0 0 0 1px rgba(0,0,0,0.1)')
  )
}

function Th(...children: TNode[]): TNode {
  return html.th(
    attr.class(
      'px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'
    ),
    ...children
  )
}

function Td(...children: TNode[]): TNode {
  return html.td(
    attr.class(
      'px-3 py-2 text-sm border-b border-gray-100 dark:border-gray-800 align-middle'
    ),
    ...children
  )
}

function Code(text: string): TNode {
  return html.code(
    attr.class(
      'px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs text-gray-800 dark:text-gray-200'
    ),
    text
  )
}

function Desc(text: string): TNode {
  return html.p(
    attr.class('text-sm text-gray-600 dark:text-gray-400'),
    text
  )
}

function SubHeading(text: string): TNode {
  return html.h3(
    attr.class('text-base font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2'),
    text
  )
}

function SectionHeading(text: string): TNode {
  return html.h2(attr.class('text-xl font-semibold'), text)
}

function Table(...children: TNode[]): TNode {
  return html.div(
    attr.class('overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700'),
    html.table(
      attr.class('w-full text-sm border-collapse'),
      ...children
    )
  )
}

// ---------------------------------------------------------------------------
// Color resolution helper
// ---------------------------------------------------------------------------

function resolveColorValue(colorName: string, shade: number): string {
  const resolved = normalizeColorName(colorName as any)
  if (resolved === 'white') return 'white'
  if (resolved === 'black') return 'black'
  const palette = (colors as any)[resolved]
  return palette?.[shade] ?? 'transparent'
}

// ---------------------------------------------------------------------------
// Theme table helper
// ---------------------------------------------------------------------------

function renderThemeTable(
  title: string,
  varPrefix: string,
  lightMap: Record<string, [string, number]>,
  darkMap: Record<string, [string, number]>
): TNode {
  const names = Object.keys(lightMap)
  return html.div(
    attr.class('space-y-2'),
    SubHeading(title),
    Table(
      html.thead(
        html.tr(
          Th('Name'),
          Th('CSS Variable'),
          Th('Light'),
          Th('Dark')
        )
      ),
      html.tbody(
        ...names.map(name => {
          const [lColor, lShade] = lightMap[name]
          const [dColor, dShade] = darkMap[name]
          const lValue = resolveColorValue(lColor, lShade)
          const dValue = resolveColorValue(dColor, dShade)
          return html.tr(
            Td(Code(name)),
            Td(Code(`--${varPrefix}-${name}`)),
            Td(
              html.div(
                attr.class('flex items-center gap-2'),
                Swatch(lValue),
                html.span(
                  attr.class('font-mono text-xs text-gray-500 dark:text-gray-400'),
                  `${lColor}-${lShade}`
                )
              )
            ),
            Td(
              html.div(
                attr.class('flex items-center gap-2'),
                Swatch(dValue),
                html.span(
                  attr.class('font-mono text-xs text-gray-500 dark:text-gray-400'),
                  `${dColor}-${dShade}`
                )
              )
            )
          )
        })
      )
    )
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CSSVariablesPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-5xl mx-auto'),

      // Page header
      html.div(
        attr.class('space-y-3'),
        html.h1(attr.class('text-3xl font-bold'), 'CSS Variables'),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400 max-w-3xl'),
          'BeatUI exposes its entire design system as CSS custom properties. Every color, spacing value, font setting, shadow, and animation token is available as a CSS variable that automatically adapts to light and dark themes.'
        )
      ),

      // -----------------------------------------------------------------------
      // 1. Architecture Overview
      // -----------------------------------------------------------------------
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          SectionHeading('Architecture Overview'),
          Desc(
            'Design tokens flow through a one-way pipeline from TypeScript source definitions to live CSS custom properties on the :root element.'
          ),
          html.div(
            attr.class(
              'flex flex-wrap items-center gap-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm'
            ),
            html.span(
              attr.class(
                'px-3 py-1.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-mono text-xs font-semibold'
              ),
              'src/tokens/*.ts'
            ),
            html.span(attr.class('text-gray-400 dark:text-gray-500 font-bold'), '→'),
            html.span(
              attr.class(
                'px-3 py-1.5 rounded-md bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-mono text-xs font-semibold'
              ),
              'Vite plugin'
            ),
            html.span(attr.class('text-gray-400 dark:text-gray-500 font-bold'), '→'),
            html.span(
              attr.class(
                'px-3 py-1.5 rounded-md bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-mono text-xs font-semibold'
              ),
              ':root { --color-* }'
            ),
            html.span(attr.class('text-gray-400 dark:text-gray-500 font-bold'), '→'),
            html.span(
              attr.class(
                'px-3 py-1.5 rounded-md bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-mono text-xs font-semibold'
              ),
              '.light / .dark overrides'
            )
          ),
          html.div(
            attr.class('space-y-2 text-sm text-gray-600 dark:text-gray-400'),
            html.p(
              html.span(attr.class('font-semibold text-gray-800 dark:text-gray-200'), 'Primitive tokens '),
              '— raw values like palette colors, pixel sizes, and timing values live in ',
              Code('src/tokens/'),
              ' and are compiled to CSS variables on ',
              Code(':root'),
              '.'
            ),
            html.p(
              html.span(attr.class('font-semibold text-gray-800 dark:text-gray-200'), 'Semantic tokens '),
              '— role-based variables (e.g. ',
              Code('--color-primary-500'),
              ') reference primitive variables and are re-aliased under ',
              Code('.light'),
              ' and ',
              Code('.dark'),
              ' classes so they switch automatically.'
            ),
            html.p(
              html.span(attr.class('font-semibold text-gray-800 dark:text-gray-200'), 'Theme colors '),
              '— background, text, border, and interactive colors are defined per-mode and exposed as single-purpose variables like ',
              Code('--bg-surface'),
              ' or ',
              Code('--text-normal'),
              '.'
            )
          )
        )
      ),

      // -----------------------------------------------------------------------
      // 2. Color Palettes
      // -----------------------------------------------------------------------
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          SectionHeading('Color Palettes'),
          Desc(
            'All base color palettes are available as CSS custom properties. Each palette has 11 shades from 50 (lightest) to 950 (darkest). Hover over a swatch to see the variable name and OKLCH value.'
          ),
          html.div(
            attr.class('space-y-1'),
            ...Object.keys(colors).map(name =>
              html.div(
                attr.class('flex items-center gap-2'),
                html.span(
                  attr.class(
                    'w-20 flex-shrink-0 text-xs font-mono text-gray-500 dark:text-gray-400 text-right'
                  ),
                  name
                ),
                html.div(
                  attr.class('flex gap-0.5'),
                  ...colorShades.map(shade => {
                    const value = (colors as any)[name]?.[shade] ?? 'transparent'
                    return html.span(
                      attr.class('inline-block cursor-default'),
                      style.width('28px'),
                      style.height('20px'),
                      style.backgroundColor(value),
                      attr.title(`--color-${name}-${shade}: ${value}`)
                    )
                  })
                ),
                html.div(
                  attr.class('hidden sm:flex gap-1 flex-wrap'),
                  ...colorShades.map(shade =>
                    html.span(
                      attr.class('text-xs text-gray-400 dark:text-gray-600 font-mono'),
                      String(shade)
                    )
                  )
                )
              )
            ),
            // Shade legend
            html.div(
              attr.class('flex items-center gap-2 mt-2'),
              html.span(attr.class('w-20 flex-shrink-0')),
              html.div(
                attr.class('flex gap-0.5'),
                ...colorShades.map(shade =>
                  html.span(
                    attr.class('text-xs text-gray-400 dark:text-gray-600 font-mono text-center'),
                    style.width('28px'),
                    style.display('inline-block'),
                    String(shade)
                  )
                )
              )
            )
          )
        )
      ),

      // -----------------------------------------------------------------------
      // 3. Semantic Colors
      // -----------------------------------------------------------------------
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          SectionHeading('Semantic Colors'),
          Desc(
            'Semantic color names map to base palette colors. By default they use the mappings below but can be overridden via the Tailwind plugin or CSS variable overrides.'
          ),
          Table(
            html.thead(
              html.tr(
                Th('Semantic Name'),
                Th('CSS Variable prefix'),
                Th('Maps to'),
                Th('Preview (100 → 500 → 900)')
              )
            ),
            html.tbody(
              ...semanticColorNames.map(name => {
                const baseName = semanticColors[name]
                const previewShades = [100, 300, 500, 700, 900]
                return html.tr(
                  Td(Code(name)),
                  Td(Code(`--color-${name}-*`)),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-600 dark:text-gray-400'),
                      baseName
                    )
                  ),
                  Td(
                    html.div(
                      attr.class('flex gap-1'),
                      ...previewShades.map(shade => {
                        const val = (colors as any)[baseName]?.[shade] ?? 'transparent'
                        return Swatch(val)
                      })
                    )
                  )
                )
              })
            )
          )
        )
      ),

      // -----------------------------------------------------------------------
      // 4. Theme Colors
      // -----------------------------------------------------------------------
      Card(
        {},
        html.div(
          attr.class('space-y-6'),
          SectionHeading('Theme Colors'),
          Desc(
            'These CSS variables automatically switch their resolved value between light and dark mode. Use them instead of raw palette colors in your own styles for seamless theme adaptation.'
          ),
          renderThemeTable(
            'Background Colors',
            'bg',
            bgColors.light as Record<string, [string, number]>,
            bgColors.dark as Record<string, [string, number]>
          ),
          renderThemeTable(
            'Text Colors',
            'text',
            textColors.light as Record<string, [string, number]>,
            textColors.dark as Record<string, [string, number]>
          ),
          renderThemeTable(
            'Border Colors',
            'border',
            borderColors.light as Record<string, [string, number]>,
            borderColors.dark as Record<string, [string, number]>
          ),
          renderThemeTable(
            'Interactive Colors',
            'interactive',
            interactiveColors.light as Record<string, [string, number]>,
            interactiveColors.dark as Record<string, [string, number]>
          )
        )
      ),

      // -----------------------------------------------------------------------
      // 5. Spacing
      // -----------------------------------------------------------------------
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          SectionHeading('Spacing'),
          Desc(
            'Spacing tokens are built on a base unit of 0.25rem (4px). All values except none, px, base, and full are expressed as calc() multiples of --spacing-base, so changing that single variable scales the entire system.'
          ),
          Table(
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
                  Td(Code(name)),
                  Td(Code(`--spacing-${name}`)),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400 break-all'),
                      value
                    )
                  ),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400'),
                      spacingPx[name] ?? ''
                    )
                  ),
                  Td(
                    name !== 'none' && name !== 'full'
                      ? html.div(
                          attr.class('bg-primary-500 rounded-sm'),
                          style.width(`var(--spacing-${name})`),
                          style.height('8px'),
                          style.minWidth('2px')
                        )
                      : html.span(
                          attr.class('text-xs text-gray-400 italic'),
                          name === 'none' ? '0' : '2000px'
                        )
                  )
                )
              )
            )
          ),
          SubHeading('Semantic Spacing'),
          Desc('Semantic spacing names map to primitive spacing variables and represent standard gap/stack sizes used in layout components.'),
          Table(
            html.thead(
              html.tr(
                Th('Semantic Name'),
                Th('CSS Variable'),
                Th('Default')
              )
            ),
            html.tbody(
              ...semanticSpacingNames.map(name =>
                html.tr(
                  Td(Code(name)),
                  Td(Code(`--spacing-${name}`)),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400'),
                      semanticSpacingDefaults[name] ?? ''
                    )
                  )
                )
              )
            )
          )
        )
      ),

      // -----------------------------------------------------------------------
      // 6. Typography
      // -----------------------------------------------------------------------
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          SectionHeading('Typography'),
          Desc(
            'Typography tokens cover font sizes, weights, line heights, letter spacing, font families, and semantic font roles. All sizes are calculated from --font-size-base (1rem by default).'
          ),

          // Font Sizes
          SubHeading('Font Sizes'),
          Table(
            html.thead(
              html.tr(
                Th('Name'),
                Th('CSS Variable'),
                Th('Approx'),
                Th('Preview')
              )
            ),
            html.tbody(
              ...Object.keys(fontSize).map(name => {
                const approx = fontSizePx[name] ?? ''
                return html.tr(
                  Td(Code(name)),
                  Td(Code(`--font-size-${name}`)),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400'),
                      approx
                    )
                  ),
                  Td(
                    html.span(
                      style.fontSize(`var(--font-size-${name})`),
                      style.lineHeight('1.2'),
                      attr.class('text-gray-800 dark:text-gray-200 leading-none'),
                      'Aa'
                    )
                  )
                )
              })
            )
          ),

          // Font Weights
          SubHeading('Font Weights'),
          Table(
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
                  Td(Code(name)),
                  Td(Code(`--font-weight-${name}`)),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400'),
                      value
                    )
                  ),
                  Td(
                    html.span(
                      style.fontWeight(value),
                      attr.class('text-sm text-gray-800 dark:text-gray-200'),
                      'The quick brown fox'
                    )
                  )
                )
              )
            )
          ),

          // Line Heights
          SubHeading('Line Heights'),
          Table(
            html.thead(
              html.tr(
                Th('Name'),
                Th('CSS Variable'),
                Th('Value')
              )
            ),
            html.tbody(
              ...Object.entries(lineHeight).map(([name, value]) =>
                html.tr(
                  Td(Code(name)),
                  Td(Code(`--line-height-${name}`)),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400'),
                      value
                    )
                  )
                )
              )
            )
          ),

          // Letter Spacing
          SubHeading('Letter Spacing'),
          Table(
            html.thead(
              html.tr(
                Th('Name'),
                Th('CSS Variable'),
                Th('Value'),
                Th('Preview')
              )
            ),
            html.tbody(
              ...Object.entries(letterSpacing).map(([name, value]) =>
                html.tr(
                  Td(Code(name)),
                  Td(Code(`--letter-spacing-${name}`)),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400'),
                      value
                    )
                  ),
                  Td(
                    html.span(
                      style.letterSpacing(value),
                      attr.class('text-sm text-gray-800 dark:text-gray-200'),
                      'ABCDEFG'
                    )
                  )
                )
              )
            )
          ),

          // Font Families
          SubHeading('Font Families'),
          Table(
            html.thead(
              html.tr(
                Th('Name'),
                Th('CSS Variable'),
                Th('Stack')
              )
            ),
            html.tbody(
              ...Object.entries(fontFamily).map(([name, stack]) =>
                html.tr(
                  Td(Code(name)),
                  Td(Code(`--font-family-${name}`)),
                  Td(
                    html.span(
                      attr.class('text-xs text-gray-500 dark:text-gray-400 break-all'),
                      (stack as readonly string[]).join(', ')
                    )
                  )
                )
              )
            )
          ),

          // Semantic Fonts
          SubHeading('Semantic Font Roles'),
          Desc('Semantic font roles are CSS variables that point to a font family stack. Override them to change the font used for headings, body text, code, etc.'),
          Table(
            html.thead(
              html.tr(
                Th('Role'),
                Th('CSS Variable'),
                Th('Default')
              )
            ),
            html.tbody(
              ...semanticFontNames.map(name =>
                html.tr(
                  Td(Code(name)),
                  Td(Code(`--font-${name}`)),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400'),
                      semanticFontDefaults[name] ?? ''
                    )
                  )
                )
              )
            )
          )
        )
      ),

      // -----------------------------------------------------------------------
      // 7. Border Radius
      // -----------------------------------------------------------------------
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          SectionHeading('Border Radius'),
          Desc(
            'Border radius tokens use the same base spacing variable as the spacing scale, keeping corner radii proportional to spacing as the scale changes.'
          ),
          Table(
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
              ...Object.entries(radius).map(([name, value]) =>
                html.tr(
                  Td(Code(name)),
                  Td(Code(`--radius-${name}`)),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400 break-all'),
                      value
                    )
                  ),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400'),
                      radiusPx[name] ?? ''
                    )
                  ),
                  Td(
                    html.div(
                      attr.class('bg-primary-200 dark:bg-primary-800 border border-primary-400 dark:border-primary-600'),
                      style.width('40px'),
                      style.height('40px'),
                      style.borderRadius(`var(--radius-${name})`)
                    )
                  )
                )
              )
            )
          ),
          SubHeading('Semantic Radius'),
          Desc('Semantic radius roles map to primitive radius values and represent the corner rounding used for specific component types.'),
          Table(
            html.thead(
              html.tr(
                Th('Role'),
                Th('CSS Variable'),
                Th('Default')
              )
            ),
            html.tbody(
              ...semanticRadiusNames.map(name =>
                html.tr(
                  Td(Code(name)),
                  Td(Code(`--radius-${name}`)),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400'),
                      semanticRadiusDefaults[name] ?? ''
                    )
                  )
                )
              )
            )
          )
        )
      ),

      // -----------------------------------------------------------------------
      // 8. Box Shadows
      // -----------------------------------------------------------------------
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          SectionHeading('Box Shadows'),
          Desc(
            'BeatUI provides both standard (downward) and top (upward) shadow variants. Top shadows are useful for bottom-anchored elements like bottom sheets.'
          ),

          SubHeading('Standard Shadows'),
          Table(
            html.thead(
              html.tr(
                Th('Name'),
                Th('CSS Variable'),
                Th('Preview')
              )
            ),
            html.tbody(
              ...Object.entries(shadows)
                .filter(([name]) => !name.startsWith('top-'))
                .map(([name, value]) =>
                  html.tr(
                    Td(Code(name)),
                    Td(Code(`--shadow-${name}`)),
                    Td(
                      name === 'none'
                        ? html.span(attr.class('text-xs text-gray-400 italic'), 'no shadow')
                        : html.div(
                            attr.class(
                              'rounded bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
                            ),
                            style.width('120px'),
                            style.height('40px'),
                            style.boxShadow(value)
                          )
                    )
                  )
                )
            )
          ),

          SubHeading('Top Shadows'),
          Desc('These shadows project upward and suit elements anchored to the bottom of the viewport.'),
          Table(
            html.thead(
              html.tr(
                Th('Name'),
                Th('CSS Variable'),
                Th('Preview')
              )
            ),
            html.tbody(
              ...Object.entries(shadows)
                .filter(([name]) => name.startsWith('top-'))
                .map(([name, value]) =>
                  html.tr(
                    Td(Code(name)),
                    Td(Code(`--shadow-${name}`)),
                    Td(
                      html.div(
                        attr.class(
                          'rounded bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
                        ),
                        style.width('120px'),
                        style.height('40px'),
                        style.boxShadow(value)
                      )
                    )
                  )
                )
            )
          ),

          SubHeading('Semantic Shadows'),
          Desc('Semantic shadow roles map to primitive shadow values for common UI surface types.'),
          Table(
            html.thead(
              html.tr(
                Th('Role'),
                Th('CSS Variable'),
                Th('Default')
              )
            ),
            html.tbody(
              ...semanticShadowNames.map(name =>
                html.tr(
                  Td(Code(name)),
                  Td(Code(`--shadow-${name}`)),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400'),
                      semanticShadowDefaults[name] ?? ''
                    )
                  )
                )
              )
            )
          )
        )
      ),

      // -----------------------------------------------------------------------
      // 9. Text Shadows
      // -----------------------------------------------------------------------
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          SectionHeading('Text Shadows'),
          Desc(
            'Text shadow tokens add depth and legibility to text, particularly on colored button backgrounds.'
          ),
          Table(
            html.thead(
              html.tr(
                Th('Name'),
                Th('CSS Variable'),
                Th('Preview')
              )
            ),
            html.tbody(
              ...Object.entries(textShadows).map(([name, value]) =>
                html.tr(
                  Td(Code(name)),
                  Td(Code(`--text-shadow-${name}`)),
                  Td(
                    html.span(
                      attr.class('text-base font-semibold text-white'),
                      style.textShadow(value),
                      style.backgroundColor('oklch(0.577 0.245 27.325)'),
                      style.padding('2px 8px'),
                      style.borderRadius('4px'),
                      'Sample Text'
                    )
                  )
                )
              )
            )
          ),
          SubHeading('Semantic Text Shadows'),
          Desc('Semantic text shadow roles define the shadow intensity applied to button label text by variant.'),
          Table(
            html.thead(
              html.tr(
                Th('Role'),
                Th('CSS Variable'),
                Th('Default')
              )
            ),
            html.tbody(
              ...semanticTextShadowNames.map(name =>
                html.tr(
                  Td(Code(name)),
                  Td(Code(`--text-shadow-${name}`)),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400'),
                      semanticTextShadowDefaults[name] ?? ''
                    )
                  )
                )
              )
            )
          )
        )
      ),

      // -----------------------------------------------------------------------
      // 10. Motion
      // -----------------------------------------------------------------------
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          SectionHeading('Motion'),
          Desc(
            'Motion tokens define animation durations and easing curves. All durations are multiples of --motion-duration-base (200ms), allowing the entire timing system to be scaled by changing one variable.'
          ),

          SubHeading('Durations'),
          Table(
            html.thead(
              html.tr(
                Th('Name'),
                Th('CSS Variable'),
                Th('Value'),
                Th('Approx')
              )
            ),
            html.tbody(
              ...Object.entries(motionDurations).map(([name, value]) =>
                html.tr(
                  Td(Code(name)),
                  Td(Code(`--motion-duration-${name}`)),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400 break-all'),
                      value
                    )
                  ),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400'),
                      durationApprox[name] ?? ''
                    )
                  )
                )
              )
            )
          ),

          SubHeading('Easing Curves'),
          Table(
            html.thead(
              html.tr(
                Th('Name'),
                Th('CSS Variable'),
                Th('Value')
              )
            ),
            html.tbody(
              ...Object.entries(motionEasings).map(([name, value]) =>
                html.tr(
                  Td(Code(name)),
                  Td(Code(`--motion-easing-${name}`)),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400'),
                      value
                    )
                  )
                )
              )
            )
          ),

          SubHeading('Semantic Motion'),
          Desc('Semantic motion roles combine duration and easing concepts for common transition scenarios.'),
          Table(
            html.thead(
              html.tr(
                Th('Role'),
                Th('CSS Variable'),
                Th('Default')
              )
            ),
            html.tbody(
              ...semanticMotionNames.map(name =>
                html.tr(
                  Td(Code(name)),
                  Td(Code(`--motion-${name}`)),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400'),
                      semanticMotionDefaults[name] ?? ''
                    )
                  )
                )
              )
            )
          )
        )
      ),

      // -----------------------------------------------------------------------
      // 11. Z-Index
      // -----------------------------------------------------------------------
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          SectionHeading('Z-Index'),
          Desc(
            'Z-index tokens define a consistent stacking layer system. Values are spaced in increments of 10 to allow intermediate layers when needed.'
          ),
          Table(
            html.thead(
              html.tr(
                Th('Name'),
                Th('CSS Variable'),
                Th('Value'),
                Th('Use Case')
              )
            ),
            html.tbody(
              ...Object.entries(zIndex).map(([name, value]) =>
                html.tr(
                  Td(Code(name)),
                  Td(Code(`--z-index-${name}`)),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs font-semibold text-gray-700 dark:text-gray-300'),
                      String(value)
                    )
                  ),
                  Td(
                    html.span(
                      attr.class('text-xs text-gray-500 dark:text-gray-400'),
                      zIndexUseCases[name] ?? ''
                    )
                  )
                )
              )
            )
          )
        )
      ),

      // -----------------------------------------------------------------------
      // 12. Breakpoints
      // -----------------------------------------------------------------------
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          SectionHeading('Breakpoints'),
          Desc(
            'Breakpoints are defined in rem units for accessibility — scaling with the user\'s root font size preference. They follow a mobile-first approach.'
          ),
          Table(
            html.thead(
              html.tr(
                Th('Name'),
                Th('CSS Variable'),
                Th('Value'),
                Th('Pixels (at 16px root)')
              )
            ),
            html.tbody(
              ...Object.entries(breakpoints).map(([name, value]) =>
                html.tr(
                  Td(Code(name)),
                  Td(Code(`--breakpoint-${name}`)),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400'),
                      value
                    )
                  ),
                  Td(
                    html.span(
                      attr.class('font-mono text-xs text-gray-500 dark:text-gray-400'),
                      breakpointPx[name] ?? ''
                    )
                  )
                )
              )
            )
          )
        )
      ),

      // -----------------------------------------------------------------------
      // 13. Customization
      // -----------------------------------------------------------------------
      Card(
        {},
        html.div(
          attr.class('space-y-4'),
          SectionHeading('Customization'),
          Desc(
            'You can override any CSS variable at the :root level, or scope overrides to a specific component, theme, or element. For structural changes you can also pass token overrides through the TypeScript API.'
          ),

          SubHeading('CSS Override'),
          Desc('Override tokens in your own stylesheet. Scoped overrides allow per-component or per-section customization.'),
          CodeBlock(
            `/* Global override — changes primary color to indigo */
:root {
  --color-primary-500: oklch(0.585 0.233 277.117); /* indigo-500 */
}

/* Scope overrides to a specific section */
.my-section {
  --color-primary-500: oklch(0.627 0.265 303.9); /* violet-500 */
  --radius-control: var(--radius-full); /* pill-shaped controls */
  --spacing-base: 0.3125rem; /* tighter spacing (5px base) */
}

/* Dark-mode only override */
.dark {
  --bg-background-dark: oklch(0.1 0.01 240); /* custom dark background */
}`,
            'css'
          ),

          SubHeading('TypeScript API'),
          Desc('For programmatic theme customization, use the token generation functions directly.'),
          CodeBlock(
            `import {
  generateAllTokenVariables,
  generateSemanticTokenVariables,
} from '@tempots/beatui'

// Generate all CSS variables as a record
const vars = generateAllTokenVariables()
// vars['--color-primary-500'] === 'oklch(...)'

// Generate only semantic variables with custom overrides
const semantic = generateSemanticTokenVariables({
  colors: {
    primary: 'indigo',
    danger: 'rose',
  },
  radii: {
    control: 'var(--radius-full)',
    button: 'var(--radius-full)',
  },
})

// Apply to a custom element
const el = document.getElementById('my-theme-scope')!
Object.entries(semantic).forEach(([key, value]) => {
  el.style.setProperty(key, value)
})`,
            'typescript'
          )
        )
      )
    ),
  })
}

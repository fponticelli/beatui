import {
  aria,
  attr,
  coalesce,
  computedOf,
  Fragment,
  html,
  prop,
  style,
  TNode,
  Use,
  Value,
  WithElement,
} from '@tempots/dom'
import {
  BreakpointInfo,
  BeatUIBreakpoint,
  BeatUIBreakpoints,
  WithBeatUIBreakpoint,
} from './with-breakpoint'
import { Button } from '../button'
import { Icon } from '../data/icon'
import { ElementRect } from '@tempots/ui'
import { PanelColor, PanelShadow, Side } from '../theme'
import { backgroundValue, ExtendedColor } from '../theme/style-utils'
import {
  AnimatedToggleClass,
  ToggleStatus,
  useAnimatedElementToggle,
} from '../../utils/use-animated-toggle'
import { BeatUII18n } from '../../beatui-i18n'

export interface AppShellBreakpointOptions {
  zero: number
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
}

export type AppShellBreakpointOptionalOptions =
  Partial<AppShellBreakpointOptions>

export interface AppShellHorizontalOptions {
  content: TNode
  height?: number | AppShellBreakpointOptionalOptions
  color?: PanelColor
  shadow?: PanelShadow
}

export interface AppShellVerticalOptions {
  content: TNode
  width?: number | AppShellBreakpointOptionalOptions
  color?: PanelColor
  shadow?: PanelShadow
}

export interface AppShellMainOptions {
  content: TNode
  color?: PanelColor
  shadow?: PanelShadow
}

export interface AppShellOptions {
  banner?: AppShellHorizontalOptions
  header?: AppShellHorizontalOptions
  footer?: AppShellHorizontalOptions
  menu?: AppShellVerticalOptions
  aside?: AppShellVerticalOptions
  main: AppShellMainOptions
  mainHeader?: AppShellHorizontalOptions
  mainFooter?: AppShellHorizontalOptions
  mediumBreakpoint?: BeatUIBreakpoint
  smallBreakpoint?: BeatUIBreakpoint
}

function generatePanelClasses(side: Side, shadow: PanelShadow): string {
  const sideStr = (Array.isArray(side) ? side : [side])
    .map(s => `bc-panel--side-${s}`)
    .join(' ')
  return `bc-panel ${sideStr} bc-panel--shadow-${shadow}`
}

function PanelStyles(color: Value<PanelColor>): TNode {
  const baseLight = Value.toSignal(color).map(c =>
    backgroundValue(c as ExtendedColor, 'lighter', 'light')
  )
  const baseDark = Value.toSignal(color).map(c =>
    backgroundValue(c as ExtendedColor, 'lighter', 'dark')
  )
  return Fragment(
    style.variable('--panel-bg', baseLight.$.backgroundColor),
    style.variable('--panel-text', baseLight.$.textColor),
    style.variable('--panel-bg-dark', baseDark.$.backgroundColor),
    style.variable('--panel-text-dark', baseDark.$.textColor)
  )
}

const defaults = {
  banner: {
    zero: 32,
    xs: 32,
    sm: 32,
    md: 32,
    lg: 32,
    xl: 32,
  },
  header: {
    zero: 60,
    xs: 60,
    sm: 60,
    md: 60,
    lg: 60,
    xl: 60,
  },
  mainHeader: {
    zero: 48,
    xs: 48,
    sm: 48,
    md: 48,
    lg: 48,
    xl: 48,
  },
  mainFooter: {
    zero: 48,
    xs: 48,
    sm: 48,
    md: 48,
    lg: 48,
    xl: 48,
  },
  footer: {
    zero: 48,
    xs: 48,
    sm: 48,
    md: 48,
    lg: 48,
    xl: 48,
  },
  menu: {
    zero: 300,
    xs: 300,
    sm: 300,
    md: 300,
    lg: 300,
    xl: 300,
  },
  aside: {
    zero: 280,
    xs: 280,
    sm: 280,
    md: 280,
    lg: 280,
    xl: 280,
  },
}

function fillBreakpoints(
  breakpoints: number | AppShellBreakpointOptionalOptions,
  defaults: AppShellBreakpointOptions
): AppShellBreakpointOptions {
  if (typeof breakpoints === 'number') {
    return {
      zero: breakpoints,
      xs: breakpoints,
      sm: breakpoints,
      md: breakpoints,
      lg: breakpoints,
      xl: breakpoints,
    }
  }
  const values = {
    zero: breakpoints.zero ?? defaults.zero,
    xs: breakpoints.xs ?? defaults.xs,
    sm: breakpoints.sm ?? defaults.sm,
    md: breakpoints.md ?? defaults.md,
    lg: breakpoints.lg ?? defaults.lg,
    xl: breakpoints.xl ?? defaults.xl,
  }
  // traverse and if next value is smaller than previous, update next to be previous
  if (values.xs < values.zero) {
    values.xs = values.zero
  }
  if (values.sm < values.xs) {
    values.sm = values.xs
  }
  if (values.md < values.sm) {
    values.md = values.sm
  }
  if (values.lg < values.md) {
    values.lg = values.md
  }
  if (values.xl < values.lg) {
    values.xl = values.lg
  }
  return values
}

function cleanAreas(areas: (string | null)[][]) {
  // only remove a row if all values are null
  areas = areas.filter(row => row.some(v => v != null && !v.startsWith('?')))
  // only remove a column if all values are null
  for (let i = 0; i < areas[0]!.length; i++) {
    if (areas.every(row => row[i] == null || row[i]!.startsWith('?'))) {
      areas = areas.map(row => row.filter((_, j) => j !== i))
      i--
    }
  }
  // remove ? from all values
  areas = areas.map(row => row.map(v => (v?.startsWith('?') ? v.slice(1) : v)))
  return areas
}

function makeMapBreakpoint({
  smallBreakpoint,
  mediumBreakpoint,
  vertical,
  horizontal,
  is,
}: {
  smallBreakpoint: BeatUIBreakpoint
  mediumBreakpoint: BeatUIBreakpoint
  vertical: Record<VerticalSection, AppShellBreakpointOptions>
  horizontal: Record<HorizontalSection, AppShellBreakpointOptions>
  is: BreakpointInfo<BeatUIBreakpoints>['is']
}) {
  function makeSmall(breakpoint: BeatUIBreakpoint) {
    let areas: (string | null)[][] = [
      [null],
      [null],
      [null],
      [null],
      [null],
      [null],
    ]
    // COLUMNS
    const columns = []
    // main
    columns.push('1fr')
    // ROWS
    const rows = []
    if (horizontal.banner) {
      rows.push(horizontal.banner[breakpoint] + 'px')
      areas[0]![1] = 'banner'
    }
    // header
    if (horizontal.header || vertical.menu || vertical.aside) {
      rows.push(
        (horizontal.header?.[breakpoint] ?? defaults.header[breakpoint]) + 'px'
      )
      areas[1]![1] = 'header'
    }
    // mainHeader
    if (horizontal.mainHeader) {
      rows.push(horizontal.mainHeader[breakpoint] + 'px')
      areas[2]![1] = 'mainHeader'
    }
    // main
    rows.push('1fr')
    areas[3]![1] = 'main'
    // mainFooter
    if (horizontal.mainFooter) {
      rows.push(horizontal.mainFooter[breakpoint] + 'px')
      areas[4]![1] = 'mainFooter'
    }
    // footer
    if (horizontal.footer) {
      rows.push(horizontal.footer[breakpoint] + 'px')
      areas[5]![1] = 'footer'
    }
    areas = cleanAreas(areas)

    const result = {
      columns: columns.join(' '),
      rows: rows.join(' '),
      areas: areas.map(row => `"${row.join(' ')}"`).join('\n'),
      displayMenu: false,
      displayAside: false,
      menuWidth: defaults.menu[breakpoint] + 'px',
      asideWidth: defaults.aside[breakpoint] + 'px',
    }
    return result
  }

  function makeMedium(breakpoint: BeatUIBreakpoint) {
    let areas: (string | null)[][] = [
      [null, null],
      [null, null],
      [null, null],
      [null, null],
      [null, null],
      [null, null],
    ]
    // COLUMNS
    const columns = []
    if (vertical.menu) {
      columns.push(vertical.menu[breakpoint] + 'px')
      areas[2]![0] = '?menu'
      areas[3]![0] = 'menu'
      areas[4]![0] = '?menu'
    }
    // main
    columns.push('1fr')
    // ROWS
    const rows = []
    if (horizontal.banner) {
      rows.push(horizontal.banner[breakpoint] + 'px')
      areas[0]![0] = '?banner'
      areas[0]![1] = 'banner'
    }
    // header
    if (horizontal.header || vertical.aside) {
      rows.push(
        (horizontal.header?.[breakpoint] ?? defaults.header[breakpoint]) + 'px'
      )
      areas[1]![0] = '?header'
      areas[1]![1] = 'header'
    }
    // mainHeader
    if (horizontal.mainHeader) {
      rows.push(horizontal.mainHeader[breakpoint] + 'px')
      areas[2]![1] = 'mainHeader'
    }
    // main
    rows.push('1fr')
    areas[3]![1] = 'main'
    // mainFooter
    if (horizontal.mainFooter) {
      rows.push(horizontal.mainFooter[breakpoint] + 'px')
      areas[4]![1] = 'mainFooter'
    }
    // footer
    if (horizontal.footer) {
      rows.push(horizontal.footer[breakpoint] + 'px')
      areas[5]![0] = '?footer'
      areas[5]![1] = 'footer'
    }
    areas = cleanAreas(areas)

    const result = {
      columns: columns.join(' '),
      rows: rows.join(' '),
      areas: areas.map(row => `"${row.join(' ')}"`).join('\n'),
      displayMenu: true,
      displayAside: false,
      menuWidth: defaults.menu[breakpoint] + 'px',
      asideWidth: defaults.aside[breakpoint] + 'px',
    }
    return result
  }

  function makeLarge(breakpoint: BeatUIBreakpoint) {
    let areas: (string | null)[][] = [
      [null, null, null],
      [null, null, null],
      [null, null, null],
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ]
    // COLUMNS
    const columns = []
    if (vertical.menu) {
      columns.push(vertical.menu[breakpoint] + 'px')
      areas[2]![0] = '?menu'
      areas[3]![0] = 'menu'
      areas[4]![0] = '?menu'
    }
    // main
    columns.push('1fr')
    if (vertical.aside) {
      columns.push(vertical.aside[breakpoint] + 'px')
      areas[2]![2] = '?aside'
      areas[3]![2] = 'aside'
      areas[4]![2] = '?aside'
    }
    // ROWS
    const rows = []
    if (horizontal.banner) {
      rows.push(horizontal.banner[breakpoint] + 'px')
      areas[0]![0] = '?banner'
      areas[0]![1] = 'banner'
      areas[0]![2] = '?banner'
    }
    // header
    if (horizontal.header) {
      rows.push(horizontal.header[breakpoint] + 'px')
      areas[1]![0] = '?header'
      areas[1]![1] = 'header'
      areas[1]![2] = '?header'
    }
    // mainHeader
    if (horizontal.mainHeader) {
      rows.push(horizontal.mainHeader[breakpoint] + 'px')
      areas[2]![1] = 'mainHeader'
    }
    // main
    rows.push('1fr')
    areas[3]![1] = 'main'
    // mainFooter
    if (horizontal.mainFooter) {
      rows.push(horizontal.mainFooter[breakpoint] + 'px')
      areas[4]![1] = 'mainFooter'
    }
    // footer
    if (horizontal.footer) {
      rows.push(horizontal.footer[breakpoint] + 'px')
      areas[5]![0] = '?footer'
      areas[5]![1] = 'footer'
      areas[5]![2] = '?footer'
    }
    areas = cleanAreas(areas)

    const result = {
      columns: columns.join(' '),
      rows: rows.join(' '),
      areas: areas.map(row => `"${row.join(' ')}"`).join('\n'),
      displayMenu: true,
      displayAside: true,
      menuWidth: defaults.menu[breakpoint] + 'px',
      asideWidth: defaults.aside[breakpoint] + 'px',
    }
    return result
  }

  return ({
    width,
    breakpoint,
  }: {
    width: number
    breakpoint: BeatUIBreakpoint
  }) => {
    if (is(`<=${smallBreakpoint}`, width)) {
      return makeSmall(breakpoint)
    }
    if (is(`<=${mediumBreakpoint}`, width)) {
      return makeMedium(breakpoint)
    }
    return makeLarge(breakpoint)
  }
}

const verticalSections = ['menu', 'aside'] as const
type VerticalSection = (typeof verticalSections)[number]
const horizontalSections = [
  'banner',
  'header',
  'mainHeader',
  'mainFooter',
  'footer',
] as const
type HorizontalSection = (typeof horizontalSections)[number]

function displayMenuPanel(
  hasMenu: boolean,
  { displayMenu }: { displayMenu: boolean },
  open: boolean
) {
  if (!hasMenu) return 'none'
  if (displayMenu) return 'block'
  if (open) return 'float'
  return 'none'
}

function displayAsidePanel(
  hasAside: boolean,
  { displayAside }: { displayAside: boolean },
  open: boolean
) {
  if (!hasAside) return 'none'
  if (displayAside) return 'block'
  if (open) return 'float'
  return 'none'
}

export function AppShell({
  smallBreakpoint = 'sm',
  mediumBreakpoint = 'md',
  ...options
}: AppShellOptions) {
  const vertical = Object.fromEntries(
    verticalSections
      .filter(section => options[section])
      .map(
        section =>
          [
            section,
            fillBreakpoints(options[section]!.width ?? {}, defaults[section]),
          ] as const
      )
  ) as Record<VerticalSection, AppShellBreakpointOptions>
  const horizontal = Object.fromEntries(
    horizontalSections
      .filter(section => options[section])
      .map(
        section =>
          [
            section,
            fillBreakpoints(options[section]!.height ?? {}, defaults[section]),
          ] as const
      )
  ) as Record<HorizontalSection, AppShellBreakpointOptions>

  return Use(BeatUII18n, t =>
    WithBeatUIBreakpoint(({ value, is }) => {
      const mapBreakpoint = makeMapBreakpoint({
        smallBreakpoint,
        mediumBreakpoint,
        vertical,
        horizontal,
        is,
      })
      const template = value.map(mapBreakpoint)
      const displayHeader =
        horizontal.header != null ||
        vertical.menu != null ||
        vertical.aside != null

      const displayAsideButton = computedOf(
        vertical.aside != null,
        template
      )((hasAside: boolean, { displayAside }: { displayAside: boolean }) => {
        return hasAside && !displayAside
      })

      const displayMenuButton = computedOf(
        vertical.menu != null,
        template
      )((hasMenu: boolean, { displayMenu }: { displayMenu: boolean }) => {
        return hasMenu && !displayMenu
      })

      const menuStatus = useAnimatedElementToggle()
      const asideStatus = useAnimatedElementToggle()
      const headerBottom = prop(0)
      const displayMenuAs = computedOf(
        vertical.menu != null,
        template,
        menuStatus.display
      )(displayMenuPanel)
      const displayAsideAs = computedOf(
        vertical.aside != null,
        template,
        asideStatus.display
      )(displayAsidePanel)

      return html.div(
        style.display('grid'),
        style.height('100%'),
        style.width('100%'),
        style.gridTemplateColumns(template.$.columns),
        style.gridTemplateRows(template.$.rows),
        style.gridTemplateAreas(template.$.areas),
        style.gridColumnGap('0'),
        style.gridRowGap('0'),
        options.banner
          ? html.header(
              attr.class(
                generatePanelClasses('none', options.banner.shadow ?? 'none')
              ),
              PanelStyles(options.banner.color ?? 'white'),
              style.height('100%'),
              style.gridArea('banner'),
              options.banner.content
            )
          : null,
        html.header(
          attr.class(
            generatePanelClasses('bottom', options.header?.shadow ?? 'none')
          ),
          PanelStyles(options.header?.color ?? 'white'),
          style.zIndex('20'),
          style.display(displayHeader ? 'block' : 'none'),
          style.gridArea('header'),
          ElementRect(rect => {
            rect.$.bottom.feedProp(headerBottom)
            return null
          }),
          html.div(
            style.display('flex'),
            style.height('100%'),
            html.div(
              style.display(
                displayMenuButton.map((v): string => (v ? 'flex' : 'none'))
              ),
              style.alignItems('center'),
              style.justifyContent('center'),
              style.height('100%'),
              style.width('60px'),
              Button(
                {
                  onClick: () => menuStatus.toggle(),
                  variant: 'light',
                  color: 'base',
                },
                aria.label(t.$.toggleMenu),
                Icon({
                  icon: menuStatus.display.map((v): string =>
                    v
                      ? 'line-md/menu-to-close-alt-transition'
                      : 'line-md/close-to-menu-alt-transition'
                  ),
                })
              )
            ),
            html.div(
              style.height('100%'),
              style.flexGrow('1'),
              options.header?.content
            ),
            html.div(
              style.alignItems('center'),
              style.justifyContent('center'),
              style.height('100%'),
              style.width('60px'),
              style.display(
                displayAsideButton.map((v): string => (v ? 'flex' : 'none'))
              ),
              Button(
                {
                  onClick: () => asideStatus.toggle(),
                  roundedness: 'full',
                  variant: 'light',
                  color: 'base',
                },
                aria.label(t.$.toggleAside),
                Icon(
                  { icon: 'line-md/chevron-left' },
                  attr.style('transition: transform 0.2s ease-in-out'),
                  attr.style(
                    asideStatus.display.map(
                      (v): string => `transform: rotate(${v ? 180 : 0}deg)`
                    )
                  )
                )
              )
            )
          )
        ),
        options.menu
          ? html.nav(
              WithElement(el => menuStatus.setElement(el)),
              style.zIndex('10'),
              // Add ARIA attributes for navigation landmark
              aria.label(t.$.mainNavigation),
              attr.role('navigation'),
              style.overflow('hidden'),
              attr.class(
                displayMenuAs.map((v): string =>
                  v === 'float'
                    ? generatePanelClasses(
                        'right',
                        options.menu?.shadow ?? 'md'
                      )
                    : generatePanelClasses(
                        'right',
                        options.menu?.shadow ?? 'none'
                      )
                )
              ),
              PanelStyles(options.menu?.color ?? 'white'),
              style.height(
                displayMenuAs.map((v): string =>
                  v === 'float' ? 'auto' : '100%'
                )
              ),
              style.overflow('hidden'),
              style.gridArea('menu'),
              style.display(
                computedOf(
                  displayMenuAs,
                  menuStatus.status
                )((v, s): string => {
                  if (v === 'none' && s === 'closed') return 'none'
                  return 'block'
                })
              ),
              style.position(
                computedOf(
                  displayMenuAs,
                  menuStatus.status
                )((v, s): string => {
                  if (v === 'float') return 'fixed'
                  if (v === 'none' && s !== 'closed') return 'fixed'
                  return 'initial'
                })
              ),
              style.top(headerBottom.map(v => `${v}px`)),
              AnimatedToggleClass({
                animation: { slide: 'right' },
                status: computedOf(
                  displayMenuAs,
                  menuStatus.status
                )((v, s): ToggleStatus => {
                  if (v === 'block') return 'opened'
                  return s
                }),
              }),
              style.width(coalesce(options.menu?.width, template.$.menuWidth)),
              style.bottom('0'),
              options.menu?.content
            )
          : null,
        options.mainHeader
          ? html.header(
              style.height('100%'),
              style.gridArea('mainHeader'),
              attr.class(
                generatePanelClasses(
                  'none',
                  options.mainHeader?.shadow ?? 'none'
                )
              ),
              PanelStyles(options.mainHeader?.color ?? 'white'),
              options.mainHeader.content
            )
          : null,
        html.main(
          style.height('100%'),
          style.overflow('hidden'),
          style.gridArea('main'),
          attr.class(
            generatePanelClasses('none', options.main?.shadow ?? 'none')
          ),
          PanelStyles(options.main?.color ?? 'white'),
          options.main.content
        ),
        options.mainFooter
          ? html.footer(
              style.height('100%'),
              style.gridArea('mainFooter'),
              attr.class(
                generatePanelClasses(
                  'none',
                  options.mainFooter?.shadow ?? 'none'
                )
              ),
              PanelStyles(options.mainFooter?.color ?? 'white'),
              options.mainFooter.content
            )
          : null,
        options.aside
          ? html.aside(
              WithElement(el => {
                asideStatus.setElement(el)
              }),
              style.zIndex('10'),
              // Add ARIA attributes for aside landmark
              aria.label(t.$.sidebar),
              attr.role('complementary'),
              attr.class(
                displayAsideAs.map((v): string =>
                  v === 'float'
                    ? generatePanelClasses('left', 'md')
                    : generatePanelClasses('left', 'none')
                )
              ),
              PanelStyles('white'),
              style.height('100%'),
              style.gridArea('aside'),
              style.display(
                computedOf(
                  displayAsideAs,
                  asideStatus.status
                )((v, s): string => {
                  if (v === 'none' && s === 'closed') return 'none'
                  return 'block'
                })
              ),
              style.position(
                computedOf(
                  displayAsideAs,
                  asideStatus.status
                )((v, s): string => {
                  if (v === 'float') return 'fixed'
                  if (v === 'none' && s !== 'closed') return 'fixed'
                  return 'initial'
                })
              ),
              style.top(headerBottom.map(v => `${v}px`)),
              AnimatedToggleClass({
                animation: { slide: 'left' },
                status: computedOf(
                  displayAsideAs,
                  asideStatus.status
                )((v, s): ToggleStatus => {
                  if (v === 'block') return 'opened'
                  return s
                }),
              }),
              style.width(
                coalesce(options.aside?.width, template.$.asideWidth)
              ),
              style.bottom(headerBottom.map(v => `${v}px`)),
              options.aside.content
            )
          : null,
        options.footer
          ? html.footer(
              attr.class(generatePanelClasses('top', 'none')),
              PanelStyles('white'),
              style.height('100%'),
              style.gridArea('footer'),
              options.footer.content
            )
          : null
      )
    })
  )
}

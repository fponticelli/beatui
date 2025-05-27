import {
  aria,
  attr,
  computedOf,
  html,
  prop,
  Signal,
  style,
  TNode,
} from '@tempots/dom'
import {
  BreakpointInfo,
  TWBreakpoint,
  TWBreakpoints,
  WithTWBreakpoint,
} from './with-breakpoint'
import { Button } from './button'
import { Icon } from './icon'
import { ElementRect } from '@tempots/ui'

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
}

export interface AppShellVerticalOptions {
  content: TNode
  width?: number | AppShellBreakpointOptionalOptions
}

export interface AppShellMainOptions {
  content: TNode
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
  mediumBreakpoint?: TWBreakpoint
  smallBreakpoint?: TWBreakpoint
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

function delaySignal<T>(signal: Signal<T>, delay = 0) {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let value: T
  const result = prop(signal.value)
  signal.on(v => {
    value = v
    if (timeout == null) {
      timeout = setTimeout(() => {
        timeout = null
        result.set(value)
      }, delay)
    }
  })
  signal.onDispose(() => {
    if (timeout != null) {
      clearTimeout(timeout)
    }
  })
  return result
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
  smallBreakpoint: TWBreakpoint
  mediumBreakpoint: TWBreakpoint
  vertical: Record<VerticalSection, AppShellBreakpointOptions>
  horizontal: Record<HorizontalSection, AppShellBreakpointOptions>
  is: BreakpointInfo<TWBreakpoints>['is']
}) {
  function makeSmall(breakpoint: TWBreakpoint) {
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

  function makeMedium(breakpoint: TWBreakpoint) {
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

  function makeLarge(breakpoint: TWBreakpoint) {
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
    breakpoint: TWBreakpoint
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

  return WithTWBreakpoint(({ value, is }) => {
    const mapBreakpoint = makeMapBreakpoint({
      smallBreakpoint,
      mediumBreakpoint,
      vertical,
      horizontal,
      is,
    })
    const template = value.map(mapBreakpoint)
    const displayHeader = computedOf(
      horizontal.header != null,
      vertical.menu != null,
      vertical.aside != null
    )((hasHeader: boolean, hasMenu: boolean, hasAside: boolean) => {
      return hasHeader || hasMenu || hasAside
    })
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
    const headerBottom = prop(0)
    const menuOpen = prop(false)
    const asideOpen = prop(false)
    const displayMenuAs = computedOf(
      vertical.menu != null,
      template,
      menuOpen
    )((
      hasMenu: boolean,
      { displayMenu }: { displayMenu: boolean },
      open: boolean
    ) => {
      if (!hasMenu) return 'none'
      if (displayMenu) return 'block'
      if (open) return 'float'
      return 'none'
    })
    const displayAsideAs = computedOf(
      vertical.aside != null,
      template,
      asideOpen
    )((
      hasAside: boolean,
      { displayAside }: { displayAside: boolean },
      open
    ) => {
      if (!hasAside) return 'none'
      if (displayAside) return 'block'
      if (open) return 'float'
      return 'none'
    })
    return html.div(
      attr.class('bg-white dark:bg-gray-900'),
      style.height('100%'),
      style.display('grid'),
      style.gridTemplateColumns(template.$.columns),
      style.gridTemplateRows(template.$.rows),
      style.gridTemplateAreas(template.$.areas),
      style.gridColumnGap('0'),
      style.gridRowGap('0'),
      options.banner
        ? html.header(
            attr.class('bg-gray-100'),
            style.height('100%'),
            style.gridArea('banner'),
            options.banner.content
          )
        : null,
      html.header(
        attr.class('border-b border-gray-300 dark:border-gray-600'),
        style.display(displayHeader.map((v): string => (v ? 'block' : 'none'))),
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
            style.width('48px'),
            Button(
              {
                onClick: () => menuOpen.update(v => !v),
                color: 'neutral',
                variant: 'text',
              },
              aria.label('Open menu'),
              Icon({
                icon: menuOpen.map((v): string =>
                  v
                    ? 'icon-[line-md--menu-to-close-alt-transition]'
                    : 'icon-[line-md--close-to-menu-alt-transition]'
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
            style.width('48px'),
            style.display(
              displayAsideButton.map((v): string => (v ? 'flex' : 'none'))
            ),
            Button(
              {
                onClick: () => asideOpen.update(v => !v),
                roundedness: 'full',
                variant: 'outline',
                color: 'neutral',
              },
              aria.label('Open aside'),
              Icon(
                { icon: 'icon-[line-md--chevron-left]' },
                attr.class('transition-transform'),
                attr.class(
                  asideOpen.map((v): string => (v ? 'rotate-180' : ''))
                )
              )
            )
          )
        )
      ),
      options.menu
        ? html.nav(
            attr.class('border-r border-gray-300 dark:border-gray-600'),
            attr.class(
              displayMenuAs.map((v): string =>
                v === 'float'
                  ? 'bg-gray-50 dark:bg-gray-900 shadow-xl'
                  : 'shadow-none'
              )
            ),
            style.height('100%'),
            style.gridArea('menu'),
            style.display(
              displayMenuAs.map((v): string =>
                v === 'none' ? 'none' : 'block'
              )
            ),
            style.position(
              displayMenuAs.map((v): string =>
                v === 'float' ? 'fixed' : 'initial'
              )
            ),
            style.top(headerBottom.map(v => `${v}px`)),
            style.transition('all 0.2s ease-in-out'),
            style.left(
              delaySignal(
                computedOf(
                  menuOpen,
                  template.$.menuWidth
                )((v, w) => (v ? '0' : `-${w}`)),
                0
              )
            ),
            style.width(template.$.menuWidth),
            style.bottom(headerBottom.map(v => `${v}px`)),
            options.menu.content
          )
        : null,
      options.mainHeader
        ? html.header(
            style.height('100%'),
            style.gridArea('mainHeader'),
            options.mainHeader.content
          )
        : null,
      html.main(
        style.height('100%'),
        style.overflow('hidden'),
        style.gridArea('main'),
        options.main.content
      ),
      options.mainFooter
        ? html.footer(
            style.height('100%'),
            style.gridArea('mainFooter'),
            options.mainFooter.content
          )
        : null,
      options.aside
        ? html.aside(
            attr.class('border-l border-gray-300 dark:border-gray-600'),
            attr.class(
              displayAsideAs.map((v): string =>
                v === 'float'
                  ? 'bg-gray-50 dark:bg-gray-900 shadow-xl'
                  : 'shadow-none'
              )
            ),
            style.height('100%'),
            style.gridArea('aside'),
            style.display(
              displayAsideAs.map((v): string =>
                v === 'none' ? 'none' : 'block'
              )
            ),
            style.position(
              displayAsideAs.map((v): string =>
                v === 'float' ? 'fixed' : 'initial'
              )
            ),
            style.top(headerBottom.map(v => `${v}px`)),
            style.transition('all 0.2s ease-in-out'),
            style.right(
              delaySignal(
                computedOf(
                  asideOpen,
                  template.$.asideWidth
                )((v, w) => (v ? '0' : `-${w}`)),
                0
              )
            ),
            style.width(template.$.menuWidth),
            style.bottom(headerBottom.map(v => `${v}px`)),
            options.aside.content
          )
        : null,
      options.footer
        ? html.footer(
            attr.class('border-t border-gray-300 dark:border-gray-600'),
            style.height('100%'),
            style.gridArea('footer'),
            options.footer.content
          )
        : null
    )
  })
}

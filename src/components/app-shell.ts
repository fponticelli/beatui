import { attr, html, style, TNode } from '@tempots/dom'
import {
  BreakpointInfo,
  TWBreakpoint,
  TWBreakpoints,
  WithTWBreakpoint,
} from './with-breakpoint'

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
    if (horizontal.header) {
      rows.push(horizontal.header[breakpoint] + 'px')
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
    if (horizontal.header) {
      rows.push(horizontal.header[breakpoint] + 'px')
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
    return html.div(
      style.height('100%'),
      style.display('grid'),
      style.gridTemplateColumns(template.$.columns),
      style.gridTemplateRows(template.$.rows),
      style.gridTemplateAreas(template.$.areas),
      style.gridColumnGap('0'),
      style.gridRowGap('0'),
      options.banner
        ? html.header(
            attr.class('bg-green-300'),
            style.gridArea('banner'),
            options.banner.content
          )
        : null,
      options.header
        ? html.header(
            attr.class('bg-cyan-300'),
            style.gridArea('header'),
            options.header.content
          )
        : null,
      options.menu
        ? html.nav(
            attr.class('bg-red-300'),
            style.gridArea('menu'),
            style.display(
              template.$.displayMenu.map((v): string => (v ? 'block' : 'none'))
            ),
            options.menu.content
          )
        : null,
      options.mainHeader
        ? html.header(
            attr.class('bg-rose-300'),
            style.gridArea('mainHeader'),
            options.mainHeader.content
          )
        : null,
      html.main(
        attr.class('bg-purple-300'),
        style.gridArea('main'),
        options.main.content
      ),
      options.mainFooter
        ? html.footer(
            attr.class('bg-teal-300'),
            style.gridArea('mainFooter'),
            options.mainFooter.content
          )
        : null,
      options.aside
        ? html.aside(
            attr.class('bg-blue-300'),
            style.gridArea('aside'),
            style.display(
              template.$.displayAside.map((v): string => (v ? 'block' : 'none'))
            ),
            options.aside.content
          )
        : null,
      options.footer
        ? html.footer(
            attr.class('bg-sky-300'),
            style.gridArea('footer'),
            options.footer.content
          )
        : null
    )
  })
}

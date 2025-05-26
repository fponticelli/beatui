import { attr, html, style, TNode } from '@tempots/dom'
import {
  BreakpointInfo,
  Breakpoints,
  WithTWBreakpoint,
} from './with-breakpoint'

export interface AppShellOptions {
  banner?: TNode
  header?: TNode
  footer?: TNode
  menu?: TNode
  aside?: TNode
  main?: TNode
  mainHeader?: TNode
  mainFooter?: TNode
}

function mapBreakpoint(width: number, is: BreakpointInfo<Breakpoints>['is']) {
  if (is('<xs', width)) {
    return {
      columns: '1fr',
      rows: '1fr 1fr 1fr 1fr 1fr 1fr',
      areas: `
    "banner"
    "header"
    "main-header"
    "main"
    "main-footer"
    "footer"`,
    }
  }
  return {
    columns: '1fr 3fr 1fr',
    rows: '1fr 1fr 1fr 1fr 1fr 1fr',
    areas: `
    "banner banner banner"
    "header header header"
    "menu main-header aside"
    "menu main aside"
    "menu main-footer aside"
    "footer footer footer"`,
  }
}

export function AppShell(options: AppShellOptions) {
  return WithTWBreakpoint(({ width, is }) => {
    const template = width.map(width => mapBreakpoint(width, is))
    return html.div(
      style.height('100%'),
      style.display('grid'),
      style.gridTemplateColumns(template.$.columns),
      style.gridTemplateRows(template.$.rows),
      style.gridTemplateAreas(template.$.areas),
      style.gridColumnGap('0'),
      style.gridRowGap('0'),
      html.div(
        attr.class('bg-green-300'),
        style.gridArea('banner'),
        options.banner
      ),
      html.div(
        attr.class('bg-cyan-300'),
        style.gridArea('header'),
        options.header
      ),
      html.div(attr.class('bg-red-300'), style.gridArea('menu'), options.menu),
      html.div(
        attr.class('bg-rose-300'),
        style.gridArea('main-header'),
        options.mainHeader
      ),
      html.div(
        attr.class('bg-purple-300'),
        style.gridArea('main'),
        options.main
      ),
      html.div(
        attr.class('bg-teal-300'),
        style.gridArea('main-footer'),
        options.mainFooter
      ),
      html.div(
        attr.class('bg-blue-300'),
        style.gridArea('aside'),
        options.aside
      ),
      html.div(
        attr.class('bg-sky-300'),
        style.gridArea('footer'),
        options.footer
      )
    )
  })
}

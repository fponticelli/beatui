import { attr, html, style, TNode } from '@tempots/dom'

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

export function AppShell(options: AppShellOptions) {
  return html.div(
    style.display('grid'),
    style.gridTemplateColumns('1fr 3fr 1fr'),
    style.gridTemplateRows('1fr 1fr 1fr 1fr 1fr 1fr'),
    style.gridColumnGap('0'),
    style.gridRowGap('0'),
    style.gridTemplateAreas(`
    "banner banner banner"
    "header header header"
    "menu main-header aside"
    "menu main aside"
    "menu main-footer aside"
    "footer footer footer"`),
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
    html.div(attr.class('bg-purple-300'), style.gridArea('main'), options.main),
    html.div(
      attr.class('bg-teal-300'),
      style.gridArea('main-footer'),
      options.mainFooter
    ),
    html.div(attr.class('bg-blue-300'), style.gridArea('aside'), options.aside),
    html.div(attr.class('bg-sky-300'), style.gridArea('footer'), options.footer)
  )
}

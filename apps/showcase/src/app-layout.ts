import { html, attr, TNode } from '@tempots/dom'
import { SidebarMenu } from './views/sidebar-menu'

export function AppLayout({ children }: { children: TNode }) {
  return html.div(
    attr.style('width: 100%; height: 100vh; display: flex; overflow: hidden'),
    // Left sidebar
    SidebarMenu(),
    // Main content area
    html.div(
      attr.style(
        'flex: 1; overflow: auto; display: flex; flex-direction: column'
      ),
      children
    )
  )
}

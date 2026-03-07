import { html, TNode } from '@tempots/dom'
import { RootRouter } from '@tempots/ui'
import { BeatUI } from '@tempots/beatui'
import { Async } from '@tempots/dom'
import { AppLayout } from './app-layout'
import { pages } from './registry/page-registry'

export const App = () => {
  // Build routes dynamically from page registry
  const componentRoutes: Record<string, () => unknown> = {}

  for (const page of pages) {
    componentRoutes[`/components/${page.slug}`] = () =>
      Async(
        import(`./pages/components/${page.slug}.ts`),
        ({ default: Page }: { default: () => TNode }) => Page()
      )
  }

  return BeatUI(
    {},
    AppLayout({
      children: RootRouter({
        '/': () =>
          Async(import('./pages/home'), ({ default: Page }) => Page()),
        ...componentRoutes,
        '/api/*': () =>
          Async(import('./pages/api/api-router'), ({ ApiRouter }) =>
            ApiRouter()
          ),
        '/*': () => html.div('Not Found'),
      }),
    })
  )
}

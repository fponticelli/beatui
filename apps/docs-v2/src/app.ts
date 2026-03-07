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
        '/guides/getting-started': () =>
          Async(
            import('./pages/guides/getting-started'),
            ({ default: Page }) => Page()
          ),
        '/guides/theming': () =>
          Async(
            import('./pages/guides/theming'),
            ({ default: Page }) => Page()
          ),
        '/guides/customization': () =>
          Async(
            import('./pages/guides/customization'),
            ({ default: Page }) => Page()
          ),
        '/guides/css-variables': () =>
          Async(
            import('./pages/guides/css-variables'),
            ({ default: Page }) => Page()
          ),
        '/guides/forms': () =>
          Async(
            import('./pages/guides/forms'),
            ({ default: Page }) => Page()
          ),
        '/guides/rtl-ltr': () =>
          Async(
            import('./pages/guides/rtl-ltr'),
            ({ default: Page }) => Page()
          ),
        '/guides/data-source': () =>
          Async(
            import('./pages/guides/data-source'),
            ({ default: Page }) => Page()
          ),
        '/guides/authentication': () =>
          Async(
            import('./pages/guides/authentication'),
            ({ default: Page }) => Page()
          ),
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

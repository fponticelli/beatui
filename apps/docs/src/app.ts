import { TNode } from '@tempots/dom'
import { RootRouter } from '@tempots/ui'
import { BeatUI } from '@tempots/beatui'
import { Async } from '@tempots/dom'
import { AppLayout } from './app-layout'
import { pages } from './registry/page-registry'
import { NotFoundPage } from './pages/not-found'

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
        '/guides/localization': () =>
          Async(
            import('./pages/guides/localization'),
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
        '/guides/lexical-editor': () =>
          Async(
            import('./pages/guides/lexical-editor'),
            ({ default: Page }) => Page()
          ),
        '/guides/monaco-editor': () =>
          Async(
            import('./pages/guides/monaco-editor'),
            ({ default: Page }) => Page()
          ),
        '/guides/prosemirror-editor': () =>
          Async(
            import('./pages/guides/prosemirror-editor'),
            ({ default: Page }) => Page()
          ),
        '/guides/markdown-renderer': () =>
          Async(
            import('./pages/guides/markdown-renderer'),
            ({ default: Page }) => Page()
          ),
        '/guides/json-schema-forms': () =>
          Async(
            import('./pages/guides/json-schema-forms'),
            ({ default: Page }) => Page()
          ),
        '/guides/json-structure-forms': () =>
          Async(
            import('./pages/guides/json-structure-forms'),
            ({ default: Page }) => Page()
          ),
        '/guides/json-schema-display': () =>
          Async(
            import('./pages/guides/json-schema-display'),
            ({ default: Page }) => Page()
          ),
        '/guides/openui-playground': () =>
          Async(
            import('./pages/guides/openui-playground').catch(e => {
              console.error('OpenUI playground import failed:', e)
              throw e
            }),
            ({ default: Page }) => Page()
          ),
        ...componentRoutes,
        '/api/*': () =>
          Async(import('./pages/api/api-router'), ({ ApiRouter }) =>
            ApiRouter()
          ),
        '/*': () => NotFoundPage(),
      }),
    })
  )
}

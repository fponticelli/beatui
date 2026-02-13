import { html, attr, MapSignal, Task, Fragment, TNode } from '@tempots/dom'
import { ChildRouter, Anchor } from '@tempots/ui'
import { Stack } from '@tempots/beatui'
import { ApiLanding } from './api-landing'
import {
  loadApiData,
  getModuleReflections,
  getSymbol,
  categorizeByKind,
  getModuleInfo,
} from '../../api/api-data'
import type { ApiReflection } from '../../api/typedoc-types'
import { ApiSymbolRow, ApiSymbolCard } from '../../components/api'
import { renderComment } from '../../components/api/api-comment'

/** Nested router for /api/* routes */
export function ApiRouter() {
  return ChildRouter({
    '/': () => ApiLanding(),
    '/:entryPoint': info =>
      MapSignal(info, routeInfo => {
        const slug = routeInfo.params.entryPoint
        return Task(() => loadApiData(), {
          pending: () => html.div(attr.class('p-6'), 'Loading API data...'),
          error: () =>
            html.div(
              attr.class('p-6 text-red-600'),
              'Failed to load API data. Run ',
              html.code('pnpm --filter @beatui/docs run gen:api'),
              ' first.'
            ),
          then: project => {
            const mod = getModuleReflections(project, slug)
            const moduleInfo = getModuleInfo(slug)
            if (!mod || !moduleInfo) {
              return html.div(
                attr.class('p-6'),
                html.h1('Module not found'),
                html.p(`No module found for "${slug}"`)
              )
            }
            const cats = categorizeByKind(mod.children ?? [])
            return html.div(
              attr.class('p-6'),
              Stack(
                attr.class('max-w-320 mx-auto'),
                html.nav(
                  attr.class('text-sm text-gray-500 mb-4'),
                  Anchor(
                    { href: '/api', viewTransition: true },
                    attr.class('hover:underline'),
                    'API Reference'
                  ),
                  ' / ',
                  html.span(moduleInfo.displayName)
                ),
                html.h1(
                  attr.class('text-3xl font-bold mb-1'),
                  moduleInfo.displayName
                ),
                html.p(
                  attr.class('text-sm text-gray-500 mb-6'),
                  `@tempots/beatui${slug === 'main' ? '' : '/' + slug}`
                ),
                renderComment(mod.comment),
                renderSection('Functions', cats.functions, slug),
                renderSection('Interfaces', cats.interfaces, slug),
                renderSection('Classes', cats.classes, slug),
                renderSection('Type Aliases', cats.typeAliases, slug),
                renderSection('Variables', cats.variables, slug),
                renderSection('Enums', cats.enums, slug)
              )
            )
          },
        })
      }),
    '/:entryPoint/:symbol': info =>
      MapSignal(info, routeInfo => {
        const slug = routeInfo.params.entryPoint
        const symbolName = routeInfo.params.symbol
        return Task(() => loadApiData(), {
          pending: () => html.div(attr.class('p-6'), 'Loading...'),
          error: () =>
            html.div(
              attr.class('p-6 text-red-600'),
              'Failed to load API data.'
            ),
          then: project => {
            const moduleInfo = getModuleInfo(slug)
            const reflection = getSymbol(project, slug, symbolName)
            if (!reflection || !moduleInfo) {
              return html.div(
                attr.class('p-6'),
                html.h1('Symbol not found'),
                html.p(`No symbol "${symbolName}" found in module "${slug}".`)
              )
            }
            return html.div(
              attr.class('p-6'),
              Stack(
                attr.class('max-w-320 mx-auto'),
                html.nav(
                  attr.class('text-sm text-gray-500 mb-4'),
                  Anchor(
                    { href: '/api', viewTransition: true },
                    attr.class('hover:underline'),
                    'API Reference'
                  ),
                  ' / ',
                  Anchor(
                    { href: `/api/${slug}`, viewTransition: true },
                    attr.class('hover:underline'),
                    moduleInfo.displayName
                  ),
                  ' / ',
                  html.span(reflection.name)
                ),
                ApiSymbolCard(reflection, slug)
              )
            )
          },
        })
      }),
  })
}

function renderSection(
  title: string,
  items: ApiReflection[],
  moduleSlug: string
): TNode {
  if (!items.length) return Fragment()
  return html.div(
    attr.class('api-section mb-8'),
    html.h2(attr.class('text-xl font-semibold mb-3 pb-2 border-b'), title),
    Stack(attr.class('gap-2'), ...items.map(r => ApiSymbolRow(r, moduleSlug)))
  )
}

import { html, attr, TNode } from '@tempots/dom'
import { ScrollablePanel, Stack, Badge, Icon } from '@tempots/beatui'
import { Anchor } from '@tempots/ui'
import type { ComponentPageMeta, DocSection } from './types'
import { SectionCard } from './section'
import { componentMeta } from '../registry/component-meta'

/**
 * Standard component documentation page layout.
 *
 * Structure:
 * - Header with component name, description, and API link
 * - Playground area (interactive preview + controls)
 * - Scrollable sections below
 */
export function ComponentPage(
  meta: ComponentPageMeta,
  options: {
    playground: TNode
    sections?: DocSection[]
  }
): TNode {
  const cm = componentMeta[meta.component]
  // Build the API link — most components are in the "main" module
  const apiModule = meta.apiModule ?? 'main'
  const apiSymbol = meta.component + 'Options'

  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-6xl mx-auto'),
      // Header
      html.div(
        attr.class('flex items-start justify-between'),
        html.div(
          attr.class('space-y-1'),
          html.h1(attr.class('text-2xl font-bold'), meta.name),
          html.p(
            attr.class('text-gray-600 dark:text-gray-400'),
            meta.description
          )
        ),
        html.div(
          attr.class('flex gap-2 shrink-0'),
          cm
            ? Anchor(
                {
                  href: `/api/${apiModule}/${apiSymbol}`,
                  viewTransition: true,
                },
                attr.class('no-underline'),
                Badge(
                  { variant: 'outline', size: 'sm', color: 'primary' },
                  Icon({ icon: 'lucide:book-open', size: 'xs' }),
                  'API'
                )
              )
            : undefined,
          cm?.sourceFile
            ? Anchor(
                {
                  href: `https://github.com/fponticelli/beatui/blob/main/packages/beatui/src/${cm.sourceFile}`,
                },
                attr.class('no-underline'),
                attr.target('_blank'),
                Badge(
                  { variant: 'outline', size: 'sm', color: 'base' },
                  Icon({ icon: 'lucide:code-2', size: 'xs' }),
                  'Source'
                )
              )
            : undefined
        )
      ),
      // Playground
      html.div(attr.class('playground-preview'), options.playground),
      // Sections
      ...(options.sections ?? []).map(section => SectionCard(section))
    ),
  })
}

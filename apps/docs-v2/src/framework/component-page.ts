import { html, attr, TNode } from '@tempots/dom'
import { ScrollablePanel, Stack } from '@tempots/beatui'
import type { ComponentPageMeta, DocSection } from './types'
import { SectionCard } from './section'

/**
 * Standard component documentation page layout.
 *
 * Structure:
 * - Header with component name and description
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
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-6xl mx-auto'),
      // Header
      html.div(
        attr.class('space-y-1'),
        html.h1(attr.class('text-2xl font-bold'), meta.name),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400'),
          meta.description
        )
      ),
      // Playground
      options.playground,
      // Sections
      ...(options.sections ?? []).map(section => SectionCard(section))
    ),
  })
}

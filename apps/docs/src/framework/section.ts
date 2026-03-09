import { html, attr, TNode } from '@tempots/dom'
import { Card } from '@tempots/beatui'
import type { DocSection } from './types'

/**
 * Create a section definition for use in ComponentPage.
 */
export function Section(
  title: string,
  content: () => TNode,
  description?: string
): DocSection {
  return { title, description, content }
}

/**
 * Renders a documentation section as a card with a title and optional description.
 */
export function SectionCard(section: DocSection): TNode {
  return Card(
    {},
    html.div(
      attr.class('space-y-3'),
      html.h3(attr.class('text-lg font-semibold'), section.title),
      section.description
        ? html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            section.description
          )
        : undefined,
      html.div(attr.class('mt-2 playground-preview'), section.content())
    )
  )
}

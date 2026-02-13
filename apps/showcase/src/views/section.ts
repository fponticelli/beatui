import { html, attr, TNode } from '@tempots/dom'

/**
 * Reusable section component matching the mock's visual pattern:
 * - Uppercase section header (11px, #9CA3AF, letter-spacing 0.05em)
 * - Content with flex-wrap layout (gap 8px)
 * - 20px bottom margin between sections
 */
export function Section(title: string, ...children: TNode[]): TNode {
  return html.div(
    attr.style('margin-bottom: 20px'),
    html.div(attr.class('sc-section-header'), title),
    html.div(
      attr.style(
        'display: flex; flex-wrap: wrap; gap: 8px; align-items: center'
      ),
      ...children
    )
  )
}

/**
 * Section variant with stacked (column) layout for form-like content.
 */
export function SectionStack(title: string, ...children: TNode[]): TNode {
  return html.div(
    attr.style('margin-bottom: 20px'),
    html.div(attr.class('sc-section-header'), title),
    html.div(
      attr.style('display: flex; flex-direction: column; gap: 10px'),
      ...children
    )
  )
}

/**
 * Section variant where content is not wrapped in a flex container.
 * Useful when children need their own layout (e.g., tables, grids).
 */
export function SectionBlock(title: string, ...children: TNode[]): TNode {
  return html.div(
    attr.style('margin-bottom: 20px'),
    html.div(attr.class('sc-section-header'), title),
    ...children
  )
}

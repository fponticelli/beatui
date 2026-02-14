import { TNode, attr, html } from '@tempots/dom'

export interface PresenceSelection {
  /** Author display name */
  author: string
  /** Author's presence color (hex) */
  color: string
}

/**
 * PresenceCursor renders a cursor indicator with an author name tag.
 * Used to show collaborative editing cursors.
 */
export function PresenceCursor(options: {
  author: string
  color: string
}): TNode {
  const { author, color } = options
  return html.span(
    attr.class('bc-presence-cursor'),
    attr.style(`--presence-color: ${color}`),
    html.span(attr.class('bc-presence-cursor__bar')),
    html.span(attr.class('bc-presence-cursor__label'), author)
  )
}

/**
 * PresenceHighlight wraps text with a colored selection highlight.
 * Used to show collaborative editing selections.
 */
export function PresenceHighlight(
  options: { color: string },
  ...children: TNode[]
): TNode {
  return html.span(
    attr.class('bc-presence-highlight'),
    attr.style(`--presence-color: ${options.color}`),
    ...children
  )
}

/**
 * PresenceSelectionMark wraps text with both highlight and cursor.
 */
export function PresenceSelectionMark(
  options: PresenceSelection,
  ...children: TNode[]
): TNode {
  const { author, color } = options
  return html.span(
    attr.class('bc-presence-selection'),
    attr.style(`--presence-color: ${color}`),
    html.span(attr.class('bc-presence-highlight'), ...children),
    PresenceCursor({ author, color })
  )
}

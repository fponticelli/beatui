import { TNode, Value, attr, html, computedOf, Task } from '@tempots/dom'
import { micromark } from 'micromark'
import { StylePortal } from '@/components/misc/style-portal'

export type MarkdownOptions = {
  content: Value<string>
  /** Escape HTML by default for safety. Set true to allow raw HTML passthrough. */
  allowHtml?: Value<boolean>
}

/**
 * Markdown component: renders Markdown to HTML using micromark.
 * - Escapes HTML by default (allowHtml: false)
 * - Applies bu-prose utilities for typography and a small component CSS (bc-markdown)
 * - Ships as separate subpath bundle (@tempots/beatui/markdown)
 */
export function Markdown(
  options: MarkdownOptions,
  ...children: TNode[]
): TNode {
  const { content, allowHtml = false } = options

  const rendered = computedOf(
    content,
    allowHtml
  )((md = '', allowDangerousHtml = false) =>
    micromark(md, { allowDangerousHtml })
  )

  return html.div(
    // Ensure styles are present declaratively via head portal
    Task(
      () => import('@/markdown/styles'),
      ({ default: css }) => StylePortal({ id: 'beatui-markdown-css', css })
    ),
    attr.class('bc-markdown bu-prose'),
    attr.innerHTML(rendered),
    ...children
  )
}

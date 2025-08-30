import {
  TNode,
  Value,
  attr,
  html,
  computedOf,
  Task,
  MapSignal,
  Async,
} from '@tempots/dom'
import { micromark } from 'micromark'
import { StylePortal } from '@/components/misc/style-portal'
import { resolveExtensions } from '@/markdown/extensions'

export type MarkdownOptions = {
  content: Value<string>
  /** Escape HTML by default for safety. Set true to allow raw HTML passthrough. */
  allowHtml?: Value<boolean>
  features?: Value<{
    gfm?: boolean
  }>
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
    allowHtml,
    options.features
  )(async (md = '', allowDangerousHtml = false, features = {}) => {
    const { extensions, htmlExtensions } = await resolveExtensions(features)
    return micromark(md, { allowDangerousHtml, extensions, htmlExtensions })
  })

  return html.div(
    // Ensure styles are present declaratively via head portal
    Task(
      () => import('@/markdown/styles'),
      ({ default: css }) => StylePortal({ id: 'beatui-markdown-css', css })
    ),
    attr.class('bc-markdown bu-prose'),
    MapSignal(rendered, html =>
      Async(html, content => attr.innerHTML(content))
    ),
    ...children
  )
}

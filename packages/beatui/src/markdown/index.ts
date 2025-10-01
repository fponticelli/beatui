import {
  TNode,
  Value,
  attr,
  html,
  computedOf,
  Task,
  MapSignal,
  Async,
  Renderable,
} from '@tempots/dom'
import { micromark } from 'micromark'
import { LinkPortal } from '@/components/misc/link-portal'
import { resolveExtensions } from '@/markdown/extensions'

export type MarkdownOptions = {
  content: Value<string>
  /** Escape HTML by default for safety. Set true to allow raw HTML passthrough. */
  allowHtml?: Value<boolean>
  features?: Value<{
    gfm?: boolean
  }>
  cssInjection?: 'link' | 'none'
}

/**
 * Markdown component: renders Markdown to HTML using micromark.
 * - Escapes HTML by default (allowHtml: false)
 * - Applies bc-markdown typography styles for consistent Markdown rendering
 * - Ships as separate subpath bundle (@tempots/beatui/markdown)
 */
export function Markdown(
  options: MarkdownOptions,
  ...children: TNode[]
): Renderable {
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
    (options.cssInjection ?? 'none') === 'none'
      ? null
      : Task(
          () => import('@/markdown/styles-url'),
          ({ default: href }) => LinkPortal({ id: 'beatui-markdown-css', href })
        ),
    attr.class('bc-markdown'),
    MapSignal(rendered, html =>
      Async(html, content => attr.innerHTML(content))
    ),
    ...children
  )
}

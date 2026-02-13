/**
 * Markdown rendering for `@tempots/beatui/markdown`.
 *
 * Renders Markdown content to styled HTML using micromark with optional
 * GFM (GitHub Flavored Markdown) support. HTML is escaped by default
 * for safety.
 *
 * ```ts
 * import { Markdown } from '@tempots/beatui/markdown'
 * ```
 *
 * @module
 */

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
import { LinkPortal } from '../components/misc/link-portal'
import { resolveExtensions } from './extensions'

export type MarkdownOptions = {
  content: Value<string>
  /** Escape HTML by default for safety. Set true to allow raw HTML passthrough. */
  allowHtml?: Value<boolean>
  /**
   * Allow potentially dangerous protocols in links and images (e.g., `data:`, `javascript:`).
   * **WARNING: This is unsafe!** Enabling this opens you up to XSS attacks.
   * Only enable if you completely trust the markdown source.
   * @default false
   */
  allowDangerousProtocol?: Value<boolean>
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
  const { content, allowHtml = false, allowDangerousProtocol = false } = options

  const rendered = computedOf(
    content,
    allowHtml,
    allowDangerousProtocol,
    options.features
  )(async (
    md = '',
    allowDangerousHtml = false,
    allowDangerousProtocol = false,
    features = {}
  ) => {
    const { extensions, htmlExtensions } = await resolveExtensions(features)
    return micromark(md, {
      allowDangerousHtml,
      allowDangerousProtocol,
      extensions,
      htmlExtensions,
    })
  })

  return html.div(
    // Ensure styles are present declaratively via head portal
    (options.cssInjection ?? 'none') === 'none'
      ? null
      : Task(
          () => import('./styles-url'),
          ({ default: href }) => LinkPortal({ id: 'beatui-markdown-css', href })
        ),
    attr.class('bc-markdown'),
    MapSignal(rendered, html =>
      Async(html, content => attr.innerHTML(content))
    ),
    ...children
  )
}

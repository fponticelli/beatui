import { html, attr, Fragment, TNode } from '@tempots/dom'
import type {
  ApiComment,
  ApiCommentPart,
  ApiCommentTag,
} from '../../api/typedoc-types'

/** Renders a TypeDoc comment (summary + block tags) */
export function renderComment(comment: ApiComment | undefined): TNode {
  if (!comment) return Fragment()

  const parts: TNode[] = []

  if (comment.summary?.length) {
    parts.push(
      html.p(
        attr.class('api-comment__summary'),
        ...comment.summary.map(renderPart)
      )
    )
  }

  if (comment.blockTags?.length) {
    parts.push(...comment.blockTags.map(renderBlockTag))
  }

  return html.div(attr.class('api-comment'), ...parts)
}

/** Renders a single summary line (first sentence) for compact listings */
export function renderSummaryLine(comment: ApiComment | undefined): TNode {
  if (!comment?.summary?.length) return Fragment()
  return html.span(
    attr.class('api-comment__summary-line'),
    ...comment.summary.map(renderPart)
  )
}

function renderPart(part: ApiCommentPart): TNode {
  switch (part.kind) {
    case 'code':
      // Detect multi-line code blocks
      if (part.text.startsWith('```')) {
        const lines = part.text.split('\n')
        // Remove first line (```lang) and last line (```)
        const code = lines.slice(1, -1).join('\n')
        return html.pre(attr.class('api-comment__code-block'), html.code(code))
      }
      return html.code(
        attr.class('api-comment__inline-code'),
        part.text.replace(/^`|`$/g, '')
      )
    case 'inline-tag':
      if (part.tag === '@link' || part.tag === '@see') {
        return html.code(attr.class('api-comment__inline-code'), part.text)
      }
      return html.span(part.text)
    case 'text':
    default:
      return html.span(part.text)
  }
}

function renderBlockTag(tag: ApiCommentTag): TNode {
  const tagLabel = tag.tag.replace(/^@/, '')
  return html.div(
    attr.class('api-comment__block-tag'),
    html.h4(attr.class('api-comment__tag-label'), tagLabel),
    html.div(
      attr.class('api-comment__tag-content'),
      ...tag.content.map(renderPart)
    )
  )
}

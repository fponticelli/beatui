import { html, attr, Fragment, Empty, TNode } from '@tempots/dom'
import { Anchor } from '@tempots/ui'
import type { ApiReflection } from '../../api/typedoc-types'
import { kindLabel, ReflectionKind } from '../../api/typedoc-types'
import { renderType } from './api-type-renderer'
import { renderSummaryLine } from './api-comment'

/** Compact row for symbol listings: kind badge, linked name, brief type/signature, first comment line */
export function ApiSymbolRow(
  reflection: ApiReflection,
  moduleSlug: string
): TNode {
  const kind = kindLabel(reflection.kind)
  const kindClass = kind.toLowerCase().replace(/\s+/g, '-')

  return html.div(
    attr.class('api-symbol-row'),
    html.span(
      attr.class(`api-badge api-badge--${kindClass} api-badge--sm`),
      kind
    ),
    html.div(
      attr.class('api-symbol-row__content'),
      Anchor(
        { href: `/api/${moduleSlug}/${reflection.name}`, viewTransition: true },
        attr.class('api-symbol-row__name'),
        html.code(reflection.name)
      ),
      renderBriefSignature(reflection, moduleSlug),
      renderSummaryLine(
        reflection.comment ?? reflection.signatures?.[0]?.comment
      )
    )
  )
}

function renderBriefSignature(r: ApiReflection, moduleSlug: string): TNode {
  if (r.kind === ReflectionKind.Function && r.signatures?.length) {
    const sig = r.signatures[0]
    const params = sig.parameters ?? []
    return html.span(
      attr.class('api-symbol-row__signature'),
      html.code(
        '(',
        ...params.flatMap((p, i) => {
          const name = p.name === '__namedParameters' ? 'options' : p.name
          const optional = p.flags?.isOptional ? '?' : ''
          return i > 0 ? [', ', name + optional] : [name + optional]
        }),
        ')',
        sig.type ? Fragment(': ', renderType(sig.type, moduleSlug)) : Empty
      )
    )
  }

  if (
    r.kind === ReflectionKind.Variable ||
    r.kind === ReflectionKind.TypeAlias
  ) {
    if (r.type) {
      return html.span(
        attr.class('api-symbol-row__type'),
        html.code(renderType(r.type, moduleSlug))
      )
    }
  }

  return Empty
}

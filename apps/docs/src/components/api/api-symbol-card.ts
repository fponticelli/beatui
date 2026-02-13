import { html, attr, Fragment, Empty, TNode } from '@tempots/dom'
import type { ApiReflection } from '../../api/typedoc-types'
import { kindLabel, ReflectionKind } from '../../api/typedoc-types'
import { renderComment } from './api-comment'
import { renderSignature } from './api-signature'
import { renderPropertyTable } from './api-property-table'
import { renderType } from './api-type-renderer'

/** Full symbol documentation card — used on the symbol detail page */
export function ApiSymbolCard(
  reflection: ApiReflection,
  moduleSlug: string
): TNode {
  const kind = kindLabel(reflection.kind)

  return html.div(
    attr.class('api-symbol-card'),
    // Header
    html.div(
      attr.class('api-symbol-card__header'),
      html.span(
        attr.class(
          `api-badge api-badge--${kind.toLowerCase().replace(/\s+/g, '-')}`
        ),
        kind
      ),
      html.h2(attr.class('api-symbol-card__name'), reflection.name),
      renderSourceLink(reflection)
    ),
    // Comment
    renderComment(reflection.comment),
    // Body — depends on kind
    renderBody(reflection, moduleSlug)
  )
}

function renderSourceLink(reflection: ApiReflection): TNode {
  const source = reflection.sources?.[0]
  if (!source?.url) return Empty
  return html.a(
    attr.href(source.url),
    attr.target('_blank'),
    attr.rel('noopener noreferrer'),
    attr.class('api-symbol-card__source-link'),
    `${source.fileName}:${source.line}`
  )
}

function renderBody(reflection: ApiReflection, moduleSlug: string): TNode {
  switch (reflection.kind) {
    case ReflectionKind.Function:
      return renderFunctionBody(reflection, moduleSlug)
    case ReflectionKind.Interface:
    case ReflectionKind.Namespace:
      return renderInterfaceBody(reflection, moduleSlug)
    case ReflectionKind.Class:
      return renderClassBody(reflection, moduleSlug)
    case ReflectionKind.TypeAlias:
      return renderTypeAliasBody(reflection, moduleSlug)
    case ReflectionKind.Variable:
      return renderVariableBody(reflection, moduleSlug)
    case ReflectionKind.Enum:
      return renderEnumBody(reflection, moduleSlug)
    default:
      return Empty
  }
}

function renderFunctionBody(r: ApiReflection, moduleSlug: string): TNode {
  if (!r.signatures?.length) return Empty
  return html.div(
    attr.class('api-symbol-card__body'),
    ...r.signatures.map(sig => renderSignature(sig, moduleSlug))
  )
}

function renderInterfaceBody(r: ApiReflection, moduleSlug: string): TNode {
  const properties = (r.children ?? []).filter(
    c => c.kind === ReflectionKind.Property
  )
  const methods = (r.children ?? []).filter(
    c => c.kind === ReflectionKind.Method
  )

  return html.div(
    attr.class('api-symbol-card__body'),
    // Type parameters
    r.typeParameter?.length
      ? html.div(
          attr.class('api-symbol-card__type-params'),
          html.h3('Type Parameters'),
          html.ul(
            ...r.typeParameter.map(tp =>
              html.li(
                html.code(tp.name),
                tp.type
                  ? Fragment(
                      ' extends ',
                      html.code(renderType(tp.type, moduleSlug))
                    )
                  : Empty,
                tp.default
                  ? Fragment(
                      ' = ',
                      html.code(renderType(tp.default, moduleSlug))
                    )
                  : Empty
              )
            )
          )
        )
      : Empty,
    // Properties
    properties.length
      ? html.div(
          attr.class('api-symbol-card__section'),
          html.h3('Properties'),
          renderPropertyTable(properties, moduleSlug)
        )
      : Empty,
    // Methods
    methods.length
      ? html.div(
          attr.class('api-symbol-card__section'),
          html.h3('Methods'),
          // eslint-disable-next-line tempots/no-renderable-signal-map
          ...methods.map(m =>
            html.div(
              attr.class('api-symbol-card__method'),
              html.h4(attr.class('api-symbol-card__method-name'), m.name),
              ...(m.signatures ?? []).map(sig =>
                renderSignature(sig, moduleSlug)
              )
            )
          )
        )
      : Empty
  )
}

function renderClassBody(r: ApiReflection, moduleSlug: string): TNode {
  // Reuse interface body plus extends/implements
  return html.div(
    attr.class('api-symbol-card__body'),
    r.extendedTypes?.length
      ? html.div(
          attr.class('api-symbol-card__extends'),
          html.span('Extends: '),
          ...r.extendedTypes.flatMap((t, i) =>
            i > 0
              ? [', ', html.code(renderType(t, moduleSlug))]
              : [html.code(renderType(t, moduleSlug))]
          )
        )
      : Empty,
    r.implementedTypes?.length
      ? html.div(
          attr.class('api-symbol-card__implements'),
          html.span('Implements: '),
          ...r.implementedTypes.flatMap((t, i) =>
            i > 0
              ? [', ', html.code(renderType(t, moduleSlug))]
              : [html.code(renderType(t, moduleSlug))]
          )
        )
      : Empty,
    renderInterfaceBody(r, moduleSlug)
  )
}

function renderTypeAliasBody(r: ApiReflection, moduleSlug: string): TNode {
  return html.div(
    attr.class('api-symbol-card__body'),
    // Type parameters
    r.typeParameter?.length
      ? html.div(
          attr.class('api-symbol-card__type-params'),
          html.h3('Type Parameters'),
          html.ul(
            ...r.typeParameter.map(tp =>
              html.li(
                html.code(tp.name),
                tp.type
                  ? Fragment(
                      ' extends ',
                      html.code(renderType(tp.type, moduleSlug))
                    )
                  : Empty,
                tp.default
                  ? Fragment(
                      ' = ',
                      html.code(renderType(tp.default, moduleSlug))
                    )
                  : Empty
              )
            )
          )
        )
      : Empty,
    // Type definition
    html.div(
      attr.class('api-symbol-card__type-def'),
      html.h3('Type'),
      html.pre(
        attr.class('api-symbol-card__type-code'),
        html.code(renderType(r.type, moduleSlug))
      )
    )
  )
}

function renderVariableBody(r: ApiReflection, moduleSlug: string): TNode {
  return html.div(
    attr.class('api-symbol-card__body'),
    r.type
      ? html.div(
          attr.class('api-symbol-card__type-def'),
          html.h3('Type'),
          html.pre(
            attr.class('api-symbol-card__type-code'),
            html.code(renderType(r.type, moduleSlug))
          )
        )
      : Empty,
    r.defaultValue
      ? html.div(
          attr.class('api-symbol-card__default'),
          html.h3('Value'),
          html.pre(
            attr.class('api-symbol-card__type-code'),
            html.code(r.defaultValue)
          )
        )
      : Empty
  )
}

function renderEnumBody(r: ApiReflection, moduleSlug: string): TNode {
  const members = (r.children ?? []).filter(
    c => c.kind === ReflectionKind.EnumMember
  )
  if (!members.length) return Empty

  return html.div(
    attr.class('api-symbol-card__body'),
    html.h3('Members'),
    html.table(
      attr.class('api-table'),
      html.thead(
        html.tr(html.th('Member'), html.th('Value'), html.th('Description'))
      ),
      html.tbody(
        // eslint-disable-next-line tempots/no-renderable-signal-map
        ...members.map(m =>
          html.tr(
            html.td(html.code(m.name)),
            html.td(m.type ? html.code(renderType(m.type, moduleSlug)) : Empty),
            html.td(
              m.comment?.summary
                ? html.span(...m.comment.summary.map(s => html.span(s.text)))
                : Empty
            )
          )
        )
      )
    )
  )
}

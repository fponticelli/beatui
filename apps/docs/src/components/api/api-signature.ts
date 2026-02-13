import { html, attr, Fragment, TNode } from '@tempots/dom'
import type { ApiSignature, ApiTypeParameter } from '../../api/typedoc-types'
import { renderType } from './api-type-renderer'
import { renderComment } from './api-comment'

/** Renders a full function signature with params table and return type */
export function renderSignature(sig: ApiSignature, moduleSlug: string): TNode {
  return html.div(
    attr.class('api-signature'),
    // Signature line
    html.div(
      attr.class('api-signature__header'),
      html.code(
        attr.class('api-signature__code'),
        sig.name,
        renderTypeParams(sig.typeParameter),
        '(',
        renderParamsList(sig, moduleSlug),
        ')',
        sig.type ? Fragment(': ', renderType(sig.type, moduleSlug)) : Fragment()
      )
    ),
    // Comment
    sig.comment ? renderComment(sig.comment) : Fragment(),
    // Parameters table
    sig.parameters?.length
      ? html.div(
          attr.class('api-signature__params'),
          html.h4(attr.class('api-signature__params-title'), 'Parameters'),
          html.table(
            attr.class('api-table'),
            html.thead(
              html.tr(html.th('Name'), html.th('Type'), html.th('Description'))
            ),
            html.tbody(
              ...sig.parameters.map(p =>
                html.tr(
                  html.td(
                    html.code(
                      p.name === '__namedParameters' ? 'options' : p.name
                    ),
                    p.flags?.isOptional
                      ? html.span(attr.class('api-optional'), '?')
                      : Fragment()
                  ),
                  html.td(
                    attr.class('api-table__type-cell'),
                    html.code(renderType(p.type, moduleSlug))
                  ),
                  html.td(
                    p.comment?.summary
                      ? html.span(
                          ...p.comment.summary.map(s => html.span(s.text))
                        )
                      : Fragment()
                  )
                )
              )
            )
          )
        )
      : Fragment(),
    // Return type
    sig.type
      ? html.div(
          attr.class('api-signature__returns'),
          html.h4(attr.class('api-signature__returns-title'), 'Returns'),
          html.code(renderType(sig.type, moduleSlug))
        )
      : Fragment()
  )
}

function renderParamsList(sig: ApiSignature, moduleSlug: string): TNode {
  if (!sig.parameters?.length) return Fragment()
  return Fragment(
    ...sig.parameters.flatMap((p, i) => {
      const name = p.name === '__namedParameters' ? 'options' : p.name
      const optional = p.flags?.isOptional ? '?' : ''
      const parts: TNode[] = [
        html.span(attr.class('api-signature__param-name'), name + optional),
        ': ',
        renderType(p.type, moduleSlug),
      ]
      return i > 0 ? [', ', ...parts] : parts
    })
  )
}

function renderTypeParams(params: ApiTypeParameter[] | undefined): TNode {
  if (!params?.length) return Fragment()
  return Fragment(
    '<',
    ...params.flatMap((p, i) => {
      const parts: TNode[] = [
        html.span(attr.class('api-signature__type-param'), p.name),
      ]
      return i > 0 ? [', ', ...parts] : parts
    }),
    '>'
  )
}

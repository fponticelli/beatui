import { html, attr, Fragment, TNode } from '@tempots/dom'
import type { ApiReflection } from '../../api/typedoc-types'
import { renderType } from './api-type-renderer'

/** Renders an interface/type-alias property table */
export function renderPropertyTable(
  properties: ApiReflection[],
  moduleSlug: string
): TNode {
  if (!properties.length) return Fragment()

  return html.table(
    attr.class('api-table api-table--properties'),
    html.thead(
      html.tr(html.th('Property'), html.th('Type'), html.th('Description'))
    ),
    html.tbody(
      ...properties.map(p =>
        html.tr(
          html.td(
            html.code(p.name),
            p.flags?.isOptional
              ? html.span(attr.class('api-optional'), '?')
              : Fragment(),
            p.flags?.isReadonly
              ? html.span(
                  attr.class('api-badge api-badge--readonly'),
                  'readonly'
                )
              : Fragment()
          ),
          html.td(
            attr.class('api-table__type-cell'),
            html.code(renderType(p.type, moduleSlug))
          ),
          html.td(
            p.comment?.summary
              ? html.span(...p.comment.summary.map(s => html.span(s.text)))
              : p.defaultValue
                ? html.span('Default: ', html.code(p.defaultValue))
                : Fragment()
          )
        )
      )
    )
  )
}

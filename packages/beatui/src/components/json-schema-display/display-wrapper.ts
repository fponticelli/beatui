import { html, attr, Renderable, Fragment, Empty, TNode } from '@tempots/dom'
import type { SchemaContext } from '../json-schema/schema-context'
import type { Mismatch } from './mismatch'

/**
 * Renders mismatch indicators as colored badges.
 */
function MismatchIndicators(mismatches: Mismatch[]): Renderable {
  if (mismatches.length === 0) return Empty

  return html.div(
    attr.class('bc-json-schema-display__mismatches'),
    ...mismatches.map(m =>
      html.span(
        attr.class(
          `bc-json-schema-display__mismatch bc-json-schema-display__mismatch--${m.kind}`
        ),
        attr.title(
          m.expected
            ? `Expected: ${m.expected}${m.actual ? `, got: ${m.actual}` : ''}`
            : m.message
        ),
        m.message
      )
    )
  )
}

/**
 * Display wrapper component.
 * Renders label (from ctx.widgetLabel), required indicator, deprecated badge,
 * description, and mismatch indicators around content.
 * Analog of InputWrapper + WithSchemaIssues for display mode.
 */
export function DisplayWrapper({
  ctx,
  mismatches,
  children,
}: {
  ctx: SchemaContext
  mismatches?: Mismatch[]
  children: TNode
}): Renderable {
  const label = ctx.widgetLabel
  const isRequired = ctx.isPropertyRequired
  const isDeprecated = ctx.isDeprecated
  const description = ctx.description

  // If we're at the root, don't show a label wrapper
  if (ctx.isRoot && !mismatches?.length) {
    return Fragment(children)
  }

  const fieldMismatches = mismatches
    ? mismatches.filter(m => {
        // Show mismatches at this exact path level
        const mPath = m.path.map(String).join('.')
        const ctxPath = ctx.path.map(String).join('.')
        return mPath === ctxPath
      })
    : []

  return html.div(
    attr.class('bc-json-schema-display__field'),
    // Label row
    label || isRequired || isDeprecated
      ? html.div(
          attr.class('bc-json-schema-display__label-row'),
          label
            ? html.span(attr.class('bc-json-schema-display__label'), label)
            : null,
          isRequired
            ? html.span(attr.class('bc-json-schema-display__required'), '*')
            : null,
          isDeprecated
            ? html.span(
                attr.class('bc-json-schema-display__deprecated'),
                'deprecated'
              )
            : null
        )
      : null,
    // Value content
    children,
    // Description
    description
      ? html.div(attr.class('bc-json-schema-display__description'), description)
      : null,
    // Mismatch indicators
    MismatchIndicators(fieldMismatches)
  )
}

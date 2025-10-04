import { attr, Empty, html, Renderable } from '@tempots/dom'
import { Notice } from '../../misc'
import type { SchemaConflict, NotViolation } from '../schema-context'

/**
 * Banner component for displaying schema conflicts
 */
export function SchemaConflictsBanner({
  conflicts,
}: {
  conflicts: readonly SchemaConflict[]
}): Renderable {
  if (conflicts.length === 0) return Empty

  return Notice(
    {
      variant: 'warning',
      tone: 'prominent',
      title: 'Schema Conflicts Detected',
      class: 'bc-schema-conflicts-banner',
    },
    html.ul(
      attr.style('margin: 0; padding-left: 1.25rem; list-style-type: disc;'),
      ...conflicts.map(conflict =>
        html.li(
          attr.style('margin-bottom: 0.25rem;'),
          conflict.message,
          conflict.path.length > 0
            ? html.code(
                attr.style(
                  'margin-left: 0.5rem; font-size: 0.75rem; opacity: 0.7;'
                ),
                ` (${conflict.path.join('.')})`
              )
            : null
        )
      )
    )
  )
}

/**
 * Banner component for displaying schema violations
 */
export function NotViolationsBanner({
  violations,
}: {
  violations: readonly NotViolation[]
}): Renderable {
  if (violations.length === 0) return Empty

  return Notice(
    {
      variant: 'danger',
      tone: 'prominent',
      title: 'Schema Violations Detected',
      class: 'bc-not-violations-banner',
    },
    html.ul(
      attr.style('margin: 0; padding-left: 1.25rem; list-style-type: disc;'),
      ...violations.map(violation =>
        html.li(
          attr.style('margin-bottom: 0.25rem;'),
          violation.message,
          violation.path.length > 0
            ? html.code(
                attr.style(
                  'margin-left: 0.5rem; font-size: 0.75rem; opacity: 0.7;'
                ),
                ` (${violation.path.join('.')})`
              )
            : null
        )
      )
    )
  )
}

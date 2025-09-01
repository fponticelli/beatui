import { attr, Renderable } from '@tempots/dom'
import { Stack } from '../../layout'
import type { Controller } from '../../form'
import type { SchemaContext } from '../schema-context'
import { SchemaConflictsBanner, NotViolationsBanner } from './schema-banners'
import { PresenceToggle } from './presence-toggle'

/**
 * Wraps content with schema issues banners and presence toggle if needed
 */
export function WithSchemaIssues<T>(
  ctx: SchemaContext,
  content: Renderable,
  controller?: Controller<T>
): Renderable {
  const hasConflicts = ctx.schemaConflicts.length > 0
  const hasViolations = ctx.notViolations.length > 0
  const shouldShowPresence = ctx.shouldShowPresenceToggle && controller != null

  let wrappedContent = content

  // Wrap with presence toggle if needed
  if (shouldShowPresence && controller != null) {
    wrappedContent = PresenceToggle({ ctx, controller, content })
  }

  // Add schema issues banners if needed
  if (!hasConflicts && !hasViolations) {
    return wrappedContent
  }

  return Stack(
    attr.class('bu-gap-2'),
    hasViolations
      ? NotViolationsBanner({ violations: ctx.notViolations })
      : null,
    hasConflicts
      ? SchemaConflictsBanner({ conflicts: ctx.schemaConflicts })
      : null,
    wrappedContent
  )
}

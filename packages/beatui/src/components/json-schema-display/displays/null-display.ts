import { html, attr, Renderable, Value } from '@tempots/dom'
import type { SchemaContext } from '../../json-schema/schema-context'
import type { Mismatch } from '../mismatch'
import { DisplayWrapper } from '../display-wrapper'
import type { DisplayWidgetRegistry } from '../display-widget-customization'

/**
 * Renders a null indicator.
 */
export function NullDisplay({
  ctx,
  mismatches,
}: {
  ctx: SchemaContext
  value: Value<unknown>
  mismatches?: Mismatch[]
  displayWidgetRegistry?: DisplayWidgetRegistry
}): Renderable {
  return DisplayWrapper({
    ctx,
    mismatches,
    children: html.span(
      attr.class('bc-json-schema-display__value--null'),
      'null'
    ),
  })
}

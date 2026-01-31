import { html, attr, Renderable, Value } from '@tempots/dom'
import type { SchemaContext } from '../../json-schema/schema-context'
import type { Mismatch } from '../mismatch'
import { DisplayWrapper } from '../display-wrapper'
import type { DisplayWidgetRegistry } from '../display-widget-customization'

function booleanClass(v: unknown): string {
  if (v == null) return 'bc-json-schema-display__value--null'
  const b = Boolean(v)
  return `bc-json-schema-display__boolean bc-json-schema-display__boolean--${b ? 'true' : 'false'}`
}

function booleanText(v: unknown): string {
  if (v == null) return '\u2014'
  return Boolean(v) ? 'true' : 'false'
}

/**
 * Renders a boolean value as a styled true/false badge.
 */
export function BooleanDisplay({
  ctx,
  value,
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
      attr.class(Value.map(value, booleanClass)),
      Value.map(value, booleanText)
    ),
  })
}

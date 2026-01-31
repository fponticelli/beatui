import { html, attr, Renderable, Value } from '@tempots/dom'
import type { SchemaContext } from '../../json-schema/schema-context'
import type { Mismatch } from '../mismatch'
import { DisplayWrapper } from '../display-wrapper'
import type { DisplayWidgetRegistry } from '../display-widget-customization'

function formatNumber(v: unknown): string {
  if (v == null) return '\u2014'
  const num = Number(v)
  if (isNaN(num)) return String(v)
  return num.toLocaleString()
}

function numberClass(v: unknown): string {
  return v == null
    ? 'bc-json-schema-display__value--null'
    : 'bc-json-schema-display__value'
}

/**
 * Renders a number or integer value with locale formatting.
 */
export function NumberDisplay({
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
      attr.class(Value.map(value, numberClass)),
      Value.map(value, formatNumber)
    ),
  })
}

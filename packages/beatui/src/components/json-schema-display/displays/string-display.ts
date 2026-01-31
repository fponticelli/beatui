import { html, attr, Renderable, Value, MapSignal } from '@tempots/dom'
import type {
  SchemaContext,
  JSONSchema,
} from '../../json-schema/schema-context'
import type { Mismatch } from '../mismatch'
import { DisplayWrapper } from '../display-wrapper'
import { resolveWidget } from '../../json-schema/widgets/utils'
import type { DisplayWidgetRegistry } from '../display-widget-customization'

function renderStringValue(s: string, widget: string | undefined): Renderable {
  switch (widget) {
    case 'email':
      return s
        ? html.a(
            attr.class('bc-json-schema-display__link'),
            attr.href(`mailto:${s}`),
            s
          )
        : html.span(attr.class('bc-json-schema-display__value--null'), '\u2014')

    case 'uri':
    case 'uri-reference':
    case 'url':
      return s
        ? html.a(
            attr.class('bc-json-schema-display__link'),
            attr.href(s),
            attr.target('_blank'),
            attr.rel('noopener noreferrer'),
            s
          )
        : html.span(attr.class('bc-json-schema-display__value--null'), '\u2014')

    case 'color':
      return s
        ? html.span(
            attr.class('bc-json-schema-display__color-display'),
            html.span(
              attr.class('bc-json-schema-display__color-swatch'),
              attr.style(`background-color: ${s}`)
            ),
            html.span(attr.class('bc-json-schema-display__monospace'), s)
          )
        : html.span(attr.class('bc-json-schema-display__value--null'), '\u2014')

    case 'date-time':
    case 'date':
    case 'time':
      if (!s)
        return html.span(
          attr.class('bc-json-schema-display__value--null'),
          '\u2014'
        )
      try {
        if (widget === 'time') return html.span(s)
        const d = new Date(s)
        if (isNaN(d.getTime())) return html.span(s)
        return html.span(
          widget === 'date' ? d.toLocaleDateString() : d.toLocaleString()
        )
      } catch {
        return html.span(s)
      }

    case 'password':
      return s
        ? html.span(
            attr.class('bc-json-schema-display__value'),
            '\u2022'.repeat(Math.min(s.length, 12))
          )
        : html.span(attr.class('bc-json-schema-display__value--null'), '\u2014')

    case 'uuid':
      return s
        ? html.span(attr.class('bc-json-schema-display__monospace'), s)
        : html.span(attr.class('bc-json-schema-display__value--null'), '\u2014')

    case 'textarea':
    case 'markdown':
      return s
        ? html.pre(attr.class('bc-json-schema-display__pre'), s)
        : html.span(attr.class('bc-json-schema-display__value--null'), '\u2014')

    default:
      return s !== ''
        ? html.span(attr.class('bc-json-schema-display__value'), s)
        : html.span(attr.class('bc-json-schema-display__value--null'), '\u2014')
  }
}

/**
 * Renders a string value with format-aware display.
 * Supports: email, uri/url, color, date-time, date, time, password, uuid, textarea, markdown, and plain text.
 */
export function StringDisplay({
  ctx,
  value,
  mismatches,
}: {
  ctx: SchemaContext
  value: Value<unknown>
  mismatches?: Mismatch[]
  displayWidgetRegistry?: DisplayWidgetRegistry
}): Renderable {
  const def = ctx.definition as JSONSchema
  const resolved = resolveWidget(def, ctx.name)
  const widget = resolved?.widget

  const strValue = Value.map(value, v => (v != null ? String(v) : ''))

  const content = MapSignal(strValue, s => renderStringValue(s, widget))

  return DisplayWrapper({
    ctx,
    mismatches,
    children: content,
  })
}

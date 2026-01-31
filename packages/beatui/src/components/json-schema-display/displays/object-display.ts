import {
  html,
  attr,
  Renderable,
  Value,
  Empty,
  MapSignal,
} from '@tempots/dom'
import type {
  SchemaContext,
  JSONSchema,
} from '../../json-schema/schema-context'
import type { Mismatch } from '../mismatch'
import { GenericDisplay } from './generic-display'
import {
  getContainerLayout,
  applyContainerLayout,
} from '../../json-schema/containers/container-layouts'
import type { DisplayWidgetRegistry } from '../display-widget-customization'

/**
 * Renders an object value with labeled properties in schema order.
 */
export function ObjectDisplay({
  ctx,
  value,
  mismatches,
  displayWidgetRegistry,
}: {
  ctx: SchemaContext
  value: Value<unknown>
  mismatches?: Mismatch[]
  displayWidgetRegistry?: DisplayWidgetRegistry
}): Renderable {
  const def = ctx.definition as JSONSchema
  const sig = Value.toSignal(value)

  const content = MapSignal(sig, v => {
    if (v == null) {
      return html.span(
        attr.class('bc-json-schema-display__value--null'),
        '\u2014'
      )
    }

    if (typeof v !== 'object' || Array.isArray(v)) {
      return html.span(
        attr.class('bc-json-schema-display__value'),
        JSON.stringify(v)
      )
    }

    const obj = v as Record<string, unknown>
    const properties = def.properties ?? {}
    const propertyNames = Object.keys(properties)
    const objectKeys = Object.keys(obj)

    // Schema-defined properties in schema order
    const schemaPropertyChildren = propertyNames.map(key => {
      const propDef = properties[key]
      const propCtx = ctx
        .with({
          definition: propDef,
          isPropertyRequired: ctx.hasRequiredProperty(key),
        })
        .append(key)

      // Filter mismatches for this property
      const propMismatches = mismatches?.filter(m => {
        const mPath = m.path.map(String)
        const expectedPath = [...ctx.path.map(String), key]
        return (
          mPath.length >= expectedPath.length &&
          expectedPath.every((seg, i) => mPath[i] === seg)
        )
      })

      const propValue = key in obj ? obj[key] : undefined

      // Show missing required indicator
      if (!(key in obj) && ctx.hasRequiredProperty(key)) {
        return html.div(
          attr.class('bc-json-schema-display__field'),
          html.div(
            attr.class('bc-json-schema-display__label-row'),
            html.span(
              attr.class('bc-json-schema-display__label'),
              propCtx.widgetLabel ?? key
            ),
            html.span(attr.class('bc-json-schema-display__required'), '*')
          ),
          html.span(
            attr.class('bc-json-schema-display__value--missing'),
            '(missing)'
          )
        )
      }

      if (!(key in obj)) {
        return Empty // Skip absent optional properties
      }

      return GenericDisplay({
        ctx: propCtx,
        value: propValue,
        mismatches: propMismatches,
        displayWidgetRegistry,
      })
    })

    // Extra properties not in schema
    const schemaKeySet = new Set(propertyNames)
    const extraKeys = objectKeys.filter(k => !schemaKeySet.has(k))
    const extraPropertyChildren = extraKeys.map(key => {
      const extraCtx = ctx.with({ definition: true }).append(key)

      const propMismatches = mismatches?.filter(m => {
        const mPath = m.path.map(String)
        const expectedPath = [...ctx.path.map(String), key]
        return (
          mPath.length >= expectedPath.length &&
          expectedPath.every((seg, i) => mPath[i] === seg)
        )
      })

      return html.div(
        attr.class('bc-json-schema-display__extra-property'),
        GenericDisplay({
          ctx: extraCtx,
          value: obj[key],
          mismatches: propMismatches,
          displayWidgetRegistry,
        })
      )
    })

    const allChildren = [...schemaPropertyChildren, ...extraPropertyChildren]

    // Apply container layout if configured
    const layoutConfig = getContainerLayout(ctx)
    if (layoutConfig) {
      return applyContainerLayout(layoutConfig, ctx, allChildren, [
        ...propertyNames,
        ...extraKeys,
      ])
    }

    // Nest objects in a container with left border (non-root)
    if (!ctx.isRoot) {
      return html.div(
        attr.class('bc-json-schema-display__object'),
        ...allChildren
      )
    }

    return html.div(
      attr.class('bc-json-schema-display__fields'),
      ...allChildren
    )
  })

  // For root objects, no additional wrapper
  if (ctx.isRoot) {
    return content
  }

  return html.div(
    attr.class('bc-json-schema-display__field'),
    ctx.widgetLabel
      ? html.div(
          attr.class('bc-json-schema-display__label-row'),
          html.span(
            attr.class('bc-json-schema-display__label'),
            ctx.widgetLabel
          ),
          ctx.isPropertyRequired
            ? html.span(
                attr.class('bc-json-schema-display__required'),
                '*'
              )
            : null,
          ctx.isDeprecated
            ? html.span(
                attr.class('bc-json-schema-display__deprecated'),
                'deprecated'
              )
            : null
        )
      : null,
    content,
    ctx.description
      ? html.div(
          attr.class('bc-json-schema-display__description'),
          ctx.description
        )
      : null
  )
}

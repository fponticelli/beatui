import { attr, html, Renderable, Value, When } from '@tempots/dom'
import { Stack } from '../../layout'
import { Switch } from '../../form'
import type { Controller } from '../../form'
import type { SchemaContext, JSONSchema } from '../schema-context'

/**
 * Presence toggle for optional properties.
 * Shows a toggle that controls whether the property key exists in the parent object.
 */
export function PresenceToggle<T>({
  ctx,
  controller,
  content,
}: {
  ctx: SchemaContext
  controller: Controller<T>
  content: Renderable
}): Renderable {
  const isPresent = Value.map(controller.value, v => v !== undefined)
  const label = ctx.widgetLabel ?? 'Property'

  const handleToggle = (checked: boolean) => {
    if (checked) {
      // Set to default value or appropriate empty value
      const defaultValue = ctx.default
      if (defaultValue !== undefined) {
        controller.change(defaultValue as T)
      } else {
        // Set appropriate empty value based on schema type
        const def = ctx.definition as JSONSchema
        if (def.type === 'string') {
          controller.change('' as T)
        } else if (def.type === 'number' || def.type === 'integer') {
          controller.change(0 as T)
        } else if (def.type === 'boolean') {
          controller.change(false as T)
        } else if (def.type === 'array') {
          controller.change([] as T)
        } else if (def.type === 'object') {
          controller.change({} as T)
        } else {
          controller.change(null as T)
        }
      }
    } else {
      // Remove the property by setting to undefined
      controller.change(undefined as T)
    }
  }

  return Stack(
    html.div(
      attr.class('bc-presence-toggle'),
      Switch({
        value: isPresent,
        onChange: handleToggle,
        label: `Include ${label}`,
        size: 'xs',
      })
    ),
    When(isPresent, () => content)
  )
}

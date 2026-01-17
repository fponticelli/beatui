import { Renderable, WithElement, Value, Fragment } from '@tempots/dom'
import { Group } from '../../layout'
import { NativeSelectControl, type Controller } from '../../form'
import { Label, MutedLabel } from '../../typography'
import type { SchemaContext, JSONSchema } from '../schema-context'
import {
  definitionToInputWrapperOptions,
  tryResolveCustomWidget,
} from './shared-utils'
import { resolveWidget } from '../widgets/utils'

/**
 * Control for enum schemas
 */
export function JSONSchemaEnum({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<unknown>
}): Renderable {
  // Try to resolve a custom widget first
  const resolved = resolveWidget(ctx.definition as JSONSchema, ctx.name)
  const customWidget = tryResolveCustomWidget({
    ctx,
    controller,
    resolved,
  })
  if (customWidget) {
    return customWidget
  }

  const def = ctx.definition as JSONSchema
  return NativeSelectControl({
    ...definitionToInputWrapperOptions({ ctx }),
    options: (def.enum ?? []).map((e: unknown) => ({
      type: 'value',
      value: e,
      label: String(e),
    })),
    controller,
  })
}

/**
 * Control for const schemas
 */
export function JSONSchemaConst({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<unknown>
}): Renderable {
  // Try to resolve a custom widget first
  const resolved = resolveWidget(ctx.definition as JSONSchema, ctx.name)
  const customWidget = tryResolveCustomWidget({
    ctx,
    controller,
    resolved,
  })
  if (customWidget) {
    return customWidget
  }

  const def = ctx.definition as JSONSchema
  return Fragment(
    WithElement(() => {
      // Set const value on mount
      if (Value.get(controller.signal) !== def.const) {
        controller.change(def.const)
      }
    }),
    Group(MutedLabel(ctx.widgetLabel, ': '), Label(String(def.const)))
  )
}

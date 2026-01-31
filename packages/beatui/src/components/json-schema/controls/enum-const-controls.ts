import { Renderable, WithElement, Value, Fragment, Use } from '@tempots/dom'
import { Group } from '../../layout'
import {
  NativeSelectControl,
  type Controller,
  transformNullToUndefined,
} from '../../form'
import { Label, MutedLabel } from '../../typography'
import type { SchemaContext, JSONSchema } from '../schema-context'
import {
  definitionToInputWrapperOptions,
  tryResolveCustomWidget,
} from './shared-utils'
import { resolveWidget } from '../widgets/utils'
import { SelectOption } from '../../form/input/option'
import { BeatUII18n } from '../../../beatui-i18n'

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
  const enumValues = def.enum ?? []

  // Check if field can be cleared (nullable or optional, but not if null is already an enum value)
  const canClear =
    (ctx.isNullable || ctx.isOptional) && !enumValues.includes(null)

  // Use undefined (not null) as the cleared value for optional-only properties
  const useUndefinedForClear = !ctx.isNullable

  // Build options list, prepending "none" option if clearable
  return Use(BeatUII18n, t => {
    const options: SelectOption<unknown>[] = enumValues.map((e: unknown) => ({
      type: 'value' as const,
      value: e,
      label: String(e),
    }))

    if (canClear) {
      // Prepend the "none" option
      options.unshift({
        type: 'value' as const,
        value: null, // We use null as the sentinel value internally
        label: Value.get(t.$.selectNone),
      })
    }

    // Transform controller if needed for optional-only fields
    // For optional-only fields, we need to convert null (our sentinel) to undefined
    const effectiveController =
      canClear && useUndefinedForClear
        ? (transformNullToUndefined(
            controller as Controller<NonNullable<unknown> | undefined>
          ) as unknown as Controller<unknown>)
        : controller

    return NativeSelectControl({
      ...definitionToInputWrapperOptions({ ctx }),
      options,
      controller: effectiveController as Controller<unknown>,
      // Custom equality to handle null/undefined comparison
      equality: (a, b) => {
        if (a == null && b == null) return true
        return a === b
      },
    })
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

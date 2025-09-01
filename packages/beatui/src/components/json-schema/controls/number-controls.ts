import { Fragment, Renderable } from '@tempots/dom'
import {
  Control,
  NumberInput,
  NullableNumberInput,
  type Controller,
  type NumberInputOptions,
} from '../../form'
import type { SchemaContext, JSONSchema } from '../schema-context'
import {
  definitionToInputWrapperOptions,
  makePlaceholder,
  integerMultipleOf,
} from './shared-utils'

/**
 * Control for number schemas
 */
export function JSONSchemaNumber({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<number>
}): Renderable {
  // Handle writeOnly fields - hide them unless explicitly shown
  if (ctx.isWriteOnly && !ctx.shouldShowWriteOnly) {
    return Fragment()
  }

  const def = ctx.definition as JSONSchema
  const baseOptions = {
    ...definitionToInputWrapperOptions({ ctx }),
    placeholder: makePlaceholder(ctx.definition as JSONSchema, String),
    min: def.minimum,
    max: def.maximum,
    step: def.multipleOf,
    // Disable input if readOnly (unless overridden) or deprecated
    disabled: (ctx.isReadOnly && !ctx.shouldIgnoreReadOnly) || ctx.isDeprecated,
  }

  // For optional nullable primitives, use nullable controls instead of presence toggles
  if (ctx.isNullable && (ctx.isOptional || !ctx.shouldShowPresenceToggle)) {
    return Control(NullableNumberInput, {
      ...baseOptions,
      controller: controller as unknown as Controller<number | null>,
    })
  }

  // For non-nullable numbers, use regular number input
  return Control<number, NumberInputOptions>(NumberInput, {
    ...baseOptions,
    controller,
  })
}

/**
 * Control for integer schemas
 */
export function JSONSchemaInteger({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<number>
}): Renderable {
  return JSONSchemaNumber({
    ctx: ctx.with({
      definition: {
        ...(ctx.definition as JSONSchema),
        multipleOf: integerMultipleOf(
          (ctx.definition as JSONSchema).multipleOf
        ),
      },
    }),
    controller,
  })
}

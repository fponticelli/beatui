/**
 * Decimal Control for JSON Structure
 *
 * Handles float, double, and decimal types with NumberInput
 */

import { Renderable } from '@tempots/dom'
import {
  Control,
  NumberInput,
  NullableNumberInput,
  type Controller,
  type NumberInputOptions,
} from '../../form'
import type { StructureContext } from '../structure-context'
import type { FloatType } from '../structure-types'
import { withDeprecationBadge } from './deprecation-utils'

/**
 * Create input wrapper options from context
 */
function createInputOptions(ctx: StructureContext, floatType: FloatType) {
  const def = ctx.definition as {
    minimum?: number | string
    maximum?: number | string
    exclusiveMinimum?: number | string
    exclusiveMaximum?: number | string
    multipleOf?: number
    precision?: number
    scale?: number
  }

  // Determine step based on scale or multipleOf
  let step: number | undefined
  if (def.multipleOf !== undefined) {
    step = def.multipleOf
  } else if (floatType === 'decimal' && def.scale !== undefined) {
    // For decimal with scale, use 10^(-scale) as step
    step = Math.pow(10, -def.scale)
  }

  // Get min/max constraints
  const minimum =
    def.minimum !== undefined
      ? typeof def.minimum === 'string'
        ? parseFloat(def.minimum)
        : def.minimum
      : undefined
  const maximum =
    def.maximum !== undefined
      ? typeof def.maximum === 'string'
        ? parseFloat(def.maximum)
        : def.maximum
      : undefined
  const exclusiveMinimum =
    def.exclusiveMinimum !== undefined
      ? typeof def.exclusiveMinimum === 'string'
        ? parseFloat(def.exclusiveMinimum)
        : def.exclusiveMinimum
      : undefined
  const exclusiveMaximum =
    def.exclusiveMaximum !== undefined
      ? typeof def.exclusiveMaximum === 'string'
        ? parseFloat(def.exclusiveMaximum)
        : def.exclusiveMaximum
      : undefined

  // For exclusive bounds, we can't perfectly represent them in HTML5 number input
  // But we can document this in the description
  let description = ctx.description
  if (exclusiveMinimum !== undefined || exclusiveMaximum !== undefined) {
    const rangeText = []
    if (exclusiveMinimum !== undefined) {
      rangeText.push(`> ${exclusiveMinimum}`)
    }
    if (exclusiveMaximum !== undefined) {
      rangeText.push(`< ${exclusiveMaximum}`)
    }
    const rangeDesc = `Valid range: ${rangeText.join(' and ')}`
    description = description ? `${description} (${rangeDesc})` : rangeDesc
  }

  // Use first example as placeholder if available
  const placeholder =
    ctx.examples?.[0] != null ? String(ctx.examples[0]) : undefined

  return {
    label: ctx.suppressLabel
      ? undefined
      : withDeprecationBadge(ctx.label, ctx.isDeprecated),
    description,
    required: ctx.isRequired,
    disabled: ctx.readOnly || ctx.isDeprecated,
    min: minimum ?? exclusiveMinimum,
    max: maximum ?? exclusiveMaximum,
    step,
    placeholder,
  }
}

/**
 * Control for float/double/decimal types
 */
export function StructureDecimalControl({
  ctx,
  controller,
  floatType,
}: {
  ctx: StructureContext
  controller: Controller<number | null>
  floatType: FloatType
}): Renderable {
  const options = createInputOptions(ctx, floatType)

  // Use nullable or non-nullable NumberInput based on type
  if (ctx.isNullable) {
    return Control(NullableNumberInput, {
      ...options,
      controller: controller as Controller<number | null>,
    })
  }

  return Control<number, NumberInputOptions>(NumberInput, {
    ...options,
    controller: controller as Controller<number>,
  })
}

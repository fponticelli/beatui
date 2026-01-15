/**
 * Integer Control for JSON Structure
 *
 * Handles all integer types (int8/16/32/64/128, uint8/16/32/64/128)
 * with appropriate Number or BigInt inputs
 */

import { Renderable } from '@tempots/dom'
import {
  Control,
  NumberInput,
  NullableNumberInput,
  BigintInput,
  NullableBigintInput,
  type Controller,
  type NumberInputOptions,
} from '../../form'
import type { StructureContext } from '../structure-context'
import {
  INTEGER_BOUNDS,
  isBigIntType,
  type IntegerType,
} from '../structure-types'
import { withDeprecationBadge } from './deprecation-utils'

/**
 * Create input wrapper options from context for NumberInput (not BigInt)
 */
function createNumberInputOptions(ctx: StructureContext, intType: IntegerType) {
  const bounds = INTEGER_BOUNDS[intType]
  const min = getMinimum(ctx, bounds.min)
  const max = getMaximum(ctx, bounds.max)

  // Use first example as placeholder if available
  const placeholder =
    ctx.examples?.[0] != null ? String(ctx.examples[0]) : undefined

  return {
    label: ctx.suppressLabel
      ? undefined
      : withDeprecationBadge(ctx.label, ctx.isDeprecated),
    description: ctx.description,
    required: ctx.isRequired,
    disabled: ctx.readOnly || ctx.isDeprecated,
    // Convert to numbers for NumberInput
    min: typeof min === 'bigint' ? Number(min) : min,
    max: typeof max === 'bigint' ? Number(max) : max,
    step: 1,
    placeholder,
  }
}

/**
 * Create input wrapper options from context for BigintInput
 */
function createBigintInputOptions(ctx: StructureContext, intType: IntegerType) {
  const bounds = INTEGER_BOUNDS[intType]
  const min = getMinimum(ctx, bounds.min)
  const max = getMaximum(ctx, bounds.max)

  // Use first example as placeholder if available
  const placeholder =
    ctx.examples?.[0] != null ? String(ctx.examples[0]) : undefined

  return {
    label: ctx.suppressLabel
      ? undefined
      : withDeprecationBadge(ctx.label, ctx.isDeprecated),
    description: ctx.description,
    required: ctx.isRequired,
    disabled: ctx.readOnly || ctx.isDeprecated,
    // Ensure bigint for BigintInput
    min: typeof min === 'number' ? BigInt(min) : min,
    max: typeof max === 'number' ? BigInt(max) : max,
    placeholder,
  }
}

/**
 * Get minimum value respecting both type bounds and schema constraints
 */
function getMinimum(ctx: StructureContext, typeBound: bigint): number | bigint {
  const def = ctx.definition as {
    minimum?: number | string
    exclusiveMinimum?: number | string
  }

  if (def.minimum !== undefined) {
    const schemaMin =
      typeof def.minimum === 'string' ? BigInt(def.minimum) : def.minimum
    // Return the larger of type bound and schema minimum
    if (typeof schemaMin === 'bigint') {
      return schemaMin > typeBound ? schemaMin : typeBound
    }
    return BigInt(schemaMin) > typeBound ? schemaMin : Number(typeBound)
  }

  if (def.exclusiveMinimum !== undefined) {
    const schemaMin =
      typeof def.exclusiveMinimum === 'string'
        ? BigInt(def.exclusiveMinimum)
        : def.exclusiveMinimum
    const adjustedMin =
      typeof schemaMin === 'bigint' ? schemaMin + 1n : schemaMin + 1
    if (typeof adjustedMin === 'bigint') {
      return adjustedMin > typeBound ? adjustedMin : typeBound
    }
    return BigInt(adjustedMin) > typeBound ? adjustedMin : Number(typeBound)
  }

  // Convert bigint to number if it fits
  if (
    typeBound >= BigInt(Number.MIN_SAFE_INTEGER) &&
    typeBound <= BigInt(Number.MAX_SAFE_INTEGER)
  ) {
    return Number(typeBound)
  }
  return typeBound
}

/**
 * Get maximum value respecting both type bounds and schema constraints
 */
function getMaximum(ctx: StructureContext, typeBound: bigint): number | bigint {
  const def = ctx.definition as {
    maximum?: number | string
    exclusiveMaximum?: number | string
  }

  if (def.maximum !== undefined) {
    const schemaMax =
      typeof def.maximum === 'string' ? BigInt(def.maximum) : def.maximum
    // Return the smaller of type bound and schema maximum
    if (typeof schemaMax === 'bigint') {
      return schemaMax < typeBound ? schemaMax : typeBound
    }
    return BigInt(schemaMax) < typeBound ? schemaMax : Number(typeBound)
  }

  if (def.exclusiveMaximum !== undefined) {
    const schemaMax =
      typeof def.exclusiveMaximum === 'string'
        ? BigInt(def.exclusiveMaximum)
        : def.exclusiveMaximum
    const adjustedMax =
      typeof schemaMax === 'bigint' ? schemaMax - 1n : schemaMax - 1
    if (typeof adjustedMax === 'bigint') {
      return adjustedMax < typeBound ? adjustedMax : typeBound
    }
    return BigInt(adjustedMax) < typeBound ? adjustedMax : Number(typeBound)
  }

  // Convert bigint to number if it fits
  if (
    typeBound >= BigInt(Number.MIN_SAFE_INTEGER) &&
    typeBound <= BigInt(Number.MAX_SAFE_INTEGER)
  ) {
    return Number(typeBound)
  }
  return typeBound
}

/**
 * Control for integer types
 */
export function StructureIntegerControl({
  ctx,
  controller,
  intType,
}: {
  ctx: StructureContext
  controller: Controller<number | bigint | null>
  intType: IntegerType
}): Renderable {
  // For BigInt types (int64, int128, uint64, uint128), use BigintInput
  if (isBigIntType(intType)) {
    const bigintOptions = createBigintInputOptions(ctx, intType)
    if (ctx.isNullable) {
      return Control(NullableBigintInput, {
        ...bigintOptions,
        controller: controller as Controller<bigint | null>,
      })
    }
    return Control(BigintInput, {
      ...bigintOptions,
      controller: controller as Controller<bigint>,
    })
  }

  // For smaller integer types (int8, int16, int32, uint8, uint16, uint32), use NumberInput
  const numberOptions = createNumberInputOptions(ctx, intType)
  if (ctx.isNullable) {
    return Control(NullableNumberInput, {
      ...numberOptions,
      controller: controller as Controller<number | null>,
    })
  }

  return Control<number, NumberInputOptions>(NumberInput, {
    ...numberOptions,
    controller: controller as Controller<number>,
  })
}

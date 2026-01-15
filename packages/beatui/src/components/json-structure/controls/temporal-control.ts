/**
 * Temporal Control for JSON Structure
 *
 * Handles date, datetime, time, and duration types with appropriate temporal inputs
 */

import { Fragment, Renderable } from '@tempots/dom'
import {
  Control,
  PlainDateInput,
  NullablePlainDateInput,
  PlainDateTimeInput,
  NullablePlainDateTimeInput,
  PlainTimeInput,
  NullablePlainTimeInput,
  DurationInput,
  NullableDurationInput,
  type Controller,
} from '../../form'
import type { StructureContext } from '../structure-context'
import type { TemporalType } from '../structure-types'
import { Temporal } from '@js-temporal/polyfill'
import { withDeprecationBadge } from './deprecation-utils'

/**
 * Create input wrapper options from context
 */
function createInputOptions(ctx: StructureContext) {
  return {
    label: ctx.suppressLabel
      ? undefined
      : withDeprecationBadge(ctx.label, ctx.isDeprecated),
    description: ctx.description,
    required: ctx.isRequired,
    disabled: ctx.readOnly || ctx.isDeprecated,
  }
}

/**
 * Control for temporal types (date, datetime, time, duration)
 */
export function StructureTemporalControl({
  ctx,
  controller,
  temporalType,
}: {
  ctx: StructureContext
  controller: Controller<
    | Temporal.PlainDate
    | Temporal.PlainDateTime
    | Temporal.PlainTime
    | Temporal.Duration
    | null
  >
  temporalType: TemporalType
}): Renderable {
  const options = createInputOptions(ctx)

  // Route to appropriate temporal input based on type
  switch (temporalType) {
    case 'date':
      if (ctx.isNullable) {
        return Control(NullablePlainDateInput, {
          ...options,
          controller: controller as Controller<Temporal.PlainDate | null>,
        })
      }
      return Control(PlainDateInput, {
        ...options,
        controller: controller as Controller<Temporal.PlainDate>,
      })

    case 'datetime':
      if (ctx.isNullable) {
        return Control(NullablePlainDateTimeInput, {
          ...options,
          controller: controller as Controller<Temporal.PlainDateTime | null>,
        })
      }
      return Control(PlainDateTimeInput, {
        ...options,
        controller: controller as Controller<Temporal.PlainDateTime>,
      })

    case 'time':
      if (ctx.isNullable) {
        return Control(NullablePlainTimeInput, {
          ...options,
          controller: controller as Controller<Temporal.PlainTime | null>,
        })
      }
      return Control(PlainTimeInput, {
        ...options,
        controller: controller as Controller<Temporal.PlainTime>,
      })

    case 'duration':
      if (ctx.isNullable) {
        return Control(NullableDurationInput, {
          ...options,
          controller: controller as Controller<Temporal.Duration | null>,
        })
      }
      return Control(DurationInput, {
        ...options,
        controller: controller as Controller<Temporal.Duration>,
      })

    default:
      console.warn(`Unknown temporal type: ${temporalType}`)
      return Fragment()
  }
}

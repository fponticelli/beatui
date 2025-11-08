import { Fragment, Renderable } from '@tempots/dom'
import {
  Control,
  NumberInput,
  NullableNumberInput,
  RatingInput,
  NullableRatingInput,
  MaskInput,
  SliderInput,
  NullableSliderInput,
  type Controller,
  type NumberInputOptions,
} from '../../form'
import type { SchemaContext, JSONSchema } from '../schema-context'
import { resolveWidget } from '../widgets/utils'
import {
  definitionToInputWrapperOptions,
  makePlaceholder,
  integerMultipleOf,
  shouldHideWriteOnly,
  shouldDisableControl,
} from './shared-utils'

/**
 * Detect numeric widget type based on schema and x:ui hints
 */
function detectNumericWidget(ctx: SchemaContext): {
  widget: 'number' | 'slider' | 'rating' | 'currency' | 'percent'
  options?: Record<string, unknown>
} {
  const resolved = resolveWidget(ctx.definition as JSONSchema, ctx.name)

  // Use resolved widget if available
  if (resolved?.widget === 'slider') {
    return { widget: 'slider', options: resolved.options }
  }
  if (resolved?.widget === 'rating') {
    return { widget: 'rating', options: resolved.options }
  }

  // Handle legacy x:ui displayFormat for currency/percent
  const def = ctx.definition as JSONSchema
  const xui =
    typeof def === 'object'
      ? (def['x:ui'] as Record<string, unknown> | undefined)
      : undefined

  if (xui?.displayFormat === 'currency') {
    return {
      widget: 'currency',
      options: {
        currency: typeof xui?.currency === 'string' ? xui.currency : 'USD',
      },
    }
  }
  if (xui?.displayFormat === 'percent') {
    return { widget: 'percent' }
  }

  return { widget: 'number' }
}

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
  if (shouldHideWriteOnly(ctx)) {
    return Fragment()
  }

  const def = ctx.definition as JSONSchema
  const widgetInfo = detectNumericWidget(ctx)

  const baseOptions = {
    ...definitionToInputWrapperOptions({ ctx }),
    placeholder: makePlaceholder(ctx.definition as JSONSchema, String),
    min: def.minimum,
    max: def.maximum,
    step: def.multipleOf,
    disabled: shouldDisableControl(ctx),
  }

  // Handle nullable cases first
  const isNullable =
    ctx.isNullable && (ctx.isOptional || !ctx.shouldShowPresenceToggle)

  // Select appropriate widget based on detection
  switch (widgetInfo.widget) {
    case 'rating':
      const maxRating =
        (typeof widgetInfo.options?.max === 'number'
          ? widgetInfo.options.max
          : def.maximum) || 5
      if (isNullable) {
        return Control(NullableRatingInput, {
          ...baseOptions,
          max: maxRating,
          controller: controller as unknown as Controller<number | null>,
        })
      }
      return Control(RatingInput, {
        ...baseOptions,
        max: maxRating,
        controller,
      })

    case 'slider':
      if (isNullable) {
        return Control(NullableSliderInput, {
          ...baseOptions,
          controller: controller as unknown as Controller<number | null>,
        })
      }
      return Control(SliderInput, {
        ...baseOptions,
        controller,
      })

    case 'currency':
      const currency =
        typeof widgetInfo.options?.currency === 'string'
          ? widgetInfo.options.currency
          : 'USD'
      if (isNullable) {
        return Control(MaskInput, {
          ...baseOptions,
          mask: createCurrencyMask(currency),
          controller: controller as unknown as Controller<string | null>,
        })
      }
      return Control(MaskInput, {
        ...baseOptions,
        mask: createCurrencyMask(currency),
        controller: controller as unknown as Controller<string>,
      })

    case 'percent':
      if (isNullable) {
        return Control(MaskInput, {
          ...baseOptions,
          mask: createPercentMask(),
          controller: controller as unknown as Controller<string | null>,
        })
      }
      return Control(MaskInput, {
        ...baseOptions,
        mask: createPercentMask(),
        controller: controller as unknown as Controller<string>,
      })

    default:
      // Standard number input
      if (isNullable) {
        return Control(NullableNumberInput, {
          ...baseOptions,
          controller: controller as unknown as Controller<number | null>,
        })
      }
      return Control<number, NumberInputOptions>(NumberInput, {
        ...baseOptions,
        controller,
      })
  }
}

/**
 * Create currency mask configuration
 */
function createCurrencyMask(currency: string): string {
  return `${getCurrencySymbol(currency)} 000,000.00`
}

/**
 * Create percent mask configuration
 */
function createPercentMask(): string {
  return '000.00%'
}

/**
 * Get currency symbol for common currencies
 */
function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  }
  return symbols[currency.toUpperCase()] || currency
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

import type { JSONSchema } from '../schema-context'
import type { InputWrapperOptions } from '../../form'

/**
 * Convert schema definition to input wrapper options
 */
export function definitionToInputWrapperOptions({
  ctx,
}: {
  ctx: import('../schema-context').SchemaContext
}): Partial<InputWrapperOptions> {
  const { examples, default: defaultValue } = ctx
  let { description } = ctx
  if (description == null && examples != null && defaultValue != null) {
    if (Array.isArray(examples)) {
      description = `example: ${examples[0]}`
    } else {
      description = `example: ${examples}`
    }
  }

  // Add deprecated/readOnly/writeOnly indicators to description
  const indicators: string[] = []
  if (ctx.isDeprecated) {
    indicators.push('deprecated')
  }
  if (ctx.isReadOnly && !ctx.shouldIgnoreReadOnly) {
    indicators.push('read-only')
  }
  if (ctx.isWriteOnly && !ctx.shouldShowWriteOnly) {
    indicators.push('write-only')
  }

  if (indicators.length > 0) {
    const indicatorText = `(${indicators.join(', ')})`
    description = description
      ? `${description} ${indicatorText}`
      : indicatorText
  }

  return {
    label: ctx.suppressLabel ? undefined : ctx.widgetLabel,
    description,
    required: ctx.isPropertyRequired,
    layout: ctx.horizontal ? 'horizontal' : 'vertical',
  }
}

/**
 * Create placeholder value from schema definition
 */
export function makePlaceholder<T>(
  definition: JSONSchema,
  converter: (value: unknown) => T
) {
  if (definition.default != null) {
    return converter(definition.default)
  }
  if (Array.isArray(definition.examples)) {
    return converter(definition.examples[0])
  }
  if (definition.examples != null) {
    return converter(definition.examples)
  }
  return undefined
}

/**
 * Convert multipleOf to integer step for integer inputs
 */
export function integerMultipleOf(multipleOf?: number) {
  if (multipleOf == null) return 1
  return Math.round(multipleOf)
}

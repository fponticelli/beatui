import { AnyStringWidgetOptions } from './string-type'
import { resolveWidget } from './utils'
import { SchemaContext } from '../schema-context'

export function stringFormatDetection(
  ctx: SchemaContext
): AnyStringWidgetOptions | undefined {
  const { definition } = ctx
  if (typeof definition === 'boolean') return undefined
  const options = {
    pattern: definition.pattern,
    minLength: definition.minLength,
    maxLength: definition.maxLength,
  }

  // Use new widget resolver with precedence
  const resolved = resolveWidget(definition, ctx.name)
  const widget = resolved?.widget

  if (widget != null) {
    switch (widget) {
      case 'binary':
        return { ...options, format: 'binary', ...resolved?.options }
      case 'date':
        return { ...options, format: 'date' }
      case 'date-time':
        return { ...options, format: 'date-time' }
      case 'email':
        return { ...options, format: 'email' }
      case 'markdown':
        return { ...options, format: 'markdown' }
      case 'password':
        return { ...options, format: 'password' }
      case 'textarea':
        return { ...options, format: 'textarea' }
      case 'time':
        return { ...options, format: 'time' }
      case 'uuid':
        return { format: 'uuid' }
      case 'url':
        return { ...options, format: 'url' }
      case 'uri':
        return { ...options, format: 'uri' }
      case 'uri-reference':
        return { ...options, format: 'uri-reference' }
      case 'hostname':
        return { ...options, format: 'hostname' }
      case 'ipv4':
        return { ...options, format: 'ipv4' }
      case 'ipv6':
        return { ...options, format: 'ipv6' }
      case 'regex':
        return { ...options, format: 'regex' }
      case 'duration':
        return { ...options, format: 'duration' }
      case 'color':
        return { ...options, format: 'color' }
    }
  }

  // If no widget was resolved, return undefined to let the control handle defaults
  return undefined
}

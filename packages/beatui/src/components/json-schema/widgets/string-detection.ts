import { AnyStringWidgetOptions } from './string-type'
import { getUIWidget } from './utils'
import { SchemaContext } from '../context'

const textAreaFields = ['description', 'comment', 'notes', 'text']

export function stringFormatDetection(
  ctx: SchemaContext
): AnyStringWidgetOptions | undefined {
  const { definition } = ctx
  const options = {
    pattern: definition.pattern,
    minLength: definition.minLength,
    maxLength: definition.maxLength,
  }
  // test uiwidget
  const widget = getUIWidget(definition)
  if (widget != null) {
    switch (widget) {
      case 'binary':
        return { ...options, format: 'binary' }
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
    }
  }
  // test format
  if (definition.format === 'email') {
    return { ...options, format: 'email' }
  }
  if (definition.format === 'date') {
    return { ...options, format: 'date' }
  }
  if (definition.format === 'date-time' || definition.format === 'datetime') {
    return { ...options, format: 'date-time' }
  }
  if (definition.format === 'time') {
    return { ...options, format: 'time' }
  }
  if (definition.format === 'password') {
    return { ...options, format: 'password' }
  }
  if (
    definition.format === 'binary' ||
    definition.format === 'base64' ||
    definition.format === 'bytes'
  ) {
    return { ...options, format: 'binary' }
  }
  if (definition.format === 'uuid') {
    return { ...options, format: 'uuid' }
  }
  // contentEncoding
  if (definition.contentEncoding === 'base64') {
    return { ...options, format: 'binary' }
  }
  if (definition.contentMediaType === 'text/markdown') {
    return { ...options, format: 'markdown' }
  }
  // any contentMediaType
  if (definition.contentMediaType != null) {
    return {
      ...options,
      format: 'binary',
      mediaType: definition.contentMediaType,
    }
  }
  // heuristic
  if (
    (definition.minLength != null && definition.minLength > 20) ||
    (definition.maxLength != null && definition.maxLength > 100) ||
    (ctx.name != null &&
      textAreaFields.some(f => ctx.name!.toLocaleLowerCase().includes(f)))
  ) {
    return { ...options, format: 'textarea' }
  }

  return undefined
}

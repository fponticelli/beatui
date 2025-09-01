import { AnyStringWidgetOptions } from './string-type'
import { getUIFormat } from './utils'
import { JSONSchema, SchemaContext } from '../schema-context'

const textAreaFields = ['description', 'comment', 'notes', 'text']

function getTextAreaTriggers(definition: JSONSchema): string[] {
  if (typeof definition === 'boolean') return textAreaFields
  const xui = definition['x:ui'] as Record<string, unknown> | undefined
  if (xui && Array.isArray(xui.textAreaTriggers)) {
    return [...textAreaFields, ...(xui.textAreaTriggers as string[])]
  }
  return textAreaFields
}

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
  // test uiwidget
  const widget = getUIFormat(definition)
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
  if (definition.format === 'uri' || definition.format === 'iri') {
    return { ...options, format: 'uri' }
  }
  if (definition.format === 'url') {
    return { ...options, format: 'url' }
  }
  if (
    definition.format === 'uri-reference' ||
    definition.format === 'iri-reference'
  ) {
    return { ...options, format: 'uri-reference' }
  }
  if (
    definition.format === 'hostname' ||
    definition.format === 'idn-hostname'
  ) {
    return { ...options, format: 'hostname' }
  }
  if (definition.format === 'ipv4') {
    return { ...options, format: 'ipv4' }
  }
  if (definition.format === 'ipv6') {
    return { ...options, format: 'ipv6' }
  }
  if (definition.format === 'regex') {
    return { ...options, format: 'regex' }
  }
  if (definition.format === 'duration') {
    return { ...options, format: 'duration' }
  }
  if (definition.format === 'color') {
    return { ...options, format: 'color' }
  }
  // content/media handling
  if (definition.contentMediaType === 'text/markdown') {
    return { ...options, format: 'markdown' }
  }
  // Prefer to attach mediaType when available, even if content is base64-encoded
  if (definition.contentMediaType != null) {
    return {
      ...options,
      format: 'binary',
      mediaType: definition.contentMediaType,
    }
  }
  if (definition.contentEncoding === 'base64') {
    return {
      ...options,
      format: 'binary',
      mediaType: definition.contentMediaType,
    }
  }
  // heuristic (case-insensitive match against triggers)
  const triggers = getTextAreaTriggers(definition)
  if (
    (definition.minLength != null && definition.minLength > 20) ||
    (definition.maxLength != null && definition.maxLength > 100) ||
    (ctx.name != null &&
      triggers.some(f =>
        ctx.name!.toLocaleLowerCase().includes(String(f).toLocaleLowerCase())
      ))
  ) {
    return { ...options, format: 'textarea' }
  }

  return undefined
}

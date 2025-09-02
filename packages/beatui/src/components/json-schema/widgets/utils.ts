import { JSONSchema } from '../schema-context'

const textAreaFields = ['description', 'comment', 'notes', 'text']

function getTextAreaTriggers(definition: JSONSchema): string[] {
  if (typeof definition === 'boolean') return textAreaFields
  const xui = definition['x:ui'] as Record<string, unknown> | undefined
  if (xui && Array.isArray(xui.textAreaTriggers)) {
    return [...textAreaFields, ...(xui.textAreaTriggers as string[])]
  }
  return textAreaFields
}

/**
 * Unified x:ui configuration types
 */
export type XUIString = string

export interface XUIObject {
  /** Widget type - takes precedence over format */
  widget?: string
  /** Format type - fallback if widget not specified */
  format?: string
  /** Widget-specific options */
  [key: string]: unknown
}

export type XUIConfig = XUIString | XUIObject

/**
 * Resolved widget information with precedence applied
 */
export interface ResolvedWidget {
  /** The effective widget type */
  widget: string
  /** Source of the widget selection for debugging */
  source:
    | 'explicit-widget'
    | 'explicit-format'
    | 'schema-format'
    | 'schema-media'
    | 'constraints'
    | 'heuristics'
    | 'type-fallback'
  /** Additional options from x:ui object */
  options?: Record<string, unknown>
}

/**
 * Extract x:ui configuration from schema definition
 */
export function getXUIConfig(definition: JSONSchema): XUIConfig | undefined {
  if (typeof definition === 'boolean') return undefined
  const raw = (definition as unknown as Record<string, unknown>)['x:ui']
  if (raw == null) return undefined
  if (typeof raw === 'string') return raw
  if (typeof raw === 'object' && raw !== null) {
    return raw as XUIObject
  }
  return undefined
}

/**
 * Resolve effective widget with precedence rules:
 * 1. Explicit x:ui.widget
 * 2. Explicit x:ui.format (or x:ui as string)
 * 3. Schema format property
 * 4. Schema contentMediaType/contentEncoding
 * 5. Schema constraints (enum, const, min/max, etc.)
 * 6. Heuristics (property names, length bounds)
 * 7. Type fallback
 */
export function resolveWidget(
  definition: JSONSchema,
  propertyName?: string
): ResolvedWidget | undefined {
  if (typeof definition === 'boolean') return undefined

  const xui = getXUIConfig(definition)

  // 1. Explicit x:ui.widget
  if (typeof xui === 'object' && typeof xui.widget === 'string') {
    return {
      widget: xui.widget,
      source: 'explicit-widget',
      options: xui,
    }
  }

  // 2. Explicit x:ui.format or x:ui as string
  const explicitFormat =
    typeof xui === 'string'
      ? xui
      : typeof xui === 'object' && typeof xui.format === 'string'
        ? xui.format
        : undefined

  if (explicitFormat) {
    return {
      widget: explicitFormat,
      source: 'explicit-format',
      options: typeof xui === 'object' ? xui : undefined,
    }
  }

  // 3. Schema format property
  if (typeof definition.format === 'string') {
    // Map some formats to more specific widgets
    const formatMap: Record<string, string> = {
      datetime: 'date-time',
      base64: 'binary',
      bytes: 'binary',
      iri: 'uri',
      'iri-reference': 'uri-reference',
      'idn-hostname': 'hostname',
    }

    return {
      widget: formatMap[definition.format] || definition.format,
      source: 'schema-format',
    }
  }

  // 4. Schema contentMediaType/contentEncoding
  if (definition.contentMediaType === 'text/markdown') {
    return {
      widget: 'markdown',
      source: 'schema-media',
    }
  }

  if (
    definition.contentMediaType != null ||
    definition.contentEncoding === 'base64'
  ) {
    return {
      widget: 'binary',
      source: 'schema-media',
      options: {
        mediaType: definition.contentMediaType,
        encoding: definition.contentEncoding,
      },
    }
  }

  // 5. Schema constraints
  if (definition.enum != null) {
    return {
      widget: 'enum',
      source: 'constraints',
    }
  }

  if (definition.const != null) {
    return {
      widget: 'const',
      source: 'constraints',
    }
  }

  // For numbers: check for slider/rating patterns
  // Handle both direct number types and union types like ['number', 'null']
  const isNumberType =
    definition.type === 'number' ||
    definition.type === 'integer' ||
    (Array.isArray(definition.type) &&
      definition.type.some(t => t === 'number' || t === 'integer'))

  if (isNumberType) {
    if (definition.minimum != null && definition.maximum != null) {
      // Could be slider or rating based on range
      const range = definition.maximum - definition.minimum
      // Only use rating for small ranges (≤ 5) with integer steps starting from 0 or 1
      if (
        range <= 5 &&
        definition.minimum >= 0 &&
        definition.minimum <= 1 &&
        (definition.multipleOf == null || definition.multipleOf >= 1)
      ) {
        return {
          widget: 'rating',
          source: 'constraints',
          options: { max: definition.maximum },
        }
      }
      return {
        widget: 'slider',
        source: 'constraints',
        options: {
          min: definition.minimum,
          max: definition.maximum,
          step: definition.multipleOf,
        },
      }
    }
  }

  // 6. Heuristics based on property name and constraints
  if (definition.type === 'string') {
    // Length-based heuristics
    if (
      (definition.minLength != null && definition.minLength > 20) ||
      (definition.maxLength != null && definition.maxLength > 100)
    ) {
      return {
        widget: 'textarea',
        source: 'heuristics',
      }
    }

    // Name-based heuristics
    if (propertyName) {
      const name = propertyName.toLowerCase()
      if (name.includes('password') || name.includes('secret')) {
        return { widget: 'password', source: 'heuristics' }
      }
      if (name.includes('email')) {
        return { widget: 'email', source: 'heuristics' }
      }
      if (name.includes('url') || name.includes('link')) {
        return { widget: 'url', source: 'heuristics' }
      }
      if (name.includes('color')) {
        return { widget: 'color', source: 'heuristics' }
      }

      // Check for textarea triggers (including custom ones from x:ui)
      const textAreaTriggers = getTextAreaTriggers(definition)
      if (
        textAreaTriggers.some((trigger: string) =>
          name.includes(trigger.toLowerCase())
        )
      ) {
        return { widget: 'textarea', source: 'heuristics' }
      }
    }
  }

  // 7. Type fallback - return undefined to let controls handle default widgets
  return undefined
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use resolveWidget instead
 */
export function getUIFormat(definition: JSONSchema): string | undefined {
  const resolved = resolveWidget(definition)
  return resolved?.widget
}

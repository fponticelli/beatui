import type { JSONSchema } from '../schema-context'

export type JSONTypeName =
  | 'string'
  | 'number'
  | 'integer'
  | 'object'
  | 'array'
  | 'boolean'
  | 'null'

/**
 * Detect the JSON type name for a value
 */
export function detectTypeName(
  v: unknown,
  union: JSONTypeName[]
): JSONTypeName | null {
  if (v === null) return union.includes('null') ? 'null' : null
  const t = typeof v
  switch (t) {
    case 'string':
      return union.includes('string') ? 'string' : null
    case 'number': {
      if (Number.isInteger(v as number) && union.includes('integer'))
        return 'integer'
      return union.includes('number') ? 'number' : null
    }
    case 'boolean':
      return union.includes('boolean') ? 'boolean' : null
    case 'object': {
      if (Array.isArray(v)) return union.includes('array') ? 'array' : null
      return union.includes('object') ? 'object' : null
    }
    default:
      return null
  }
}

/**
 * Try to convert a value to a target type
 */
export function tryConvert(
  value: unknown,
  target: JSONTypeName
): { ok: true; value: unknown } | { ok: false } {
  try {
    switch (target) {
      case 'string':
        if (value == null) return { ok: true, value: undefined }
        return { ok: true, value: String(value) }
      case 'number': {
        if (typeof value === 'number') return { ok: true, value }
        if (typeof value === 'string') {
          const n = Number(value)
          return Number.isFinite(n) ? { ok: true, value: n } : { ok: false }
        }
        if (typeof value === 'boolean')
          return { ok: true, value: value ? 1 : 0 }
        return { ok: false }
      }
      case 'integer': {
        if (typeof value === 'number' && Number.isInteger(value))
          return { ok: true, value }
        if (typeof value === 'string') {
          if (/^[-+]?\d+$/.test(value.trim()))
            return { ok: true, value: parseInt(value, 10) }
          return { ok: false }
        }
        if (typeof value === 'boolean')
          return { ok: true, value: value ? 1 : 0 }
        return { ok: false }
      }
      case 'boolean': {
        if (typeof value === 'boolean') return { ok: true, value }
        if (typeof value === 'string') {
          const s = value.trim().toLowerCase()
          if (s === 'true' || s === '1' || s === 'yes')
            return { ok: true, value: true }
          if (s === 'false' || s === '0' || s === 'no')
            return { ok: true, value: false }
          return { ok: false }
        }
        if (typeof value === 'number') return { ok: true, value: value !== 0 }
        return { ok: false }
      }
      case 'array':
        if (Array.isArray(value)) return { ok: true, value }
        return { ok: false }
      case 'object':
        if (value != null && typeof value === 'object' && !Array.isArray(value))
          return { ok: true, value }
        return { ok: false }
      case 'null':
        return { ok: true, value: null }
    }
  } catch {
    return { ok: false }
  }
}

/**
 * Get default cleared value for a type
 */
export function defaultClearedValue(target: JSONTypeName): unknown {
  switch (target) {
    case 'null':
      return null
    case 'array':
      return []
    case 'object':
      return {}
    default:
      return undefined
  }
}

/**
 * Extract x:ui configuration from schema with proper typing
 */
export function getXUI(def: JSONSchema): {
  unionDefault?: JSONTypeName
  confirmBranchChange?: boolean
  selector?: 'segmented' | 'select'
} {
  if (typeof def === 'boolean') return {}

  const raw = (def as Record<string, unknown>)['x:ui']
  if (raw != null && typeof raw === 'object' && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>
    return {
      unionDefault:
        typeof o['unionDefault'] === 'string'
          ? (o['unionDefault'] as JSONTypeName)
          : undefined,
      confirmBranchChange: Boolean(o['confirmBranchChange']),
      selector:
        o['selector'] === 'segmented' || o['selector'] === 'select'
          ? o['selector']
          : undefined,
    }
  }
  return {}
}

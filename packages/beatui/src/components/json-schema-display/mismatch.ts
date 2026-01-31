import type {
  JSONSchemaDefinition,
  JSONSchemaType,
} from '../json-schema/schema-types'

export type MismatchKind =
  | 'type-mismatch'
  | 'missing-required'
  | 'extra-property'
  | 'enum-mismatch'
  | 'const-mismatch'
  | 'constraint-violation'

export interface Mismatch {
  readonly kind: MismatchKind
  readonly path: ReadonlyArray<PropertyKey>
  readonly message: string
  readonly expected?: string
  readonly actual?: string
}

function getValueType(value: unknown): JSONSchemaType | 'unknown' {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'number'
  }
  if (typeof value === 'boolean') return 'boolean'
  return 'unknown'
}

function typeMatches(
  valueType: JSONSchemaType | 'unknown',
  schemaType: JSONSchemaType
): boolean {
  if (valueType === schemaType) return true
  // integer is a subset of number
  if (schemaType === 'number' && valueType === 'integer') return true
  return false
}

/**
 * Lightweight mismatch detection between a JSON value and a JSON Schema definition.
 * No AJV dependency - checks type, required, extra properties, enum/const, and basic constraints.
 */
export function detectMismatches(
  value: unknown,
  definition: JSONSchemaDefinition,
  path: PropertyKey[] = []
): Mismatch[] {
  if (typeof definition === 'boolean') {
    if (definition === false) {
      return [
        {
          kind: 'type-mismatch',
          path,
          message: 'Schema disallows any value',
          actual: String(value),
        },
      ]
    }
    return []
  }

  const mismatches: Mismatch[] = []
  const schema = definition

  // Type check
  if (schema.type != null && value !== undefined) {
    const expectedTypes = Array.isArray(schema.type)
      ? schema.type
      : [schema.type]
    const actualType = getValueType(value)

    if (
      actualType !== 'unknown' &&
      !expectedTypes.some(t => typeMatches(actualType, t))
    ) {
      mismatches.push({
        kind: 'type-mismatch',
        path,
        message: `Expected ${expectedTypes.join(' | ')}, got ${actualType}`,
        expected: expectedTypes.join(' | '),
        actual: actualType,
      })
      // If type doesn't match, skip deeper checks
      return mismatches
    }
  }

  // Enum check
  if (schema.enum != null && value !== undefined) {
    const matches = schema.enum.some(
      e => JSON.stringify(e) === JSON.stringify(value)
    )
    if (!matches) {
      mismatches.push({
        kind: 'enum-mismatch',
        path,
        message: `Value not in enum: ${JSON.stringify(schema.enum)}`,
        expected: schema.enum.map(String).join(', '),
        actual: String(value),
      })
    }
  }

  // Const check
  if (schema.const !== undefined && value !== undefined) {
    if (JSON.stringify(schema.const) !== JSON.stringify(value)) {
      mismatches.push({
        kind: 'const-mismatch',
        path,
        message: `Expected const ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`,
        expected: JSON.stringify(schema.const),
        actual: JSON.stringify(value),
      })
    }
  }

  // String constraints
  if (typeof value === 'string') {
    if (schema.minLength != null && value.length < schema.minLength) {
      mismatches.push({
        kind: 'constraint-violation',
        path,
        message: `String length ${value.length} < minLength ${schema.minLength}`,
        expected: `>= ${schema.minLength} chars`,
        actual: `${value.length} chars`,
      })
    }
    if (schema.maxLength != null && value.length > schema.maxLength) {
      mismatches.push({
        kind: 'constraint-violation',
        path,
        message: `String length ${value.length} > maxLength ${schema.maxLength}`,
        expected: `<= ${schema.maxLength} chars`,
        actual: `${value.length} chars`,
      })
    }
    if (schema.pattern != null) {
      try {
        const re = new RegExp(schema.pattern)
        if (!re.test(value)) {
          mismatches.push({
            kind: 'constraint-violation',
            path,
            message: `String does not match pattern /${schema.pattern}/`,
            expected: `/${schema.pattern}/`,
            actual: value,
          })
        }
      } catch {
        // Invalid pattern, skip
      }
    }
  }

  // Number constraints
  if (typeof value === 'number') {
    if (schema.minimum != null && value < schema.minimum) {
      mismatches.push({
        kind: 'constraint-violation',
        path,
        message: `Value ${value} < minimum ${schema.minimum}`,
        expected: `>= ${schema.minimum}`,
        actual: String(value),
      })
    }
    if (schema.maximum != null && value > schema.maximum) {
      mismatches.push({
        kind: 'constraint-violation',
        path,
        message: `Value ${value} > maximum ${schema.maximum}`,
        expected: `<= ${schema.maximum}`,
        actual: String(value),
      })
    }
    if (schema.exclusiveMinimum != null && value <= schema.exclusiveMinimum) {
      mismatches.push({
        kind: 'constraint-violation',
        path,
        message: `Value ${value} <= exclusiveMinimum ${schema.exclusiveMinimum}`,
        expected: `> ${schema.exclusiveMinimum}`,
        actual: String(value),
      })
    }
    if (schema.exclusiveMaximum != null && value >= schema.exclusiveMaximum) {
      mismatches.push({
        kind: 'constraint-violation',
        path,
        message: `Value ${value} >= exclusiveMaximum ${schema.exclusiveMaximum}`,
        expected: `< ${schema.exclusiveMaximum}`,
        actual: String(value),
      })
    }
    if (schema.multipleOf != null && value % schema.multipleOf !== 0) {
      mismatches.push({
        kind: 'constraint-violation',
        path,
        message: `Value ${value} is not a multiple of ${schema.multipleOf}`,
        expected: `multiple of ${schema.multipleOf}`,
        actual: String(value),
      })
    }
  }

  // Object checks
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj)

    // Missing required
    if (schema.required != null) {
      for (const req of schema.required) {
        if (!(req in obj)) {
          mismatches.push({
            kind: 'missing-required',
            path: [...path, req],
            message: `Missing required property "${req}"`,
            expected: req,
          })
        }
      }
    }

    // Extra properties
    if (schema.additionalProperties === false && schema.properties != null) {
      const allowedKeys = new Set(Object.keys(schema.properties))
      // Also include pattern properties keys
      if (schema.patternProperties != null) {
        const patterns = Object.keys(schema.patternProperties).map(
          p => new RegExp(p)
        )
        for (const key of keys) {
          if (!allowedKeys.has(key) && !patterns.some(re => re.test(key))) {
            mismatches.push({
              kind: 'extra-property',
              path: [...path, key],
              message: `Extra property "${key}" not allowed`,
              actual: key,
            })
          }
        }
      } else {
        for (const key of keys) {
          if (!allowedKeys.has(key)) {
            mismatches.push({
              kind: 'extra-property',
              path: [...path, key],
              message: `Extra property "${key}" not allowed`,
              actual: key,
            })
          }
        }
      }
    }

    // Recurse into properties
    if (schema.properties != null) {
      for (const [key, propDef] of Object.entries(schema.properties)) {
        if (key in obj) {
          mismatches.push(
            ...detectMismatches(obj[key], propDef, [...path, key])
          )
        }
      }
    }
  }

  // Array checks
  if (Array.isArray(value)) {
    if (schema.minItems != null && value.length < schema.minItems) {
      mismatches.push({
        kind: 'constraint-violation',
        path,
        message: `Array length ${value.length} < minItems ${schema.minItems}`,
        expected: `>= ${schema.minItems} items`,
        actual: `${value.length} items`,
      })
    }
    if (schema.maxItems != null && value.length > schema.maxItems) {
      mismatches.push({
        kind: 'constraint-violation',
        path,
        message: `Array length ${value.length} > maxItems ${schema.maxItems}`,
        expected: `<= ${schema.maxItems} items`,
        actual: `${value.length} items`,
      })
    }

    // Recurse into items
    if (schema.prefixItems != null) {
      // Draft 2020-12 tuple validation
      for (let i = 0; i < value.length && i < schema.prefixItems.length; i++) {
        mismatches.push(
          ...detectMismatches(value[i], schema.prefixItems[i], [...path, i])
        )
      }
      // Check remaining items against `items` if present
      if (schema.items != null && !Array.isArray(schema.items)) {
        for (let i = schema.prefixItems.length; i < value.length; i++) {
          mismatches.push(
            ...detectMismatches(value[i], schema.items, [...path, i])
          )
        }
      }
    } else if (Array.isArray(schema.items)) {
      // Draft-07 tuple validation
      for (let i = 0; i < value.length && i < schema.items.length; i++) {
        mismatches.push(
          ...detectMismatches(value[i], schema.items[i], [...path, i])
        )
      }
      if (schema.additionalItems != null) {
        for (let i = schema.items.length; i < value.length; i++) {
          mismatches.push(
            ...detectMismatches(value[i], schema.additionalItems, [...path, i])
          )
        }
      }
    } else if (schema.items != null) {
      // Single items schema
      for (let i = 0; i < value.length; i++) {
        mismatches.push(
          ...detectMismatches(value[i], schema.items, [...path, i])
        )
      }
    }
  }

  return mismatches
}

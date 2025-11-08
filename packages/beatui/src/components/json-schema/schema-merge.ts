import type {
  JSONSchema,
  JSONSchemaDefinition,
  JSONSchemaType,
  SchemaConflict,
  AllOfMergeResult,
} from './schema-types'

/**
 * Merge two compatible schema definitions into one.
 */
function mergeCompatibleSchemas(
  existing: JSONSchemaDefinition,
  incoming: JSONSchemaDefinition
): JSONSchemaDefinition {
  // Handle boolean schemas
  if (typeof existing === 'boolean' || typeof incoming === 'boolean') {
    return incoming // Last wins for boolean schemas
  }

  // Both are objects - deep merge
  const merged = { ...existing }

  // Merge all properties from incoming, with special handling for certain fields
  for (const [key, value] of Object.entries(incoming)) {
    if (
      key === 'required' &&
      Array.isArray(existing.required) &&
      Array.isArray(value)
    ) {
      // Union required arrays
      merged.required = [...new Set([...existing.required, ...value])]
    } else if (
      key === 'properties' &&
      existing.properties &&
      typeof value === 'object' &&
      value != null
    ) {
      // Deep merge properties
      merged.properties = { ...existing.properties, ...value }
    } else {
      // For other properties, incoming wins
      ;(merged as Record<string, unknown>)[key] = value
    }
  }

  return merged
}

/**
 * Check if two schema definitions are compatible (can be merged without conflicts).
 */
function areSchemaDefinitionsCompatible(
  existing: JSONSchemaDefinition,
  incoming: JSONSchemaDefinition
): boolean {
  // Boolean schemas
  if (typeof existing === 'boolean' || typeof incoming === 'boolean') {
    return existing === incoming
  }

  // Both are objects - check for compatibility
  const existingType = existing.type
  const incomingType = incoming.type

  // Different types are incompatible
  if (
    existingType != null &&
    incomingType != null &&
    existingType !== incomingType
  ) {
    return false
  }

  // Check string constraints
  if (existingType === 'string' && incomingType === 'string') {
    if (
      existing.minLength != null &&
      incoming.maxLength != null &&
      existing.minLength > incoming.maxLength
    ) {
      return false
    }
    if (
      existing.maxLength != null &&
      incoming.minLength != null &&
      existing.maxLength < incoming.minLength
    ) {
      return false
    }
  }

  // Check numeric constraints
  if (
    (existingType === 'number' || existingType === 'integer') &&
    (incomingType === 'number' || incomingType === 'integer')
  ) {
    if (
      existing.minimum != null &&
      incoming.maximum != null &&
      existing.minimum > incoming.maximum
    ) {
      return false
    }
    if (
      existing.maximum != null &&
      incoming.minimum != null &&
      existing.maximum < incoming.minimum
    ) {
      return false
    }
  }

  // If we get here, schemas are compatible
  return true
}

/**
 * Analyze a property conflict between two schema definitions and provide detailed information.
 */
function analyzePropertyConflict(
  propertyName: string,
  existing: JSONSchemaDefinition,
  incoming: JSONSchemaDefinition,
  path: ReadonlyArray<PropertyKey>
): SchemaConflict | null {
  // Handle boolean schemas
  if (typeof existing === 'boolean' || typeof incoming === 'boolean') {
    return {
      path,
      message: `Property "${propertyName}" has conflicting boolean schema definitions in allOf branches`,
      conflictingValues: [existing, incoming],
    }
  }

  // Analyze type conflicts
  const existingType = existing.type
  const incomingType = incoming.type

  if (
    existingType != null &&
    incomingType != null &&
    existingType !== incomingType
  ) {
    const existingTypes = Array.isArray(existingType)
      ? existingType
      : [existingType]
    const incomingTypes = Array.isArray(incomingType)
      ? incomingType
      : [incomingType]

    return {
      path,
      message: `Property "${propertyName}" has conflicting types: ${existingTypes.join('|')} vs ${incomingTypes.join('|')}`,
      conflictingValues: [existing, incoming],
    }
  }

  // Analyze constraint conflicts (for same types)
  if (existingType === incomingType && existingType === 'string') {
    const conflicts: string[] = []
    if (
      existing.minLength != null &&
      incoming.maxLength != null &&
      existing.minLength > incoming.maxLength
    ) {
      conflicts.push(
        `minLength ${existing.minLength} > maxLength ${incoming.maxLength}`
      )
    }
    if (
      existing.maxLength != null &&
      incoming.minLength != null &&
      existing.maxLength < incoming.minLength
    ) {
      conflicts.push(
        `maxLength ${existing.maxLength} < minLength ${incoming.minLength}`
      )
    }
    if (conflicts.length > 0) {
      return {
        path,
        message: `Property "${propertyName}" has conflicting string constraints: ${conflicts.join(', ')}`,
        conflictingValues: [existing, incoming],
      }
    }
  }

  if (
    existingType === incomingType &&
    (existingType === 'number' || existingType === 'integer')
  ) {
    const conflicts: string[] = []
    if (
      existing.minimum != null &&
      incoming.maximum != null &&
      existing.minimum > incoming.maximum
    ) {
      conflicts.push(
        `minimum ${existing.minimum} > maximum ${incoming.maximum}`
      )
    }
    if (
      existing.maximum != null &&
      incoming.minimum != null &&
      existing.maximum < incoming.minimum
    ) {
      conflicts.push(
        `maximum ${existing.maximum} < minimum ${incoming.minimum}`
      )
    }
    if (conflicts.length > 0) {
      return {
        path,
        message: `Property "${propertyName}" has conflicting numeric constraints: ${conflicts.join(', ')}`,
        conflictingValues: [existing, incoming],
      }
    }
  }

  // Check if schemas are actually compatible (no real conflict)
  if (areSchemaDefinitionsCompatible(existing, incoming)) {
    // No actual conflict - schemas can be merged without issues
    return null
  }

  // Generic conflict fallback
  return {
    path,
    message: `Property "${propertyName}" has conflicting definitions in allOf branches`,
    conflictingValues: [existing, incoming],
  }
}

/**
 * Normalize schema type to a set of allowed types.
 * Treats 'number' as also allowing 'integer' for intersection purposes.
 */
function normalizeSchemaTypes(
  type: JSONSchemaType | readonly JSONSchemaType[]
): Set<JSONSchemaType> {
  const types = Array.isArray(type) ? type : [type]
  const normalized = new Set<JSONSchemaType>(
    (types as JSONSchemaType[]).map(t => t)
  )
  // Treat 'number' as also allowing 'integer' for intersection purposes
  if (normalized.has('number')) normalized.add('integer')
  return normalized
}

/**
 * Merge properties from a schema into the accumulated properties object.
 * Detects and reports conflicts.
 */
function mergeSchemaProperties(
  allProperties: Record<string, JSONSchemaDefinition>,
  schemaProperties: Record<string, JSONSchemaDefinition>,
  basePath: ReadonlyArray<PropertyKey>,
  conflicts: SchemaConflict[]
): void {
  for (const [key, propDef] of Object.entries(schemaProperties)) {
    if (allProperties[key] != null && allProperties[key] !== propDef) {
      // Property conflict detected - provide detailed analysis
      const existing = allProperties[key]
      const conflict = analyzePropertyConflict(key, existing, propDef, [
        ...basePath,
        'properties',
        key,
      ])
      if (conflict != null) {
        conflicts.push(conflict)
      }
    }
    // Merge compatible properties instead of just overwriting
    if (allProperties[key] != null) {
      allProperties[key] = mergeCompatibleSchemas(allProperties[key], propDef)
    } else {
      allProperties[key] = propDef
    }
  }
}

/**
 * Detect and report conflicts for additionalProperties.
 */
function detectAdditionalPropertiesConflicts(
  merged: JSONSchema,
  additionalProperties: JSONSchemaDefinition | undefined,
  basePath: ReadonlyArray<PropertyKey>,
  conflicts: SchemaConflict[]
): void {
  if (
    additionalProperties != null &&
    merged.additionalProperties != null &&
    merged.additionalProperties !== additionalProperties
  ) {
    conflicts.push({
      path: [...basePath, 'additionalProperties'],
      message: `Conflicting additionalProperties values in allOf: ${merged.additionalProperties} vs ${additionalProperties}`,
      conflictingValues: [merged.additionalProperties, additionalProperties],
    })
  }
}

/**
 * Detect and report conflicts for property count constraints (minProperties/maxProperties).
 */
function detectPropertyCountConflicts(
  merged: JSONSchema,
  minProperties: number | undefined,
  maxProperties: number | undefined,
  basePath: ReadonlyArray<PropertyKey>,
  conflicts: SchemaConflict[]
): void {
  if (
    minProperties != null &&
    merged.maxProperties != null &&
    minProperties > merged.maxProperties
  ) {
    conflicts.push({
      path: [...basePath, 'minProperties'],
      message: `minProperties ${minProperties} conflicts with existing maxProperties ${merged.maxProperties}`,
      conflictingValues: [minProperties, merged.maxProperties],
    })
  }
  if (
    maxProperties != null &&
    merged.minProperties != null &&
    maxProperties < merged.minProperties
  ) {
    conflicts.push({
      path: [...basePath, 'maxProperties'],
      message: `maxProperties ${maxProperties} conflicts with existing minProperties ${merged.minProperties}`,
      conflictingValues: [maxProperties, merged.minProperties],
    })
  }
}

/**
 * Intersect type sets from all branches to determine the effective type.
 * Reports conflicts if no common types exist.
 */
function intersectTypes(
  perBranchTypes: Array<Set<JSONSchemaType>>,
  basePath: ReadonlyArray<PropertyKey>,
  conflicts: SchemaConflict[]
): JSONSchemaType | JSONSchemaType[] | undefined {
  if (perBranchTypes.length === 0) {
    return undefined
  }

  let intersection: Set<JSONSchemaType> | null = null
  for (const types of perBranchTypes) {
    if (intersection == null) {
      intersection = new Set(types)
    } else {
      const next = new Set<JSONSchemaType>()
      for (const t of intersection) {
        if (types.has(t)) next.add(t)
      }
      intersection = next
    }
  }

  const final = Array.from(intersection ?? [])
  if (final.length === 0) {
    // No overlap – true incompatibility across branches
    const values = perBranchTypes.map(s => Array.from(s))
    conflicts.push({
      path: [...basePath, 'type'],
      message: `Incompatible types in allOf (no common types)`,
      conflictingValues: values,
    })
    return undefined
  } else if (final.length === 1) {
    return final[0]
  } else {
    return final
  }
}

/**
 * Deep merge allOf branches into a single effective schema.
 * - Intersects types (detects conflicts like string ∧ number)
 * - Unions required arrays
 * - Deep merges properties objects
 * - Detects and reports conflicts as non-blocking schema errors
 */
export function mergeAllOf(
  allOfSchemas: readonly JSONSchema[],
  basePath: ReadonlyArray<PropertyKey> = []
): AllOfMergeResult {
  const conflicts: SchemaConflict[] = []
  const merged: JSONSchema = {}

  // Collect per-branch allowed types for intersection analysis
  const perBranchTypes: Array<Set<JSONSchemaType>> = []
  const allRequired: string[] = []
  const allProperties: Record<string, JSONSchemaDefinition> = {}

  for (const schema of allOfSchemas) {
    // Track allowed types (normalized) per branch for intersection
    if (schema.type != null) {
      perBranchTypes.push(normalizeSchemaTypes(schema.type))
    }

    // Union required arrays
    if (Array.isArray(schema.required)) {
      allRequired.push(...schema.required)
    }

    // Deep merge properties with enhanced conflict detection
    if (schema.properties != null) {
      mergeSchemaProperties(
        allProperties,
        schema.properties,
        basePath,
        conflicts
      )
    }

    // Copy other schema properties with conflict detection for critical properties
    const {
      type: _type,
      required: _required,
      properties: _properties,
      allOf: _allOf,
      additionalProperties,
      patternProperties,
      minProperties,
      maxProperties,
      ...otherProps
    } = schema

    // Detect conflicts
    detectAdditionalPropertiesConflicts(
      merged,
      additionalProperties,
      basePath,
      conflicts
    )
    detectPropertyCountConflicts(
      merged,
      minProperties,
      maxProperties,
      basePath,
      conflicts
    )

    // Merge properties into result
    Object.assign(merged, otherProps)
    if (additionalProperties != null)
      merged.additionalProperties = additionalProperties
    if (patternProperties != null) merged.patternProperties = patternProperties
    if (minProperties != null) merged.minProperties = minProperties
    if (maxProperties != null) merged.maxProperties = maxProperties
  }

  // Determine effective type via intersection of allowed types across branches
  const effectiveType = intersectTypes(perBranchTypes, basePath, conflicts)
  if (effectiveType != null) {
    merged.type = effectiveType
  }

  if (allRequired.length > 0) {
    merged.required = [...new Set(allRequired)]
  }

  if (Object.keys(allProperties).length > 0) {
    merged.properties = allProperties
  }

  return {
    mergedSchema: merged,
    conflicts,
  }
}

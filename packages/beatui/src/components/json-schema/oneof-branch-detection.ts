import type { Ajv } from 'ajv'
import type {
  JSONSchema,
  JSONSchemaDefinition,
  JSONSchemaType,
  SchemaContext,
} from './schema-context'
import { compileWithCache } from './ajv-utils'
import { resolveRef } from './ref-utils'

/**
 * Result of oneOf branch detection
 */
export interface OneOfBranchDetectionResult {
  /** Index of the matching branch, or -1 if no single match */
  matchingBranch: number
  /** Array of all branches that validate against the current value */
  validBranches: number[]
  /** Whether multiple branches match (ambiguous for oneOf) */
  isAmbiguous: boolean
  /** Whether no branches match */
  hasNoMatch: boolean
}

/**
 * Detect which oneOf branch(es) the current value matches.
 * This works with both inline schemas and $ref schemas by resolving references first.
 *
 * @param ctx - Schema context containing oneOf definition
 * @param value - Current value to test against branches
 * @param ajv - AJV instance for validation (optional, falls back to heuristics)
 * @returns Branch detection result
 */
export function detectOneOfBranch(
  ctx: SchemaContext,
  value: unknown,
  ajv?: Ajv
): OneOfBranchDetectionResult {
  const oneOfDef = ctx.definition as JSONSchema
  const branches = oneOfDef.oneOf

  if (!Array.isArray(branches) || branches.length === 0) {
    return {
      matchingBranch: -1,
      validBranches: [],
      isAmbiguous: false,
      hasNoMatch: true,
    }
  }

  // Resolve all $ref branches first (only for in-document refs)
  const resolvedBranches = branches.map(branch => {
    if (typeof branch === 'object' && branch != null && '$ref' in branch) {
      const ref = (branch as { $ref: string }).$ref
      // Only resolve in-document refs, external refs are handled by AJV
      if (typeof ref === 'string' && ref.startsWith('#')) {
        return resolveRef(branch as JSONSchema, ctx.schema)
      }
    }
    return branch as JSONSchema
  })

  const validBranches: number[] = []

  // Test each branch against the current value
  for (let i = 0; i < resolvedBranches.length; i++) {
    const branch = resolvedBranches[i]
    if (typeof branch === 'boolean') {
      // Boolean schema: true matches everything, false matches nothing
      if (branch === true) {
        validBranches.push(i)
      }
      continue
    }

    if (ajv) {
      // Use AJV for precise validation
      try {
        const validate = compileWithCache(ajv, branch)
        if (validate(value)) {
          validBranches.push(i)
        }
      } catch (error) {
        // If compilation fails, fall back to heuristic matching
        console.warn(`Failed to compile oneOf branch ${i}:`, error)
        if (matchesBranchHeuristic(branch, value)) {
          validBranches.push(i)
        }
      }
    } else {
      // Fall back to heuristic matching when no AJV available
      if (matchesBranchHeuristic(branch, value)) {
        validBranches.push(i)
      }
    }
  }

  const isAmbiguous = validBranches.length > 1
  const hasNoMatch = validBranches.length === 0
  const matchingBranch = validBranches.length === 1 ? validBranches[0] : -1

  return {
    matchingBranch,
    validBranches,
    isAmbiguous,
    hasNoMatch,
  }
}

/**
 * Heuristic matching for when AJV is not available.
 * This provides basic type and discriminator-based matching.
 */
function matchesBranchHeuristic(branch: JSONSchema, value: unknown): boolean {
  // Handle const values
  if ('const' in branch) {
    return branch.const === value
  }

  // Handle enum values
  if (Array.isArray(branch.enum)) {
    return branch.enum.includes(value)
  }

  // Handle type matching
  if (branch.type != null) {
    const expectedTypes = Array.isArray(branch.type)
      ? branch.type
      : [branch.type]
    const actualType = getValueType(value)

    if (actualType === 'unknown' || !expectedTypes.includes(actualType)) {
      return false
    }
  }

  // Handle discriminator-like patterns (properties with const values)
  if (branch.properties && typeof value === 'object' && value != null) {
    const valueObj = value as Record<string, unknown>

    for (const [propName, propSchema] of Object.entries(branch.properties)) {
      if (
        typeof propSchema === 'object' &&
        propSchema != null &&
        'const' in propSchema
      ) {
        // This property has a const value - check if it matches
        if (valueObj[propName] !== propSchema.const) {
          return false
        }
      }
    }
  }

  // If we get here, the branch might match (no definitive mismatch found)
  return true
}

/**
 * Get the JSON Schema type of a value
 */
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

/**
 * Get a human-readable label for a oneOf branch.
 * Prioritizes title, then discriminator values, then type, then fallback.
 */
export function getOneOfBranchLabel(
  branch: JSONSchemaDefinition,
  index: number,
  fallback = `Option ${index + 1}`
): string {
  if (typeof branch === 'boolean') {
    return branch ? 'Any Value' : 'No Value'
  }

  // Use explicit title if available
  if (branch.title) {
    return branch.title
  }

  // Look for discriminator-like const values in properties
  if (branch.properties) {
    for (const [propName, propSchema] of Object.entries(branch.properties)) {
      if (
        typeof propSchema === 'object' &&
        propSchema != null &&
        'const' in propSchema
      ) {
        const constValue = propSchema.const
        if (typeof constValue === 'string') {
          return `${propName}: ${constValue}`
        }
      }
    }
  }

  // Use const value if available
  if ('const' in branch && typeof branch.const === 'string') {
    return branch.const
  }

  // Use type information
  if (branch.type) {
    const types = Array.isArray(branch.type) ? branch.type : [branch.type]
    return types.join(' | ')
  }

  return fallback
}

/**
 * Auto-select the best oneOf branch for a given value.
 * Returns the branch index, or -1 if no clear choice can be made.
 */
export function autoSelectOneOfBranch(
  ctx: SchemaContext,
  value: unknown,
  ajv?: Ajv
): number {
  const detection = detectOneOfBranch(ctx, value, ajv)

  // If exactly one branch matches, use it
  if (detection.matchingBranch !== -1) {
    return detection.matchingBranch
  }

  // For oneOf, we should be strict - if multiple branches match or no branches match,
  // we require manual selection. Only auto-select when there's exactly one valid branch.

  // No clear choice - return -1 to indicate manual selection needed
  return -1
}

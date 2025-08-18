import type { StandardSchemaV1 } from '../form/schema/standard-schema-v1'
import Ajv, { type ErrorObject, type JSONSchemaType } from 'ajv'

/**
 * Create a StandardSchemaV1 validator from a JSON Schema using AJV.
 * - Vendor: 'ajv'
 * - Returns StandardSchemaV1-compliant validate() that maps AJV errors to standard issues
 */
export function createAJVStandardSchema<T = unknown>(
  schema: JSONSchemaType<T>,
  options?: { ajv?: Ajv }
): StandardSchemaV1<T> {
  const ajv = options?.ajv ?? new Ajv({ allErrors: true })
  const validate = ajv.compile<T>(schema)

  return {
    '~standard': {
      version: 1 as const,
      vendor: 'ajv',
      validate: (value: unknown): StandardSchemaV1.Result<T> => {
        // AJV validate mutates value when coercion is enabled on the instance
        const ok = validate(value)
        if (ok) {
          return { value: value as T }
        }
        const issues = ajvErrorsToIssues(validate.errors ?? [])
        return { issues }
      },
      types: undefined,
    },
  }
}

function ajvErrorsToIssues(
  errors: ErrorObject[]
): ReadonlyArray<StandardSchemaV1.Issue> {
  return errors.map(err => ({
    message: buildMessage(err),
    path: buildPath(err),
  }))
}

function buildMessage(err: ErrorObject): string {
  // Prefer AJV's message; fall back to keyword-based generic
  return err.message ?? `${err.keyword} validation failed`
}

function buildPath(err: ErrorObject): ReadonlyArray<PropertyKey> | undefined {
  const base = jsonPointerToSegments(err.instancePath || '')

  // Add missing/extra property info where appropriate to point precisely at the field
  if (err.keyword === 'required') {
    const mp = (err.params as { missingProperty?: string }).missingProperty
    if (mp != null) return [...base, mp]
  }
  if (err.keyword === 'additionalProperties') {
    const ap = (err.params as { additionalProperty?: string })
      .additionalProperty
    if (ap != null) return [...base, ap]
  }
  // Ajv may report unevaluatedProperties similarly
  if (err.keyword === 'unevaluatedProperties') {
    const up = (err.params as { unevaluatedProperty?: string })
      .unevaluatedProperty
    if (up != null) return [...base, up]
  }

  return base.length > 0 ? base : undefined
}

function jsonPointerToSegments(ptr: string): PropertyKey[] {
  if (!ptr) return []
  // ptr like "/a/0/b" -> ["a", 0, "b"]
  const segments = ptr
    .split('/')
    .slice(1)
    .map(s => s.replace(/~1/g, '/').replace(/~0/g, '~'))
  return segments.map(s => (isArrayIndex(s) ? Number(s) : s))
}

function isArrayIndex(s: string): boolean {
  // Treat non-empty sequence of digits as array index
  return /^\d+$/.test(s)
}

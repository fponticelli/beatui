import Ajv, { type ErrorObject } from 'ajv'
import { Validation } from '@tempots/std'
import type { JSONSchema7Definition } from 'json-schema'
import type {
  ControllerError,
  ControllerValidation,
  PathSegment,
} from '../form'

export function jsonPointerToSegments(ptr: string): PropertyKey[] {
  return ptr
    .split('/')
    .slice(1)
    .map(s => s.replace(/~1/g, '/').replace(/~0/g, '~'))
}

export function buildPath(
  err: ErrorObject
): ReadonlyArray<PropertyKey> | undefined {
  const base = jsonPointerToSegments(err.instancePath || '')
  if (err.keyword === 'required') {
    const mp = (err.params as { missingProperty?: string }).missingProperty
    if (mp != null) return [...base, mp]
  }
  if (err.keyword === 'additionalProperties') {
    const ap = (err.params as { additionalProperty?: string })
      .additionalProperty
    if (ap != null) return [...base, ap]
  }
  if (err.keyword === 'unevaluatedProperties') {
    const up = (err.params as { unevaluatedProperty?: string })
      .unevaluatedProperty
    if (up != null) return [...base, up]
  }
  return base.length > 0 ? base : undefined
}

export function buildMessage(err: ErrorObject): string {
  return err.message ?? `${err.keyword} validation failed`
}

export function ajvErrorsToDependencies(errors: ErrorObject[]) {
  return errors.reduce((acc, err) => {
    const path = buildPath(err)
    if (path == null) return acc
    let current = acc
    for (const seg of path) {
      const segment = seg as PathSegment
      if (current.dependencies == null) {
        current.dependencies = {} as Record<PathSegment, ControllerError>
      }
      if (current.dependencies[segment] == null) {
        current.dependencies[segment] = {}
      }
      current = current.dependencies[segment]
    }
    current.message = buildMessage(err)
    return acc
  }, {} as ControllerError)
}

export function ajvErrorsToControllerValidation(
  errors: ErrorObject[]
): ControllerValidation {
  const error = ajvErrorsToDependencies(errors)
  return Validation.invalid(error)
}

export function compileSchema(schema: JSONSchema7Definition, ajv: Ajv) {
  try {
    return { ok: true as const, value: ajv.compile(schema) }
  } catch (e) {
    return {
      ok: false as const,
      error: (e as Error).message ?? 'Failed to compile schema',
    }
  }
}

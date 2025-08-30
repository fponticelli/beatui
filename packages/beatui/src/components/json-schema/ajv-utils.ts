import { type ErrorObject } from 'ajv'
import { Validation } from '@tempots/std'
import type {
  ControllerError,
  ControllerValidation,
  PathSegment,
} from '../form'
import addFormats from 'ajv-formats'

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addUiWidgetKeyword(ajv: any) {
  ajv.addKeyword({
    keyword: 'ui:widget',
    type: 'string',
    validate: () => true,
  })
}

export async function getAjvForSchema(schema: { $schema?: string }) {
  try {
    const id = schema.$schema ?? 'https://json-schema.org/draft/2020-12/schema'

    if (id.includes('draft/2020-12')) {
      const Ajv2020 = (await import('ajv/dist/2020')).default
      const ajv2020 = new Ajv2020({ meta: false, strictSchema: true })
      addFormats(ajv2020)
      addUiWidgetKeyword(ajv2020)
      return {
        ok: true as const,
        value: { ajv: ajv2020, validate: ajv2020.compile(schema) },
      }
    }
    if (id.includes('draft/2019-09')) {
      const Ajv2019 = (await import('ajv/dist/2019')).default
      const ajv2019 = new Ajv2019({ meta: false, strictSchema: true })
      addFormats(ajv2019)
      addUiWidgetKeyword(ajv2019)
      return {
        ok: true as const,
        value: { ajv: ajv2019, validate: ajv2019.compile(schema) },
      }
    }

    const Ajv = (await import('ajv')).default
    const ajv07 = new Ajv({ meta: false, strictSchema: true })
    addFormats(ajv07)
    addUiWidgetKeyword(ajv07)
    return {
      ok: true as const,
      value: { ajv: ajv07, validate: ajv07.compile(schema) },
    }
  } catch (e) {
    return {
      ok: false as const,
      error: (e as Error).message ?? 'Failed to compile schema',
    }
  }
}

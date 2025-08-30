import type Ajv from 'ajv'
import type { ErrorObject, KeywordDefinition } from 'ajv'
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

function addUiWidgetKeyword(ajv: Ajv) {
  const def: KeywordDefinition = {
    keyword: 'ui:widget',
    // Accept both string and object shapes for future-proofing
    schemaType: ['string', 'object'],
    errors: false,
    // No-op validation – vendor annotation only
    validate: () => true,
  }
  ajv.addKeyword(def)
}

type BuildAjvResult =
  | { ok: true; value: { ajv: Ajv; validate: import('ajv').ValidateFunction } }
  | { ok: false; error: string }

async function createAjv(base: '2020-12' | '2019-09' | 'draft-07') {
  const createAjv = (
    await (() => {
      switch (base) {
        case '2020-12':
          return import('ajv/dist/2020')
        case '2019-09':
          return import('ajv/dist/2019')
        case 'draft-07':
          return import('ajv')
      }
    })()
  ).default
  const ajv = new createAjv({ meta: true, strictSchema: true, allErrors: true })
  switch (base) {
    case '2020-12':
      ajv.opts.defaultMeta = 'https://json-schema.org/draft/2020-12/schema'
      break
    case '2019-09':
      ajv.opts.defaultMeta = 'https://json-schema.org/draft/2019-09/schema'
      break
    case 'draft-07':
      ajv.opts.defaultMeta = 'http://json-schema.org/draft-07/schema#'
      break
  }
  addFormats(ajv)
  addUiWidgetKeyword(ajv)
  return ajv
}

function getFlavor(id: string | undefined): '2020-12' | '2019-09' | 'draft-07' {
  if (id == null) return '2020-12'
  if (id.includes('draft/2020-12')) return '2020-12'
  if (id.includes('draft/2019-09')) return '2019-09'
  return 'draft-07'
}

export async function getAjvForSchema(schema: {
  $schema?: string
}): Promise<BuildAjvResult> {
  try {
    const flavor = getFlavor(schema.$schema)
    const ajv = await createAjv(flavor)
    const validate = ajv.compile(schema)
    return { ok: true, value: { ajv, validate } }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { ok: false, error: message }
  }
}

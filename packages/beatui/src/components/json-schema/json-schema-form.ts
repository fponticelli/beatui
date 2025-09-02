import { type SchemaObject } from 'ajv'
import {
  html,
  Value,
  attr,
  Renderable,
  Fragment,
  OnDispose,
  Async,
} from '@tempots/dom'
import { Validation } from '@tempots/std'
import { Controller, ControllerValidation, useController } from '../form'
import { ajvErrorsToControllerValidation, getAjvForSchema } from './ajv-utils'
import { JSONSchemaControl } from './controls'

function cloneJson<T>(v: T): T {
  // Use structuredClone when available; fallback to JSON round-trip for plain data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sc: any = (globalThis as unknown as { structuredClone?: unknown })
    .structuredClone
  if (typeof sc === 'function') return sc(v)
  return JSON.parse(JSON.stringify(v)) as T
}

function jsonEqual(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return a === b
  }
}

/**
 * External reference resolver function type.
 * Called when the form encounters external $ref URIs that need to be resolved.
 *
 * @param ids - Array of external schema IDs that need to be resolved
 * @returns Promise resolving to array of schema objects with matching $id properties
 *
 * @example
 * ```typescript
 * const refResolver = async (ids: string[]) => {
 *   const schemas = await Promise.all(
 *     ids.map(id => fetch(`/schemas/${id}`).then(r => r.json()))
 *   )
 *   return schemas
 * }
 * ```
 */
export type ExternalRefResolver = (
  ids: ReadonlyArray<string>
) => Promise<ReadonlyArray<SchemaObject>>

/**
 * Configuration options for JSONSchemaForm external reference resolution.
 */
export interface JSONSchemaFormExternalOptions {
  /**
   * Pre-bundled external schemas to register with AJV before compilation.
   * These schemas should have $id properties and will be available for $ref resolution.
   *
   * @example
   * ```typescript
   * const externalSchemas = [
   *   { $id: 'https://example.com/address', type: 'object', properties: { ... } },
   *   { $id: 'https://example.com/person', type: 'object', properties: { ... } }
   * ]
   * ```
   */
  externalSchemas?: ReadonlyArray<SchemaObject>

  /**
   * Dynamic resolver for external $ref URIs not found in externalSchemas.
   * Called when the form encounters external references during schema compilation.
   * The resolver should fetch and return schemas with matching $id properties.
   *
   * @example
   * ```typescript
   * const refResolver = async (ids: string[]) => {
   *   // Fetch schemas from API, filesystem, or other sources
   *   return await fetchSchemasById(ids)
   * }
   * ```
   */
  refResolver?: ExternalRefResolver

  /**
   * Controls automatic sanitization of form data to remove properties
   * not allowed by the schema (e.g., when additionalProperties: false).
   *
   * - 'all': Remove all additional properties
   * - 'failing': Remove only properties that cause validation failures
   * - false: No automatic sanitization (default)
   */
  sanitizeAdditional?: 'all' | 'failing' | false
}

/**
 * Props for the JSONSchemaForm component.
 */
export interface JSONSchemaFormProps<T> extends JSONSchemaFormExternalOptions {
  /** The root JSON Schema to render as a form */
  schema: SchemaObject
  /** Reactive value containing the form data */
  initialValue: Value<T>
}

export function JSONSchemaForm<T>(
  {
    schema,
    initialValue,
    externalSchemas,
    refResolver,
    sanitizeAdditional,
  }: JSONSchemaFormProps<T>,
  fn: ({
    Form,
    controller,
    setStatus,
  }: {
    Form: Renderable
    controller: Controller<T>
    setStatus: (result: ControllerValidation) => void
  }) => Renderable
): Renderable {
  return Async(
    getAjvForSchema(schema, {
      externalSchemas,
      refResolver,
      sanitizeAdditional,
    }),
    result => {
      if (result.ok) {
        const { ajv, validate } = result.value
        const { controller, setStatus } = useController({
          initialValue,
          validate: (value: T) => {
            const ok = validate(value)
            if (ok) return Validation.valid
            return ajvErrorsToControllerValidation(validate.errors ?? [])
          },
        })

        // Optional sanitization pass: remove additional properties eagerly
        const shouldSanitize = sanitizeAdditional !== false
        let sanitizing = false
        const cancel = shouldSanitize
          ? controller.value.on(v => {
              if (sanitizing) return
              const working = cloneJson(v)
              const ok = validate(working)
              if (ok && !jsonEqual(working, v)) {
                sanitizing = true
                controller.change(working as T)
                sanitizing = false
              }
            })
          : () => {}

        // Pass AJV for conditional evaluation in combinators
        const Form = Fragment(
          OnDispose(() => {
            cancel()
            controller.dispose()
          }),
          JSONSchemaControl({ schema, controller, ajv })
        )
        return fn({ Form, controller, setStatus })
      }
      return html.div(attr.class('bu-text-red-600'), result.error)
    }
  )
}

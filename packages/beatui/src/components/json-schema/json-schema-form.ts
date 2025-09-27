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
import {
  getConditionalValidation,
  applyConditionalValidation,
  createConditionalWatcher,
} from './validation/conditional-validation'
import {
  getAsyncValidationRules,
  AsyncValidator,
} from './validation/async-validation'

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
  /** Validation behavior */
  validationMode?: 'onSubmit' | 'continuous' | 'touchedOrSubmit'
  validateDebounceMs?: number
}

export function JSONSchemaForm<T>(
  {
    schema,
    initialValue,
    externalSchemas,
    refResolver,
    sanitizeAdditional,
    validationMode,
    validateDebounceMs,
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

        // Extract conditional validation configuration from schema
        const conditionalConfig = getConditionalValidation(schema)

        // Extract async validation rules from schema
        const asyncRules = getAsyncValidationRules(schema)
        const asyncValidator =
          asyncRules.length > 0 ? new AsyncValidator() : null

        const mode = validationMode ?? 'touchedOrSubmit'
        const validateFn = (value: T): ControllerValidation => {
          // Apply base AJV validation
          const ok = validate(value)
          let baseValidation: ControllerValidation
          if (ok) {
            baseValidation = Validation.valid
          } else {
            baseValidation = ajvErrorsToControllerValidation(
              validate.errors ?? []
            )
          }

          // Apply conditional validation if configured
          if (conditionalConfig) {
            return applyConditionalValidation(
              value,
              value, // formData is the same as value for root-level validation
              conditionalConfig,
              validate
            )
          }

          return baseValidation
        }

        const { controller, setStatus } = useController({
          initialValue,
          validationMode: mode,
          validateDebounceMs,
          validate: mode === 'onSubmit' ? undefined : validateFn,
        })

        // Set up conditional validation watcher if needed
        const conditionalWatcher = conditionalConfig
          ? createConditionalWatcher(conditionalConfig, () => {
              // Trigger revalidation by forcing a status update
              const currentValidation = controller.status.value
              setStatus(currentValidation)
            })
          : null

        // Optional sanitization pass: remove additional properties eagerly
        const shouldSanitize = sanitizeAdditional !== false
        let sanitizing = false
        const cancelSanitization = shouldSanitize
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

        // Set up conditional validation watching
        const cancelConditionalWatch = conditionalWatcher
          ? controller.value.on((currentValue, previousValue) => {
              // Check if any watched paths have changed
              if (previousValue != null) {
                // Simple change detection - could be enhanced with deep path checking
                const hasRelevantChanges =
                  JSON.stringify(currentValue) !== JSON.stringify(previousValue)
                if (hasRelevantChanges) {
                  // Trigger revalidation after a short delay to batch changes
                  setTimeout(() => {
                    const newValidation = controller.status.value
                    setStatus(newValidation)
                  }, 10)
                }
              }
            })
          : () => {}

        // Set up async validation triggers if needed
        const cancelAsyncWatch =
          asyncValidator && asyncRules.length > 0
            ? controller.value.on(currentValue => {
                for (const rule of asyncRules) {
                  asyncValidator.validateField(rule, currentValue, currentValue)
                }
              })
            : () => {}

        // Combined cleanup function
        const cleanup = () => {
          cancelSanitization()
          cancelConditionalWatch()
          cancelAsyncWatch()
          asyncValidator?.dispose()
          controller.dispose()
        }

        // Pass AJV for conditional evaluation in combinators
        const Form = Fragment(
          OnDispose(cleanup),
          JSONSchemaControl({ schema, controller, ajv })
        )
        return fn({ Form, controller, setStatus })
      }
      return html.div(attr.class('text-red-600'), result.error)
    }
  )
}

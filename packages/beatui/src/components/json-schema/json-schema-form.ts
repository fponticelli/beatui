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
import {
  type CustomWidgets,
  WidgetRegistry,
} from './widgets/widget-customization'
import { extractSchemaDefaults } from './schema-defaults'
import { deepMergeDefaults } from '../form/utils/deep-merge'

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
  /**
   * Initial value for the form data.
   *
   * When omitted, the form will be auto-populated from schema defaults:
   * - `default` property values (highest priority)
   * - First item from `examples` array (fallback)
   * - Empty object for object schemas (last resort)
   *
   * When provided, schema defaults are merged with the provided value
   * (provided values take precedence) unless `applySchemaDefaults` is false.
   */
  initialValue?: Value<T>
  /** Validation behavior */
  validationMode?: 'onSubmit' | 'eager' | 'onTouched'
  validateDebounceMs?: number
  /** Custom widgets for form-scoped widget overrides */
  customWidgets?: CustomWidgets
  /**
   * Whether to automatically populate form values from schema defaults.
   * When true, extracts `default` values (with `examples[0]` as fallback)
   * from the schema and merges them with the provided initialValue.
   * Provided values take precedence over schema defaults.
   *
   * @default true
   */
  applySchemaDefaults?: boolean
}

/**
 * Create a form-scoped widget registry from custom widgets configuration
 */
function createFormWidgetRegistry(
  customWidgets: CustomWidgets
): WidgetRegistry {
  const registry = new WidgetRegistry()

  for (let i = 0; i < customWidgets.length; i++) {
    const registration = customWidgets[i]
    const key = registration.displayName ?? `custom-widget-${i}`
    registry.register(key, {
      factory: registration.factory,
      displayName: registration.displayName ?? `Custom Widget ${i + 1}`,
      description: registration.description,
      supportedTypes: registration.supportedTypes,
      priority: registration.priority ?? 50,
      canFallback: true,
      matcher: registration.matcher,
    })
  }

  return registry
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
    customWidgets,
    applySchemaDefaults = true,
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
  // Compute effective initial value with schema defaults merged in.
  // IMPORTANT: We read the initial value once and merge defaults non-reactively
  // to avoid feedback loops when the controller feeds changes back to initialValue.
  const providedValue =
    initialValue !== undefined ? Value.get(initialValue) : undefined
  const schemaDefaults = extractSchemaDefaults(schema)

  // When initialValue is not provided, use schema defaults as the base
  // When provided but applySchemaDefaults is true, merge defaults with provided value
  // When provided and applySchemaDefaults is false, use provided value as-is
  let effectiveInitialValue: T
  if (initialValue === undefined) {
    // No initial value provided - use schema defaults, fall back to empty object
    effectiveInitialValue = (schemaDefaults ?? {}) as T
  } else if (applySchemaDefaults) {
    // Merge schema defaults with provided value
    effectiveInitialValue = deepMergeDefaults(
      schemaDefaults,
      providedValue
    ) as T
  } else {
    // Use provided value as-is
    effectiveInitialValue = providedValue as T
  }

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

        const mode = validationMode ?? 'onTouched'
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
          initialValue: effectiveInitialValue,
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
          ? controller.signal.on(v => {
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
          ? controller.signal.on((currentValue, previousValue) => {
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
            ? controller.signal.on(currentValue => {
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

        // Create form-scoped widget registry if custom widgets provided
        const formWidgetRegistry = customWidgets
          ? createFormWidgetRegistry(customWidgets)
          : undefined

        // Pass AJV for conditional evaluation in combinators
        const Form = Fragment(
          OnDispose(cleanup),
          JSONSchemaControl({
            schema,
            controller,
            ajv,
            widgetRegistry: formWidgetRegistry,
          })
        )
        return fn({ Form, controller, setStatus })
      }
      return html.div(attr.class('bc-json-schema-form__error'), result.error)
    }
  )
}

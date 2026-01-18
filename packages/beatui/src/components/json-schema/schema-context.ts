import { humanize, upperCaseFirst } from '@tempots/std'
import type Ajv from 'ajv'
import type { Signal } from '@tempots/dom'
import type {
  JSONSchemaDefinition,
  JSONSchemaType,
  SchemaConflict,
  NotViolation,
} from './schema-types'
import type { WidgetRegistry } from './widgets/widget-customization'
import type { ControllerValidation } from '../form/controller/controller-validation'
import type { ValidationMode } from '../form/controller/union-controller'

// Re-export types for backward compatibility
export type {
  JSONSchema,
  JSONSchemaDefinition,
  JSONSchemaType,
  SchemaConflict,
  AllOfMergeResult,
  NotViolation,
} from './schema-types'

// Re-export functions for backward compatibility
export { mergeAllOf } from './schema-merge'
export {
  evaluateNotViolation,
  composeEffectiveObjectSchema,
  evaluateIfThenElseOverlay,
  getEvaluatedProperties,
} from './schema-conditionals'

export type SchemaContextOptions = {
  schema: JSONSchemaDefinition
  definition: JSONSchemaDefinition
  horizontal: boolean
  path: ReadonlyArray<PropertyKey>
  ajv?: Ajv
  isPropertyRequired?: boolean
  suppressLabel?: boolean
  schemaConflicts?: readonly SchemaConflict[]
  notViolations?: readonly NotViolation[]
  widgetRegistry?: WidgetRegistry
  /**
   * Function to set the form's validation status.
   * Available for custom widgets that need to perform their own validation.
   */
  setStatus?: (status: ControllerValidation) => void
  /**
   * Signal containing the entire form's current value.
   * Useful for cross-field validation or conditional rendering.
   */
  formValue?: Signal<unknown>
  /**
   * Current validation mode ('eager', 'onTouched', 'onSubmit').
   * Custom widgets may want to behave differently based on this.
   */
  validationMode?: ValidationMode
  /**
   * Signal indicating whether the form is currently submitting.
   * Widgets should typically disable during submission.
   */
  submitting?: Signal<boolean>
}

export class SchemaContext {
  readonly schema: JSONSchemaDefinition
  readonly definition: JSONSchemaDefinition
  readonly horizontal: boolean
  readonly path: ReadonlyArray<PropertyKey>
  readonly ajv: Ajv | undefined
  readonly isPropertyRequired: boolean
  readonly suppressLabel: boolean
  readonly schemaConflicts: readonly SchemaConflict[]
  readonly notViolations: readonly NotViolation[]
  readonly widgetRegistry: WidgetRegistry | undefined
  /**
   * Function to set the form's validation status.
   * Available for custom widgets that need to perform their own validation.
   */
  readonly setStatus: ((status: ControllerValidation) => void) | undefined
  /**
   * Signal containing the entire form's current value.
   * Useful for cross-field validation or conditional rendering.
   */
  readonly formValue: Signal<unknown> | undefined
  /**
   * Current validation mode ('eager', 'onTouched', 'onSubmit').
   * Custom widgets may want to behave differently based on this.
   */
  readonly validationMode: ValidationMode | undefined
  /**
   * Signal indicating whether the form is currently submitting.
   * Widgets should typically disable during submission.
   */
  readonly submitting: Signal<boolean> | undefined

  constructor(options: SchemaContextOptions) {
    const {
      schema,
      definition,
      horizontal,
      path,
      ajv,
      isPropertyRequired,
      suppressLabel,
      schemaConflicts,
      notViolations,
      widgetRegistry,
      setStatus,
      formValue,
      validationMode,
      submitting,
    } = options
    this.schema = schema
    this.definition = definition
    this.horizontal = horizontal
    this.path = path
    this.ajv = ajv
    this.isPropertyRequired = isPropertyRequired ?? false
    this.suppressLabel = suppressLabel ?? false
    this.schemaConflicts = schemaConflicts ?? []
    this.notViolations = notViolations ?? []
    this.widgetRegistry = widgetRegistry
    this.setStatus = setStatus
    this.formValue = formValue
    this.validationMode = validationMode
    this.submitting = submitting
  }

  readonly with = (options: Partial<SchemaContextOptions>) => {
    return new SchemaContext({
      schema: options.schema ?? this.schema,
      definition: options.definition ?? this.definition,
      horizontal: options.horizontal ?? this.horizontal,
      path: options.path ?? this.path,
      ajv: options.ajv ?? this.ajv,
      isPropertyRequired: options.isPropertyRequired ?? this.isPropertyRequired,
      suppressLabel: options.suppressLabel ?? this.suppressLabel,
      schemaConflicts: options.schemaConflicts ?? this.schemaConflicts,
      notViolations: options.notViolations ?? this.notViolations,
      widgetRegistry: options.widgetRegistry ?? this.widgetRegistry,
      setStatus: options.setStatus ?? this.setStatus,
      formValue: options.formValue ?? this.formValue,
      validationMode: options.validationMode ?? this.validationMode,
      submitting: options.submitting ?? this.submitting,
    })
  }

  readonly append = (segment: PropertyKey) => {
    return this.with({ path: [...this.path, segment] })
  }

  get isRoot() {
    return this.path.length === 0
  }

  get name(): string | undefined {
    const last = this.path[this.path.length - 1]
    if (typeof last === 'string') {
      return last
    }
    return undefined
  }

  get widgetName(): string {
    return this.path.map(String).join('.')
  }

  get widgetLabel(): string | undefined {
    const name = this.name
    // Prefer explicit title when available; otherwise fall back to path-derived name
    const title =
      typeof this.definition === 'object' && this.definition !== null
        ? this.definition.title
        : undefined
    return title ?? (name != null ? upperCaseFirst(humanize(name)) : undefined)
  }

  readonly hasRequiredProperty = (name: string) => {
    if (typeof this.definition === 'boolean') return false
    return (
      this.definition.required != null &&
      this.definition.required.includes(name)
    )
  }

  get nullable() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.definition as any).nullable ?? false
  }

  get isNullable(): boolean {
    return (
      this.nullable ||
      this.hasType('null') ||
      this.hasEnumValue(null) ||
      this.hasConstValue(null) ||
      (this.anyOf?.some(ctx => ctx.isNullable) ?? false) ||
      (this.oneOf?.some(ctx => ctx.isNullable) ?? false)
    )
  }

  /**
   * Determines if this property is optional (can be absent from parent object).
   * This is different from nullable - optional means the key can be missing,
   * while nullable means the value can be explicitly null.
   */
  get isOptional(): boolean {
    return !this.isPropertyRequired
  }

  /**
   * Determines if this property should show a presence toggle.
   * Optional properties that are not at the root level should have presence toggles,
   * but primitive values that allow null should use nullable controls instead.
   */
  get shouldShowPresenceToggle(): boolean {
    if (!this.isOptional || this.isRoot) {
      return false
    }

    // For primitive values that are nullable, use nullable controls instead of presence toggles
    if ((this.isNullable || this.isOptional) && this.isPrimitive) {
      return false
    }

    return true
  }

  /**
   * Determines if this schema represents a primitive type (string, number, boolean, null).
   */
  get isPrimitive(): boolean {
    if (typeof this.definition === 'boolean') {
      return false
    }

    const def = this.definition

    // If no type is specified but has const or enum, consider it primitive
    if (def.const !== undefined || def.enum !== undefined) {
      return true
    }

    if (def.type) {
      const types = Array.isArray(def.type) ? def.type : [def.type]
      const primitiveTypes = ['string', 'number', 'integer', 'boolean']
      return types.every(type => primitiveTypes.includes(type))
    }

    return false
  }

  /**
   * Determines if this property is marked as readOnly.
   */
  get isReadOnly(): boolean {
    if (typeof this.definition === 'boolean') return false
    return Boolean(this.definition.readOnly)
  }

  /**
   * Determines if this property is marked as writeOnly.
   */
  get isWriteOnly(): boolean {
    if (typeof this.definition === 'boolean') return false
    return Boolean(this.definition.writeOnly)
  }

  /**
   * Determines if this property is marked as deprecated.
   */
  get isDeprecated(): boolean {
    if (typeof this.definition === 'boolean') return false
    return Boolean(
      (this.definition as unknown as Record<string, unknown>).deprecated
    )
  }

  /**
   * Checks if readOnly should be ignored based on x:ui.ignoreReadOnly.
   */
  get shouldIgnoreReadOnly(): boolean {
    if (typeof this.definition === 'boolean') return false
    const xuiRaw = (this.definition as unknown as Record<string, unknown>)[
      'x:ui'
    ]
    if (xuiRaw && typeof xuiRaw === 'object') {
      return Boolean((xuiRaw as Record<string, unknown>)['ignoreReadOnly'])
    }
    return false
  }

  /**
   * Checks if writeOnly should be shown based on x:ui.showWriteOnly.
   */
  get shouldShowWriteOnly(): boolean {
    if (typeof this.definition === 'boolean') return false
    const xuiRaw = (this.definition as unknown as Record<string, unknown>)[
      'x:ui'
    ]
    if (xuiRaw && typeof xuiRaw === 'object') {
      return Boolean((xuiRaw as Record<string, unknown>)['showWriteOnly'])
    }
    return false
  }

  get anyOf() {
    if (typeof this.definition === 'boolean') return undefined
    return Array.isArray(this.definition.anyOf)
      ? this.definition.anyOf.map(definition => {
          return this.with({ definition })
        })
      : undefined
  }

  get oneOf() {
    if (typeof this.definition === 'boolean') return undefined
    return Array.isArray(this.definition.oneOf)
      ? this.definition.oneOf.map(definition => {
          return this.with({ definition })
        })
      : undefined
  }

  get allOf() {
    if (typeof this.definition === 'boolean') return undefined
    return Array.isArray(this.definition.allOf)
      ? this.definition.allOf.map(definition => {
          return this.with({ definition })
        })
      : undefined
  }

  readonly hasType = (type: JSONSchemaType) => {
    if (this.definition === true) return true
    if (this.definition === false) return false
    return Array.isArray(this.definition.type)
      ? this.definition.type.includes(type)
      : this.definition.type === type
  }

  readonly hasEnumValue = (value: unknown) => {
    if (typeof this.definition === 'boolean') return false
    return Array.isArray(this.definition.enum)
      ? this.definition.enum.includes(value)
      : false
  }

  readonly hasConstValue = (value: unknown) => {
    if (typeof this.definition === 'boolean') return false
    return this.definition.const === value
  }

  get description() {
    if (typeof this.definition === 'boolean') return undefined
    return this.definition.description
  }

  get examples() {
    if (typeof this.definition === 'boolean') return undefined
    return this.definition.examples
  }

  get default() {
    if (typeof this.definition === 'boolean') return undefined
    return this.definition.default
  }
}

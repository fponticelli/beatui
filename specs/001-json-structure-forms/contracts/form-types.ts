/**
 * JSON Structure Form Component Types
 *
 * Runtime types for form rendering and state management
 */

import type { Value, Renderable } from '@tempots/dom'
import type { Controller } from '@tempots/ui'
import type { JSONStructureSchema, TypeDefinition } from './schema-types'

// =============================================================================
// Form Component Props
// =============================================================================

export interface JSONStructureFormProps<T = unknown> {
  /** JSON Structure schema document */
  schema: JSONStructureSchema

  /** Initial form value */
  initialValue?: T

  /** Validation mode */
  validationMode?: 'onSubmit' | 'onTouched' | 'eager'

  /** Debounce validation by milliseconds */
  validateDebounceMs?: number

  /** Form-level read-only mode */
  readOnly?: boolean

  /** Locale for altnames resolution */
  locale?: string

  /** Custom widget registry */
  widgetRegistry?: WidgetRegistry

  /** Called when form is submitted with valid data */
  onSubmit?: (value: T) => void | Promise<void>

  /** Called when validation state changes */
  onValidate?: (errors: ValidationError[]) => void

  /** Called when any value changes */
  onChange?: (value: T) => void
}

// =============================================================================
// Structure Context
// =============================================================================

export interface StructureContext {
  /** Root schema document */
  readonly schema: JSONStructureSchema

  /** Current type definition being rendered */
  readonly definition: TypeDefinition

  /** Path from root to current position */
  readonly path: ReadonlyArray<PropertyKey>

  /** Form-level read-only mode */
  readonly readOnly: boolean

  /** Locale for altnames resolution */
  readonly locale?: string

  /** Custom widget registry */
  readonly widgetRegistry?: WidgetRegistry

  /** Whether this property is required by parent */
  readonly isPropertyRequired: boolean

  /** Whether to suppress label rendering */
  readonly suppressLabel: boolean

  // Computed getters
  readonly isRequired: boolean
  readonly isNullable: boolean
  readonly isDeprecated: boolean
  readonly isAbstract: boolean
  readonly resolvedType: string | string[]
  readonly description: string | undefined
  readonly label: string
  readonly examples: unknown[] | undefined

  /** Create child context with updated fields */
  with(updates: Partial<StructureContextUpdates>): StructureContext
}

export interface StructureContextUpdates {
  definition: TypeDefinition
  path: ReadonlyArray<PropertyKey>
  isPropertyRequired: boolean
  suppressLabel: boolean
}

// =============================================================================
// Widget System
// =============================================================================

export interface WidgetFactory<T = unknown> {
  (props: WidgetProps<T>): Renderable
}

export interface WidgetProps<T = unknown> {
  /** Controller for this field's value */
  controller: Controller<T>

  /** Current structure context */
  ctx: StructureContext

  /** Widget-specific options */
  options?: Record<string, unknown>
}

export interface WidgetRegistration {
  /** Factory function to create the widget */
  factory: WidgetFactory

  /** Human-readable display name */
  displayName: string

  /** Optional description */
  description?: string

  /** JSON Structure types this widget handles */
  supportedTypes?: string[]

  /** Resolution priority (higher = preferred) */
  priority?: number

  /** Whether this can be used as fallback */
  canFallback?: boolean

  /** Custom matching logic */
  matcher?: (ctx: StructureContext) => boolean
}

export interface WidgetRegistry {
  /** Register a widget */
  register(name: string, registration: WidgetRegistration): void

  /** Get all registrations for a type */
  getForType(type: string): WidgetRegistration[]

  /** Find best matching widget for context */
  findBestWidget(ctx: StructureContext): ResolvedWidget | null

  /** Get registration by name */
  get(name: string): WidgetRegistration | undefined
}

export interface ResolvedWidget {
  name: string
  registration: WidgetRegistration
}

// =============================================================================
// Widget Registration Helpers
// =============================================================================

export interface WidgetRegistrationOptions {
  displayName?: string
  description?: string
  priority?: number
  canFallback?: boolean
}

/** Create registration for a specific type */
export type ForTypeRegistration = (
  type: string,
  factory: WidgetFactory,
  options?: WidgetRegistrationOptions
) => { name: string; registration: WidgetRegistration }

/** Create registration for a specific format */
export type ForFormatRegistration = (
  format: string,
  factory: WidgetFactory,
  options?: WidgetRegistrationOptions
) => { name: string; registration: WidgetRegistration }

/** Create registration for type + format combination */
export type ForTypeAndFormatRegistration = (
  type: string,
  format: string,
  factory: WidgetFactory,
  options?: WidgetRegistrationOptions
) => { name: string; registration: WidgetRegistration }

// =============================================================================
// Validation
// =============================================================================

export interface ValidationError {
  /** JSON Pointer path to error location */
  path: string

  /** Human-readable error message */
  message: string

  /** Error code for programmatic handling */
  code?: string
}

export interface ValidationResult {
  /** Overall validity */
  isValid: boolean

  /** List of validation errors */
  errors: ValidationError[]
}

export interface ControllerValidation {
  /** Error message for this field */
  message?: string

  /** Nested errors for child fields */
  dependencies?: Record<PropertyKey, ControllerError>
}

export interface ControllerError {
  message: string
}

// =============================================================================
// Form Controller Hook
// =============================================================================

export interface UseStructureControllerOptions<T = unknown> {
  schema: JSONStructureSchema
  initialValue?: T
  validationMode?: 'onSubmit' | 'onTouched' | 'eager'
  validateDebounceMs?: number
}

export interface UseStructureControllerResult<T = unknown> {
  /** Root controller for form value */
  controller: Controller<T>

  /** Trigger validation manually */
  validate: () => Promise<ValidationResult>

  /** Reset to initial value */
  reset: () => void

  /** Current validation errors (reactive) */
  errors: Value<ValidationError[]>

  /** Whether form has been modified (reactive) */
  isDirty: Value<boolean>

  /** Whether form is currently validating (reactive) */
  isValidating: Value<boolean>
}

// =============================================================================
// Control Component Props
// =============================================================================

export interface GenericControlProps<T = unknown> {
  controller: Controller<T>
  ctx: StructureContext
}

export interface ObjectControlProps {
  controller: Controller<Record<string, unknown>>
  ctx: StructureContext
}

export interface ArrayControlProps<T = unknown> {
  controller: Controller<T[]>
  ctx: StructureContext
}

export interface SetControlProps<T = unknown> {
  controller: Controller<T[]>
  ctx: StructureContext
}

export interface MapControlProps<T = unknown> {
  controller: Controller<Record<string, T>>
  ctx: StructureContext
}

export interface TupleControlProps {
  controller: Controller<unknown[]>
  ctx: StructureContext
}

export interface ChoiceControlProps {
  controller: Controller<Record<string, unknown>>
  ctx: StructureContext
}

export interface UnionControlProps {
  controller: Controller<unknown>
  ctx: StructureContext
}

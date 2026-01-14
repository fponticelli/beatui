/**
 * JSON Structure Form Components
 *
 * @packageDocumentation
 */

// Schema type definitions and utilities
export * from './structure-types'

// Context
export { StructureContext, createStructureContext } from './structure-context'
export type { StructureContextOptions, StructureContextUpdates } from './structure-context'

// $ref resolution utilities
export { resolveRef, resolveTypeReference, parseRefPath, RefResolver, createRefResolver } from './ref-utils'

// $extends inheritance utilities
export { resolveExtends, createExtendsResolver } from './extends-utils'
export type { InheritanceResult, InheritanceError } from './extends-utils'

// Controls
export { StructureGenericControl, StructureControl } from './controls/generic-control'
export type { GenericControlProps } from './controls/generic-control'

// Validation
export { createValidator, validate } from './validation/sdk-validator'
export type { ValidationResult, ValidatorOptions, StructureValidator } from './validation/sdk-validator'
export {
  formatValidationError,
  formatValidationErrors,
  groupErrorsByPath,
  getErrorsForPath,
  hasErrorsAtPath,
  getChildErrors,
} from './validation/error-transform'
export type { RawValidationError, FormattedValidationError } from './validation/error-transform'

// Widget registry
export {
  DefaultWidgetRegistry,
  getGlobalWidgetRegistry,
  setGlobalWidgetRegistry,
  createWidgetRegistry,
  forType,
  forFormat,
  forTypeAndFormat,
  forMatcher,
} from './widgets/widget-registry'
export type {
  WidgetProps,
  WidgetFactory,
  WidgetRegistration,
  ResolvedWidget,
  WidgetRegistry,
  WidgetRegistrationOptions,
} from './widgets/widget-registry'

// Widget utilities
export {
  resolveWidget,
  getWidgetOptions,
  getExplicitWidgetName,
  hasCustomWidget,
  resolveWidgetWithOverride,
  mergeWidgetOptions,
} from './widgets/widget-utils'
export type { WidgetOptions } from './widgets/widget-utils'

// Default widgets
export {
  registerDefaultWidgets,
  hasDefaultWidgets,
  ensureDefaultWidgets,
} from './widgets/default-widgets'

// Main form component
export { JSONStructureForm } from './json-structure-form'
export type { JSONStructureFormProps, ValidationMode } from './json-structure-form'

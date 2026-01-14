/**
 * JSON Structure Form Components - Public API
 *
 * @packageDocumentation
 */

// Schema type definitions
export type {
  // Primitive types
  PrimitiveType,
  CompoundType,
  TypeKeyword,

  // Type references and specifiers
  TypeReference,
  TypeSpecifier,

  // Validation constraints
  StringValidation,
  NumericValidation,
  ArrayValidation,
  ObjectValidation,

  // Metadata
  Altnames,
  TypeMetadata,

  // Type definitions
  BaseTypeDefinition,
  ObjectTypeDefinition,
  ArrayTypeDefinition,
  SetTypeDefinition,
  MapTypeDefinition,
  TupleTypeDefinition,
  ChoiceTypeDefinition,
  DecimalTypeDefinition,
  StringTypeDefinition,
  IntegerTypeDefinition,
  FloatTypeDefinition,
  EnumTypeDefinition,
  ConstTypeDefinition,
  TypeDefinition,

  // Schema document
  JSONStructureSchema,
  Namespace,
} from './schema-types'

export { isNamespace, isTypeDefinition } from './schema-types'

// Form component types
export type {
  // Main form props
  JSONStructureFormProps,

  // Context
  StructureContext,
  StructureContextUpdates,

  // Widget system
  WidgetFactory,
  WidgetProps,
  WidgetRegistration,
  WidgetRegistry,
  ResolvedWidget,
  WidgetRegistrationOptions,
  ForTypeRegistration,
  ForFormatRegistration,
  ForTypeAndFormatRegistration,

  // Validation
  ValidationError,
  ValidationResult,
  ControllerValidation,
  ControllerError,

  // Controller hook
  UseStructureControllerOptions,
  UseStructureControllerResult,

  // Control props
  GenericControlProps,
  ObjectControlProps,
  ArrayControlProps,
  SetControlProps,
  MapControlProps,
  TupleControlProps,
  ChoiceControlProps,
  UnionControlProps,
} from './form-types'

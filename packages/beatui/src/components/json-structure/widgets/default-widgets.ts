/**
 * Default Widget Registrations
 *
 * Registers default widgets for all JSON Structure types.
 */

import type { WidgetRegistry, WidgetFactory } from './widget-registry'
import { getGlobalWidgetRegistry } from './widget-registry'

// Import all control components
import { StructureStringControl } from '../controls/string-control'
import { StructureBooleanControl } from '../controls/boolean-control'
import { StructureIntegerControl } from '../controls/integer-control'
import { StructureDecimalControl } from '../controls/decimal-control'
import { StructureUuidControl } from '../controls/uuid-control'
import { StructureTemporalControl } from '../controls/temporal-control'
import { StructureUriControl } from '../controls/uri-control'
import { StructureBinaryControl } from '../controls/binary-control'
import { StructureAnyControl } from '../controls/any-control'
import { StructureObjectControl } from '../controls/object-control'
import { StructureArrayControl } from '../controls/array-control'
import { StructureSetControl } from '../controls/set-control'
import { StructureMapControl } from '../controls/map-control'
import { StructureTupleControl } from '../controls/tuple-control'
import { StructureChoiceControl } from '../controls/choice-control'
import {
  StructureEnumControl,
  StructureConstControl,
} from '../controls/enum-const-controls'

import type { Controller, ObjectController, ArrayController } from '../../form'
import type { IntegerType, FloatType, TemporalType } from '../structure-types'
import { Temporal } from '@js-temporal/polyfill'

/**
 * Register all default widgets for JSON Structure types
 *
 * @param registry - Widget registry to register to (defaults to global)
 */
export function registerDefaultWidgets(
  registry: WidgetRegistry = getGlobalWidgetRegistry()
): void {
  // String type
  registry.register('string', {
    factory: ({ controller, ctx }) =>
      StructureStringControl({
        ctx,
        controller: controller as Controller<string | undefined>,
      }),
    displayName: 'String',
    description: 'Text input for string values',
    supportedTypes: ['string'],
    priority: 0,
    canFallback: true,
  })

  // Boolean type
  registry.register('boolean', {
    factory: ({ controller, ctx }) =>
      StructureBooleanControl({
        ctx,
        controller: controller as Controller<boolean | null>,
      }),
    displayName: 'Boolean',
    description: 'Checkbox for boolean values',
    supportedTypes: ['boolean'],
    priority: 0,
    canFallback: true,
  })

  // UUID type
  registry.register('uuid', {
    factory: ({ controller, ctx }) =>
      StructureUuidControl({
        ctx,
        controller: controller as Controller<string | undefined>,
      }),
    displayName: 'UUID',
    description: 'Input for UUID values',
    supportedTypes: ['uuid'],
    priority: 0,
    canFallback: true,
  })

  // URI type
  registry.register('uri', {
    factory: ({ controller, ctx }) =>
      StructureUriControl({
        ctx,
        controller: controller as Controller<string | undefined>,
      }),
    displayName: 'URI',
    description: 'Input for URI/URL values',
    supportedTypes: ['uri'],
    priority: 0,
    canFallback: true,
  })

  // Binary type
  registry.register('binary', {
    factory: ({ controller, ctx }) =>
      StructureBinaryControl({
        ctx,
        controller: controller as Controller<File | undefined>,
      }),
    displayName: 'Binary',
    description: 'File upload for binary data',
    supportedTypes: ['binary'],
    priority: 0,
    canFallback: true,
  })

  // Any type
  registry.register('any', {
    factory: ({ controller, ctx }) =>
      StructureAnyControl({
        ctx,
        controller: controller as Controller<unknown>,
      }),
    displayName: 'Any',
    description: 'Generic control for any type',
    supportedTypes: ['any'],
    priority: 0,
    canFallback: true,
  })

  // Integer types - register a single factory that handles all integer types
  const integerTypes: IntegerType[] = [
    'int8',
    'int16',
    'int32',
    'int64',
    'int128',
    'uint8',
    'uint16',
    'uint32',
    'uint64',
    'uint128',
  ]

  const integerFactory: WidgetFactory = ({ controller, ctx }) =>
    StructureIntegerControl({
      ctx,
      controller: controller as Controller<number | bigint | null>,
      intType: ctx.primaryType as IntegerType,
    })

  for (const intType of integerTypes) {
    registry.register(intType, {
      factory: integerFactory,
      displayName: intType.toUpperCase(),
      description: `Number input for ${intType} values`,
      supportedTypes: [intType],
      priority: 0,
      canFallback: true,
    })
  }

  // Float types - register a single factory that handles all float types
  const floatTypes: FloatType[] = ['float', 'double', 'decimal']

  const floatFactory: WidgetFactory = ({ controller, ctx }) =>
    StructureDecimalControl({
      ctx,
      controller: controller as Controller<number | null>,
      floatType: ctx.primaryType as FloatType,
    })

  for (const floatType of floatTypes) {
    registry.register(floatType, {
      factory: floatFactory,
      displayName: floatType.charAt(0).toUpperCase() + floatType.slice(1),
      description: `Number input for ${floatType} values`,
      supportedTypes: [floatType],
      priority: 0,
      canFallback: true,
    })
  }

  // Temporal types - register a single factory that handles all temporal types
  const temporalTypes: TemporalType[] = ['date', 'datetime', 'time', 'duration']

  const temporalFactory: WidgetFactory = ({ controller, ctx }) =>
    StructureTemporalControl({
      ctx,
      controller: controller as Controller<
        | Temporal.PlainDate
        | Temporal.PlainDateTime
        | Temporal.PlainTime
        | Temporal.Duration
        | null
      >,
      temporalType: ctx.primaryType as TemporalType,
    })

  for (const temporalType of temporalTypes) {
    registry.register(temporalType, {
      factory: temporalFactory,
      displayName: temporalType.charAt(0).toUpperCase() + temporalType.slice(1),
      description: `Input for ${temporalType} values`,
      supportedTypes: [temporalType],
      priority: 0,
      canFallback: true,
    })
  }

  // Object type
  registry.register('object', {
    factory: ({ controller, ctx }) =>
      StructureObjectControl({
        ctx,
        controller: controller as unknown as ObjectController<{
          [key: string]: unknown
        }>,
      }),
    displayName: 'Object',
    description: 'Form for object values',
    supportedTypes: ['object'],
    priority: 0,
    canFallback: true,
  })

  // Array type
  registry.register('array', {
    factory: ({ controller, ctx }) =>
      StructureArrayControl({
        ctx,
        controller: controller as unknown as ArrayController<unknown[]>,
      }),
    displayName: 'Array',
    description: 'List control for array values',
    supportedTypes: ['array'],
    priority: 0,
    canFallback: true,
  })

  // Set type
  registry.register('set', {
    factory: ({ controller, ctx }) =>
      StructureSetControl({
        ctx,
        controller: controller as unknown as ArrayController<unknown[]>,
      }),
    displayName: 'Set',
    description: 'Set control for unique values',
    supportedTypes: ['set'],
    priority: 0,
    canFallback: true,
  })

  // Map type
  registry.register('map', {
    factory: ({ controller, ctx }) =>
      StructureMapControl({
        ctx,
        controller: controller as unknown as ObjectController<{
          [key: string]: unknown
        }>,
      }),
    displayName: 'Map',
    description: 'Map control for key-value pairs',
    supportedTypes: ['map'],
    priority: 0,
    canFallback: true,
  })

  // Tuple type
  registry.register('tuple', {
    factory: ({ controller, ctx }) =>
      StructureTupleControl({
        ctx,
        controller: controller as unknown as ArrayController<unknown[]>,
      }),
    displayName: 'Tuple',
    description: 'Tuple control for fixed-length arrays',
    supportedTypes: ['tuple'],
    priority: 0,
    canFallback: true,
  })

  // Choice type
  registry.register('choice', {
    factory: ({ controller, ctx }) =>
      StructureChoiceControl({
        ctx,
        controller: controller as Controller<unknown>,
      }),
    displayName: 'Choice',
    description: 'Choice control for union types',
    supportedTypes: ['choice'],
    priority: 0,
    canFallback: true,
  })

  // Enum matcher - higher priority for enum-constrained fields
  registry.register('enum', {
    factory: ({ controller, ctx }) =>
      StructureEnumControl({
        ctx,
        controller: controller as Controller<unknown>,
      }),
    displayName: 'Enum',
    description: 'Dropdown for enumerated values',
    priority: 10, // Higher priority than base types
    canFallback: false,
    matcher: ctx => ctx.hasEnum,
  })

  // Const matcher - highest priority for const fields
  registry.register('const', {
    factory: ({ controller, ctx }) =>
      StructureConstControl({
        ctx,
        controller: controller as Controller<unknown>,
      }),
    displayName: 'Const',
    description: 'Display for constant values',
    priority: 20, // Highest priority
    canFallback: false,
    matcher: ctx => ctx.hasConst,
  })
}

/**
 * Check if default widgets have been registered
 *
 * @param registry - Registry to check (defaults to global)
 * @returns True if default widgets are registered
 */
export function hasDefaultWidgets(
  registry: WidgetRegistry = getGlobalWidgetRegistry()
): boolean {
  // Check for a few key widgets
  return (
    registry.has('string') && registry.has('object') && registry.has('array')
  )
}

/**
 * Ensure default widgets are registered
 *
 * Only registers if not already registered.
 *
 * @param registry - Registry to ensure (defaults to global)
 */
export function ensureDefaultWidgets(
  registry: WidgetRegistry = getGlobalWidgetRegistry()
): void {
  if (!hasDefaultWidgets(registry)) {
    registerDefaultWidgets(registry)
  }
}

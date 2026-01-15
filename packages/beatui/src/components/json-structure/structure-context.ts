/**
 * Structure Context
 *
 * Immutable context object threaded through the form rendering tree.
 * Provides access to schema, definition, path, and computed properties.
 */

import { humanize, upperCaseFirst } from '@tempots/std'
import type {
  JSONStructureSchema,
  TypeDefinition,
  TypeKeyword,
  Altnames,
} from './structure-types'
import {
  isNullableType,
  getNonNullTypes,
  isPrimitiveType,
  isTypeReference,
  getResolvedType,
} from './structure-types'
import { RefResolver, createRefResolver } from './ref-utils'
import type { WidgetRegistry } from './widgets/widget-registry'

/**
 * Options for creating a StructureContext
 */
export interface StructureContextOptions {
  /** Root schema document */
  schema: JSONStructureSchema
  /** Current type definition being rendered */
  definition: TypeDefinition
  /** Path from root to current position */
  path: ReadonlyArray<PropertyKey>
  /** Form-level read-only mode */
  readOnly?: boolean
  /** Locale for altnames resolution */
  locale?: string
  /** Custom widget registry */
  widgetRegistry?: WidgetRegistry
  /** Whether this property is required by parent */
  isPropertyRequired?: boolean
  /** Whether to suppress label rendering */
  suppressLabel?: boolean
  /** Shared ref resolver for the schema */
  refResolver?: RefResolver
}

/**
 * Updates that can be passed to context.with()
 */
export interface StructureContextUpdates {
  definition?: TypeDefinition
  path?: ReadonlyArray<PropertyKey>
  readOnly?: boolean
  locale?: string
  widgetRegistry?: WidgetRegistry
  isPropertyRequired?: boolean
  suppressLabel?: boolean
}

/**
 * Immutable context for JSON Structure form rendering
 */
export class StructureContext {
  readonly schema: JSONStructureSchema
  readonly definition: TypeDefinition
  readonly path: ReadonlyArray<PropertyKey>
  readonly readOnly: boolean
  readonly locale: string | undefined
  readonly widgetRegistry: WidgetRegistry | undefined
  readonly isPropertyRequired: boolean
  readonly suppressLabel: boolean
  private readonly refResolver: RefResolver

  constructor(options: StructureContextOptions) {
    this.schema = options.schema
    this.definition = options.definition
    this.path = options.path
    this.readOnly = options.readOnly ?? false
    this.locale = options.locale
    this.widgetRegistry = options.widgetRegistry
    this.isPropertyRequired = options.isPropertyRequired ?? false
    this.suppressLabel = options.suppressLabel ?? false
    this.refResolver = options.refResolver ?? createRefResolver(options.schema)
  }

  /**
   * Create a new context with updated fields
   */
  with(updates: StructureContextUpdates): StructureContext {
    return new StructureContext({
      schema: this.schema,
      definition: updates.definition ?? this.definition,
      path: updates.path ?? this.path,
      readOnly: updates.readOnly ?? this.readOnly,
      locale: updates.locale ?? this.locale,
      widgetRegistry: updates.widgetRegistry ?? this.widgetRegistry,
      isPropertyRequired: updates.isPropertyRequired ?? this.isPropertyRequired,
      suppressLabel: updates.suppressLabel ?? this.suppressLabel,
      refResolver: this.refResolver,
    })
  }

  /**
   * Create a child context by appending to the path
   */
  append(segment: PropertyKey): StructureContext {
    return this.with({ path: [...this.path, segment] })
  }

  /**
   * Check if this is the root context
   */
  get isRoot(): boolean {
    return this.path.length === 0
  }

  /**
   * Get the property name (last segment of path)
   */
  get name(): string | undefined {
    const last = this.path[this.path.length - 1]
    return typeof last === 'string' ? last : undefined
  }

  /**
   * Get the widget name (dot-separated path)
   */
  get widgetName(): string {
    return this.path.map(String).join('.')
  }

  /**
   * Get the resolved type(s) from the definition
   */
  get resolvedType(): TypeKeyword | TypeKeyword[] | null {
    const typeSpec = this.definition.type
    if (!typeSpec) return null

    // Handle $ref in type specifier
    if (isTypeReference(typeSpec)) {
      const resolved = this.refResolver.resolve(typeSpec.$ref)
      if (resolved?.type) {
        return getResolvedType(resolved.type) as
          | TypeKeyword
          | TypeKeyword[]
          | null
      }
      return null
    }

    return getResolvedType(typeSpec) as TypeKeyword | TypeKeyword[] | null
  }

  /**
   * Get the primary type (first non-null type)
   */
  get primaryType(): TypeKeyword | null {
    const resolved = this.resolvedType
    if (!resolved) return null
    if (typeof resolved === 'string') {
      return resolved === 'null' ? null : resolved
    }
    const nonNull = getNonNullTypes(resolved)
    return nonNull[0] ?? null
  }

  /**
   * Check if this type is nullable
   */
  get isNullable(): boolean {
    return isNullableType(this.definition.type)
  }

  /**
   * Check if this is a required field
   */
  get isRequired(): boolean {
    return this.isPropertyRequired
  }

  /**
   * Check if this is an optional field (can be absent)
   */
  get isOptional(): boolean {
    return !this.isPropertyRequired
  }

  /**
   * Check if this field is deprecated
   */
  get isDeprecated(): boolean {
    return this.definition.deprecated === true
  }

  /**
   * Check if this type is abstract
   */
  get isAbstract(): boolean {
    return this.definition.abstract === true
  }

  /**
   * Check if this is a primitive type
   */
  get isPrimitive(): boolean {
    const primary = this.primaryType
    return primary != null && isPrimitiveType(primary)
  }

  /**
   * Get the description from the definition
   */
  get description(): string | undefined {
    return this.definition.description
  }

  /**
   * Get examples from the definition
   */
  get examples(): unknown[] | undefined {
    return this.definition.examples
  }

  /**
   * Get the default value from the definition
   */
  get defaultValue(): unknown {
    return this.definition.default
  }

  /**
   * Get the unit for numeric values
   */
  get unit(): string | undefined {
    return this.definition.unit
  }

  /**
   * Get the currency for monetary values
   */
  get currency(): string | undefined {
    return this.definition.currency
  }

  /**
   * Get the label for this field
   *
   * Resolution order:
   * 1. Locale-specific altname (if locale is set)
   * 2. Definition name
   * 3. Humanized path name
   */
  get label(): string {
    // Try locale-specific altname first
    if (this.locale && this.definition.altnames) {
      const localeKey = `lang:${this.locale}` as const
      const localeName = this.definition.altnames[localeKey]
      if (localeName) return localeName
    }

    // Try definition name
    if (this.definition.name) {
      return this.definition.name
    }

    // Fall back to humanized path name
    const pathName = this.name
    if (pathName) {
      return upperCaseFirst(humanize(pathName))
    }

    return ''
  }

  /**
   * Get altnames from the definition
   */
  get altnames(): Altnames | undefined {
    return this.definition.altnames
  }

  /**
   * Get the JSON path string (for validation error matching)
   */
  get jsonPath(): string {
    if (this.path.length === 0) return ''
    return '/' + this.path.map(String).join('/')
  }

  /**
   * Resolve a $ref using the shared resolver
   */
  resolveRef(ref: string): TypeDefinition | undefined {
    return this.refResolver.resolve(ref)
  }

  /**
   * Check if this definition has an enum constraint
   */
  get hasEnum(): boolean {
    return 'enum' in this.definition && Array.isArray(this.definition.enum)
  }

  /**
   * Get enum values if present
   */
  get enumValues(): unknown[] | undefined {
    if ('enum' in this.definition) {
      return this.definition.enum as unknown[]
    }
    return undefined
  }

  /**
   * Check if this definition has a const constraint
   */
  get hasConst(): boolean {
    return 'const' in this.definition
  }

  /**
   * Get const value if present
   */
  get constValue(): unknown {
    if ('const' in this.definition) {
      return (this.definition as { const: unknown }).const
    }
    return undefined
  }

  /**
   * Get string format if defined (for string types)
   */
  get format(): string | undefined {
    if ('format' in this.definition) {
      return (this.definition as { format?: string }).format
    }
    return undefined
  }
}

/**
 * Create a root context from a schema
 */
export function createStructureContext(
  schema: JSONStructureSchema,
  options?: Partial<
    Omit<StructureContextOptions, 'schema' | 'definition' | 'path'>
  >
): StructureContext {
  // Determine the root definition
  // If $root is specified, resolve that definition
  // Otherwise, use the schema itself as the definition
  let rootDefinition: TypeDefinition

  const refResolver = createRefResolver(schema)

  if (schema.$root) {
    const resolved = refResolver.resolve(schema.$root)
    if (resolved) {
      rootDefinition = resolved
    } else {
      console.warn(`Failed to resolve $root: ${schema.$root}`)
      rootDefinition = schema as unknown as TypeDefinition
    }
  } else if (schema.type || schema.properties) {
    // Schema has type or properties at root level
    rootDefinition = schema as unknown as TypeDefinition
  } else {
    // Fallback - treat schema as any type
    rootDefinition = { type: 'any' } as TypeDefinition
  }

  return new StructureContext({
    schema,
    definition: rootDefinition,
    path: [],
    readOnly: options?.readOnly,
    locale: options?.locale,
    widgetRegistry: options?.widgetRegistry,
    refResolver,
  })
}

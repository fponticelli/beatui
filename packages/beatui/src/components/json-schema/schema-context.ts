import { humanize, upperCaseFirst } from '@tempots/std'
import type {
  JSONSchema7Definition,
  JSONSchema7Type,
  JSONSchema7TypeName,
} from 'json-schema'
import type Ajv from 'ajv'

export type SchemaContextOptions = {
  schema: JSONSchema7Definition
  definition: JSONSchema7Definition
  horizontal: boolean
  path: ReadonlyArray<PropertyKey>
  ajv?: Ajv
  isPropertyRequired?: boolean
  suppressLabel?: boolean
}

export class SchemaContext {
  readonly schema: JSONSchema7Definition
  readonly definition: JSONSchema7Definition
  readonly horizontal: boolean
  readonly path: ReadonlyArray<PropertyKey>
  readonly ajv: Ajv | undefined
  readonly isPropertyRequired: boolean
  readonly suppressLabel: boolean
  constructor(options: SchemaContextOptions) {
    const {
      schema,
      definition,
      horizontal,
      path,
      ajv,
      isPropertyRequired,
      suppressLabel,
    } = options
    this.schema = schema
    this.definition = definition
    this.horizontal = horizontal
    this.path = path
    this.ajv = ajv
    this.isPropertyRequired = isPropertyRequired ?? false
    this.suppressLabel = suppressLabel ?? false
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
    if (typeof this.definition === 'boolean') return undefined
    return (
      this.definition.title ??
      (this.name != null ? upperCaseFirst(humanize(this.name!)) : undefined)
    )
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
      this.nullable ??
      (this.hasType('null') ||
        this.hasEnumValue(null) ||
        this.hasConstValue(null) ||
        this.anyOf?.some(ctx => ctx.isNullable) ||
        this.oneOf?.some(ctx => ctx.isNullable))
    )
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

  readonly hasType = (type: JSONSchema7TypeName) => {
    if (this.definition === true) return true
    if (this.definition === false) return false
    return Array.isArray(this.definition.type)
      ? this.definition.type.includes(type)
      : this.definition.type === type
  }

  readonly hasEnumValue = (value: JSONSchema7Type) => {
    if (typeof this.definition === 'boolean') return false
    return Array.isArray(this.definition.enum)
      ? this.definition.enum.includes(value)
      : false
  }

  readonly hasConstValue = (value: JSONSchema7Type) => {
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

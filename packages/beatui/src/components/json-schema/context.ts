import type { JSONSchema7, JSONSchema7Definition } from 'json-schema'

export type SchemaContextOptions = {
  schema: JSONSchema7Definition
  definition?: JSONSchema7
  horizontal: boolean
  required: boolean
  path: ReadonlyArray<PropertyKey>
}

export class SchemaContext {
  readonly schema: JSONSchema7Definition
  readonly definition: JSONSchema7
  readonly horizontal: boolean
  readonly required: boolean
  readonly path: ReadonlyArray<PropertyKey>
  constructor(options: SchemaContextOptions) {
    const { schema, definition, horizontal, required, path } = options
    this.schema = schema
    this.definition =
      typeof definition === 'undefined'
        ? typeof schema === 'boolean'
          ? ({} as JSONSchema7)
          : ((schema ?? {}) as JSONSchema7)
        : definition
    this.horizontal = horizontal
    this.required = required
    this.path = path
  }

  readonly with = (options: Partial<SchemaContextOptions>) => {
    return new SchemaContext({
      schema: options.schema ?? this.schema,
      definition: options.definition ?? this.definition,
      horizontal: options.horizontal ?? this.horizontal,
      required: options.required ?? this.required,
      path: options.path ?? this.path,
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
}

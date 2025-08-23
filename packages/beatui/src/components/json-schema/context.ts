import type { JSONSchema7, JSONSchema7Definition } from 'json-schema'

export type SchemaContextOptions = {
  schema: JSONSchema7Definition
  definition?: JSONSchema7
  horizontal: boolean
  required: boolean
  isRoot: boolean
}

export class SchemaContext {
  readonly schema: JSONSchema7Definition
  readonly definition: JSONSchema7
  readonly horizontal: boolean
  readonly required: boolean
  readonly isRoot: boolean
  constructor(options: SchemaContextOptions) {
    const { schema, definition, horizontal, required, isRoot } = options
    this.schema = schema
    this.definition =
      typeof definition === 'undefined'
        ? typeof schema === 'boolean'
          ? ({} as JSONSchema7)
          : ((schema ?? {}) as JSONSchema7)
        : definition
    this.horizontal = horizontal
    this.required = required
    this.isRoot = isRoot
  }

  readonly with = (options: Partial<SchemaContextOptions>) => {
    return new SchemaContext({
      schema: options.schema ?? this.schema,
      definition: options.definition ?? this.definition,
      horizontal: options.horizontal ?? this.horizontal,
      required: options.required ?? this.required,
      isRoot: options.isRoot ?? false,
    })
  }
}

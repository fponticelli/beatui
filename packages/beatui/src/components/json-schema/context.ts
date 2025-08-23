import type { JSONSchema7, JSONSchema7Definition } from 'json-schema'

export class SchemaContext {
  readonly schema: JSONSchema7Definition
  readonly definition: JSONSchema7
  readonly horizontal: boolean
  readonly required: boolean
  constructor(
    schema: JSONSchema7Definition,
    definition: JSONSchema7 | undefined,
    horizontal: boolean,
    required: boolean
  ) {
    this.schema = schema
    this.definition =
      typeof definition === 'undefined'
        ? typeof schema === 'boolean'
          ? ({} as JSONSchema7)
          : ((schema ?? {}) as JSONSchema7)
        : definition
    this.horizontal = horizontal
    this.required = required
  }

  readonly withDefinition = (definition: JSONSchema7Definition) => {
    if (definition === true) {
      return new SchemaContext(
        true,
        {} as JSONSchema7,
        this.horizontal,
        this.required
      )
    }
    if (definition === false) {
      throw new Error('Not implemented: false schema')
    }
    return new SchemaContext(this.schema, definition, this.horizontal, false)
  }
  readonly withHorizontal = (horizontal: boolean) =>
    new SchemaContext(this.schema, this.definition, horizontal, false)
  readonly withRequired = (required: boolean) =>
    new SchemaContext(this.schema, this.definition, this.horizontal, required)
}

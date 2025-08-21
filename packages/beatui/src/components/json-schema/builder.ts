import type { JSONSchema7, JSONSchema7Definition } from 'json-schema'
import {
  ArrayController,
  CheckboxControl,
  Controller,
  ControllerError,
  ControllerValidation,
  InputWrapperOptions,
  ListControl,
  NumberControl,
  ObjectController,
  PathSegment,
  TextControl,
  useController,
} from '../form'
import { attr, TNode, Value, WithElement } from '@tempots/dom'
import { Stack } from '../layout'
import { objectEntries, Validation } from '@tempots/std'
import Ajv, { type ErrorObject } from 'ajv'

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
          ? {}
          : (schema ?? {})
        : definition
    this.horizontal = horizontal
    this.required = required
  }

  readonly withDefinition = (definition: JSONSchema7Definition) => {
    if (definition === true) {
      return new SchemaContext(true, {}, this.horizontal, this.required)
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

export function JSONSchemaAny({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<unknown>
}): TNode {
  return JSONSchemaUnion({
    ctx: ctx.withDefinition({
      ...ctx.definition,
      type: ['string', 'number', 'object', 'array', 'boolean', 'null'],
    }),
    controller: controller as unknown as Controller<unknown>,
  })
}

function definitionToInputWrapperOptions({
  ctx,
}: {
  ctx: SchemaContext
}): Partial<InputWrapperOptions> {
  const { definition } = ctx
  let description = definition.description
  if (
    description == null &&
    definition.examples != null &&
    definition.default != null
  ) {
    if (Array.isArray(definition.examples)) {
      description = `example: ${definition.examples[0]}`
    } else {
      description = `example: ${definition.examples}`
    }
  }
  return {
    label: definition.title,
    description,
    required: ctx.required,
    horizontal: ctx.horizontal,
  }
}

export function JSONSchemaNever({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<never>
}): TNode {
  console.log(ctx, controller)
  // TODO
  throw new Error('Not implemented: never')
}

function makePlaceholder<T>(
  definition: JSONSchema7,
  converter: (value: unknown) => T
) {
  if (definition.default != null) {
    return converter(definition.default)
  }
  if (Array.isArray(definition.examples)) {
    return converter(definition.examples[0])
  }
  if (definition.examples != null) {
    return converter(definition.examples)
  }
  return undefined
}

export function JSONSchemaNumber({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<number>
}): TNode {
  return NumberControl({
    ...definitionToInputWrapperOptions({ ctx }),
    controller,
    placeholder: makePlaceholder(ctx.definition, String),
    min: ctx.definition.minimum,
    max: ctx.definition.maximum,
    step: ctx.definition.multipleOf,
  })
}

function integerMultipleOf(multipleOf?: number) {
  if (multipleOf == null) return 1
  // ensure multipleOf is an integer
  return Math.round(multipleOf)
}

export function JSONSchemaInteger({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<number>
}): TNode {
  return JSONSchemaNumber({
    ctx: ctx.withDefinition({
      ...ctx.definition,
      multipleOf: integerMultipleOf(ctx.definition.multipleOf),
    }),
    controller,
  })
}

export function JSONSchemaString({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<string>
}): TNode {
  // TODO: format
  // TODO: minLength
  // TODO: maxLength
  // TODO: pattern
  // TODO: contentEncoding
  // TODO: contentMediaType
  // TODO: contentSchema
  return TextControl({
    ...definitionToInputWrapperOptions({ ctx }),
    controller,
    placeholder: makePlaceholder(ctx.definition, String),
  })
}

export function JSONSchemaBoolean({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<boolean>
}): TNode {
  return CheckboxControl({
    ...definitionToInputWrapperOptions({ ctx }),
    controller,
  })
}

export function JSONSchemaNull({
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<null>
}): TNode {
  // TODO is this right?
  return WithElement(() => {
    controller.change(null)
  })
}

export function JSONSchemaArray({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: ArrayController<unknown[]>
}): TNode {
  // TODO items when array/tuple
  // TODO prefixItems
  // TODO additionalItems
  // TODO minItems
  // TODO maxItems
  // TODO uniqueItems
  // TODO unevaluatedItems
  return ListControl({
    ...definitionToInputWrapperOptions({ ctx }),
    createItem: () => makePlaceholder(ctx.definition, () => undefined),
    controller,
    element: payload => {
      const item = payload.item as Controller<unknown>
      const definition = Array.isArray(ctx.definition.items)
        ? ctx.definition.items[payload.position.index]
        : (ctx.definition.items ?? {})
      return JSONSchemaGenericControl({
        ctx: ctx.withDefinition(definition),
        controller: item,
      })
    },
  })
}

export function JSONSchemaObject({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: ObjectController<{ [key: string]: unknown }>
}): TNode {
  console.log(ctx, controller)
  // TODO minProperties
  // TODO maxProperties
  // TODO patternProperties
  // TODO additionalProperties
  // TODO unevaluatedProperties
  // TODO propertyNames
  // TODO dependencies
  // TODO dependentRequired/dependentSchemas

  // TODO missing properties

  return Stack(
    attr.class('bu-gap-1'),
    ...objectEntries(ctx.definition.properties ?? {}).map(([k, value]) => {
      const key = k as string
      const field = controller.field(key)
      return JSONSchemaGenericControl({
        ctx: ctx
          .withDefinition(value)
          .withRequired(ctx.definition.required?.includes(key) ?? false),
        controller: field,
      })
    })
  )
}

export function JSONSchemaUnion<T>({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<T>
}): TNode {
  console.log(ctx, controller)
  // TODO
  throw new Error('Not implemented: union')
}

export function JSONSchemaControl<T>({
  schema,
  controller,
}: {
  schema: JSONSchema7Definition
  controller: Controller<T>
}): TNode {
  const ctx = new SchemaContext(schema, undefined, false, true)
  if (schema === true) {
    return JSONSchemaAny({ ctx, controller: controller as Controller<unknown> })
  }
  if (schema === false) {
    return JSONSchemaNever({
      ctx,
      controller: controller as unknown as Controller<never>,
    })
  }
  return JSONSchemaGenericControl({ ctx, controller })
}

export function JSONSchemaGenericControl<T>({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<T>
}): TNode {
  // other considerations:
  // TODO enum
  // TODO const
  // TODO oneOf
  // TODO anyOf
  // TODO allOf
  // TODO not

  // deprecated (2020-12)
  // readOnly / writeOnly
  const { definition } = ctx
  if (definition?.type == null) {
    // TODO this is any type: same as ["string", "number", "object", "array", "boolean", "null"]
    // TODO unless there are constraints on the properties or other attributes
    return JSONSchemaAny({ ctx, controller: controller as Controller<unknown> })
  }
  if (Array.isArray(definition.type)) {
    return JSONSchemaUnion({
      ctx,
      controller: controller as Controller<unknown>,
    })
  }
  switch (definition.type) {
    case 'number':
      return JSONSchemaNumber({
        ctx,
        controller: controller as unknown as Controller<number>,
      })
    case 'integer':
      return JSONSchemaInteger({
        ctx,
        controller: controller as unknown as Controller<number>,
      })
    case 'string':
      return JSONSchemaString({
        ctx,
        controller: controller as unknown as Controller<string>,
      })
    case 'boolean':
      return JSONSchemaBoolean({
        ctx,
        controller: controller as unknown as Controller<boolean>,
      })
    case 'array':
      return JSONSchemaArray({
        ctx,
        controller:
          controller instanceof ArrayController
            ? controller
            : (controller.array() as unknown as ArrayController<unknown[]>),
      })
    case 'object':
      return JSONSchemaObject({
        ctx,
        controller: (controller instanceof ObjectController
          ? controller
          : controller.object()) as ObjectController<{
          [key: string]: unknown
        }>,
      })
    case 'null':
      return JSONSchemaNull({
        ctx,
        controller: controller as unknown as Controller<null>,
      })
    default:
      throw new Error(`Not implemented: unknown type ${definition.type}`)
  }
}

export function jsonPointerToSegments(ptr: string): PropertyKey[] {
  return ptr
    .split('/')
    .slice(1)
    .map(s => s.replace(/~1/g, '/').replace(/~0/g, '~'))
}

export function buildPath(
  err: ErrorObject
): ReadonlyArray<PropertyKey> | undefined {
  const base = jsonPointerToSegments(err.instancePath || '')
  if (err.keyword === 'required') {
    const mp = (err.params as { missingProperty?: string }).missingProperty
    if (mp != null) return [...base, mp]
  }
  if (err.keyword === 'additionalProperties') {
    const ap = (err.params as { additionalProperty?: string })
      .additionalProperty
    if (ap != null) return [...base, ap]
  }
  if (err.keyword === 'unevaluatedProperties') {
    const up = (err.params as { unevaluatedProperty?: string })
      .unevaluatedProperty
    if (up != null) return [...base, up]
  }
  return base.length > 0 ? base : undefined
}

export function buildMessage(err: ErrorObject): string {
  // Prefer AJV's message; fall back to keyword-based generic
  return err.message ?? `${err.keyword} validation failed`
}

export function ajvErrorsToDependencies(errors: ErrorObject[]) {
  return errors.reduce((acc, err) => {
    const path = buildPath(err)
    if (path == null) return acc
    let current = acc
    for (const seg of path) {
      const segment = seg as PathSegment
      if (current.dependencies == null) {
        current.dependencies = {} as Record<PathSegment, ControllerError>
      }
      if (current.dependencies[segment] == null) {
        current.dependencies[segment] = {}
      }
      current = current.dependencies[segment]
    }
    current.message = buildMessage(err)
    return acc
  }, {} as ControllerError)
}

export function ajvErrorsToControllerValidation(
  errors: ErrorObject[]
): ControllerValidation {
  return Validation.invalid({
    message: 'Validation failed',
    error: {
      dependencies: ajvErrorsToDependencies(errors),
    },
  })
}

export function JSONSchemaForm<T>({
  schema,
  initialValue,
  onChange,
  ajv: maybeAjv,
}: {
  schema: JSONSchema7Definition
  initialValue: Value<T>
  onChange?: (value: T) => void
  ajv?: Ajv
}): TNode {
  const ajv = maybeAjv ?? new Ajv({ allErrors: true })
  const validate = ajv.compile<T>(schema)
  const { controller } = useController({
    initialValue,
    validate: (value: T) => {
      const result = validate(value)
      if (result) {
        return Validation.valid
      }
      return ajvErrorsToControllerValidation(validate.errors ?? [])
    },
    onChange,
  })
  return JSONSchemaControl({ schema, controller })
}

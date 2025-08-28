import type { JSONSchema7, JSONSchema7Definition } from 'json-schema'
import {
  ArrayController,
  CheckboxInput,
  Control,
  Controller,
  InputWrapperOptions,
  ListControl,
  NumberInput,
  NumberInputOptions,
  ObjectController,
} from '../form'
import { attr, html, TNode, WithElement } from '@tempots/dom'
import { Stack } from '../layout'
import { objectEntries } from '@tempots/std'
import { SchemaContext } from './schema-context'
import { StringControl } from './widgets/string-controls'
import { resolveRef } from './ref-utils'
import { Label } from '../typography'

export function JSONSchemaAny({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<unknown>
}): TNode {
  if (ctx.definition === true) {
    return JSONSchemaAny({
      ctx: ctx.with({
        definition: {
          type: ['string', 'number', 'object', 'array', 'boolean', 'null'],
        },
      }),
      controller: controller as unknown as Controller<unknown>,
    })
  }
  return JSONSchemaUnion({
    ctx: ctx.with({
      definition: {
        ...ctx.definition,
        type: ['string', 'number', 'object', 'array', 'boolean', 'null'],
      },
    }),
    controller: controller as unknown as Controller<unknown>,
  })
}

function definitionToInputWrapperOptions({
  ctx,
}: {
  ctx: SchemaContext
}): Partial<InputWrapperOptions> {
  const { examples, default: defaultValue } = ctx
  let { description } = ctx
  if (description == null && examples != null && defaultValue != null) {
    if (Array.isArray(examples)) {
      description = `example: ${examples[0]}`
    } else {
      description = `example: ${examples}`
    }
  }
  return {
    label: ctx.widgetLabel,
    description,
    required: ctx.isPropertyRequired,
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
  console.warn(ctx, controller)
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
  const def = ctx.definition as JSONSchema7
  return Control<number, NumberInputOptions>(NumberInput, {
    ...definitionToInputWrapperOptions({ ctx }),
    controller,
    placeholder: makePlaceholder(ctx.definition as JSONSchema7, String),
    min: def.minimum,
    max: def.maximum,
    step: def.multipleOf,
  })
}

function integerMultipleOf(multipleOf?: number) {
  if (multipleOf == null) return 1
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
    ctx: ctx.with({
      definition: {
        ...(ctx.definition as JSONSchema7),
        multipleOf: integerMultipleOf(
          (ctx.definition as JSONSchema7).multipleOf
        ),
      },
    }),
    controller,
  })
}

export function JSONSchemaString({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<string | undefined>
}): TNode {
  const options = {
    ...definitionToInputWrapperOptions({ ctx }),
    placeholder: makePlaceholder(ctx.definition as JSONSchema7, String),
  }
  return StringControl({ ctx, options, controller })
}

export function JSONSchemaBoolean({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<boolean>
}): TNode {
  return Control(CheckboxInput, {
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
  return ListControl({
    ...definitionToInputWrapperOptions({ ctx }),
    createItem: () =>
      makePlaceholder(ctx.definition as JSONSchema7, () => undefined),
    controller,
    element: payload => {
      const item = payload.item as Controller<unknown>
      const index = payload.position.index
      const d = ctx.definition as JSONSchema7
      const definition = Array.isArray(d.items)
        ? d.items[payload.position.index]
        : (d.items ?? {})
      return JSONSchemaGenericControl({
        ctx: ctx.with({ definition: definition as JSONSchema7 }).append(index),
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
  return Stack(
    attr.class('bu-gap-1'),
    ctx.name != null ? Label(ctx.widgetLabel) : null,
    ...objectEntries((ctx.definition as JSONSchema7).properties ?? {}).map(
      ([k, definition]) => {
        // deprecated fields are not rendered
        if (definition === false) return null
        const key = k as string
        const field = controller.field(key)
        return JSONSchemaGenericControl({
          ctx: ctx
            .with({
              definition,
              isPropertyRequired: ctx.hasRequiredProperty(key),
            })
            .append(key),
          controller: field,
        })
      }
    )
  )
}

export function JSONSchemaUnion<T>({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<T>
}): TNode {
  console.warn(ctx, controller)
  throw new Error('Not implemented: union')
}

export function JSONSchemaGenericControl<T>({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<T>
}): TNode {
  // Resolve $ref (in-document) if present; merge with siblings
  const baseDef = ctx.definition as JSONSchema7
  const resolvedDef = baseDef?.$ref ? resolveRef(baseDef, ctx.schema) : baseDef
  const nextCtx = ctx.with({ definition: resolvedDef })

  if (resolvedDef?.type == null) {
    return JSONSchemaAny({
      ctx: nextCtx,
      controller: controller as unknown as Controller<unknown>,
    })
  }
  if (Array.isArray(resolvedDef.type)) {
    return JSONSchemaUnion({
      ctx: nextCtx,
      controller: controller as unknown as Controller<unknown>,
    })
  }
  switch (resolvedDef.type) {
    case 'number':
      return JSONSchemaNumber({
        ctx: nextCtx,
        controller: controller as unknown as Controller<number>,
      })
    case 'integer':
      return JSONSchemaInteger({
        ctx: nextCtx,
        controller: controller as unknown as Controller<number>,
      })
    case 'string':
      return JSONSchemaString({
        ctx: nextCtx,
        controller: controller as unknown as Controller<string | undefined>,
      })
    case 'boolean':
      return JSONSchemaBoolean({
        ctx: nextCtx,
        controller: controller as unknown as Controller<boolean>,
      })
    case 'array':
      return JSONSchemaArray({
        ctx: nextCtx,
        controller:
          controller instanceof ArrayController
            ? (controller as unknown as ArrayController<unknown[]>)
            : (controller.array() as unknown as ArrayController<unknown[]>),
      })
    case 'object': {
      const schema = JSONSchemaObject({
        ctx: nextCtx,
        controller: (controller instanceof ObjectController
          ? controller
          : (
              controller as Controller<Record<string, unknown>>
            ).object()) as ObjectController<{
          [key: string]: unknown
        }>,
      })
      if (nextCtx.isRoot) {
        return schema
      }
      return html.div(attr.class('bc-json-schema-object'), schema)
    }
    case 'null':
      return JSONSchemaNull({
        ctx: nextCtx,
        controller: controller as unknown as Controller<null>,
      })
    default:
      throw new Error(`Not implemented: unknown type ${resolvedDef.type}`)
  }
}

export function JSONSchemaControl<T>({
  schema,
  controller,
  ajv,
}: {
  schema: JSONSchema7Definition
  controller: Controller<T>
  ajv?: import('ajv').default
}): TNode {
  const ctx = new SchemaContext({
    schema,
    definition: schema,
    horizontal: false,
    isPropertyRequired: false,
    path: [],
    ajv,
  })
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

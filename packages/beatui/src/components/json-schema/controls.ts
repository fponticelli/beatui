import type { JSONSchema7, JSONSchema7Definition } from 'json-schema'
import {
  ArrayController,
  CheckboxControl,
  Controller,
  InputWrapperOptions,
  ListControl,
  NumberControl,
  ObjectController,
} from '../form'
import { attr, html, TNode, WithElement } from '@tempots/dom'
import { Stack } from '../layout'
import { objectEntries } from '@tempots/std'
import { SchemaContext } from './context'
import { StringControl } from './widgets/string-controls'

export function JSONSchemaAny({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<unknown>
}): TNode {
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
  const { definition } = ctx
  let description = definition.description
  if (
    description == null &&
    (definition as JSONSchema7).examples != null &&
    (definition as JSONSchema7).default != null
  ) {
    const d = definition as JSONSchema7
    if (Array.isArray(d.examples)) {
      description = `example: ${d.examples[0]}`
    } else {
      description = `example: ${d.examples}`
    }
  }
  return {
    label: ctx.widgetLabel,
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
  return NumberControl({
    ...definitionToInputWrapperOptions({ ctx }),
    controller,
    placeholder: makePlaceholder(ctx.definition as JSONSchema7, String),
    min: (ctx.definition as JSONSchema7).minimum,
    max: (ctx.definition as JSONSchema7).maximum,
    step: (ctx.definition as JSONSchema7).multipleOf,
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
    ...objectEntries((ctx.definition as JSONSchema7).properties ?? {}).map(
      ([k, value]) => {
        const key = k as string
        const field = controller.field(key)
        return JSONSchemaGenericControl({
          ctx: ctx
            .with({
              definition: value as JSONSchema7,
              required:
                (ctx.definition as JSONSchema7).required?.includes(key) ??
                false,
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
  const definition = ctx.definition as JSONSchema7
  if (definition?.type == null) {
    return JSONSchemaAny({
      ctx,
      controller: controller as unknown as Controller<unknown>,
    })
  }
  if (Array.isArray(definition.type)) {
    return JSONSchemaUnion({
      ctx,
      controller: controller as unknown as Controller<unknown>,
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
        controller: controller as unknown as Controller<string | undefined>,
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
            ? (controller as unknown as ArrayController<unknown[]>)
            : (controller.array() as unknown as ArrayController<unknown[]>),
      })
    case 'object': {
      const schema = JSONSchemaObject({
        ctx,
        controller: (controller instanceof ObjectController
          ? controller
          : (
              controller as Controller<Record<string, unknown>>
            ).object()) as ObjectController<{
          [key: string]: unknown
        }>,
      })
      if (ctx.isRoot) {
        return schema
      }
      return html.div(attr.class('bc-json-schema-object'), schema)
    }
    case 'null':
      return JSONSchemaNull({
        ctx,
        controller: controller as unknown as Controller<null>,
      })
    default:
      throw new Error(`Not implemented: unknown type ${definition.type}`)
  }
}

export function JSONSchemaControl<T>({
  schema,
  controller,
}: {
  schema: JSONSchema7Definition
  controller: Controller<T>
}): TNode {
  const ctx = new SchemaContext({
    schema,
    definition: undefined,
    horizontal: false,
    required: true,
    path: [],
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

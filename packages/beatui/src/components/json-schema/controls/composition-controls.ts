import { attr, Renderable, Value, prop, MapSignal } from '@tempots/dom'
import { Stack } from '../../layout'
import { NativeSelect, InputWrapper, type Controller } from '../../form'
import { SegmentedInput } from '../../form/input/segmented-input'
import type { SchemaContext, JSONSchema } from '../schema-context'
import { mergeAllOf } from '../schema-context'
import { definitionToInputWrapperOptions } from './shared-utils'
import { JSONSchemaGenericControl } from './generic-control'

/**
 * Control for anyOf schemas
 */
export function JSONSchemaAnyOf<T>({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<T>
}): Renderable {
  const variants = (ctx.definition as JSONSchema).anyOf as JSONSchema[]
  return JSONSchemaOneOfLike({ ctx, controller, kind: 'anyOf', variants })
}

/**
 * Control for oneOf schemas
 */
export function JSONSchemaOneOf<T>({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<T>
}): Renderable {
  const variants = (ctx.definition as JSONSchema).oneOf as JSONSchema[]
  return JSONSchemaOneOfLike({ ctx, controller, kind: 'oneOf', variants })
}

/**
 * Control for allOf schemas
 */
export function JSONSchemaAllOf<T>({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<T>
}): Renderable {
  const variants = (ctx.definition as JSONSchema).allOf as JSONSchema[]

  // Merge all allOf branches into a single effective schema
  const { mergedSchema, conflicts } = mergeAllOf(variants, ctx.path)

  // Create new context with merged schema and conflicts
  const mergedCtx = ctx.with({
    definition: mergedSchema,
    schemaConflicts: [...ctx.schemaConflicts, ...conflicts],
  })

  // Render the merged schema as a single control
  return JSONSchemaGenericControl({
    ctx: mergedCtx,
    controller: controller as unknown as Controller<unknown>,
  })
}

/**
 * Shared implementation for anyOf/oneOf controls
 */
function JSONSchemaOneOfLike<T>({
  ctx,
  controller,
  kind,
  variants,
}: {
  ctx: SchemaContext
  controller: Controller<T>
  kind: 'anyOf' | 'oneOf'
  variants: JSONSchema[]
}): Renderable {
  const typesOrTitles = variants.map(def => {
    const t =
      def.title ??
      (Array.isArray(def.type)
        ? def.type.join(' | ')
        : ((def.type as string) ?? kind))
    return String(t)
  })

  const sel = prop<number>(0)
  controller.onDispose(sel.dispose)

  const count = variants.length

  const Selector = (onChange: (idx: number) => void) => {
    if (count <= 3) {
      return SegmentedInput<Record<string, string>>({
        options: Object.fromEntries(
          typesOrTitles.map((s, i) => [String(i), s])
        ),
        value: Value.map(sel, v => String(v)) as unknown as Value<string>,
        onChange: (k: string) => onChange(Number(k)),
        size: 'sm',
      })
    }
    return NativeSelect<number>({
      options: variants.map((_, i) => ({
        type: 'value',
        value: i,
        label: typesOrTitles[i]!,
      })),
      value: sel,
      onChange: onChange,
    } as unknown as Parameters<typeof NativeSelect<number>>[0])
  }

  const change = (idx: number) => sel.set(idx)

  const inner = MapSignal(sel, i => {
    return JSONSchemaGenericControl({
      ctx: ctx.with({
        definition: variants[Value.get(i)],
        suppressLabel: true,
      }),
      controller: controller as unknown as Controller<unknown>,
    })
  })

  if (count <= 1) {
    if (ctx.isRoot) return inner
    return InputWrapper({
      ...definitionToInputWrapperOptions({ ctx }),
      content: inner,
    })
  }

  if (ctx.isRoot) return Stack(attr.class('bu-gap-2'), Selector(change), inner)
  return InputWrapper({
    ...definitionToInputWrapperOptions({ ctx }),
    content: Stack(attr.class('bu-gap-2'), Selector(change), inner),
  })
}

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
  NativeSelect,
  NativeSelectControl,
  InputWrapper,
  NullableNumberInput,
} from '../form'
import {
  attr,
  html,
  Renderable,
  WithElement,
  Value,
  prop,
  MapSignal,
} from '@tempots/dom'
import { Group, Stack } from '../layout'
import { objectEntries, upperCaseFirst } from '@tempots/std'
import { SchemaContext } from './schema-context'
import { StringControl } from './widgets/string-controls'
import { resolveRef } from './ref-utils'
import { Label, MutedLabel } from '../typography'
import { SegmentedInput } from '../form/input/segmented-input'
import { NullableResetAfter } from '../form/input/nullable-utils'

export function JSONSchemaAny({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<unknown>
}): Renderable {
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

export function JSONSchemaEnum({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<unknown>
}): Renderable {
  const def = ctx.definition as JSONSchema7
  return NativeSelectControl({
    ...definitionToInputWrapperOptions({ ctx }),
    options: (def.enum ?? []).map(e => ({
      type: 'value',
      value: e,
      label: String(e),
    })),
    controller,
  })
}

export function JSONSchemaConst({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<unknown>
}): Renderable {
  const def = ctx.definition as JSONSchema7
  return Group(
    MutedLabel(ctx.widgetLabel, ': '),
    Label(String(def.const)),
    WithElement(() => {
      if (controller.value.value !== def.const) {
        controller.change(def.const)
      }
    })
  )
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
    label: ctx.suppressLabel ? undefined : ctx.widgetLabel,
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
}): Renderable {
  console.warn(ctx, controller)
  // TODO
  return html.div(attr.class('bc-json-schema-never'), 'Never')
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
}): Renderable {
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
}): Renderable {
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
}): Renderable {
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
  controller: Controller<boolean | null>
}): Renderable {
  const hasNull = Array.isArray((ctx.definition as JSONSchema7).type)
    ? (ctx.definition as JSONSchema7).type!.includes('null' as never)
    : (ctx.definition as JSONSchema7).type === 'null'

  const base = Control(CheckboxInput, {
    ...definitionToInputWrapperOptions({ ctx }),
    controller: controller as unknown as Controller<boolean>,
  })

  if (!hasNull) return base

  // Nullable boolean: add a small clear button that sets the value to null
  return Control(CheckboxInput, {
    ...definitionToInputWrapperOptions({ ctx }),
    controller: controller as unknown as Controller<boolean>,
    after: NullableResetAfter(
      controller.value as unknown as Value<boolean | null>,
      (controller as unknown as Controller<boolean | null>).disabled,
      v => (controller as unknown as Controller<boolean | null>).change(v)
    ),
  })
}

export function JSONSchemaNull({
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<null>
}): Renderable {
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
}): Renderable {
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
}): Renderable {
  return Stack(
    attr.class('bu-gap-1'),
    ctx.suppressLabel || ctx.name == null ? null : Label(ctx.widgetLabel),
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

type JSONTypeName =
  | 'string'
  | 'number'
  | 'integer'
  | 'object'
  | 'array'
  | 'boolean'
  | 'null'

function detectTypeName(
  v: unknown,
  union: JSONTypeName[]
): JSONTypeName | null {
  if (v === null) return union.includes('null') ? 'null' : null
  const t = typeof v
  switch (t) {
    case 'string':
      return union.includes('string') ? 'string' : null
    case 'number': {
      if (Number.isInteger(v as number) && union.includes('integer'))
        return 'integer'
      return union.includes('number') ? 'number' : null
    }
    case 'boolean':
      return union.includes('boolean') ? 'boolean' : null
    case 'object': {
      if (Array.isArray(v)) return union.includes('array') ? 'array' : null
      return union.includes('object') ? 'object' : null
    }
    default:
      return null
  }
}

function tryConvert(
  value: unknown,
  target: JSONTypeName
): { ok: true; value: unknown } | { ok: false } {
  try {
    switch (target) {
      case 'string':
        if (value == null) return { ok: true, value: undefined }
        return { ok: true, value: String(value) }
      case 'number': {
        if (typeof value === 'number') return { ok: true, value }
        if (typeof value === 'string') {
          const n = Number(value)
          return Number.isFinite(n) ? { ok: true, value: n } : { ok: false }
        }
        if (typeof value === 'boolean')
          return { ok: true, value: value ? 1 : 0 }
        return { ok: false }
      }
      case 'integer': {
        if (typeof value === 'number' && Number.isInteger(value))
          return { ok: true, value }
        if (typeof value === 'string') {
          if (/^[-+]?\d+$/.test(value.trim()))
            return { ok: true, value: parseInt(value, 10) }
          return { ok: false }
        }
        if (typeof value === 'boolean')
          return { ok: true, value: value ? 1 : 0 }
        return { ok: false }
      }
      case 'boolean': {
        if (typeof value === 'boolean') return { ok: true, value }
        if (typeof value === 'string') {
          const s = value.trim().toLowerCase()
          if (s === 'true' || s === '1' || s === 'yes')
            return { ok: true, value: true }
          if (s === 'false' || s === '0' || s === 'no')
            return { ok: true, value: false }
          return { ok: false }
        }
        if (typeof value === 'number') return { ok: true, value: value !== 0 }
        return { ok: false }
      }
      case 'array':
        if (Array.isArray(value)) return { ok: true, value }
        return { ok: false }
      case 'object':
        if (value != null && typeof value === 'object' && !Array.isArray(value))
          return { ok: true, value }
        return { ok: false }
      case 'null':
        return { ok: true, value: null }
    }
  } catch {
    return { ok: false }
  }
}

function defaultClearedValue(target: JSONTypeName): unknown {
  switch (target) {
    case 'null':
      return null
    case 'array':
      return []
    case 'object':
      return {}
    default:
      return undefined
  }
}

function getXUI(def: JSONSchema7): {
  unionDefault?: JSONTypeName
  confirmBranchChange?: boolean
  selector?: 'segmented' | 'select'
} {
  const raw = (def as unknown as Record<string, unknown>)['x:ui']
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    return {
      unionDefault: o['unionDefault'] as JSONTypeName | undefined,
      confirmBranchChange: Boolean(o['confirmBranchChange']) || false,
      selector: (o['selector'] as 'segmented' | 'select') || undefined,
    }
  }
  return {}
}

export function JSONSchemaUnion<T>({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<T>
}): Renderable {
  const def = ctx.definition as JSONSchema7
  let types = (def.type as JSONTypeName[]) ?? []
  const xui = getXUI(def)

  // If only primitives + null, hide null in selector and use nullable control
  const hasNull = types.includes('null')
  const primitives = types.filter(
    t =>
      t !== 'null' &&
      (t === 'string' || t === 'number' || t === 'integer' || t === 'boolean')
  )
  const onlyPrimitivePlusNull =
    hasNull && primitives.length === types.length - 1
  if (onlyPrimitivePlusNull) {
    types = primitives
  }

  const selectionStore = prop<JSONTypeName | null>(null)
  controller.onDispose(selectionStore.dispose)

  // Determine initial branch
  const current = controller.value.value as unknown
  const detected = detectTypeName(current, types)
  const initial: JSONTypeName =
    detected ??
    selectionStore.value ??
    (xui.unionDefault && types.includes(xui.unionDefault)
      ? xui.unionDefault
      : (types.find(t => t !== 'null') ?? types[0]!))

  // Active selection signal in storage
  if (selectionStore.value !== initial) selectionStore.set(initial)
  const selectedValue = Value.map(selectionStore, s => s ?? initial)

  const Selector = (onChange: (t: JSONTypeName) => void) => {
    const mode = xui.selector ?? (types.length <= 3 ? 'segmented' : 'select')
    if (mode === 'segmented') {
      const labels = Object.fromEntries(
        types.map(t => [t, upperCaseFirst(t)])
      ) as Record<JSONTypeName, string>
      return SegmentedInput<Record<JSONTypeName, string>>({
        options: labels,
        value: selectedValue,
        onChange: (t: keyof typeof labels) => onChange(t as JSONTypeName),
        size: 'sm',
      })
    }
    // Fallback to native select
    return NativeSelect<JSONTypeName>({
      options: types.map(t => ({
        type: 'value',
        value: t,
        label: upperCaseFirst(t),
      })),
      value: selectedValue,
      onChange: onChange,
    })
  }

  const changeBranch = (next: JSONTypeName) => {
    const currentVal = controller.value.value as unknown
    if (detectTypeName(currentVal, [next])) {
      selectionStore.set(next)
      return
    }
    const conv = tryConvert(currentVal, next)
    if (conv.ok) {
      selectionStore.set(next)
      controller.change(conv.value as T)
      return
    }
    const clear = () => {
      selectionStore.set(next)
      controller.change(defaultClearedValue(next) as T)
    }
    if (xui.confirmBranchChange) {
      if (typeof window === 'object' && typeof window.confirm === 'function') {
        const ok = window.confirm(
          'Changing type will clear the current value. Continue?'
        )
        if (!ok) return
      }
    }
    clear()
  }

  // Render active branch control reactively
  const inner = MapSignal(selectedValue, sv => {
    const t = Value.get(sv) as JSONTypeName

    // For primitive+null unions, map number/integer to NullableNumberInput
    if (onlyPrimitivePlusNull && (t === 'number' || t === 'integer')) {
      const d = def as JSONSchema7
      return Control(NullableNumberInput, {
        ...definitionToInputWrapperOptions({
          ctx: ctx.with({ suppressLabel: true }),
        }),
        controller: controller as unknown as Controller<number | null>,
        min: d.minimum,
        max: d.maximum,
        step: t === 'integer' ? integerMultipleOf(d.multipleOf) : d.multipleOf,
      })
    }

    return JSONSchemaGenericControl({
      ctx: ctx.with({
        definition: {
          ...(def as JSONSchema7),
          type: t,
        },
        suppressLabel: true,
      }),
      controller: controller as unknown as Controller<unknown>,
    })
  })

  if (ctx.isRoot) {
    return types.length > 1
      ? Stack(attr.class('bu-gap-2'), Selector(changeBranch), inner)
      : inner
  }
  return InputWrapper({
    ...definitionToInputWrapperOptions({ ctx }),
    content:
      types.length > 1
        ? Stack(attr.class('bu-gap-2'), Selector(changeBranch), inner)
        : inner,
  })
}

export function JSONSchemaGenericControl<T>({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<T>
}): Renderable {
  // Resolve $ref (in-document) if present; merge with siblings
  // TODO comparing to boolean is not strictly correct (false is never, true is correct)
  const baseDef = typeof ctx.definition === 'boolean' ? {} : ctx.definition
  const resolvedDef = baseDef?.$ref ? resolveRef(baseDef, ctx.schema) : baseDef
  const nextCtx = ctx.with({ definition: resolvedDef })

  if (resolvedDef == null) {
    return JSONSchemaAny({
      ctx: nextCtx,
      controller: controller as unknown as Controller<unknown>,
    })
  }
  if (resolvedDef.enum != null) {
    return JSONSchemaEnum({
      ctx: nextCtx,
      controller: controller as unknown as Controller<unknown>,
    })
  }
  if (resolvedDef.const != null) {
    return JSONSchemaConst({
      ctx: nextCtx,
      controller: controller as unknown as Controller<unknown>,
    })
  }
  if (resolvedDef.anyOf != null) {
    return JSONSchemaAnyOf({
      ctx: nextCtx,
      controller: controller as unknown as Controller<unknown>,
    })
  }
  if (resolvedDef.oneOf != null) {
    return JSONSchemaOneOf({
      ctx: nextCtx,
      controller: controller as unknown as Controller<unknown>,
    })
  }
  if (resolvedDef.allOf != null) {
    return JSONSchemaAllOf({
      ctx: nextCtx,
      controller: controller as unknown as Controller<unknown>,
    })
  }
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
        controller: controller as unknown as Controller<boolean | null>,
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
      console.warn('Unknown type', resolvedDef.type)
      // TODO
      return html.div(attr.class('bc-json-schema-unknown'), 'Unknown')
  }
}

export function JSONSchemaAnyOf<T>({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<T>
}): Renderable {
  const variants = (ctx.definition as JSONSchema7).anyOf as JSONSchema7[]
  return JSONSchemaOneOfLike({ ctx, controller, kind: 'anyOf', variants })
}

export function JSONSchemaOneOf<T>({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<T>
}): Renderable {
  const variants = (ctx.definition as JSONSchema7).oneOf as JSONSchema7[]
  return JSONSchemaOneOfLike({ ctx, controller, kind: 'oneOf', variants })
}

export function JSONSchemaAllOf<T>({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<T>
}): Renderable {
  const variants = (ctx.definition as JSONSchema7).allOf as JSONSchema7[]
  return Stack(
    attr.class('bu-gap-2'),
    ...variants.map(def =>
      JSONSchemaGenericControl({
        ctx: ctx.with({ definition: def, suppressLabel: true }),
        controller: controller as unknown as Controller<unknown>,
      })
    )
  )
}

function JSONSchemaOneOfLike<T>({
  ctx,
  controller,
  kind,
  variants,
}: {
  ctx: SchemaContext
  controller: Controller<T>
  kind: 'anyOf' | 'oneOf'
  variants: JSONSchema7[]
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

  const inner = MapSignal(sel, i =>
    JSONSchemaGenericControl({
      ctx: ctx.with({
        definition: variants[Value.get(i)],
        suppressLabel: true,
      }),
      controller: controller as unknown as Controller<unknown>,
    })
  )

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

export function JSONSchemaControl<T>({
  schema,
  controller,
  ajv,
}: {
  schema: JSONSchema7Definition
  controller: Controller<T>
  ajv?: import('ajv').default
}): Renderable {
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

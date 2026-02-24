import {
  attr,
  Renderable,
  Value,
  MapSignal,
  Use,
  Fragment,
  Empty,
} from '@tempots/dom'
import { ObjectController, InputWrapper } from '../../form'
import { Button } from '../../button'
import { objectEntries } from '@tempots/std'
import { BeatUII18n } from '../../../beatui-i18n'
import { renderAdditionalEntry, renderUnevaluatedEntry } from './object-helpers'
import { JSONSchemaGenericControl } from './generic-control'
import {
  makePlaceholder,
  definitionToInputWrapperOptions,
  tryResolveCustomWidget,
} from './shared-utils'
import { resolveWidget } from '../widgets/utils'
import type {
  SchemaContext,
  JSONSchema,
  JSONSchemaDefinition,
} from '../schema-context'
import {
  composeEffectiveObjectSchema,
  getEvaluatedProperties,
  hasConditionalFeatures,
} from '../schema-context'
import {
  getContainerLayout,
  applyContainerLayout,
} from '../containers/container-layouts'

/**
 * Configuration extracted from schema for rendering object properties.
 */
interface ObjectRenderConfig {
  knownProps: Record<string, JSONSchemaDefinition>
  knownKeys: Set<string>
  ap: boolean | JSONSchema | undefined
  apAllowed: boolean
  apSchema: JSONSchema
  minProps: number
  maxProps: number
  unevaluatedProps: boolean | JSONSchema | undefined
  canAddUnevaluated: boolean
  unevaluatedTooltip: string | null
  patternProps: Record<string, JSONSchemaDefinition>
  patternList: RegExp[]
  propertyNamesDef: boolean | JSONSchema | undefined
  lockKeyAfterSet: boolean
}

/**
 * Extract render configuration from an effective schema.
 */
function extractRenderConfig(effective: JSONSchema): ObjectRenderConfig {
  const knownProps = (effective.properties ?? {}) as Record<
    string,
    JSONSchemaDefinition
  >
  const knownKeys = new Set(Object.keys(knownProps))

  const ap =
    (effective.additionalProperties as boolean | JSONSchema | undefined) ?? true
  const apAllowed = ap !== false
  const apSchema: JSONSchema =
    ap === true || ap === undefined ? ({} as JSONSchema) : (ap as JSONSchema)

  const minProps = (effective.minProperties as number | undefined) ?? 0
  const maxProps = (effective.maxProperties as number | undefined) ?? Infinity

  // Handle unevaluatedProperties (2019-09/2020-12)
  const unevaluatedProps = (effective as unknown as Record<string, unknown>)
    .unevaluatedProperties as boolean | JSONSchema | undefined

  let canAddUnevaluated = true
  let unevaluatedTooltip: string | null = null

  if (unevaluatedProps === false) {
    canAddUnevaluated = false
    unevaluatedTooltip = 'No unevaluated properties are allowed by schema'
  } else if (unevaluatedProps && typeof unevaluatedProps === 'object') {
    canAddUnevaluated = true
  }

  // patternProperties and propertyNames constraints
  const patternProps = (effective.patternProperties ?? {}) as Record<
    string,
    JSONSchemaDefinition
  >
  const patternList = Object.keys(patternProps)
    .filter(Boolean)
    .map(p => {
      try {
        return new RegExp(p)
      } catch {
        return null
      }
    })
    .filter((r): r is RegExp => r != null)

  const propertyNamesDef = effective.propertyNames as
    | boolean
    | JSONSchema
    | undefined

  // x:ui.lockKeyAfterSet support (object-level)
  const xuiRaw = (effective as unknown as Record<string, unknown>)['x:ui']
  const lockKeyAfterSet = Boolean(
    xuiRaw &&
    typeof xuiRaw === 'object' &&
    (xuiRaw as Record<string, unknown>)['lockKeyAfterSet']
  )

  return {
    knownProps,
    knownKeys,
    ap,
    apAllowed,
    apSchema,
    minProps,
    maxProps,
    unevaluatedProps,
    canAddUnevaluated,
    unevaluatedTooltip,
    patternProps,
    patternList,
    propertyNamesDef,
    lockKeyAfterSet,
  }
}

/**
 * Create a property name validator function.
 */
function createPropertyNameValidator(
  config: ObjectRenderConfig,
  ajv: import('ajv').default | undefined
): (name: string) => { ok: true } | { ok: false; message: string } {
  const { knownKeys, apAllowed, patternList, patternProps, propertyNamesDef } =
    config

  return (name: string) => {
    const trimmed = (name ?? '').trim()
    if (trimmed === '') return { ok: false, message: 'Key cannot be empty' }

    // propertyNames handling
    if (propertyNamesDef === false) {
      return { ok: false, message: 'No property names are allowed by schema' }
    }
    if (propertyNamesDef && typeof propertyNamesDef === 'object' && ajv) {
      try {
        const validate = ajv.compile(propertyNamesDef as JSONSchema)
        const ok = validate(trimmed)
        if (!ok) {
          const msg = validate.errors?.[0]?.message ?? 'Invalid property name'
          return { ok: false, message: msg }
        }
      } catch {
        // ignore compile errors; treat as no constraint
      }
    }

    // If additionalProperties is false and new key is not declared, require match against patternProperties
    if (!apAllowed && !knownKeys.has(trimmed)) {
      if (patternList.length === 0) {
        return { ok: false, message: 'Only declared properties are allowed' }
      }
      const matches = patternList.some(r => r.test(trimmed))
      if (!matches) {
        return {
          ok: false,
          message: `Key must match one of: ${Object.keys(patternProps).join(', ')}`,
        }
      }
    }

    return { ok: true }
  }
}

/**
 * Create helper functions for adding properties.
 */
function createPropertyHelpers(config: ObjectRenderConfig) {
  const { minProps, apSchema, unevaluatedProps } = config

  const canRemove = (count: number) => count > minProps

  const makeDefaultFor = (schema: JSONSchema): unknown => {
    const def = makePlaceholder(schema, (v: unknown) => v) as unknown
    if (def !== undefined) return def
    const t = schema.type
    if (t === 'string') return ''
    if (t === 'number' || t === 'integer') return 0
    if (t === 'boolean') return false
    if (t === 'array') return []
    if (t === 'object') return {}
    return undefined
  }

  const getValueSchemaForNew = (): JSONSchema => {
    if (unevaluatedProps && typeof unevaluatedProps === 'object') {
      return unevaluatedProps as JSONSchema
    }
    return apSchema
  }

  return { canRemove, makeDefaultFor, getValueSchemaForNew }
}

/**
 * Render known properties from schema.properties.
 */
function renderKnownProperties({
  ctx,
  controller,
  config,
  effective,
}: {
  ctx: SchemaContext
  controller: ObjectController<{ [key: string]: unknown }>
  config: ObjectRenderConfig
  effective: JSONSchema
}): { children: Renderable[]; names: string[] } {
  const knownPropertyEntries = objectEntries(config.knownProps).filter(
    ([, definition]) => definition !== false
  )

  const names = knownPropertyEntries.map(([k]) => k as string)

  const children = knownPropertyEntries.map(([k, definition]) => {
    const key = k as string
    const field = controller.field(key)

    return JSONSchemaGenericControl({
      ctx: ctx
        .with({
          definition,
          isPropertyRequired: Array.isArray(effective.required)
            ? effective.required.includes(key)
            : ctx.hasRequiredProperty(key),
          suppressLabel: false,
        })
        .append(key),
      controller: field,
    })
  })

  return { children, names }
}

/**
 * Create the Add Property button.
 */
function createAddPropertyButton({
  controller,
  config,
  validatePropertyName,
  helpers,
}: {
  controller: ObjectController<{ [key: string]: unknown }>
  config: ObjectRenderConfig
  validatePropertyName: (
    name: string
  ) => { ok: true } | { ok: false; message: string }
  helpers: ReturnType<typeof createPropertyHelpers>
}): Renderable | null {
  if (!config.apAllowed) return null

  const nextAvailableKey = (baseName: string, exists: Set<string>) => {
    const base = baseName
    const tryKey = (k: string) => {
      if (exists.has(k)) return false
      const validity = validatePropertyName(k)
      return validity.ok
    }
    if (tryKey(base)) return base
    let i = 1
    while (exists.has(base + i) || !tryKey(base + i)) i++
    return base + i
  }

  return Use(BeatUII18n, t =>
    Button(
      {
        variant: 'outline',
        disabled: Value.map(
          controller.signal,
          current =>
            !config.canAddUnevaluated ||
            Object.keys(current ?? {}).length >= config.maxProps
        ),
        onClick: () => {
          const current = Value.get(controller.signal) ?? {}
          const currentKeys = Object.keys(current)
          if (
            !config.canAddUnevaluated ||
            currentKeys.length >= config.maxProps
          ) {
            return
          }

          const keys = new Set(currentKeys)
          const newKey = nextAvailableKey('property', keys)
          const permitted = validatePropertyName(newKey)
          if (!permitted.ok) return

          const valueSchema = helpers.getValueSchemaForNew()
          const val = helpers.makeDefaultFor(valueSchema)
          const next = { ...current, [newKey]: val }
          controller.change(next)
        },
      },
      attr.title(config.unevaluatedTooltip),
      t.$.addLabel
    )
  )
}

/**
 * Wrap content with InputWrapper if needed.
 */
function wrapWithInputWrapper({
  ctx,
  containerLayout,
  content,
}: {
  ctx: SchemaContext
  containerLayout: ReturnType<typeof getContainerLayout>
  content: Renderable
}): Renderable {
  const shouldWrap =
    !ctx.suppressLabel &&
    ctx.name != null &&
    (!containerLayout ||
      !['fieldset', 'group'].includes(containerLayout.format || ''))

  if (!shouldWrap) return content

  return InputWrapper({
    ...definitionToInputWrapperOptions({ ctx }),
    content,
  })
}

/**
 * Render a static object (no conditional features).
 * Known properties are rendered once; signals handle value updates internally.
 * Only additional/unevaluated properties need MapSignal for dynamic keys.
 */
function renderStaticObject({
  ctx,
  controller,
  baseDef,
}: {
  ctx: SchemaContext
  controller: ObjectController<{ [key: string]: unknown }>
  baseDef: JSONSchema
}): Renderable {
  const config = extractRenderConfig(baseDef)
  const validatePropertyName = createPropertyNameValidator(config, ctx.ajv)
  const helpers = createPropertyHelpers(config)

  // Render known properties once - signals handle updates
  const { children: knownChildren, names: knownPropertyNames } =
    renderKnownProperties({
      ctx,
      controller,
      config,
      effective: baseDef,
    })

  // Additional/unevaluated properties need MapSignal for dynamic keys
  const dynamicProperties = MapSignal(controller.signal, current => {
    const currentKeys = Object.keys(current ?? {})
    const additionalKeys = currentKeys.filter(k => !config.knownKeys.has(k))

    if (additionalKeys.length === 0) {
      return Empty
    }

    const evaluatedKeys = getEvaluatedProperties(
      baseDef,
      (current ?? {}) as Record<string, unknown>,
      ctx.ajv
    )

    const unevaluatedKeys = additionalKeys.filter(k => !evaluatedKeys.has(k))
    const evaluatedAdditionalKeys = additionalKeys.filter(k =>
      evaluatedKeys.has(k)
    )

    return Fragment(
      // Evaluated additional keys (pattern-matched and truly additional)
      ...evaluatedAdditionalKeys.map(k => {
        const isPatternMatched = config.patternList.some(r => r.test(k))
        return renderAdditionalEntry(k, isPatternMatched, {
          controller,
          effCtx: ctx,
          patternProps: config.patternProps,
          apSchema: config.apSchema,
          canRemove: helpers.canRemove,
          lockKeyAfterSet: config.lockKeyAfterSet,
          validatePropertyName,
        })
      }),
      // Unevaluated keys
      ...unevaluatedKeys.map(k => {
        const isPatternMatched = config.patternList.some(r => r.test(k))
        return renderUnevaluatedEntry(k, isPatternMatched, {
          controller,
          effCtx: ctx,
          patternProps: config.patternProps,
          apSchema: config.apSchema,
          unevaluatedProps: config.unevaluatedProps,
          canRemove: helpers.canRemove,
          lockKeyAfterSet: config.lockKeyAfterSet,
          validatePropertyName,
        })
      })
    )
  })

  const addButton = createAddPropertyButton({
    controller,
    config,
    validatePropertyName,
    helpers,
  })

  // Get container layout
  const containerLayout = getContainerLayout(ctx)

  // For static rendering, we need to handle layout differently
  // Known properties are static, dynamic properties are reactive
  const allChildren = [...knownChildren, dynamicProperties, addButton].filter(
    Boolean
  )

  const content = applyContainerLayout(
    containerLayout,
    ctx,
    allChildren,
    knownPropertyNames
  )

  return wrapWithInputWrapper({ ctx, containerLayout, content })
}

/**
 * Render a dynamic object (has conditional features).
 * Uses MapSignal to recompute effective schema on every value change.
 */
function renderDynamicObject({
  ctx,
  controller,
  baseDef,
}: {
  ctx: SchemaContext
  controller: ObjectController<{ [key: string]: unknown }>
  baseDef: JSONSchema
}): Renderable {
  return MapSignal(controller.signal, current => {
    const { effective, conflicts } = composeEffectiveObjectSchema(
      baseDef,
      current,
      ctx.ajv,
      ctx.path
    )
    const effCtx = ctx.with({
      definition: effective,
      schemaConflicts: [...ctx.schemaConflicts, ...conflicts],
    })

    const config = extractRenderConfig(effective)
    const validatePropertyName = createPropertyNameValidator(config, ctx.ajv)
    const helpers = createPropertyHelpers(config)

    const currentKeys = Object.keys(current ?? {})
    const additionalKeys = currentKeys.filter(k => !config.knownKeys.has(k))

    const evaluatedKeys = getEvaluatedProperties(
      effective,
      (current ?? {}) as Record<string, unknown>,
      ctx.ajv
    )

    const unevaluatedKeys = additionalKeys.filter(k => !evaluatedKeys.has(k))
    const evaluatedAdditionalKeys = additionalKeys.filter(k =>
      evaluatedKeys.has(k)
    )

    const canAdd =
      config.apAllowed &&
      config.canAddUnevaluated &&
      currentKeys.length < config.maxProps

    const nextAvailableKey = (baseName: string, exists: Set<string>) => {
      const base = baseName
      const tryKey = (k: string) => {
        if (exists.has(k)) return false
        const validity = validatePropertyName(k)
        return validity.ok
      }
      if (tryKey(base)) return base
      let i = 1
      while (exists.has(base + i) || !tryKey(base + i)) i++
      return base + i
    }

    const AddPropertyButton = Use(BeatUII18n, t =>
      Button(
        {
          variant: 'outline',
          disabled: !canAdd,
          onClick: () => {
            if (!canAdd) return
            const keys = new Set(
              Object.keys(Value.get(controller.signal) ?? {})
            )
            const newKey = nextAvailableKey('property', keys)
            const permitted = validatePropertyName(newKey)
            if (!permitted.ok) return

            const valueSchema = helpers.getValueSchemaForNew()
            const val = helpers.makeDefaultFor(valueSchema)
            const next = {
              ...(Value.get(controller.signal) ?? {}),
              [newKey]: val,
            }
            controller.change(next)
          },
        },
        attr.title(config.unevaluatedTooltip),
        t.$.addLabel
      )
    )

    const containerLayout = getContainerLayout(effCtx)

    const knownPropertyEntries = objectEntries(config.knownProps).filter(
      ([, definition]) => definition !== false
    )

    const knownPropertyNames = knownPropertyEntries.map(([k]) => k as string)
    const allPropertyNames = [
      ...knownPropertyNames,
      ...evaluatedAdditionalKeys,
      ...unevaluatedKeys,
    ]

    const propertyChildren = [
      // Known properties

      ...knownPropertyEntries.map(([k, definition]) => {
        const key = k as string
        const field = controller.field(key)

        return JSONSchemaGenericControl({
          ctx: effCtx
            .with({
              definition,
              isPropertyRequired: Array.isArray(effective.required)
                ? effective.required.includes(key)
                : effCtx.hasRequiredProperty(key),
              suppressLabel: false,
            })
            .append(key),
          controller: field,
        })
      }),
      // Evaluated additional keys
      ...evaluatedAdditionalKeys.map(k => {
        const isPatternMatched = config.patternList.some(r => r.test(k))
        return renderAdditionalEntry(k, isPatternMatched, {
          controller,
          effCtx,
          patternProps: config.patternProps,
          apSchema: config.apSchema,
          canRemove: helpers.canRemove,
          lockKeyAfterSet: config.lockKeyAfterSet,
          validatePropertyName,
        })
      }),
      // Unevaluated keys
      ...unevaluatedKeys.map(k => {
        const isPatternMatched = config.patternList.some(r => r.test(k))
        return renderUnevaluatedEntry(k, isPatternMatched, {
          controller,
          effCtx,
          patternProps: config.patternProps,
          apSchema: config.apSchema,
          unevaluatedProps: config.unevaluatedProps,
          canRemove: helpers.canRemove,
          lockKeyAfterSet: config.lockKeyAfterSet,
          validatePropertyName,
        })
      }),
      // Add affordance
      config.apAllowed ? AddPropertyButton : null,
    ].filter(Boolean)

    const content = applyContainerLayout(
      containerLayout,
      effCtx,
      propertyChildren,
      allPropertyNames
    )

    return wrapWithInputWrapper({ ctx: effCtx, containerLayout, content })
  })
}

/**
 * Control for object schemas
 */
export function JSONSchemaObject({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: ObjectController<{ [key: string]: unknown }>
}): Renderable {
  // Try to resolve a custom widget first
  const resolved = resolveWidget(ctx.definition as JSONSchema, ctx.name)
  const customWidget = tryResolveCustomWidget({
    ctx,
    controller:
      controller as unknown as import('../../form').Controller<unknown>,
    resolved,
  })
  if (customWidget) {
    return customWidget
  }

  const baseDef = ctx.definition as JSONSchema

  // Check if schema has conditional features that require reactive re-evaluation
  if (hasConditionalFeatures(baseDef)) {
    // Use MapSignal to recompute effective schema on every value change
    return renderDynamicObject({ ctx, controller, baseDef })
  }

  // For schemas without conditional features, render statically
  // Known properties are rendered once; signals handle value updates internally
  return renderStaticObject({ ctx, controller, baseDef })
}

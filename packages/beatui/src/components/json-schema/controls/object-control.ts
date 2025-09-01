import { attr, Renderable, Value, MapSignal, Use } from '@tempots/dom'
import { Stack } from '../../layout'
import { ObjectController } from '../../form'
import { Button } from '../../button'
import { Label } from '../../typography'
import { objectEntries } from '@tempots/std'
import { BeatUII18n } from '@/beatui-i18n'
import { renderAdditionalEntry, renderUnevaluatedEntry } from './object-helpers'
import { JSONSchemaGenericControl } from './generic-control'
import { makePlaceholder } from './shared-utils'
import type {
  SchemaContext,
  JSONSchema,
  JSONSchemaDefinition,
} from '../schema-context'
import {
  composeEffectiveObjectSchema,
  getEvaluatedProperties,
} from '../schema-context'

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
  // Recompute effective object schema reactively based on current value to support
  // if/then/else, dependentRequired, dependentSchemas, and draft-07 dependencies.
  return MapSignal(controller.value, current => {
    const base = ctx.definition as JSONSchema
    const { effective, conflicts } = composeEffectiveObjectSchema(
      base,
      current,
      ctx.ajv,
      ctx.path
    )
    const effCtx = ctx.with({
      definition: effective,
      schemaConflicts: [...ctx.schemaConflicts, ...conflicts],
    })

    const knownProps = (effective.properties ?? {}) as Record<
      string,
      JSONSchemaDefinition
    >

    const knownKeys = new Set(Object.keys(knownProps))
    const currentKeys = Object.keys(current ?? {})
    const additionalKeys = currentKeys.filter(k => !knownKeys.has(k))

    // Handle unevaluatedProperties (2019-09/2020-12)
    const unevaluatedProps = (effective as unknown as Record<string, unknown>)
      .unevaluatedProperties as boolean | JSONSchema | undefined
    const evaluatedKeys = getEvaluatedProperties(
      effective,
      current ?? {},
      ctx.ajv
    )

    // Separate keys into evaluated and unevaluated for unevaluatedProperties handling
    const unevaluatedKeys = additionalKeys.filter(k => !evaluatedKeys.has(k))
    const evaluatedAdditionalKeys = additionalKeys.filter(k =>
      evaluatedKeys.has(k)
    )

    const ap =
      (effective.additionalProperties as boolean | JSONSchema | undefined) ??
      true
    const apAllowed = ap !== false
    const apSchema: JSONSchema =
      ap === true || ap === undefined ? ({} as JSONSchema) : (ap as JSONSchema)

    const minProps = (effective.minProperties as number | undefined) ?? 0
    const maxProps = (effective.maxProperties as number | undefined) ?? Infinity

    // Determine if we can add properties based on unevaluatedProperties
    let canAddUnevaluated = true
    let unevaluatedTooltip: string | null = null

    if (unevaluatedProps === false) {
      canAddUnevaluated = false
      unevaluatedTooltip = 'No unevaluated properties are allowed by schema'
    } else if (unevaluatedProps && typeof unevaluatedProps === 'object') {
      // unevaluatedProperties is a schema - we can add but must validate against it
      canAddUnevaluated = true
    }

    const canAdd =
      apAllowed && canAddUnevaluated && currentKeys.length < maxProps
    const canRemove = (count: number) => count > minProps

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

    const validatePropertyName = (
      name: string
    ): { ok: true } | { ok: false; message: string } => {
      const trimmed = (name ?? '').trim()
      if (trimmed === '') return { ok: false, message: 'Key cannot be empty' }

      // propertyNames handling
      if (propertyNamesDef === false) {
        return { ok: false, message: 'No property names are allowed by schema' }
      }
      if (propertyNamesDef && typeof propertyNamesDef === 'object' && ctx.ajv) {
        try {
          const validate = ctx.ajv.compile(propertyNamesDef as JSONSchema)
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

    // x:ui.lockKeyAfterSet support (object-level)
    const xuiRaw = (effective as unknown as Record<string, unknown>)['x:ui']
    const lockKeyAfterSet = Boolean(
      xuiRaw &&
        typeof xuiRaw === 'object' &&
        (xuiRaw as Record<string, unknown>)['lockKeyAfterSet']
    )

    const makeDefaultFor = (schema: JSONSchema): unknown => {
      // try placeholder or null/undefined
      const def = makePlaceholder(schema, (v: unknown) => v) as unknown
      if (def !== undefined) return def
      // empty value per type
      const t = schema.type
      if (t === 'string') return ''
      if (t === 'number' || t === 'integer') return 0
      if (t === 'boolean') return false
      if (t === 'array') return []
      if (t === 'object') return {}
      return undefined
    }

    const nextAvailableKey = (baseName: string, exists: Set<string>) => {
      // Find a key that also satisfies constraints
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
            const keys = new Set(Object.keys(Value.get(controller.value) ?? {}))
            const newKey = nextAvailableKey('property', keys)
            const permitted = validatePropertyName(newKey)
            if (!permitted.ok) return

            // Use unevaluatedProperties schema if available, otherwise additionalProperties
            let valueSchema = apSchema
            if (unevaluatedProps && typeof unevaluatedProps === 'object') {
              valueSchema = unevaluatedProps as JSONSchema
            }

            const val = makeDefaultFor(valueSchema)
            const next = {
              ...(Value.get(controller.value) ?? {}),
              [newKey]: val,
            }
            controller.change(next)
          },
        },
        attr.title(unevaluatedTooltip),
        t.$.addLabel
      )
    )

    return Stack(
      attr.class('bu-gap-1'),
      effCtx.suppressLabel || effCtx.name == null
        ? null
        : Label(effCtx.widgetLabel),
      // Known properties
      ...objectEntries(knownProps).map(([k, definition]) => {
        if (definition === false) return null
        const key = k as string
        const field = controller.field(key)

        return JSONSchemaGenericControl({
          ctx: effCtx
            .with({
              definition,
              isPropertyRequired: Array.isArray(effective.required)
                ? effective.required.includes(key)
                : effCtx.hasRequiredProperty(key),
            })
            .append(key),
          controller: field,
        })
      }),
      // Evaluated additional keys (pattern-matched and truly additional)
      ...evaluatedAdditionalKeys.map(k => {
        const isPatternMatched = patternList.some(r => r.test(k))
        return renderAdditionalEntry(k, isPatternMatched, {
          controller,
          effCtx,
          patternProps,
          apSchema,
          canRemove,
          lockKeyAfterSet,
          validatePropertyName,
        })
      }),
      // Unevaluated keys (use unevaluatedProperties schema if available)
      ...unevaluatedKeys.map(k => {
        const isPatternMatched = patternList.some(r => r.test(k))
        return renderUnevaluatedEntry(k, isPatternMatched, {
          controller,
          effCtx,
          patternProps,
          apSchema,
          unevaluatedProps,
          canRemove,
          lockKeyAfterSet,
          validatePropertyName,
        })
      }),
      // Add affordance
      apAllowed ? AddPropertyButton : null
    )
  })
}

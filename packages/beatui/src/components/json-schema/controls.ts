import type { JSONSchema, JSONSchemaDefinition } from './schema-context'
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
  transformEmptyStringToUndefined,
  TextInput,
  EmailInput,
  PasswordInput,
  UUIDInput,
  TextArea,
  Switch,
  EditableText,
} from '../form'
import {
  attr,
  html,
  Renderable,
  WithElement,
  Value,
  prop,
  MapSignal,
  When,
  Use,
  Ensure,
  style,
  Fragment,
} from '@tempots/dom'
import { Group, Stack } from '../layout'
import { objectEntries, upperCaseFirst } from '@tempots/std'
import {
  SchemaContext,
  mergeAllOf,
  evaluateNotViolation,
  composeEffectiveObjectSchema,
  getEvaluatedProperties,
  type SchemaConflict,
  type NotViolation,
} from './schema-context'
import { StringControl } from './widgets/string-controls'
import { stringFormatDetection } from './widgets/string-detection'
import { resolveRef } from './ref-utils'
import { Label, MutedLabel } from '../typography'
import { SegmentedInput } from '../form/input/segmented-input'
import { NullableResetAfter } from '../form/input/nullable-utils'
import { Notice } from '../misc'
import { BeatUII18n } from '@/beatui-i18n'
import { Button, CloseButton } from '../button'

function SchemaConflictsBanner({
  conflicts,
}: {
  conflicts: readonly SchemaConflict[]
}) {
  if (conflicts.length === 0) return null

  return Notice(
    {
      variant: 'warning',
      tone: 'prominent',
      title: 'Schema Conflicts Detected',
      class: 'bc-schema-conflicts-banner',
    },
    html.ul(
      attr.style('margin: 0; padding-left: 1.25rem; list-style-type: disc;'),
      ...conflicts.map(conflict =>
        html.li(
          attr.style('margin-bottom: 0.25rem;'),
          conflict.message,
          conflict.path.length > 0
            ? html.code(
                attr.style(
                  'margin-left: 0.5rem; font-size: 0.75rem; opacity: 0.7;'
                ),
                ` (${conflict.path.join('.')})`
              )
            : null
        )
      )
    )
  )
}

function NotViolationsBanner({
  violations,
}: {
  violations: readonly NotViolation[]
}) {
  if (violations.length === 0) return null

  return Notice(
    {
      variant: 'error',
      tone: 'prominent',
      title: 'Schema Violations Detected',
      class: 'bc-not-violations-banner',
    },
    html.ul(
      attr.style('margin: 0; padding-left: 1.25rem; list-style-type: disc;'),
      ...violations.map(violation =>
        html.li(
          attr.style('margin-bottom: 0.25rem;'),
          violation.message,
          violation.path.length > 0
            ? html.code(
                attr.style(
                  'margin-left: 0.5rem; font-size: 0.75rem; opacity: 0.7;'
                ),
                ` (${violation.path.join('.')})`
              )
            : null
        )
      )
    )
  )
}

/**
 * Presence toggle for optional properties.
 * Shows a toggle that controls whether the property key exists in the parent object.
 */
function PresenceToggle<T>({
  ctx,
  controller,
  content,
}: {
  ctx: SchemaContext
  controller: Controller<T>
  content: Renderable
}) {
  const isPresent = Value.map(controller.value, v => v !== undefined)
  const label = ctx.widgetLabel || 'Property'

  const handleToggle = (checked: boolean) => {
    if (checked) {
      // Set to default value or appropriate empty value
      const defaultValue = ctx.default
      if (defaultValue !== undefined) {
        controller.change(defaultValue as T)
      } else {
        // Set appropriate empty value based on schema type
        const def = ctx.definition as JSONSchema
        if (def.type === 'string') {
          controller.change('' as T)
        } else if (def.type === 'number' || def.type === 'integer') {
          controller.change(0 as T)
        } else if (def.type === 'boolean') {
          controller.change(false as T)
        } else if (def.type === 'array') {
          controller.change([] as T)
        } else if (def.type === 'object') {
          controller.change({} as T)
        } else {
          controller.change(null as T)
        }
      }
    } else {
      // Remove the property by setting to undefined
      controller.change(undefined as T)
    }
  }

  return Stack(
    html.div(
      attr.class('bc-presence-toggle'),
      Switch({
        value: isPresent,
        onChange: handleToggle,
        label: `Include ${label}`,
        size: 'xs',
      })
    ),
    When(isPresent, () => content)
  )
}

function withSchemaIssues<T>(
  ctx: SchemaContext,
  content: Renderable,
  controller?: Controller<T>
): Renderable {
  const hasConflicts = ctx.schemaConflicts.length > 0
  const hasViolations = ctx.notViolations.length > 0
  const shouldShowPresence = ctx.shouldShowPresenceToggle && controller != null

  let wrappedContent = content

  // Wrap with presence toggle if needed
  if (shouldShowPresence && controller != null) {
    wrappedContent = PresenceToggle({ ctx, controller, content })
  }

  // Add schema issues banners if needed
  if (!hasConflicts && !hasViolations) {
    return wrappedContent
  }

  return Stack(
    attr.class('bu-gap-2'),
    hasViolations
      ? NotViolationsBanner({ violations: ctx.notViolations })
      : null,
    hasConflicts
      ? SchemaConflictsBanner({ conflicts: ctx.schemaConflicts })
      : null,
    wrappedContent
  )
}

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
  const def = ctx.definition as JSONSchema
  return NativeSelectControl({
    ...definitionToInputWrapperOptions({ ctx }),
    options: (def.enum ?? []).map((e: unknown) => ({
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
  const def = ctx.definition as JSONSchema
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

  // Add deprecated/readOnly/writeOnly indicators to description
  const indicators: string[] = []
  if (ctx.isDeprecated) {
    indicators.push('deprecated')
  }
  if (ctx.isReadOnly && !ctx.shouldIgnoreReadOnly) {
    indicators.push('read-only')
  }
  if (ctx.isWriteOnly && !ctx.shouldShowWriteOnly) {
    indicators.push('write-only')
  }

  if (indicators.length > 0) {
    const indicatorText = `(${indicators.join(', ')})`
    description = description
      ? `${description} ${indicatorText}`
      : indicatorText
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
  definition: JSONSchema,
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
  // Handle writeOnly fields - hide them unless explicitly shown
  if (ctx.isWriteOnly && !ctx.shouldShowWriteOnly) {
    return Fragment()
  }

  const def = ctx.definition as JSONSchema
  const baseOptions = {
    ...definitionToInputWrapperOptions({ ctx }),
    placeholder: makePlaceholder(ctx.definition as JSONSchema, String),
    min: def.minimum,
    max: def.maximum,
    step: def.multipleOf,
    // Disable input if readOnly (unless overridden) or deprecated
    disabled: (ctx.isReadOnly && !ctx.shouldIgnoreReadOnly) || ctx.isDeprecated,
  }

  // For optional nullable primitives, use nullable controls instead of presence toggles
  if (ctx.isNullable && (ctx.isOptional || !ctx.shouldShowPresenceToggle)) {
    return Control(NullableNumberInput, {
      ...baseOptions,
      controller: controller as unknown as Controller<number | null>,
    })
  }

  // For non-nullable numbers, use regular number input
  return Control<number, NumberInputOptions>(NumberInput, {
    ...baseOptions,
    controller,
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
        ...(ctx.definition as JSONSchema),
        multipleOf: integerMultipleOf(
          (ctx.definition as JSONSchema).multipleOf
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
  // Handle writeOnly fields - hide them unless explicitly shown
  if (ctx.isWriteOnly && !ctx.shouldShowWriteOnly) {
    return Fragment()
  }

  const options = {
    ...definitionToInputWrapperOptions({ ctx }),
    placeholder: makePlaceholder(ctx.definition as JSONSchema, String),
    // Disable input if readOnly (unless overridden) or deprecated
    disabled: (ctx.isReadOnly && !ctx.shouldIgnoreReadOnly) || ctx.isDeprecated,
  }

  // For optional nullable primitives, use nullable controls instead of presence toggles
  if (ctx.isNullable && (ctx.isOptional || !ctx.shouldShowPresenceToggle)) {
    return StringControl({ ctx, options, controller })
  }

  // For non-nullable strings, use regular text input that maps empty to undefined
  const format = stringFormatDetection(ctx)
  switch (format?.format) {
    case 'email':
      return Control(EmailInput, {
        ...options,
        controller: transformEmptyStringToUndefined(controller),
      })
    case 'password':
      return Control(PasswordInput, {
        ...options,
        controller: transformEmptyStringToUndefined(controller),
      })
    case 'uuid':
      return Control(UUIDInput, {
        ...options,
        controller: transformEmptyStringToUndefined(controller),
      })
    case 'textarea':
      return Control(TextArea, {
        ...options,
        controller: transformEmptyStringToUndefined(controller),
      })
    default:
      return Control(TextInput, {
        ...options,
        controller: transformEmptyStringToUndefined(controller),
      })
  }
}

export function JSONSchemaBoolean({
  ctx,
  controller,
}: {
  ctx: SchemaContext
  controller: Controller<boolean | null>
}): Renderable {
  // Handle writeOnly fields - hide them unless explicitly shown
  if (ctx.isWriteOnly && !ctx.shouldShowWriteOnly) {
    return Fragment()
  }

  const baseOptions = {
    ...definitionToInputWrapperOptions({ ctx }),
    // Disable input if readOnly (unless overridden) or deprecated
    disabled: (ctx.isReadOnly && !ctx.shouldIgnoreReadOnly) || ctx.isDeprecated,
  }

  // Use non-nullable boolean by default
  const base = Control(CheckboxInput, {
    ...baseOptions,
    controller: controller as unknown as Controller<boolean>,
  })

  // For optional nullable primitives, use nullable controls instead of presence toggles
  if (!ctx.isNullable || (!ctx.isOptional && ctx.shouldShowPresenceToggle))
    return base

  // Nullable boolean: add a small clear button that sets the value to null
  return Control(CheckboxInput, {
    ...baseOptions,
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
      makePlaceholder(ctx.definition as JSONSchema, () => undefined),
    controller,
    element: payload => {
      const item = payload.item as Controller<unknown>
      const index = payload.position.index
      const d = ctx.definition as JSONSchema
      const definition = Array.isArray(d.items)
        ? d.items[payload.position.index]
        : (d.items ?? {})
      return JSONSchemaGenericControl({
        ctx: ctx
          .with({ definition: definition as JSONSchemaDefinition })
          .append(index),
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
    const evaluatedKeys = getEvaluatedProperties(effective, current, ctx.ajv)

    // Remove unused pattern separation since we handle it in rendering

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
      const def = makePlaceholder(schema, v => v) as unknown
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
        // temporary pass-through, will be replaced below after we define validatePropertyName
        return !exists.has(k)
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
            const keys = new Set(Object.keys(controller.value.value ?? {}))
            const newKey = nextAvailableKey('property', keys)
            const permitted = validatePropertyName(newKey)
            if (!permitted.ok) return

            // Use unevaluatedProperties schema if available, otherwise additionalProperties
            let valueSchema = apSchema
            if (unevaluatedProps && typeof unevaluatedProps === 'object') {
              valueSchema = unevaluatedProps as JSONSchema
            }

            const val = makeDefaultFor(valueSchema)
            const next = { ...(controller.value.value ?? {}), [newKey]: val }
            controller.change(next)
          },
        },
        attr.title(unevaluatedTooltip),
        t.$.addLabel
      )
    )

    const renderAdditionalEntry = (key: string, usePatternSchema = false) => {
      const valueCtrl = controller.field(key) as Controller<unknown>
      const keySignal = prop(key)
      const keyError = prop<string | null>(null)

      // Determine which schema to use for the value
      let valueSchema = apSchema
      if (usePatternSchema) {
        // Find the first matching pattern and use its schema
        const matchingPattern = Object.keys(patternProps).find(pattern => {
          try {
            return new RegExp(pattern).test(key)
          } catch {
            return false
          }
        })
        if (matchingPattern) {
          const patternSchemaDef = patternProps[matchingPattern]
          if (
            patternSchemaDef !== false &&
            typeof patternSchemaDef === 'object'
          ) {
            valueSchema = patternSchemaDef as JSONSchema
          }
        }
      }

      const handleRename = (nextKey: string) => {
        const trimmed = (nextKey ?? '').trim()
        if (!trimmed || trimmed === key) return
        if (
          Object.prototype.hasOwnProperty.call(
            controller.value.value ?? {},
            trimmed
          )
        )
          return // avoid duplicates
        const validity = validatePropertyName(trimmed)
        if (!validity.ok) {
          keyError.set(validity.message)
          return
        }
        keyError.set(null)
        const obj = { ...(controller.value.value ?? {}) }
        const val = obj[key]
        delete (obj as Record<string, unknown>)[key]
        ;(obj as Record<string, unknown>)[trimmed] = val
        controller.change(obj)
      }
      const RemoveBtn = Use(BeatUII18n, t =>
        CloseButton({
          size: 'xs',
          label: t.$.removeItem,
          disabled: !canRemove(Object.keys(current ?? {}).length),
          onClick: () => {
            const count = Object.keys(controller.value.value ?? {}).length
            if (!canRemove(count)) return
            const obj = { ...(controller.value.value ?? {}) }
            delete (obj as Record<string, unknown>)[key]
            controller.change(obj)
          },
        })
      )

      const keyLocked = Value.map(
        valueCtrl.value,
        v => lockKeyAfterSet && v != null
      )

      // Render key editor, hints/errors, and value control
      return html.div(
        attr.class('bu-grid bu-gap-2'),
        style.gridTemplateColumns('2fr 3fr min-content'),
        InputWrapper({
          content: EditableText({
            value: keySignal,
            onChange: handleRename,
            disabled: Value.map(controller.disabled, d => d) || keyLocked,
          }),
          error: Ensure(keyError, keyError =>
            html.div(attr.class('bu-text-red-600 bu-text-sm'), keyError)
          ),
          description:
            patternList.length > 0
              ? html.div(
                  attr.class('bu-text-muted-600 bu-text-xs'),
                  'Allowed patterns: ',
                  Object.keys(patternProps).join(', ')
                )
              : null,
        }),
        html.div(
          JSONSchemaGenericControl({
            ctx: effCtx
              .with({ definition: valueSchema, suppressLabel: true })
              .append(key),
            controller: valueCtrl,
          })
        ),
        html.div(attr.class('bu-pt-3 bu-flex-shrink'), RemoveBtn)
      )
    }

    const renderUnevaluatedEntry = (key: string, usePatternSchema = false) => {
      const valueCtrl = controller.field(key) as Controller<unknown>
      const keySignal = prop(key)
      const keyError = prop<string | null>(null)

      // Determine which schema to use for unevaluated properties
      let valueSchema: JSONSchema
      if (unevaluatedProps && typeof unevaluatedProps === 'object') {
        // Use unevaluatedProperties schema
        valueSchema = unevaluatedProps as JSONSchema
      } else if (usePatternSchema) {
        // Find the first matching pattern and use its schema
        const matchingPattern = Object.keys(patternProps).find(pattern => {
          try {
            return new RegExp(pattern).test(key)
          } catch {
            return false
          }
        })
        if (matchingPattern) {
          const patternSchemaDef = patternProps[matchingPattern]
          if (
            patternSchemaDef !== false &&
            typeof patternSchemaDef === 'object'
          ) {
            valueSchema = patternSchemaDef as JSONSchema
          } else {
            valueSchema = apSchema
          }
        } else {
          valueSchema = apSchema
        }
      } else {
        // Fall back to additionalProperties schema
        valueSchema = apSchema
      }

      const handleRename = (nextKey: string) => {
        const trimmed = (nextKey ?? '').trim()
        if (!trimmed || trimmed === key) return
        if (
          Object.prototype.hasOwnProperty.call(
            controller.value.value ?? {},
            trimmed
          )
        )
          return // avoid duplicates
        const validity = validatePropertyName(trimmed)
        if (!validity.ok) {
          keyError.set(validity.message)
          return
        }
        keyError.set(null)
        const obj = { ...(controller.value.value ?? {}) }
        const val = obj[key]
        delete (obj as Record<string, unknown>)[key]
        ;(obj as Record<string, unknown>)[trimmed] = val
        controller.change(obj)
      }

      const RemoveBtn = Use(BeatUII18n, t =>
        CloseButton({
          size: 'xs',
          label: t.$.removeItem,
          disabled: !canRemove(Object.keys(current ?? {}).length),
          onClick: () => {
            const count = Object.keys(controller.value.value ?? {}).length
            if (!canRemove(count)) return
            const obj = { ...(controller.value.value ?? {}) }
            delete (obj as Record<string, unknown>)[key]
            controller.change(obj)
          },
        })
      )

      const keyLocked = Value.map(
        valueCtrl.value,
        v => lockKeyAfterSet && v != null
      )

      // Render key editor with unevaluated property indicator
      return html.div(
        attr.class('bu-grid bu-gap-2'),
        style.gridTemplateColumns('2fr 3fr min-content'),
        InputWrapper({
          content: EditableText({
            value: keySignal,
            onChange: handleRename,
            disabled: Value.map(controller.disabled, d => d) || keyLocked,
          }),
          error: Ensure(keyError, keyError =>
            html.div(attr.class('bu-text-red-600 bu-text-sm'), keyError)
          ),
          description: html.div(
            attr.class('bu-text-muted-600 bu-text-xs'),
            unevaluatedProps === false
              ? 'Unevaluated property (not allowed by schema)'
              : 'Unevaluated property',
            patternList.length > 0
              ? html.span(
                  ' • Allowed patterns: ',
                  Object.keys(patternProps).join(', ')
                )
              : null
          ),
        }),
        html.div(
          JSONSchemaGenericControl({
            ctx: effCtx
              .with({ definition: valueSchema, suppressLabel: true })
              .append(key),
            controller: valueCtrl,
          })
        ),
        html.div(attr.class('bu-pt-3 bu-flex-shrink'), RemoveBtn)
      )
    }

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
        return renderAdditionalEntry(k, isPatternMatched)
      }),
      // Unevaluated keys (use unevaluatedProperties schema if available)
      ...unevaluatedKeys.map(k => {
        const isPatternMatched = patternList.some(r => r.test(k))
        return renderUnevaluatedEntry(k, isPatternMatched)
      }),
      // Add affordance
      apAllowed ? AddPropertyButton : null
    )
  })
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

function getXUI(def: JSONSchema): {
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
  const def = ctx.definition as JSONSchema
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
      const d = def as JSONSchema
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
          ...(def as JSONSchema),
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
  let resolvedDef = baseDef?.$ref ? resolveRef(baseDef, ctx.schema) : baseDef
  let nextCtx = ctx.with({ definition: resolvedDef })

  // Handle allOf early by merging into effective schema
  if (resolvedDef?.allOf != null) {
    // Filter out boolean schemas (true/false) and only process object schemas
    const objectSchemas = resolvedDef.allOf.filter(
      (schema): schema is JSONSchema =>
        typeof schema === 'object' && schema !== null
    )
    if (objectSchemas.length > 0) {
      const { mergedSchema, conflicts } = mergeAllOf(objectSchemas, ctx.path)
      // Merge the allOf result with any other properties from the parent schema
      const { allOf: _allOf, ...parentProps } = resolvedDef
      resolvedDef = { ...parentProps, ...mergedSchema }
      nextCtx = ctx.with({
        definition: resolvedDef,
        schemaConflicts: [...ctx.schemaConflicts, ...conflicts],
      })
    }
  }

  // Evaluate not violations against current controller value
  let notViolations = [...nextCtx.notViolations]
  if (resolvedDef?.not != null && typeof resolvedDef.not === 'object') {
    const currentValue = controller.value
    const violation = evaluateNotViolation(
      resolvedDef.not,
      currentValue,
      nextCtx.ajv,
      nextCtx.path
    )
    if (violation) {
      notViolations = [...notViolations, violation]
      nextCtx = nextCtx.with({ notViolations })
    }
  }

  if (resolvedDef == null) {
    return withSchemaIssues(
      nextCtx,
      JSONSchemaAny({
        ctx: nextCtx,
        controller: controller as unknown as Controller<unknown>,
      }),
      controller
    )
  }
  if (resolvedDef.enum != null) {
    return withSchemaIssues(
      nextCtx,
      JSONSchemaEnum({
        ctx: nextCtx,
        controller: controller as unknown as Controller<unknown>,
      }),
      controller
    )
  }
  if (resolvedDef.const != null) {
    return withSchemaIssues(
      nextCtx,
      JSONSchemaConst({
        ctx: nextCtx,
        controller: controller as unknown as Controller<unknown>,
      }),
      controller
    )
  }
  if (resolvedDef.anyOf != null) {
    return withSchemaIssues(
      nextCtx,
      JSONSchemaAnyOf({
        ctx: nextCtx,
        controller: controller as unknown as Controller<unknown>,
      }),
      controller
    )
  }
  if (resolvedDef.oneOf != null) {
    return withSchemaIssues(
      nextCtx,
      JSONSchemaOneOf({
        ctx: nextCtx,
        controller: controller as unknown as Controller<unknown>,
      }),
      controller
    )
  }
  if (resolvedDef?.type == null) {
    return withSchemaIssues(
      nextCtx,
      JSONSchemaAny({
        ctx: nextCtx,
        controller: controller as unknown as Controller<unknown>,
      }),
      controller
    )
  }
  if (Array.isArray(resolvedDef.type)) {
    return withSchemaIssues(
      nextCtx,
      JSONSchemaUnion({
        ctx: nextCtx,
        controller: controller as unknown as Controller<unknown>,
      }),
      controller
    )
  }
  switch (resolvedDef.type) {
    case 'number':
      return withSchemaIssues(
        nextCtx,
        JSONSchemaNumber({
          ctx: nextCtx,
          controller: controller as unknown as Controller<number>,
        }),
        controller
      )
    case 'integer':
      return withSchemaIssues(
        nextCtx,
        JSONSchemaInteger({
          ctx: nextCtx,
          controller: controller as unknown as Controller<number>,
        }),
        controller
      )
    case 'string':
      return withSchemaIssues(
        nextCtx,
        JSONSchemaString({
          ctx: nextCtx,
          controller: controller as unknown as Controller<string | undefined>,
        }),
        controller
      )
    case 'boolean':
      return withSchemaIssues(
        nextCtx,
        JSONSchemaBoolean({
          ctx: nextCtx,
          controller: controller as unknown as Controller<boolean | null>,
        }),
        controller
      )
    case 'array':
      return withSchemaIssues(
        nextCtx,
        JSONSchemaArray({
          ctx: nextCtx,
          controller:
            controller instanceof ArrayController
              ? (controller as unknown as ArrayController<unknown[]>)
              : (controller.array() as unknown as ArrayController<unknown[]>),
        }),
        controller
      )
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
        return withSchemaIssues(nextCtx, schema, controller)
      }
      return withSchemaIssues(
        nextCtx,
        html.div(attr.class('bc-json-schema-object'), schema),
        controller
      )
    }
    case 'null':
      return withSchemaIssues(
        nextCtx,
        JSONSchemaNull({
          ctx: nextCtx,
          controller: controller as unknown as Controller<null>,
        }),
        controller
      )
    default:
      console.warn('Unknown type', resolvedDef.type)
      // TODO
      return withSchemaIssues(
        nextCtx,
        html.div(attr.class('bc-json-schema-unknown'), 'Unknown'),
        controller
      )
  }
}

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
  schema: JSONSchemaDefinition
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

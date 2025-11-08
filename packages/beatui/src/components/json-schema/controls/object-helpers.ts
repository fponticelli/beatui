import {
  attr,
  html,
  Renderable,
  Value,
  prop,
  computedOf,
  Use,
  Ensure,
  style,
} from '@tempots/dom'
import {
  ObjectController,
  InputWrapper,
  EditableText,
  type Controller,
} from '../../form'
import { CloseButton } from '../../button'
import { BeatUII18n } from '@/beatui-i18n'
import type {
  SchemaContext,
  JSONSchema,
  JSONSchemaDefinition,
} from '../schema-context'
import { JSONSchemaGenericControl } from './generic-control'

interface RenderEntryOptions {
  controller: ObjectController<{ [key: string]: unknown }>
  effCtx: SchemaContext
  patternProps: Record<string, JSONSchemaDefinition>
  apSchema: JSONSchema
  canRemove: (count: number) => boolean
  lockKeyAfterSet: boolean
  validatePropertyName: (
    name: string
  ) => { ok: true } | { ok: false; message: string }
}

interface RenderUnevaluatedEntryOptions extends RenderEntryOptions {
  unevaluatedProps: boolean | JSONSchema | undefined
}

/**
 * Render an additional property entry
 */
export function renderAdditionalEntry(
  key: string,
  usePatternSchema: boolean,
  options: RenderEntryOptions
): Renderable {
  const {
    controller,
    effCtx,
    patternProps,
    apSchema,
    canRemove,
    lockKeyAfterSet,
    validatePropertyName,
  } = options

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
      if (patternSchemaDef !== false && typeof patternSchemaDef === 'object') {
        valueSchema = patternSchemaDef as JSONSchema
      }
    }
  }

  const handleRename = (nextKey: string) => {
    const trimmed = (nextKey ?? '').trim()
    if (!trimmed || trimmed === key) return
    if (
      Object.prototype.hasOwnProperty.call(
        Value.get(controller.signal) ?? {},
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
    const obj = { ...(Value.get(controller.signal) ?? {}) }
    const val = obj[key]
    delete (obj as Record<string, unknown>)[key]
    ;(obj as Record<string, unknown>)[trimmed] = val
    controller.change(obj)
  }

  const RemoveBtn = Use(BeatUII18n, t =>
    CloseButton({
      size: 'xs',
      label: t.$.removeItem,
      disabled: !canRemove(
        Object.keys(Value.get(controller.signal) ?? {}).length
      ),
      onClick: () => {
        const count = Object.keys(Value.get(controller.signal) ?? {}).length
        if (!canRemove(count)) return
        const obj = { ...(Value.get(controller.signal) ?? {}) }
        delete (obj as Record<string, unknown>)[key]
        controller.change(obj)
      },
    })
  )

  const keyLocked = Value.map(
    valueCtrl.signal,
    v => lockKeyAfterSet && v != null
  )

  // Render key editor, hints/errors, and value control
  return html.div(
    attr.class('bc-object-helpers__row'),
    style.gridTemplateColumns('2fr 3fr min-content'),
    InputWrapper({
      content: EditableText({
        value: keySignal,
        onChange: handleRename,
        disabled: computedOf(
          controller.disabled,
          keyLocked
        )((d, locked) => d || locked),
      }),
      error: Ensure(keyError, keyError =>
        html.div(attr.class('bc-object-helpers__error'), keyError)
      ),
      description:
        Object.keys(patternProps).length > 0
          ? html.div(
              attr.class('bc-object-helpers__description'),
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
    html.div(attr.class('bc-object-helpers__remove'), RemoveBtn)
  )
}

/**
 * Render an unevaluated property entry
 */
export function renderUnevaluatedEntry(
  key: string,
  usePatternSchema: boolean,
  options: RenderUnevaluatedEntryOptions
): Renderable {
  const {
    controller,
    effCtx,
    patternProps,
    apSchema,
    unevaluatedProps,
    canRemove,
    lockKeyAfterSet,
    validatePropertyName,
  } = options

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
      if (patternSchemaDef !== false && typeof patternSchemaDef === 'object') {
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
        Value.get(controller.signal) ?? {},
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
    const obj = { ...(Value.get(controller.signal) ?? {}) }
    const val = obj[key]
    delete (obj as Record<string, unknown>)[key]
    ;(obj as Record<string, unknown>)[trimmed] = val
    controller.change(obj)
  }

  const RemoveBtn = Use(BeatUII18n, t =>
    CloseButton({
      size: 'xs',
      label: t.$.removeItem,
      disabled: !canRemove(
        Object.keys(Value.get(controller.signal) ?? {}).length
      ),
      onClick: () => {
        const count = Object.keys(Value.get(controller.signal) ?? {}).length
        if (!canRemove(count)) return
        const obj = { ...(Value.get(controller.signal) ?? {}) }
        delete (obj as Record<string, unknown>)[key]
        controller.change(obj)
      },
    })
  )

  const keyLocked = Value.map(
    valueCtrl.signal,
    v => lockKeyAfterSet && v != null
  )

  // Render key editor with unevaluated property indicator
  return html.div(
    attr.class('bc-object-helpers__row'),
    style.gridTemplateColumns('2fr 3fr min-content'),
    InputWrapper({
      content: EditableText({
        value: keySignal,
        onChange: handleRename,
        disabled: computedOf(
          controller.disabled,
          keyLocked
        )((d, locked) => d || locked),
      }),
      error: Ensure(keyError, keyError =>
        html.div(attr.class('bc-object-helpers__error'), keyError)
      ),
      description: html.div(
        attr.class('bc-object-helpers__description'),
        unevaluatedProps === false
          ? 'Unevaluated property (not allowed by schema)'
          : 'Unevaluated property',
        Object.keys(patternProps).length > 0
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
    html.div(attr.class('bc-object-helpers__remove'), RemoveBtn)
  )
}

import {
  attr,
  Renderable,
  Value,
  prop,
  MapSignal,
  computedOf,
} from '@tempots/dom'
import { Stack } from '../../layout'
import { NativeSelect, InputWrapper, type Controller } from '../../form'
import { SegmentedInput } from '../../form/input/segmented-input'
import type { SchemaContext, JSONSchema } from '../schema-context'
import { mergeAllOf } from '../schema-context'
import { definitionToInputWrapperOptions } from './shared-utils'
import { JSONSchemaGenericControl } from './generic-control'
import {
  autoSelectOneOfBranch,
  getOneOfBranchLabel,
} from '../oneof-branch-detection'
import {
  getDiscriminatorConfig,
  selectOneOfBranch,
} from '../discriminator/discriminator-utils'

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
  // Generate labels for each branch
  const typesOrTitles = variants.map((def, index) => {
    return getOneOfBranchLabel(def, index, `${kind} ${index + 1}`)
  })

  // Check for discriminator configuration
  const discriminatorConfig =
    typeof ctx.definition === 'boolean'
      ? { discriminator: null, type: null }
      : getDiscriminatorConfig(ctx.definition)

  // Auto-detect the active branch based on current value
  const autoDetectedBranch = computedOf(
    controller.value,
    ctx.ajv
  )((value, ajv) => {
    if (kind === 'oneOf') {
      // Try discriminator-based selection first
      if (discriminatorConfig.discriminator) {
        const discriminatorBranch = selectOneOfBranch(
          variants,
          discriminatorConfig,
          value
        )
        if (discriminatorBranch !== null) {
          return discriminatorBranch
        }
      }
      // Fall back to validation-based selection
      return autoSelectOneOfBranch(ctx, value, ajv)
    }
    // For anyOf, we could implement similar logic but it's more permissive
    return autoSelectOneOfBranch(ctx, value, ajv)
  })

  // Initialize selection with auto-detected branch or fallback to 0
  const initialBranch = Value.get(autoDetectedBranch)
  const sel = prop<number>(initialBranch >= 0 ? initialBranch : 0)
  controller.onDispose(sel.dispose)

  // Update selection when auto-detection changes (but only if user hasn't manually selected)
  let userHasManuallySelected = false
  const autoUpdateCancel = autoDetectedBranch.on(detectedBranch => {
    if (!userHasManuallySelected && detectedBranch >= 0) {
      sel.set(detectedBranch)
    }
  })
  controller.onDispose(autoUpdateCancel)

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

  const change = (idx: number) => {
    userHasManuallySelected = true
    sel.set(idx)
  }

  // Branch detection info could be used for debugging/development in the future
  // const _branchDetectionInfo = computedOf(
  //   controller.value,
  //   ctx.ajv
  // )((value, ajv) => {
  //   if (kind === 'oneOf') {
  //     const detection = detectOneOfBranch(ctx, value, ajv)
  //     return {
  //       isAmbiguous: detection.isAmbiguous,
  //       hasNoMatch: detection.hasNoMatch,
  //       validBranches: detection.validBranches,
  //     }
  //   }
  //   return { isAmbiguous: false, hasNoMatch: false, validBranches: [] }
  // })

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

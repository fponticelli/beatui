import { attr, Renderable, Value, MapSignal } from '@tempots/dom'
import { Stack } from '../../layout'
import {
  Control,
  NativeSelect,
  NullableNumberInput,
  InputWrapper,
  type Controller,
  type UnionBranch,
  UnionController,
} from '../../form'
import { SegmentedInput } from '../../form/input/segmented-input'
import { upperCaseFirst } from '@tempots/std'
import type { SchemaContext, JSONSchema } from '../schema-context'
import {
  JSONTypeName,
  detectTypeName,
  tryConvert,
  defaultClearedValue,
  getXUI,
} from './type-utils'
import {
  definitionToInputWrapperOptions,
  integerMultipleOf,
} from './shared-utils'
import { JSONSchemaString } from './string-control'
import { JSONSchemaNumber, JSONSchemaInteger } from './number-controls'
import { JSONSchemaBoolean } from './boolean-control'
import { JSONSchemaNull } from './null-control'
import { JSONSchemaArray } from './array-control'
import { JSONSchemaObject } from './object-control'

/**
 * Convert JSON schema types to UnionBranch definitions
 */
function createUnionBranches(types: JSONTypeName[]): UnionBranch[] {
  return types.map(type => ({
    key: type,
    label: upperCaseFirst(type),
    detect: (value: unknown) => detectTypeName(value, [type]) === type,
    convert: (value: unknown) => tryConvert(value, type),
    defaultValue: () => defaultClearedValue(type),
  }))
}

/**
 * Control for union type schemas
 */
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

  // Create union branches for the types
  const branches = createUnionBranches(types)

  // Create union controller
  const unionController = new UnionController(
    controller.path,
    controller.change,
    controller.value,
    controller.status,
    { disabled: controller.disabled },
    branches
  )

  // Register disposal
  controller.onDispose(() => unionController.dispose())

  // Create selector component
  const Selector = (onChange: (t: JSONTypeName) => void) => {
    const mode = xui.selector ?? (types.length <= 3 ? 'segmented' : 'select')
    if (mode === 'segmented') {
      const labels = Object.fromEntries(
        types.map(t => [t, upperCaseFirst(t)])
      ) as Record<JSONTypeName, string>
      return SegmentedInput<Record<string, string>>({
        options: labels as Record<string, string>,
        value: unionController.activeBranch as Value<string>,
        onChange: (t: string) => onChange(t as JSONTypeName),
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
      value: unionController.activeBranch as Value<JSONTypeName>,
      onChange: onChange,
    })
  }

  // Handle branch switching
  const changeBranch = (next: JSONTypeName) => {
    unionController.switchToBranch(next, xui.confirmBranchChange)
  }

  // Render active branch control reactively
  const inner = MapSignal(unionController.activeBranch, activeBranchKey => {
    const t = Value.get(activeBranchKey) as JSONTypeName
    const branchController = unionController.getBranchController(t)

    // For primitive+null unions, map number/integer to NullableNumberInput
    if (onlyPrimitivePlusNull && (t === 'number' || t === 'integer')) {
      const d = def as JSONSchema
      return Control(NullableNumberInput, {
        ...definitionToInputWrapperOptions({
          ctx: ctx.with({ suppressLabel: true }),
        }),
        controller: branchController as unknown as Controller<number | null>,
        min: d.minimum,
        max: d.maximum,
        step: t === 'integer' ? integerMultipleOf(d.multipleOf) : d.multipleOf,
      })
    }

    // Delegate directly to specific type controls to avoid circular dependency
    const nextCtx = ctx.with({
      definition: { ...(def as JSONSchema), type: t },
      suppressLabel: true,
    })

    switch (t) {
      case 'string':
        return JSONSchemaString({
          ctx: nextCtx,
          controller: branchController as unknown as Controller<
            string | undefined
          >,
        })
      case 'number':
        return JSONSchemaNumber({
          ctx: nextCtx,
          controller: branchController as unknown as Controller<number>,
        })
      case 'integer':
        return JSONSchemaInteger({
          ctx: nextCtx,
          controller: branchController as unknown as Controller<number>,
        })
      case 'boolean':
        return JSONSchemaBoolean({
          ctx: nextCtx,
          controller: branchController as unknown as Controller<boolean | null>,
        })
      case 'null':
        return JSONSchemaNull({
          ctx: nextCtx,
          controller: branchController as unknown as Controller<null>,
        })
      case 'array': {
        const arrController = (
          branchController as unknown as Controller<unknown[]>
        ).array()
        return JSONSchemaArray({
          ctx: nextCtx,
          controller: arrController as import('../../form').ArrayController<
            unknown[]
          >,
        })
      }
      case 'object': {
        const objController = (
          branchController as unknown as Controller<Record<string, unknown>>
        ).object()
        return JSONSchemaObject({
          ctx: nextCtx,
          controller: objController as import('../../form').ObjectController<
            Record<string, unknown>
          >,
        })
      }
      default:
        // Fallback: render nothing for unknown types
        return Control(NullableNumberInput, {
          ...definitionToInputWrapperOptions({ ctx: nextCtx }),
          controller: branchController as unknown as Controller<number | null>,
        })
    }
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

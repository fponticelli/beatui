/**
 * Union Control for JSON Structure
 *
 * Handles union types (type arrays) like ["string", "number"] or ["string", "null"]
 */

import { Renderable, Value, MapSignal, attr } from '@tempots/dom'
import {
  type Controller,
  type UnionBranch,
  UnionController,
  NativeSelect,
  InputWrapper,
} from '../../form'
import { upperCaseFirst } from '@tempots/std'
import type { StructureContext } from '../structure-context'
import type { TypeKeyword } from '../structure-types'
import { getNonNullTypes } from '../structure-types'
import { StructureGenericControl } from './generic-control'
import { Stack } from '../../layout'
import { SegmentedInput } from '../../form/input/segmented-input'

/**
 * Create input wrapper options from context
 */
function createInputOptions(ctx: StructureContext) {
  return {
    label: ctx.suppressLabel ? undefined : ctx.label,
    description: ctx.description,
    required: ctx.isRequired,
    disabled: ctx.readOnly || ctx.isDeprecated,
  }
}

/**
 * Detect the type of a value against a union of types
 */
function detectTypeInUnion(value: unknown, types: TypeKeyword[]): TypeKeyword | null {
  if (value === null) return types.includes('null') ? 'null' : null
  if (value === undefined) return types.includes('string') ? 'string' : types[0] ?? null

  const jsType = typeof value

  switch (jsType) {
    case 'string':
      if (types.includes('uuid')) return 'uuid'
      if (types.includes('uri')) return 'uri'
      if (types.includes('date')) return 'date'
      if (types.includes('datetime')) return 'datetime'
      if (types.includes('time')) return 'time'
      if (types.includes('duration')) return 'duration'
      return types.includes('string') ? 'string' : null

    case 'number': {
      // Try to match specific numeric types
      if (Number.isInteger(value)) {
        // Check integer types in order of preference
        if (types.includes('int32')) return 'int32'
        if (types.includes('int64')) return 'int64'
        if (types.includes('uint32')) return 'uint32'
        if (types.includes('uint64')) return 'uint64'
        if (types.includes('int16')) return 'int16'
        if (types.includes('int8')) return 'int8'
        if (types.includes('uint16')) return 'uint16'
        if (types.includes('uint8')) return 'uint8'
      }
      // Check float types
      if (types.includes('double')) return 'double'
      if (types.includes('float')) return 'float'
      if (types.includes('decimal')) return 'decimal'
      return null
    }

    case 'bigint': {
      // BigInt values
      if (types.includes('int128')) return 'int128'
      if (types.includes('int64')) return 'int64'
      if (types.includes('uint128')) return 'uint128'
      if (types.includes('uint64')) return 'uint64'
      return null
    }

    case 'boolean':
      return types.includes('boolean') ? 'boolean' : null

    case 'object': {
      if (value instanceof File || value instanceof Blob) {
        return types.includes('binary') ? 'binary' : null
      }
      if (Array.isArray(value)) {
        if (types.includes('array')) return 'array'
        if (types.includes('set')) return 'set'
        if (types.includes('tuple')) return 'tuple'
        return null
      }
      if (types.includes('object')) return 'object'
      if (types.includes('map')) return 'map'
      return null
    }

    default:
      return null
  }
}

/**
 * Try to convert a value to a target type
 */
function tryConvert(
  value: unknown,
  target: TypeKeyword
): { ok: true; value: unknown } | { ok: false } {
  try {
    switch (target) {
      case 'string':
      case 'uuid':
      case 'uri':
      case 'date':
      case 'datetime':
      case 'time':
      case 'duration':
        if (value == null) return { ok: true, value: undefined }
        return { ok: true, value: String(value) }

      case 'int8':
      case 'int16':
      case 'int32':
      case 'uint8':
      case 'uint16':
      case 'uint32': {
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

      case 'int64':
      case 'int128':
      case 'uint64':
      case 'uint128': {
        if (typeof value === 'bigint') return { ok: true, value }
        if (typeof value === 'number' && Number.isInteger(value))
          return { ok: true, value: BigInt(value) }
        if (typeof value === 'string') {
          try {
            return { ok: true, value: BigInt(value.trim()) }
          } catch {
            return { ok: false }
          }
        }
        return { ok: false }
      }

      case 'float':
      case 'double':
      case 'decimal': {
        if (typeof value === 'number') return { ok: true, value }
        if (typeof value === 'string') {
          const n = Number(value)
          return Number.isFinite(n) ? { ok: true, value: n } : { ok: false }
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
      case 'set':
      case 'tuple':
        if (Array.isArray(value)) return { ok: true, value }
        return { ok: false }

      case 'object':
      case 'map':
        if (value != null && typeof value === 'object' && !Array.isArray(value))
          return { ok: true, value }
        return { ok: false }

      case 'binary':
        if (value instanceof File || value instanceof Blob)
          return { ok: true, value }
        return { ok: false }

      case 'null':
        return { ok: true, value: null }

      case 'any':
      case 'choice':
        return { ok: true, value }

      default:
        return { ok: false }
    }
  } catch {
    return { ok: false }
  }
}

/**
 * Get default cleared value for a type
 */
function defaultClearedValue(target: TypeKeyword): unknown {
  switch (target) {
    case 'null':
      return null
    case 'array':
    case 'set':
    case 'tuple':
      return []
    case 'object':
    case 'map':
      return {}
    case 'binary':
      return undefined
    default:
      return undefined
  }
}

/**
 * Convert type keywords to UnionBranch definitions
 */
function createUnionBranches(types: TypeKeyword[]): UnionBranch[] {
  return types.map(type => ({
    key: type,
    label: upperCaseFirst(type),
    detect: (value: unknown) => detectTypeInUnion(value, [type]) === type,
    convert: (value: unknown) => tryConvert(value, type),
    defaultValue: () => defaultClearedValue(type),
  }))
}

/**
 * Choice selector component for union type selection
 */
function ChoiceSelector<T extends string>({
  options,
  selected,
  onChange,
}: {
  options: ReadonlyArray<{ value: T; label: string }>
  selected: Value<T>
  onChange: (value: T) => void
}): Renderable {
  const count = options.length
  const mode = count <= 3 ? 'segmented' : 'select'

  if (mode === 'segmented') {
    const labels = Object.fromEntries(
      options.map(o => [o.value, o.label])
    ) as Record<string, string>

    return SegmentedInput<Record<string, string>>({
      options: labels,
      value: selected as unknown as Value<string>,
      onChange: (k: string) => onChange(k as T),
      size: 'sm',
    })
  }

  // Use native select
  return NativeSelect<T>({
    options: options.map(o => ({
      type: 'value',
      value: o.value,
      label: o.label,
    })),
    value: selected,
    onChange,
  })
}

/**
 * Layout wrapper for union controls
 */
function WithSelectorLayout({
  ctx,
  showSelector,
  selector,
  inner,
}: {
  ctx: StructureContext
  showSelector: boolean
  selector: Renderable
  inner: Renderable
}): Renderable {
  if (ctx.isRoot) {
    return showSelector
      ? Stack(attr.class('bc-stack--gap-2'), selector, inner)
      : inner
  }

  return InputWrapper({
    ...createInputOptions(ctx),
    content: showSelector
      ? Stack(
          attr.class('bc-stack--gap-2 bc-stack--align-start'),
          selector,
          inner
        )
      : inner,
  })
}

/**
 * Control for union type definitions
 */
export function StructureUnionControl<T>({
  ctx,
  controller,
}: {
  ctx: StructureContext
  controller: Controller<T>
}): Renderable {
  const typeDef = ctx.definition
  const typeSpec = typeDef.type

  // Get the type array
  let types: TypeKeyword[] = []
  if (Array.isArray(typeSpec)) {
    types = typeSpec as TypeKeyword[]
  } else {
    // Single type - shouldn't happen in union control, but handle gracefully
    console.warn('StructureUnionControl called with non-array type')
    return StructureGenericControl({ ctx, controller })
  }

  // If only primitives + null, hide null in selector and use nullable control
  // This is handled at a higher level, but we check here too for safety
  const hasNull = types.includes('null')
  const nonNullTypes = getNonNullTypes(typeSpec)

  // Filter out null from the selector options if we have other types
  const selectorTypes = hasNull && nonNullTypes.length > 0 ? nonNullTypes : types

  // Create union branches for the types
  const branches = createUnionBranches(selectorTypes)

  // Create union controller
  const unionController = new UnionController(
    controller.path,
    controller.change,
    controller.signal,
    controller.status,
    { disabled: controller.disabled },
    branches
  )

  // Register disposal
  controller.onDispose(() => unionController.dispose())

  // Create selector component
  const Selector = (onChange: (t: TypeKeyword) => void) =>
    ChoiceSelector<TypeKeyword>({
      options: selectorTypes.map(t => ({ value: t, label: upperCaseFirst(t) })),
      selected: unionController.activeBranch as Value<TypeKeyword>,
      onChange,
    })

  // Handle branch switching
  const changeBranch = (next: TypeKeyword) => {
    // For now, no confirmation - switch immediately
    unionController.switchToBranch(next, false)
  }

  // Render active branch control reactively
  const inner = MapSignal(unionController.activeBranch, activeBranchKey => {
    const t = Value.get(activeBranchKey) as TypeKeyword
    const branchController = unionController.getBranchController(t)

    // Create a new context with the single type
    const nextCtx = ctx.with({
      definition: { ...typeDef, type: t },
      // Suppress inner labels only when union is nested (non-root)
      suppressLabel: !ctx.isRoot,
    })

    // Delegate to generic control for rendering the specific type
    return StructureGenericControl({
      ctx: nextCtx,
      controller: branchController as unknown as Controller<unknown>,
    })
  })

  return WithSelectorLayout({
    ctx,
    showSelector: selectorTypes.length > 1,
    selector: Selector(changeBranch),
    inner,
  })
}

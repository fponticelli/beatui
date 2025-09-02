import { attr, Renderable, Value } from '@tempots/dom'
import { Stack } from '../../layout'
import { NativeSelect, InputWrapper } from '../../form'
import { SegmentedInput } from '../../form/input/segmented-input'
import type { SchemaContext } from '../schema-context'
import { definitionToInputWrapperOptions } from './shared-utils'

export type ChoiceMode = 'auto' | 'segmented' | 'select'

export interface ChoiceOption<T extends string | number> {
  value: T
  label: string
}

export interface ChoiceSelectorParams<T extends string | number> {
  options: ReadonlyArray<ChoiceOption<T>>
  selected: Value<T>
  onChange: (value: T) => void
  mode?: ChoiceMode
  size?: 'sm' | 'md' | 'lg'
  keyFor?: (value: T) => string
  parseKey?: (key: string) => T
}

/**
 * Build a selector UI that automatically chooses SegmentedInput (<=3 options)
 * or NativeSelect (>3 options), with optional explicit override.
 * Works with both string and number choices via keyFor/parseKey.
 */
export function ChoiceSelector<T extends string | number>(
  params: ChoiceSelectorParams<T>
): Renderable {
  const {
    options,
    selected,
    onChange,
    mode = 'auto',
    size = 'sm',
    keyFor = (v: T) => String(v),
    parseKey = (k: string) => (k as unknown) as T,
  } = params

  const count = options.length
  const resolvedMode: Exclude<ChoiceMode, 'auto'> =
    mode === 'auto' ? (count <= 3 ? 'segmented' : 'select') : mode

  if (resolvedMode === 'segmented') {
    const labels = Object.fromEntries(
      options.map(o => [keyFor(o.value), o.label])
    ) as Record<string, string>

    return SegmentedInput<Record<string, string>>({
      options: labels,
      value: (Value.map(selected, v => keyFor(v)) as unknown) as Value<string>,
      onChange: (k: string) => onChange(parseKey(k)),
      size,
    })
  }

  // Fallback to native select
  return NativeSelect<T>({
    options: options.map(o => ({ type: 'value', value: o.value, label: o.label })),
    value: selected,
    onChange,
  })
}

export interface WithSelectorLayoutParams {
  ctx: SchemaContext
  showSelector: boolean
  selector: Renderable
  inner: Renderable
}

/**
 * Wrap inner control with selector and layout based on context.
 * - At root: show selector + inner in a vertical Stack when showSelector is true
 * - Non-root: wrap content in InputWrapper and include selector when needed
 */
export function withSelectorLayout({
  ctx,
  showSelector,
  selector,
  inner,
}: WithSelectorLayoutParams): Renderable {
  if (ctx.isRoot) {
    return showSelector ? Stack(attr.class('bu-gap-2'), selector, inner) : inner
  }
  return InputWrapper({
    ...definitionToInputWrapperOptions({ ctx }),
    content: showSelector ? Stack(attr.class('bu-gap-2'), selector, inner) : inner,
  })
}


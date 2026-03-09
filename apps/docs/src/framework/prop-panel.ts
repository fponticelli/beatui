import { html, attr, prop, Prop, TNode, Value } from '@tempots/dom'
import {
  SegmentedInput,
  Switch,
  TextInput,
  NumberInput,
  NativeSelect,
  InputWrapper,
} from '@tempots/beatui'
import type { SelectOption } from '@tempots/beatui'
import type { PropMeta, ComponentMeta } from './types'

/**
 * A record of reactive signals for each controllable prop.
 */
export type PropSignals = Record<string, Prop<unknown>>

/**
 * Read the current values from all signals, returning a plain object snapshot.
 * Useful for imperative APIs (e.g. Drawer/Modal open callbacks) that need
 * current values at call time rather than reactive signals.
 */
export function snapshotSignals(
  signals: Record<string, Value<unknown>>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(signals).map(([k, v]) => [k, Value.get(v)])
  )
}

/**
 * Render a description string as inline markdown.
 * Supports: `code`, **bold**, *italic*, {@link Ref}
 */
function renderDescription(text: string): TNode {
  if (!text) return undefined as unknown as TNode
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const rendered = escaped
    .replace(
      /`([^`]+)`/g,
      '<code class="text-[0.65rem] px-0.5 bg-gray-200 dark:bg-gray-700 rounded">$1</code>'
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(
      /\{@link\s+(\w+)\}/g,
      '<code class="text-[0.65rem] px-0.5 bg-gray-200 dark:bg-gray-700 rounded">$1</code>'
    )
  return html.span(attr.innerHTML(rendered))
}

/**
 * Creates a control widget for a single prop based on its type metadata.
 */
function PropControl(meta: PropMeta, signal: Prop<unknown>): TNode {
  const typedSignal = signal as Prop<string>
  const description = meta.description
    ? renderDescription(meta.description)
    : undefined

  switch (meta.type) {
    case 'boolean':
      return InputWrapper({
        label: meta.name,
        description,
        content: Switch({
          value: signal as Prop<boolean>,
          onChange: v => (signal as Prop<boolean>).set(v),
          size: 'xs',
        }),
      })

    case 'union': {
      const values = meta.unionValues ?? []

      if (!meta.optional && values.length <= 4) {
        const options: Record<string, string> = {}
        for (const v of values) {
          options[v] = v
        }
        return InputWrapper({
          label: meta.name,
          description,
          content: SegmentedInput({
            options,
            value: typedSignal,
            onChange: v => typedSignal.set(v),
            size: 'xs',
          }),
        })
      }

      // Use NativeSelect for >4 options or optional unions (need a "none" entry)
      const selectOptions: SelectOption<string>[] = values.map(v => ({
        type: 'value' as const,
        value: v,
        label: v,
      }))
      if (meta.optional) {
        selectOptions.unshift({
          type: 'value' as const,
          value: '',
          label: '(none)',
        })
      }
      return InputWrapper({
        label: meta.name,
        description,
        content: NativeSelect({
          options: selectOptions,
          value: meta.optional
            ? (Value.map(signal, v => (v as string) ?? '') as Value<string>)
            : typedSignal,
          onChange: v =>
            signal.set(meta.optional && v === '' ? undefined : v),
          size: 'xs',
        }),
      })
    }

    case 'string': {
      // For optional string props (Value<string | undefined>), convert empty ↔ undefined
      // so components using Ensure/null checks work correctly
      if (meta.optional) {
        const displayValue = Value.map(signal, v => (v as string) ?? '')
        return InputWrapper({
          label: meta.name,
          description,
          content: TextInput({
            value: displayValue as Value<string>,
            onInput: v => signal.set(v === '' ? undefined : v),
            size: 'xs',
          }),
        })
      }
      return InputWrapper({
        label: meta.name,
        description,
        content: TextInput({
          value: typedSignal,
          onInput: v => typedSignal.set(v),
          size: 'xs',
        }),
      })
    }

    case 'number':
      return InputWrapper({
        label: meta.name,
        description,
        content: NumberInput({
          value: signal as Prop<number>,
          onChange: v => (signal as Prop<number>).set(v),
          size: 'xs',
          ...(meta.numberStep != null ? { step: meta.numberStep } : {}),
          ...(meta.numberMin != null ? { min: meta.numberMin } : {}),
          ...(meta.numberMax != null ? { max: meta.numberMax } : {}),
        }),
      })

    case 'bigint':
      return InputWrapper({
        label: meta.name,
        description,
        content: TextInput({
          value: Value.map(signal, v =>
            v != null ? String(v) : ''
          ) as Value<string>,
          onInput: v => {
            try {
              signal.set(v === '' ? undefined : BigInt(v))
            } catch {
              // ignore invalid bigint input
            }
          },
          placeholder: 'bigint',
          size: 'xs',
        }),
      })

    default:
      return html.span(`[${meta.type}] ${meta.name}`)
  }
}

/**
 * Parse a default value string into a typed JS value.
 */
function parseDefault(meta: PropMeta): unknown {
  const d = meta.defaultValue
  // Treat @default undefined as actual undefined (not the string "undefined")
  if (d === undefined || d === 'undefined') {
    switch (meta.type) {
      case 'boolean':
        return false
      case 'string':
        return ''
      case 'number':
        return 0
      case 'bigint':
        return 0n
      case 'union':
        if (meta.optional) return undefined
        // Default size to 'md' when not specified (most components default to md)
        if (meta.name === 'size' && meta.unionValues?.includes('md'))
          return 'md'
        return meta.unionValues?.[0] ?? ''
      default:
        return ''
    }
  }

  if (d === 'true') return true
  if (d === 'false') return false
  if (meta.type === 'bigint') {
    try {
      return BigInt(d.replace(/n$/, ''))
    } catch {
      return 0n
    }
  }
  const num = Number(d)
  if (!isNaN(num) && meta.type === 'number') return num
  const cleaned = d.replace(/^['"]|['"]$/g, '')
  // For union types, ensure the default matches one of the available values
  if (
    meta.type === 'union' &&
    meta.unionValues &&
    meta.unionValues.length > 0
  ) {
    if (!meta.unionValues.includes(cleaned)) {
      return meta.unionValues[0]
    }
  }
  return cleaned
}

/**
 * Creates an options panel with auto-generated controls for all controllable props.
 * Returns the panel TNode, a record of reactive signals, and a props record
 * where optional string props map empty/undefined values to `undefined` reactively.
 */
export function createOptionsPanel(
  componentMeta: ComponentMeta,
  defaults?: Record<string, unknown>
): {
  panel: TNode
  signals: PropSignals
  /** Props for passing to components — optional string signals map '' to undefined. */
  props: Record<string, Value<unknown>>
  /** Names of optional props that can toggle between undefined and a value. */
  optionalKeys: string[]
} {
  const signals: PropSignals = {}
  const props: Record<string, Value<unknown>> = {}
  const optionalKeys: string[] = []

  for (const propMeta of componentMeta.props) {
    const defaultVal =
      defaults && propMeta.name in defaults
        ? defaults[propMeta.name]
        : parseDefault(propMeta)
    const signal = prop(defaultVal)
    signals[propMeta.name] = signal

    // For optional string/union props, wrap in a computed that maps '' → undefined
    // so components checking `prop != null` see undefined instead of a truthy signal
    if (propMeta.optional && (propMeta.type === 'string' || propMeta.type === 'union')) {
      props[propMeta.name] = Value.map(signal, v =>
        v === undefined || v === '' ? undefined : v
      )
      optionalKeys.push(propMeta.name)
    } else {
      props[propMeta.name] = signal
    }
  }

  // Ensure a `value` signal always exists for input-based components.
  // The metadata extractor skips `value` when the Options type is generic (e.g. NativeSelectOptions<T>).
  if (!signals.value) {
    const fallback = defaults && 'value' in defaults ? defaults.value : undefined
    signals.value = prop<unknown>(fallback)
    props.value = signals.value
  }

  const panel = html.div(
    attr.class(
      'flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[400px]'
    ),
    html.div(
      attr.class(
        'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1'
      ),
      'Options'
    ),
    ...componentMeta.props.map(meta => PropControl(meta, signals[meta.name]))
  )

  return { panel, signals, props, optionalKeys }
}

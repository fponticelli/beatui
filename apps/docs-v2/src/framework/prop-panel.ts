import {
  html,
  attr,
  prop,
  TNode,
  Signal,
} from '@tempots/dom'
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
export type PropSignals = Record<string, Signal<unknown>>

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
    .replace(/`([^`]+)`/g, '<code class="text-[0.65rem] px-0.5 bg-gray-200 dark:bg-gray-700 rounded">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\{@link\s+(\w+)\}/g, '<code class="text-[0.65rem] px-0.5 bg-gray-200 dark:bg-gray-700 rounded">$1</code>')
  return html.span(attr.innerHTML(rendered))
}

/**
 * Creates a control widget for a single prop based on its type metadata.
 */
function PropControl(meta: PropMeta, signal: Signal<unknown>): TNode {
  const typedSignal = signal as Signal<string>
  const description = meta.description ? renderDescription(meta.description) : undefined

  switch (meta.type) {
    case 'boolean':
      return InputWrapper({
        label: meta.name,
        description,
        content: Switch({
          value: signal as Signal<boolean>,
          onChange: v => (signal as Signal<boolean>).set(v),
          size: 'xs',
        }),
      })

    case 'union': {
      const values = meta.unionValues ?? []

      if (values.length <= 4) {
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

      // More than 4 options — use NativeSelect
      const selectOptions: SelectOption<string>[] = values.map(v => ({
        type: 'value' as const,
        value: v,
        label: v,
      }))
      return InputWrapper({
        label: meta.name,
        description,
        content: NativeSelect({
          options: selectOptions,
          value: typedSignal,
          onChange: v => typedSignal.set(v),
          size: 'xs',
        }),
      })
    }

    case 'string':
      return InputWrapper({
        label: meta.name,
        description,
        content: TextInput({
          value: typedSignal,
          onInput: v => typedSignal.set(v),
          size: 'xs',
        }),
      })

    case 'number':
      return InputWrapper({
        label: meta.name,
        description,
        content: NumberInput({
          value: signal as Signal<number>,
          onChange: v => (signal as Signal<number>).set(v),
          size: 'xs',
          ...(meta.numberStep != null ? { step: meta.numberStep } : {}),
          ...(meta.numberMin != null ? { min: meta.numberMin } : {}),
          ...(meta.numberMax != null ? { max: meta.numberMax } : {}),
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
  if (d === undefined) {
    switch (meta.type) {
      case 'boolean':
        return false
      case 'string':
        return ''
      case 'number':
        return 0
      case 'union':
        return meta.unionValues?.[0] ?? ''
      default:
        return ''
    }
  }

  if (d === 'true') return true
  if (d === 'false') return false
  const num = Number(d)
  if (!isNaN(num) && meta.type === 'number') return num
  const cleaned = d.replace(/^['"]|['"]$/g, '')
  // For union types, ensure the default matches one of the available values
  if (meta.type === 'union' && meta.unionValues && meta.unionValues.length > 0) {
    if (!meta.unionValues.includes(cleaned)) {
      return meta.unionValues[0]
    }
  }
  return cleaned
}

/**
 * Creates an options panel with auto-generated controls for all controllable props.
 * Returns the panel TNode and a record of reactive signals.
 */
export function createOptionsPanel(componentMeta: ComponentMeta): {
  panel: TNode
  signals: PropSignals
} {
  const signals: PropSignals = {}

  for (const propMeta of componentMeta.props) {
    const defaultVal = parseDefault(propMeta)
    signals[propMeta.name] = prop(defaultVal)
  }

  const panel = html.div(
    attr.class(
      'flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-y-auto max-h-[400px]'
    ),
    html.div(
      attr.class('text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1'),
      'Options'
    ),
    ...componentMeta.props.map(meta =>
      PropControl(meta, signals[meta.name])
    )
  )

  return { panel, signals }
}

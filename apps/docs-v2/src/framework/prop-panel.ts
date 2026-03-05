import {
  html,
  attr,
  on,
  prop,
  TNode,
  Signal,
} from '@tempots/dom'
import {
  SegmentedInput,
  Switch,
  TextInput,
  NumberInput,
  InputWrapper,
} from '@tempots/beatui'
import type { PropMeta, ComponentMeta } from './types'

/**
 * A record of reactive signals for each controllable prop.
 */
export type PropSignals = Record<string, Signal<unknown>>

/**
 * Creates a control widget for a single prop based on its type metadata.
 */
function PropControl(meta: PropMeta, signal: Signal<unknown>): TNode {
  const typedSignal = signal as Signal<string>

  switch (meta.type) {
    case 'boolean':
      return InputWrapper({
        label: meta.name,
        description: meta.description || undefined,
        content: Switch({
          value: signal as Signal<boolean>,
          onChange: v => (signal as Signal<boolean>).set(v),
          size: 'xs',
        }),
      })

    case 'union': {
      const values = meta.unionValues ?? []

      if (values.length <= 6) {
        const options: Record<string, string> = {}
        for (const v of values) {
          options[v] = v.toUpperCase()
        }
        return InputWrapper({
          label: meta.name,
          description: meta.description || undefined,
          content: SegmentedInput({
            options,
            value: typedSignal,
            onChange: v => typedSignal.set(v),
            size: 'xs',
          }),
        })
      }

      // More than 6 options — use native select
      return InputWrapper({
        label: meta.name,
        description: meta.description || undefined,
        content: html.select(
          attr.class(
            'w-full text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
          ),
          attr.value(typedSignal),
          on.change(e => typedSignal.set((e.target as HTMLSelectElement).value)),
          ...values.map(v =>
            html.option(attr.value(v), v)
          )
        ),
      })
    }

    case 'string':
      return InputWrapper({
        label: meta.name,
        description: meta.description || undefined,
        content: TextInput({
          value: typedSignal,
          onInput: v => typedSignal.set(v),
          size: 'xs',
        }),
      })

    case 'number':
      return InputWrapper({
        label: meta.name,
        description: meta.description || undefined,
        content: NumberInput({
          value: signal as Signal<number>,
          onChange: v => (signal as Signal<number>).set(v),
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
  if (d === undefined) {
    // Sensible defaults by type
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
  return d.replace(/^['"]|['"]$/g, '')
}

/**
 * Creates a prop panel with auto-generated controls for all controllable props.
 * Returns the panel TNode and a record of reactive signals.
 */
export function createPropPanel(componentMeta: ComponentMeta): {
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
      'Properties'
    ),
    ...componentMeta.props.map(meta =>
      PropControl(meta, signals[meta.name])
    )
  )

  return { panel, signals }
}

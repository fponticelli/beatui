import {
  html,
  attr,
  TNode,
  computedOf,
  MapSignal,
  Value,
  Renderable,
} from '@tempots/dom'
import { componentMeta } from '../registry/component-meta'
import { createOptionsPanel, type PropSignals } from './prop-panel'
import { CodePreview } from './code-preview'

export type PlaygroundCodeOptions = {
  /** Override the default import source. @default '@tempots/beatui' */
  importFrom?: string
  /** Additional named imports to include (e.g. ['Icon', 'Group']). */
  extraImports?: string[]
  /** Code representation of children (e.g. "'Click Me'" or "html.p('Hello')"). */
  childrenCode?: string
}

/**
 * Wraps a preview TNode with the standard playground layout (preview + controls + code).
 */
function playgroundLayout(
  componentName: string,
  preview: TNode,
  panel: TNode,
  signals: PropSignals,
  codeOptions?: PlaygroundCodeOptions
): Renderable {
  const meta = componentMeta[componentName]
  const signalValues = Object.entries(signals)
  const importFrom = codeOptions?.importFrom ?? '@tempots/beatui'
  const childrenCode = codeOptions?.childrenCode

  const codeSignal = computedOf(
    ...signalValues.map(([, s]) => s as Value<unknown>)
  )((...values: unknown[]) => {
    const propEntries = signalValues
      .map(([name], i) => {
        const value = values[i]
        const propMeta = meta?.props.find(p => p.name === name)
        const defaultVal = propMeta?.defaultValue

        if (defaultVal !== undefined) {
          const cleanDefault = defaultVal.replace(/^['"]|['"]$/g, '')
          if (String(value) === cleanDefault) return null
        }

        if (typeof value === 'string') return `  ${name}: '${value}'`
        if (typeof value === 'boolean') return value ? `  ${name}: true` : null
        if (typeof value === 'number') return `  ${name}: ${value}`
        if (typeof value === 'bigint') return `  ${name}: ${value}n`
        return `  ${name}: ${JSON.stringify(value)}`
      })
      .filter(Boolean)

    // Build import line
    const imports = [componentName, ...(codeOptions?.extraImports ?? [])]
    const importLine = `import { ${imports.join(', ')} } from '${importFrom}'`

    // Build component call
    const children = childrenCode ?? '/* children */'
    const isMultiLineChildren = children.includes('\n')
    let call: string
    if (propEntries.length === 0 && !isMultiLineChildren) {
      call = `${componentName}({}, ${children})`
    } else if (propEntries.length === 0 && isMultiLineChildren) {
      call = `${componentName}({},${children}\n)`
    } else if (isMultiLineChildren) {
      call = `${componentName}({\n${propEntries.join(',\n')}\n},${children}\n)`
    } else {
      call = `${componentName}({\n${propEntries.join(',\n')}\n}, ${children})`
    }

    return `${importLine}\n\n${call}`
  })

  return html.div(
    attr.class('space-y-2'),
    html.div(
      attr.class(
        'flex flex-col lg:flex-row gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
      ),
      html.div(
        attr.class(
          'relative flex-1 flex items-center justify-center p-6 min-h-[120px] rounded-lg bg-gray-50 dark:bg-gray-800/30 playground-preview'
        ),
        html.div(attr.class('min-w-48 min-h-16 text-center'), preview)
      ),
      html.div(attr.class('lg:w-72 shrink-0'), panel)
    ),
    CodePreview(codeSignal)
  )
}

/**
 * Creates an auto-generated playground for a component.
 * The renderFn receives reactive prop values that update as controls change.
 */
export function autoPlayground(
  componentName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderFn: (props: any) => TNode,
  options?: { defaults?: Record<string, unknown> } & PlaygroundCodeOptions
): TNode {
  const meta = componentMeta[componentName]
  if (!meta) {
    return html.div(
      attr.class('p-4 text-red-500'),
      `No metadata found for component "${componentName}"`
    )
  }

  const { panel, signals, props, optionalKeys } = createOptionsPanel(
    meta,
    options?.defaults
  )

  // If there are optional props that toggle between undefined/defined,
  // re-render the component when any of them toggle. This handles components
  // like Divider that check `label != null` at construction time.
  let preview: TNode
  if (optionalKeys.length > 0) {
    // Compute a key that changes when any optional prop toggles defined/undefined
    const optionalSignals = optionalKeys.map(k => props[k] as Value<unknown>)
    const structureKey = computedOf(...optionalSignals)((...vals: unknown[]) =>
      vals.map(v => (v == null ? '0' : '1')).join('')
    )
    preview = MapSignal(structureKey, () => {
      // Build fresh props: omit optional keys that are currently undefined,
      // pass raw signals for defined ones (so text updates reactively).
      const currentProps: Record<string, Value<unknown>> = {}
      for (const [key, value] of Object.entries(props)) {
        if (optionalKeys.includes(key)) {
          const currentVal = Value.get(value)
          if (currentVal != null && currentVal !== '') {
            currentProps[key] = signals[key]
          }
        } else {
          currentProps[key] = value
        }
      }
      return renderFn(currentProps)
    })
  } else {
    preview = renderFn(props as Record<string, Value<unknown>>)
  }

  return playgroundLayout(componentName, preview, panel, signals, options)
}

/**
 * Creates a playground with auto-generated controls panel, but the caller
 * provides the preview rendering manually. Useful for callback-based components
 * (Modal, Drawer) or generic components (Tabs) where autoPlayground doesn't work.
 *
 * The renderFn receives the reactive signals for all auto-detected options.
 */
export function manualPlayground(
  componentName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderFn: (signals: any) => TNode,
  options?: { defaults?: Record<string, unknown> } & PlaygroundCodeOptions
): Renderable {
  const meta = componentMeta[componentName]
  if (!meta) {
    return html.div(
      attr.class('p-4 text-red-500'),
      `No metadata found for component "${componentName}"`
    )
  }

  const { panel, signals } = createOptionsPanel(meta, options?.defaults)
  const preview = renderFn(signals as Record<string, Value<unknown>>)
  return playgroundLayout(componentName, preview, panel, signals, options)
}

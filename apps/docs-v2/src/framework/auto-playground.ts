import { html, attr, TNode, computedOf, Value } from '@tempots/dom'
import { componentMeta } from '../registry/component-meta'
import { createPropPanel, type PropSignals } from './prop-panel'
import { CodePreview } from './code-preview'

/**
 * Creates an auto-generated playground for a component.
 *
 * Returns a layout with:
 * - Left: live preview rendered by the caller's renderFn
 * - Right: auto-generated property controls panel
 * - Bottom: collapsible code preview
 *
 * The renderFn receives reactive prop values that update as controls change.
 */
export function autoPlayground(
  componentName: string,
  renderFn: (props: Record<string, Value<unknown>>) => TNode
): TNode {
  const meta = componentMeta[componentName]
  if (!meta) {
    return html.div(
      attr.class('p-4 text-red-500'),
      `No metadata found for component "${componentName}"`
    )
  }

  const { panel, signals } = createPropPanel(meta)

  // Build code string from current prop values
  const signalValues = Object.entries(signals)
  const codeSignal = computedOf(
    ...signalValues.map(([, s]) => s as Value<unknown>)
  )((...values: unknown[]) => {
    const propEntries = signalValues
      .map(([name], i) => {
        const value = values[i]
        // Find the default for this prop
        const propMeta = meta.props.find(p => p.name === name)
        const defaultVal = propMeta?.defaultValue

        // Skip if it matches the default
        if (defaultVal !== undefined) {
          const cleanDefault = defaultVal.replace(/^['"]|['"]$/g, '')
          if (String(value) === cleanDefault) return null
        }

        if (typeof value === 'string') return `  ${name}: '${value}'`
        if (typeof value === 'boolean') return value ? `  ${name}: true` : null
        if (typeof value === 'number') return `  ${name}: ${value}`
        return `  ${name}: ${JSON.stringify(value)}`
      })
      .filter(Boolean)

    if (propEntries.length === 0) {
      return `${componentName}({}, /* children */)`
    }

    return `${componentName}({\n${propEntries.join(',\n')}\n}, /* children */)`
  })

  return html.div(
    attr.class('space-y-2'),
    // Main playground area: preview + controls
    html.div(
      attr.class(
        'flex flex-col lg:flex-row gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
      ),
      // Live preview
      html.div(
        attr.class(
          'flex-1 flex items-center justify-center p-6 min-h-[120px] rounded-lg bg-gray-50 dark:bg-gray-800/30'
        ),
        renderFn(signals as Record<string, Value<unknown>>)
      ),
      // Controls panel
      html.div(attr.class('lg:w-72 shrink-0'), panel)
    ),
    // Code preview toggle
    CodePreview(codeSignal)
  )
}

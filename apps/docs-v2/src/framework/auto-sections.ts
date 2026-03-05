import { html, attr, TNode } from '@tempots/dom'
import type { ComponentMeta, DocSection, PropMeta } from './types'
import { componentMeta } from '../registry/component-meta'
import { Section } from './section'

/** Props that should generate their own showcase section */
const SHOWCASE_PROPS = new Set([
  'variant',
  'size',
  'color',
  'roundedness',
])

/**
 * Generate auto-sections for each union prop that's worth showcasing.
 * For each such prop, creates a grid showing all values while other props use defaults.
 */
export function AutoSections(
  componentName: string,
  renderFn: (props: Record<string, unknown>) => TNode
): DocSection[] {
  const meta = componentMeta[componentName]
  if (!meta) return []

  const sections: DocSection[] = []

  for (const propMeta of meta.props) {
    if (propMeta.type !== 'union') continue
    if (!propMeta.unionValues || propMeta.unionValues.length === 0) continue
    if (!SHOWCASE_PROPS.has(propMeta.name)) continue

    // Build default props for all other union props
    const baseProps: Record<string, unknown> = {}
    for (const p of meta.props) {
      if (p.name === propMeta.name) continue
      if (p.defaultValue !== undefined) {
        baseProps[p.name] = parseDefaultValue(p)
      }
    }

    const title = capitalizeFirst(propMeta.name) + 's'
    const description = `All available ${propMeta.name} options.`

    sections.push(
      Section(
        title,
        () =>
          html.div(
            attr.class('flex flex-row flex-wrap gap-3 items-center'),
            ...propMeta.unionValues!.map(value =>
              html.div(
                attr.class('flex flex-col items-center gap-1'),
                renderFn({ ...baseProps, [propMeta.name]: value }),
                html.span(
                  attr.class(
                    'text-xs text-gray-500 dark:text-gray-400 font-mono'
                  ),
                  value
                )
              )
            )
          ),
        description
      )
    )
  }

  return sections
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function parseDefaultValue(meta: PropMeta): unknown {
  const d = meta.defaultValue
  if (d === undefined) {
    if (meta.type === 'boolean') return false
    if (meta.type === 'union') return meta.unionValues?.[0] ?? ''
    return ''
  }
  if (d === 'true') return true
  if (d === 'false') return false
  return d.replace(/^['"]|['"]$/g, '')
}

import {
  attr,
  html,
  Renderable,
  TNode,
  prop,
  computedOf,
  on,
  aria,
  Value,
} from '@tempots/dom'
import { Stack } from '../../layout'
import { Card } from '../../layout/card'
import { Label } from '../../typography'
import { Icon } from '../../data'
import type { SchemaContext } from '../schema-context'
import { getXUIConfig } from '../widgets/utils'

/**
 * Container layout configuration from x:ui
 */
export interface ContainerLayoutConfig {
  /** Container format type */
  format?: 'fieldset' | 'tabs' | 'accordion' | 'group' | 'grid'
  /** Property ordering */
  order?: string[]
  /** Property grouping */
  groups?: Record<string, string[]>
  /** Grid columns configuration */
  cols?:
    | number
    | { sm?: number; md?: number; lg?: number; xl?: number; '2xl'?: number }
  /** Additional layout options */
  [key: string]: unknown
}

/**
 * Extract container layout configuration from schema x:ui
 */
export function getContainerLayout(
  ctx: SchemaContext
): ContainerLayoutConfig | undefined {
  if (typeof ctx.definition === 'boolean') return undefined

  const xui = getXUIConfig(ctx.definition)
  if (typeof xui !== 'object') return undefined

  const config: ContainerLayoutConfig = {}

  // Extract container-specific options
  if (
    typeof xui.format === 'string' &&
    ['fieldset', 'tabs', 'accordion', 'group', 'grid'].includes(xui.format)
  ) {
    config.format = xui.format as ContainerLayoutConfig['format']
  }

  if (Array.isArray(xui.order)) {
    config.order = xui.order.filter(
      (item): item is string => typeof item === 'string'
    )
  }

  if (xui.groups && typeof xui.groups === 'object') {
    config.groups = xui.groups as Record<string, string[]>
  }

  if (typeof xui.cols === 'number') {
    config.cols = xui.cols
  } else if (xui.cols && typeof xui.cols === 'object') {
    config.cols = xui.cols as ContainerLayoutConfig['cols']
  }

  return Object.keys(config).length > 0 ? config : undefined
}

/**
 * Fieldset container layout
 */
export function FieldsetContainer({
  title,
  children,
}: {
  title?: string
  children: TNode[]
}): Renderable {
  return html.fieldset(
    attr.class('bc-fieldset'),
    title ? html.legend(attr.class('bc-fieldset__legend'), title) : null,
    html.div(
      attr.class('bc-fieldset__content'),
      Stack(attr.class('bc-stack--gap-1'), ...children)
    )
  )
}

/**
 * Group container layout (using Card)
 */
export function GroupContainer({
  title,
  children,
}: {
  title?: string
  children: TNode[]
}): Renderable {
  return Card(
    { variant: 'outlined', size: 'md' },
    Stack(
      attr.class('bc-stack--gap-1'),
      title ? Label(title) : null,
      ...children
    )
  )
}

/**
 * Grid container layout
 */
export function GridContainer({
  cols = 1,
  children,
}: {
  cols?: ContainerLayoutConfig['cols']
  children: TNode[]
}): Renderable {
  const gridClasses =
    typeof cols === 'number'
      ? `bc-schema-grid bc-schema-grid--cols-${cols}`
      : computedOf(cols)(colsConfig => {
          if (typeof colsConfig === 'number') {
            return `bc-schema-grid bc-schema-grid--cols-${colsConfig}`
          }
          if (colsConfig && typeof colsConfig === 'object') {
            const classes = ['bc-schema-grid']
            if (colsConfig.sm) {
              classes.push(`bc-schema-grid--cols-sm-${colsConfig.sm}`)
            }
            if (colsConfig.md) {
              classes.push(`bc-schema-grid--cols-md-${colsConfig.md}`)
            }
            if (colsConfig.lg) {
              classes.push(`bc-schema-grid--cols-lg-${colsConfig.lg}`)
            }
            if (colsConfig.xl) {
              classes.push(`bc-schema-grid--cols-xl-${colsConfig.xl}`)
            }
            if (colsConfig['2xl']) {
              classes.push(`bc-schema-grid--cols-2xl-${colsConfig['2xl']}`)
            }
            return classes.join(' ')
          }
          return 'bc-schema-grid bc-schema-grid--cols-1'
        })

  return html.div(
    attr.class(gridClasses),
    attr.class('bc-schema-grid--gap-4'),
    ...children
  )
}

/**
 * Tabs container layout
 */
export function TabsContainer({
  groups,
  children,
}: {
  groups?: Record<string, TNode[]>
  children: TNode[]
}): Renderable {
  if (!groups || Object.keys(groups).length === 0) {
    // No groups defined, render as simple tabs with all children in one tab
    return SimpleTabsContainer({ title: 'Properties', children })
  }

  const activeTab = prop(Object.keys(groups)[0])
  const groupEntries = Object.entries(groups)

  return html.div(
    attr.class('bc-tabs'),
    // Tab headers
    html.div(
      attr.class('bc-tabs__header'),
      attr.role('tablist'),
      ...groupEntries.map(([groupName], index) =>
        html.button(
          attr.class('bc-tabs__tab'),
          attr.class(
            computedOf(activeTab)((active): string =>
              active === groupName ? 'bc-tabs__tab--active' : ''
            )
          ),
          attr.role('tab'),
          attr.tabindex(
            activeTab.map((active): number => (active === groupName ? 0 : -1))
          ),
          on.click(() => activeTab.set(groupName)),
          on.keydown((e: KeyboardEvent) => {
            switch (e.key) {
              case 'ArrowLeft':
                e.preventDefault()
                const prevIndex =
                  index > 0 ? index - 1 : groupEntries.length - 1
                activeTab.set(groupEntries[prevIndex][0])
                break
              case 'ArrowRight':
                e.preventDefault()
                const nextIndex =
                  index < groupEntries.length - 1 ? index + 1 : 0
                activeTab.set(groupEntries[nextIndex][0])
                break
              case 'Home':
                e.preventDefault()
                activeTab.set(groupEntries[0][0])
                break
              case 'End':
                e.preventDefault()
                activeTab.set(groupEntries[groupEntries.length - 1][0])
                break
            }
          }),
          groupName
        )
      )
    ),
    // Tab content
    html.div(
      attr.class('bc-tabs__content'),
      ...groupEntries.map(([groupName, propertyNames]) =>
        html.div(
          attr.class('bc-tabs__panel'),
          attr.class(
            computedOf(activeTab)((active): string =>
              active === groupName
                ? 'bc-tabs__panel--active'
                : 'bc-tabs__panel--hidden'
            )
          ),
          attr.role('tabpanel'),
          Stack(
            attr.class('bc-stack--gap-1'),
            // Filter children to only show properties in this group
            ...children.filter((_, index) => {
              // This is a simplified approach - in practice, you'd need to match
              // children to property names based on the rendering context
              return propertyNames.length === 0 || index < propertyNames.length
            })
          )
        )
      )
    )
  )
}

/**
 * Simple tabs container for when no groups are defined
 */
function SimpleTabsContainer({
  title,
  children,
}: {
  title: string
  children: TNode[]
}): Renderable {
  return html.div(
    attr.class('bc-tabs'),
    html.div(
      attr.class('bc-tabs__header'),
      html.div(attr.class('bc-tabs__tab bc-tabs__tab--active'), title)
    ),
    html.div(
      attr.class('bc-tabs__content'),
      html.div(
        attr.class('bc-tabs__panel bc-tabs__panel--active'),
        Stack(attr.class('bc-stack--gap-1'), ...children)
      )
    )
  )
}

/**
 * Accordion container layout
 */
export function AccordionContainer({
  groups,
  children,
}: {
  groups?: Record<string, TNode[]>
  children: TNode[]
}): Renderable {
  if (!groups || Object.keys(groups).length === 0) {
    // No groups defined, render as simple accordion with all children in one section
    return SimpleAccordionContainer({ title: 'Properties', children })
  }

  const groupEntries = Object.entries(groups)
  const openSections = prop(new Set([groupEntries[0]?.[0]].filter(Boolean)))

  return html.div(
    attr.class('bc-accordion'),
    ...groupEntries.map(([groupName, propertyNames]) => {
      const isOpen = computedOf(openSections)(sections =>
        sections.has(groupName)
      )

      return html.div(
        attr.class('bc-accordion__item'),
        html.button(
          attr.class('bc-accordion__header'),
          aria.expanded(isOpen as Value<boolean | 'undefined'>),
          on.click(() => {
            const current = openSections.value
            const newSections = new Set(current)
            if (newSections.has(groupName)) {
              newSections.delete(groupName)
            } else {
              newSections.add(groupName)
            }
            openSections.set(newSections)
          }),
          on.keydown((e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              const current = openSections.value
              const newSections = new Set(current)
              if (newSections.has(groupName)) {
                newSections.delete(groupName)
              } else {
                newSections.add(groupName)
              }
              openSections.set(newSections)
            }
          }),
          html.span(groupName),
          Icon({
            icon: computedOf(isOpen)((open): string =>
              open ? 'chevron-up' : 'chevron-down'
            ),
            size: 'sm',
          })
        ),
        html.div(
          attr.class('bc-accordion__content'),
          attr.class(
            computedOf(isOpen)((open): string =>
              open
                ? 'bc-accordion__content--open'
                : 'bc-accordion__content--closed'
            )
          ),
          Stack(
            attr.class('bc-stack--gap-1'),
            // Filter children to only show properties in this group
            ...children.filter((_, index) => {
              // This is a simplified approach - in practice, you'd need to match
              // children to property names based on the rendering context
              return propertyNames.length === 0 || index < propertyNames.length
            })
          )
        )
      )
    })
  )
}

/**
 * Simple accordion container for when no groups are defined
 */
function SimpleAccordionContainer({
  title,
  children,
}: {
  title: string
  children: TNode[]
}): Renderable {
  const isOpen = prop(true)

  return html.div(
    attr.class('bc-accordion'),
    html.div(
      attr.class('bc-accordion__item'),
      html.button(
        attr.class('bc-accordion__header'),
        on.click(() => isOpen.set(!isOpen.value)),
        html.span(title),
        Icon({
          icon: computedOf(isOpen)((open): string =>
            open ? 'chevron-up' : 'chevron-down'
          ),
          size: 'sm',
        })
      ),
      html.div(
        attr.class('bc-accordion__content'),
        attr.class(
          computedOf(isOpen)((open): string =>
            open
              ? 'bc-accordion__content--open'
              : 'bc-accordion__content--closed'
          )
        ),
        Stack(attr.class('bc-stack--gap-1'), ...children)
      )
    )
  )
}

/**
 * Order and group children based on configuration
 */
function organizeChildren(
  children: TNode[],
  config: ContainerLayoutConfig,
  propertyNames: string[]
): { orderedChildren: TNode[]; groupedChildren?: Record<string, TNode[]> } {
  // Create a map of property names to children for ordering
  const childMap = new Map<string, TNode>()
  propertyNames.forEach((name, index) => {
    if (children[index]) {
      childMap.set(name, children[index])
    }
  })

  // Apply ordering if specified
  let orderedChildren = children
  if (config.order && config.order.length > 0) {
    const orderedMap = new Map<string, TNode>()
    const remainingChildren: TNode[] = []

    // First, add children in the specified order
    config.order.forEach(propName => {
      const child = childMap.get(propName)
      if (child) {
        orderedMap.set(propName, child)
      }
    })

    // Then add any remaining children that weren't in the order list
    propertyNames.forEach((name, index) => {
      if (!config.order!.includes(name) && children[index]) {
        remainingChildren.push(children[index])
      }
    })

    orderedChildren = [...Array.from(orderedMap.values()), ...remainingChildren]
  }

  // Apply grouping if specified
  let groupedChildren: Record<string, TNode[]> | undefined
  if (config.groups && Object.keys(config.groups).length > 0) {
    groupedChildren = {}
    const usedChildren = new Set<TNode>()

    // Group children according to the groups configuration
    Object.entries(config.groups).forEach(([groupName, propNames]) => {
      groupedChildren![groupName] = []
      propNames.forEach(propName => {
        const child = childMap.get(propName)
        if (child) {
          groupedChildren![groupName].push(child)
          usedChildren.add(child)
        }
      })
    })

    // Add ungrouped children to a default group
    const ungroupedChildren = orderedChildren.filter(
      child => !usedChildren.has(child)
    )
    if (ungroupedChildren.length > 0) {
      groupedChildren['Other'] = ungroupedChildren
    }
  }

  return { orderedChildren, groupedChildren }
}

/**
 * Apply container layout to children based on configuration
 */
export function applyContainerLayout(
  config: ContainerLayoutConfig | undefined,
  ctx: SchemaContext,
  children: TNode[],
  propertyNames: string[] = []
): Renderable {
  if (!config || !config.format) {
    // No container format specified, but still apply ordering if present
    if (config?.order) {
      const { orderedChildren } = organizeChildren(
        children,
        config,
        propertyNames
      )
      return Stack(attr.class('bc-stack--gap-1'), ...orderedChildren)
    }
    return Stack(attr.class('bc-stack--gap-1'), ...children)
  }

  const title = ctx.widgetLabel || ctx.name
  const { orderedChildren, groupedChildren } = organizeChildren(
    children,
    config,
    propertyNames
  )

  switch (config.format) {
    case 'fieldset':
      return FieldsetContainer({ title, children: orderedChildren })

    case 'group':
      return GroupContainer({ title, children: orderedChildren })

    case 'grid':
      return GridContainer({ cols: config.cols, children: orderedChildren })

    case 'tabs':
      return TabsContainer({
        groups: groupedChildren || config.groups,
        children: groupedChildren
          ? Object.values(groupedChildren).flat()
          : orderedChildren,
      })

    case 'accordion':
      return AccordionContainer({
        groups: groupedChildren || config.groups,
        children: groupedChildren
          ? Object.values(groupedChildren).flat()
          : orderedChildren,
      })

    default:
      return Stack(attr.class('bc-stack--gap-1'), ...orderedChildren)
  }
}

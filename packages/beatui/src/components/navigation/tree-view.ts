import {
  aria,
  attr,
  computedOf,
  ForEach,
  html,
  on,
  OnDispose,
  prop,
  Signal,
  TNode,
  Value,
  When,
  WithElement,
  Empty,
} from '@tempots/dom'
import { Icon } from '../data/icon'
import { Collapse } from '../layout/collapse'
import { ControlSize } from '../theme'

/**
 * Data structure representing a single item in the tree hierarchy.
 */
export interface TreeItemData {
  /** Unique identifier for the tree item */
  id: string
  /** Display label for the item */
  label: string
  /** Optional icon name (Iconify format, e.g., `'mdi:folder'`) */
  icon?: string
  /** Child items nested under this item */
  children?: TreeItemData[]
  /** Optional badge text displayed on the right */
  badge?: string
}

/**
 * Configuration options for the {@link TreeView} component.
 */
export interface TreeViewOptions {
  /** Array of tree items to render */
  items: Value<TreeItemData[]>
  /** Currently selected item ID */
  selectedId?: Value<string | undefined>
  /** Callback when an item is selected */
  onSelect?: (id: string) => void
  /**
   * Set of expanded item IDs for controlled mode (read-only).
   * When provided, the component reads expansion state from this value.
   * Use together with `onToggle` to handle state updates externally.
   * When omitted, the component manages its own expansion state internally.
   */
  expandedIds?: Value<Set<string>>
  /**
   * Callback when an item is expanded or collapsed.
   * In controlled mode (when `expandedIds` is provided), use this to update your external state.
   * In uncontrolled mode, this is called after the internal state is updated.
   */
  onToggle?: (id: string, expanded: boolean) => void
  /** Size of the tree items */
  size?: Value<ControlSize>
}

/**
 * Renders a single tree item with its children recursively.
 * Accepts a Signal<TreeItemData> so it reacts to item changes without MapSignal.
 */
function renderTreeItem(
  itemSignal: Signal<TreeItemData>,
  depth: number,
  selectedId: Value<string | undefined>,
  expandedIds: Value<Set<string>>,
  onSelect: ((id: string) => void) | undefined,
  onItemToggle: (id: string) => void,
  size: Value<ControlSize>
): TNode {
  const hasChildren = itemSignal.map(
    i => i.children != null && i.children.length > 0
  )
  const isExpanded = computedOf(
    expandedIds,
    itemSignal
  )((ids, item) => ids.has(item.id))
  const isSelected = computedOf(
    selectedId,
    itemSignal
  )((id, item) => id === item.id)
  const children = itemSignal.map(i => i.children ?? [])

  const handleClick = () => {
    onSelect?.(Value.get(itemSignal).id)
  }

  const handleToggle = (e: Event) => {
    e.stopPropagation()
    onItemToggle(Value.get(itemSignal).id)
  }

  return html.div(
    attr.class('bc-tree-item'),
    // The clickable row
    html.div(
      attr.class(
        computedOf(
          isSelected,
          size
        )((selected, sz) =>
          [
            'bc-tree-item__row',
            `bc-tree-item__row--size-${sz ?? 'md'}`,
            selected ? 'bc-tree-item__row--selected' : '',
          ]
            .filter(Boolean)
            .join(' ')
        )
      ),
      attr.style(`padding-left: ${depth * 20 + 8}px`),
      attr.role('treeitem'),
      attr.tabindex(0),
      aria.selected(isSelected),
      WithElement(el => {
        const ariaValue = computedOf(
          hasChildren,
          isExpanded
        )((hc, exp) => (hc ? String(exp) : null))
        return OnDispose(
          Value.on(ariaValue, v => {
            if (v != null) {
              el.setAttribute('aria-expanded', v)
            } else {
              el.removeAttribute('aria-expanded')
            }
          })
        )
      }),
      on.click(handleClick),

      // Expand/collapse chevron
      When(
        hasChildren,
        () =>
          html.span(
            attr.class(
              Value.map(isExpanded, expanded =>
                [
                  'bc-tree-item__toggle',
                  expanded ? 'bc-tree-item__toggle--expanded' : '',
                ]
                  .filter(Boolean)
                  .join(' ')
              )
            ),
            on.click(handleToggle),
            Icon({
              icon: 'mdi:chevron-right',
              size: 'sm',
              accessibility: 'decorative',
            })
          ),
        () => html.span(attr.class('bc-tree-item__toggle-spacer'))
      ),

      // Icon
      When(
        itemSignal.map(i => i.icon != null),
        () =>
          html.span(
            attr.class('bc-tree-item__icon'),
            Icon({
              icon: itemSignal.map(i => i.icon ?? ''),
              size: 'sm',
              accessibility: 'decorative',
            })
          ),
        () => Empty
      ),

      // Label
      html.span(
        attr.class('bc-tree-item__label'),
        itemSignal.map(i => i.label)
      ),

      // Badge
      When(
        itemSignal.map(i => i.badge != null),
        () =>
          html.span(
            attr.class('bc-tree-item__badge'),
            itemSignal.map(i => i.badge ?? '')
          ),
        () => Empty
      )
    ),

    // Children (collapsible) — Collapse uses WithElement which modifies its
    // parent element, so it must be wrapped in its own div to avoid hiding
    // the entire tree item row when collapsed.
    When(
      hasChildren,
      () =>
        html.div(
          Collapse(
            { open: isExpanded },
            html.div(
              attr.class('bc-tree-item__children'),
              attr.role('group'),
              ForEach(children, childSignal =>
                renderTreeItem(
                  childSignal,
                  depth + 1,
                  selectedId,
                  expandedIds,
                  onSelect,
                  onItemToggle,
                  size
                )
              )
            )
          )
        ),
      () => Empty
    )
  )
}

/**
 * TreeView component for displaying hierarchical data with expand/collapse functionality.
 *
 * The TreeView renders a tree structure where items can have nested children. Each item
 * can display an icon, label, and badge. Items with children show a chevron that can be
 * clicked to expand or collapse the nested content.
 *
 * The component supports both controlled and uncontrolled modes:
 * - **Controlled**: Pass `expandedIds` as a prop to manage expansion state externally
 * - **Uncontrolled**: Let the component manage its own expansion state internally
 *
 * @param options - Configuration for tree items, selection, expansion, and callbacks
 * @param children - Additional child nodes appended to the tree container
 * @returns A tree navigation element with interactive expand/collapse behavior
 *
 * @example
 * ```typescript
 * // Uncontrolled mode — component manages expansion state internally
 * TreeView({
 *   items: [
 *     {
 *       id: 'folder1',
 *       label: 'Documents',
 *       icon: 'mdi:folder',
 *       children: [
 *         { id: 'file1', label: 'Report.pdf', icon: 'mdi:file-pdf' },
 *         { id: 'file2', label: 'Data.xlsx', icon: 'mdi:file-excel' },
 *       ]
 *     },
 *     { id: 'file3', label: 'Image.png', icon: 'mdi:file-image' }
 *   ],
 *   onSelect: (id) => console.log('Selected:', id),
 * })
 * ```
 *
 * @example
 * ```typescript
 * // Controlled mode — parent manages expansion state
 * const expandedIds = prop(new Set(['folder1']))
 *
 * TreeView({
 *   items: treeData,
 *   expandedIds,
 *   onToggle: (id, expanded) => {
 *     const ids = new Set(expandedIds.value)
 *     expanded ? ids.add(id) : ids.delete(id)
 *     expandedIds.set(ids)
 *   },
 * })
 * ```
 */
export function TreeView(
  {
    items,
    selectedId,
    onSelect,
    expandedIds: externalExpandedIds,
    onToggle,
    size = 'md',
  }: TreeViewOptions,
  ...children: TNode[]
) {
  // Local state for uncontrolled mode
  const localExpandedIds = prop<Set<string>>(new Set())

  // Read from external if provided, otherwise from local state
  const expandedIds: Value<Set<string>> =
    externalExpandedIds ?? localExpandedIds

  // Use a default selectedId if not provided
  const internalSelectedId = selectedId ?? prop<string | undefined>(undefined)

  // Toggle handler: updates local state in uncontrolled mode, always calls onToggle
  const handleItemToggle = (id: string) => {
    const currentIds = Value.get(expandedIds)
    const nowExpanded = !currentIds.has(id)

    // In uncontrolled mode (no external expandedIds), update local state
    if (externalExpandedIds == null) {
      const newIds = new Set(currentIds)
      if (nowExpanded) {
        newIds.add(id)
      } else {
        newIds.delete(id)
      }
      localExpandedIds.set(newIds)
    }

    onToggle?.(id, nowExpanded)
  }

  return html.div(
    attr.class(
      Value.map(size, s => `bc-tree-view bc-tree-view--size-${s ?? 'md'}`)
    ),
    attr.role('tree'),
    ForEach(items, itemSignal =>
      renderTreeItem(
        itemSignal,
        0,
        internalSelectedId,
        expandedIds,
        onSelect,
        handleItemToggle,
        size
      )
    ),
    ...children
  )
}

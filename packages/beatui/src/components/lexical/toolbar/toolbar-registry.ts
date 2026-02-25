import type {
  ToolbarButtonId,
  ToolbarConfig,
  ToolbarGroupId,
  ToolbarLayoutEntry,
} from '../../../lexical/types'

/**
 * Default buttons for each toolbar group, in display order.
 * This is the single source of truth for default group contents.
 */
export const GROUP_BUTTONS: Record<ToolbarGroupId, ToolbarButtonId[]> = {
  font: ['font-family', 'font-size', 'line-height'],
  color: ['font-color', 'highlight-color', 'background-color'],
  'text-formatting': ['bold', 'italic', 'underline', 'strikethrough', 'code'],
  'clear-formatting': ['clear-formatting'],
  headings: [
    'paragraph',
    'heading-1',
    'heading-2',
    'heading-3',
    'heading-4',
    'heading-5',
    'heading-6',
  ],
  lists: ['bullet-list', 'ordered-list', 'check-list'],
  indent: ['indent', 'outdent'],
  blocks: ['blockquote', 'code-block', 'horizontal-rule'],
  tables: ['insert-table'],
  links: ['link'],
  history: ['undo', 'redo'],
  clipboard: ['cut', 'copy', 'paste'],
}

/** Default group order, matching the current hardcoded toolbar layout. */
const DEFAULT_GROUP_ORDER: ToolbarGroupId[] = [
  'font',
  'color',
  'text-formatting',
  'clear-formatting',
  'headings',
  'lists',
  'indent',
  'blocks',
  'tables',
  'links',
  'history',
  'clipboard',
]

/**
 * Returns the default toolbar layout (all groups in standard order).
 */
export function getDefaultLayout(): ToolbarLayoutEntry[] {
  return DEFAULT_GROUP_ORDER.map(group => ({ group }))
}

/**
 * Resolves a ToolbarConfig into a concrete layout.
 * - If `layout` is provided, returns it directly.
 * - Otherwise, applies visibleGroups/hiddenGroups filtering to the default layout.
 */
export function resolveLayout(config: ToolbarConfig): ToolbarLayoutEntry[] {
  if (config.layout) {
    return config.layout
  }

  const { visibleGroups, hiddenGroups } = config
  const defaultLayout = getDefaultLayout()

  if (!visibleGroups && !hiddenGroups) {
    return defaultLayout
  }

  return defaultLayout.filter(entry => {
    if ('separator' in entry) return true
    const groupId = entry.group
    if (hiddenGroups?.includes(groupId)) return false
    if (visibleGroups && !visibleGroups.includes(groupId)) return false
    return true
  })
}

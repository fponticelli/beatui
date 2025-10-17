import {
  TNode,
  Value,
  Use,
  attr,
  When,
  Signal,
  signal,
  Repeat,
  computedOf,
  Ensure,
} from '@tempots/dom'
import { Icon } from '@/components/data/icon'
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
} from '@/components/navigation/toolbar/toolbar'
import { BeatUII18n } from '@/beatui-i18n'
import type { EditorView } from 'prosemirror-view'
import type { MarkdownFeatures } from './prosemirror-markdown-input'
import { LinkDialogButton } from './link-dialog-button'
import { ButtonVariant, ControlSize } from '../theme'
import { MarkType, NodeType } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'

export interface ProseMirrorToolbarOptions {
  /** The ProseMirror editor view */
  view: Signal<EditorView | null>
  stateUpdate: Signal<number>
  /** Enabled markdown features */
  features: Signal<MarkdownFeatures>
  /** Whether the editor is readonly */
  readOnly?: Signal<boolean>
  size?: Value<ControlSize>
}

function EToolbarButton({
  active,
  display,
  onClick,
  disabled,
  label,
  icon,
  size,
}: {
  active: Signal<boolean>
  display: Signal<boolean>
  onClick: () => void
  disabled: Signal<boolean>
  label: Value<string>
  icon: Value<string>
  size: Value<ControlSize>
}) {
  return When(display, () =>
    ToolbarButton(
      {
        onClick,
        disabled,
        variant: active.map(v => (v ? 'filled' : 'light') as ButtonVariant),
        size,
      },
      attr.title(label),
      Icon({ icon, size })
    )
  )
}

function EToolbarGroup(
  {
    display,
  }: {
    display: Signal<boolean>[]
  },
  ...children: TNode[]
) {
  return When(
    computedOf(...display)((...v) => v.some(Boolean)),
    () => ToolbarGroup(...children)
  )
}

function isMarkActive(state: EditorState, markType: MarkType) {
  const { from, $from, to, empty } = state.selection
  if (!markType) return false

  if (empty) {
    // Check storedMarks first (marks that will be applied to next typed character)
    if (state.storedMarks) {
      // Compare by mark type name instead of object identity
      const hasStoredMark = state.storedMarks.some(
        m => m.type.name === markType.name
      )
      if (hasStoredMark) return true
    }

    // Check marks at current position
    const marksHere = $from.marks()
    const hasMarkHere = marksHere.some(m => m.type.name === markType.name)
    if (hasMarkHere) return true

    // Also check the character after the cursor (nodeAfter)
    // This handles the case where cursor is at the start of a marked range
    const nodeAfter = $from.nodeAfter
    if (nodeAfter && nodeAfter.marks) {
      const hasMarkAfter = nodeAfter.marks.some(
        m => m.type.name === markType.name
      )
      if (hasMarkAfter) return true
    }

    return false
  }

  // For non-empty selections, check if the range has the mark
  // We need to manually check by name instead of using rangeHasMark
  // which uses object identity comparison
  let hasMark = false
  state.doc.nodesBetween(from, to, node => {
    if (hasMark) return false // Stop iteration if we found the mark
    if (node.marks) {
      const foundMark = node.marks.some(m => m.type.name === markType.name)
      if (foundMark) {
        hasMark = true
        return false // Stop iteration
      }
    }
  })
  return hasMark
}

function makeActiveMarkSignal(
  state: Signal<number>,
  view: Signal<EditorView>,
  markType: string
) {
  return state.map(() => {
    const editorView = view.value
    const mark = editorView.state.schema.marks[markType]
    return isMarkActive(editorView.state, mark)
  })
}

/**
 * Check if a node type is active at the current selection
 */
function isNodeActive(
  state: EditorState,
  nodeType: NodeType,
  attrs?: Record<string, unknown>
) {
  const { $from } = state.selection

  // Check if the current selection is within a node of the given type
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d)
    if (node.type.name === nodeType.name) {
      // If attrs are specified, check if they match
      if (attrs != null) {
        return Object.keys(attrs).every(key => node.attrs[key] === attrs[key])
      }
      return true
    }
  }

  // Also check the node at the selection
  const node = state.doc.nodeAt($from.pos)
  if (node && node.type.name === nodeType.name) {
    if (attrs != null) {
      return Object.keys(attrs).every(key => node.attrs[key] === attrs[key])
    }
    return true
  }

  return false
}

function makeActiveNodeSignal(
  state: Signal<number>,
  view: Signal<EditorView>,
  nodeTypeName: string,
  attrs?: Record<string, unknown>
) {
  return state.map(() => {
    const editorView = view.value
    const nodeType = editorView.state.schema.nodes[nodeTypeName]
    if (!nodeType) return false
    return isNodeActive(editorView.state, nodeType, attrs)
  })
}

/**
 * Create a toolbar for the ProseMirror markdown editor
 */
export function ProseMirrorToolbar({
  view,
  stateUpdate,
  features,
  readOnly = signal(false),
  size = 'md',
}: ProseMirrorToolbarOptions): TNode {
  return Ensure(view, viewSignal =>
    Use(BeatUII18n, t => {
      const pmt = t.$.prosemirror
      const view = viewSignal as unknown as Signal<EditorView>
      return Toolbar(
        // Text formatting group
        EToolbarGroup(
          { display: [features.$.bold, features.$.italic, features.$.code] },
          EToolbarButton({
            active: makeActiveMarkSignal(stateUpdate, view, 'strong'),
            display: features.$.bold,
            onClick: () => toggleMark(view.value, 'strong'),
            disabled: readOnly,
            label: pmt.$.bold,
            icon: 'mdi:format-bold',
            size,
          }),
          EToolbarButton({
            active: makeActiveMarkSignal(stateUpdate, view, 'em'),
            display: features.$.italic,
            onClick: () => toggleMark(view.value, 'em'),
            disabled: readOnly,
            label: pmt.$.italic,
            icon: 'mdi:format-italic',
            size,
          }),
          EToolbarButton({
            active: makeActiveMarkSignal(stateUpdate, view, 'code'),
            display: features.$.code,
            onClick: () => toggleMark(view.value, 'code'),
            disabled: readOnly,
            label: pmt.$.code,
            icon: 'mdi:code-tags',
            size,
          })
        ),

        // Headings group
        EToolbarGroup(
          { display: [features.$.headings] },
          Repeat(
            features.$.headerLevels.map(level =>
              Math.min(Math.max(level, 1), 6)
            ),
            ({ counter: level }) => {
              return EToolbarButton({
                active: makeActiveNodeSignal(stateUpdate, view, 'heading', {
                  level,
                }),
                display: features.$.headings,
                onClick: () => setHeading(view.value, level),
                disabled: readOnly,
                label: pmt.map(v => v.heading(level)),
                icon: `mdi:format-header-${level}`,
                size,
              })
            }
          )
        ),

        // Lists group
        EToolbarGroup(
          { display: [features.$.bulletList, features.$.orderedList] },
          EToolbarButton({
            active: makeActiveNodeSignal(stateUpdate, view, 'bullet_list'),
            display: features.$.bulletList,
            onClick: () => toggleList(view.value, 'bullet_list'),
            disabled: readOnly,
            label: pmt.$.bulletList,
            icon: 'mdi:format-list-bulleted',
            size,
          }),
          EToolbarButton({
            active: makeActiveNodeSignal(stateUpdate, view, 'ordered_list'),
            display: features.$.orderedList,
            onClick: () => toggleList(view.value, 'ordered_list'),
            disabled: readOnly,
            label: pmt.$.orderedList,
            icon: 'mdi:format-list-numbered',
            size,
          })
        ),

        // Block formatting group
        EToolbarGroup(
          {
            display: [
              features.$.blockquote,
              features.$.codeBlock,
              features.$.horizontalRule,
            ],
          },
          EToolbarButton({
            active: makeActiveNodeSignal(stateUpdate, view, 'blockquote'),
            display: features.$.blockquote,
            onClick: () => toggleBlockquote(view.value),
            disabled: readOnly,
            label: pmt.$.blockquote,
            icon: 'mdi:format-quote-close',
            size,
          }),
          EToolbarButton({
            active: makeActiveNodeSignal(stateUpdate, view, 'code_block'),
            display: features.$.codeBlock,
            onClick: () => toggleCodeBlock(view.value),
            disabled: readOnly,
            label: pmt.$.codeBlock,
            icon: 'mdi:code-braces',
            size,
          }),
          EToolbarButton({
            active: signal(false),
            display: features.$.horizontalRule,
            onClick: () => insertHorizontalRule(view.value),
            disabled: readOnly,
            label: pmt.$.horizontalRule,
            icon: 'mdi:minus',
            size,
          })
        ),

        When(features.$.links, () =>
          LinkDialogButton({
            view: view.value,
            isReadOnly: readOnly,
            label: pmt.$.link,
            linkDialogTitle: pmt.$.linkDialogTitle,
            linkDialogUrlPlaceholder: pmt.$.linkDialogUrlPlaceholder,
            linkDialogSave: pmt.$.linkDialogSave,
            linkDialogCancel: pmt.$.linkDialogCancel,
            linkDialogRemoveLink: pmt.$.linkDialogRemoveLink,
          })
        )
      )
    })
  )
}

/**
 * Toggle a mark (bold, italic, code)
 */
async function toggleMark(view: EditorView, markType: string) {
  const { toggleMark } = await import('prosemirror-commands')
  const mark = view.state.schema.marks[markType]
  if (mark != null) {
    toggleMark(mark)(view.state, view.dispatch)
    view.focus()
  }
}

/**
 * Set heading level
 */
async function setHeading(view: EditorView, level: number) {
  const { setBlockType } = await import('prosemirror-commands')
  const headingType = view.state.schema.nodes.heading
  if (headingType != null) {
    setBlockType(headingType, { level })(view.state, view.dispatch)
    view.focus()
  }
}

/**
 * Toggle list (bullet or ordered)
 * If already in the same list type, remove the list
 * If in a different list type, convert to the new type
 * Otherwise, wrap in the list
 */
async function toggleList(view: EditorView, listType: string) {
  const { wrapInList, liftListItem } = await import('prosemirror-schema-list')
  const type = view.state.schema.nodes[listType]
  const listItemType = view.state.schema.nodes.list_item

  if (type == null || listItemType == null) return

  const { state } = view
  const { $from } = state.selection

  // Check if we're currently in a list
  let currentListType: string | null = null
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d)
    if (node.type.name === 'bullet_list' || node.type.name === 'ordered_list') {
      currentListType = node.type.name
      break
    }
  }

  if (currentListType === listType) {
    // Same list type - remove the list
    liftListItem(listItemType)(state, view.dispatch)
  } else if (currentListType != null) {
    // Different list type - convert by lifting then wrapping
    // Dispatch is synchronous, so view.state will be updated after the first call
    const lifted = liftListItem(listItemType)(view.state, view.dispatch)
    if (lifted) {
      // view.state is now updated, wrap in the new list type
      wrapInList(type)(view.state, view.dispatch)
    }
  } else {
    // Not in a list - wrap in the list
    wrapInList(type)(state, view.dispatch)
  }

  view.focus()
}

/**
 * Toggle blockquote
 */
async function toggleBlockquote(view: EditorView) {
  const { wrapIn } = await import('prosemirror-commands')
  const blockquoteType = view.state.schema.nodes.blockquote
  if (blockquoteType != null) {
    wrapIn(blockquoteType)(view.state, view.dispatch)
    view.focus()
  }
}

/**
 * Toggle code block
 */
async function toggleCodeBlock(view: EditorView) {
  const { setBlockType } = await import('prosemirror-commands')
  const codeBlockType = view.state.schema.nodes.code_block
  if (codeBlockType != null) {
    setBlockType(codeBlockType)(view.state, view.dispatch)
    view.focus()
  }
}

/**
 * Insert horizontal rule
 */
function insertHorizontalRule(view: EditorView) {
  const hrType = view.state.schema.nodes.horizontal_rule
  if (hrType != null) {
    const tr = view.state.tr.replaceSelectionWith(hrType.create())
    view.dispatch(tr)
    view.focus()
  }
}

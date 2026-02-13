/**
 * Toolbar component for the ProseMirror markdown editor.
 *
 * Renders formatting buttons (bold, italic, code), heading level selectors,
 * list toggles (bullet/ordered), block formatting (blockquote, code block,
 * horizontal rule), and an inline link editor -- all driven by the
 * {@link MarkdownFeatures} configuration.
 *
 * @module
 */

import {
  Value,
  Use,
  When,
  Signal,
  signal,
  Repeat,
  Ensure,
} from '@tempots/dom'
import { Toolbar } from '../navigation/toolbar/toolbar'
import { BeatUII18n } from '../../beatui-i18n'
import type { EditorView } from 'prosemirror-view'
import type { MarkdownFeatures } from './prosemirror-markdown-input'
import {
  lift as pmLift,
  setBlockType as pmSetBlockType,
  toggleMark as pmToggleMark,
  wrapIn as pmWrapIn,
} from 'prosemirror-commands'
import { LinkControl } from './link-control'
import { ControlSize } from '../theme'
import { makeActiveMarkSignal, makeActiveNodeSignal } from './utils'
import { EditorToolbarGroup, EditorToolbarButton } from '../editor-toolbar'

/**
 * Options for configuring the ProseMirror markdown toolbar.
 */
export interface ProseMirrorToolbarOptions {
  /** Signal holding the ProseMirror editor view, or `null` before initialization. */
  view: Signal<EditorView | null>
  /** Ticker signal that increments on every ProseMirror state change. */
  stateUpdate: Signal<number>
  /** Signal of enabled markdown features controlling which toolbar buttons are visible. */
  features: Signal<MarkdownFeatures>
  /**
   * Signal indicating whether the editor is in read-only mode.
   * Toolbar buttons are disabled when `true`.
   * @default signal(false)
   */
  readOnly?: Signal<boolean>
  /**
   * Size of the toolbar buttons.
   * @default 'sm'
   */
  size?: Value<ControlSize>
}

/**
 * Creates a formatting toolbar for the ProseMirror markdown editor.
 *
 * The toolbar adapts dynamically to the enabled {@link MarkdownFeatures},
 * showing only the relevant button groups. It integrates with BeatUI's
 * i18n system for localised button labels and tooltips.
 *
 * @param options - Toolbar configuration including the editor view, features, and size.
 * @returns A `TNode` renderable containing the complete toolbar.
 *
 * @example
 * ```ts
 * ProseMirrorToolbar({
 *   view: editorViewSignal,
 *   stateUpdate: editorStateNotifier,
 *   features: signal(DEFAULT_FEATURES),
 *   readOnly: signal(false),
 *   size: 'sm',
 * })
 * ```
 */
export function ProseMirrorToolbar({
  view,
  stateUpdate,
  features,
  readOnly = signal(false),
  size = 'sm',
}: ProseMirrorToolbarOptions) {
  return Ensure(view, viewSignal =>
    Use(BeatUII18n, t => {
      const pmt = t.$.prosemirror
      const view = viewSignal as unknown as Signal<EditorView>
      return Toolbar(
        // Text formatting group
        EditorToolbarGroup(
          { display: [features.$.bold, features.$.italic, features.$.code] },
          EditorToolbarButton({
            active: makeActiveMarkSignal(stateUpdate, view, 'strong'),
            display: features.$.bold,
            onClick: () => toggleMark(view.value, 'strong'),
            disabled: readOnly,
            label: pmt.$.bold,
            icon: 'mdi:format-bold',
            size,
          }),
          EditorToolbarButton({
            active: makeActiveMarkSignal(stateUpdate, view, 'em'),
            display: features.$.italic,
            onClick: () => toggleMark(view.value, 'em'),
            disabled: readOnly,
            label: pmt.$.italic,
            icon: 'mdi:format-italic',
            size,
          }),
          EditorToolbarButton({
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
        EditorToolbarGroup(
          { display: [features.$.headings] },
          Repeat(
            features.$.headerLevels.map(level =>
              Math.min(Math.max(level, 1), 6)
            ),
            ({ counter: level }) => {
              return EditorToolbarButton({
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
        EditorToolbarGroup(
          { display: [features.$.bulletList, features.$.orderedList] },
          EditorToolbarButton({
            active: makeActiveNodeSignal(stateUpdate, view, 'bullet_list'),
            display: features.$.bulletList,
            onClick: () => toggleList(view.value, 'bullet_list'),
            disabled: readOnly,
            label: pmt.$.bulletList,
            icon: 'mdi:format-list-bulleted',
            size,
          }),
          EditorToolbarButton({
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
        EditorToolbarGroup(
          {
            display: [
              features.$.blockquote,
              features.$.codeBlock,
              features.$.horizontalRule,
            ],
          },
          EditorToolbarButton({
            active: makeActiveNodeSignal(stateUpdate, view, 'blockquote'),
            display: features.$.blockquote,
            onClick: () => toggleBlockquote(view.value),
            disabled: readOnly,
            label: pmt.$.blockquote,
            icon: 'mdi:format-quote-close',
            size,
          }),
          EditorToolbarButton({
            active: makeActiveNodeSignal(stateUpdate, view, 'code_block'),
            display: features.$.codeBlock,
            onClick: () => toggleCodeBlock(view.value),
            disabled: readOnly,
            label: pmt.$.codeBlock,
            icon: 'mdi:code-braces',
            size,
          }),
          EditorToolbarButton({
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
          LinkControl({
            stateUpdate,
            view,
            isReadOnly: readOnly,
            label: pmt.$.link,
            // linkDialogTitle: pmt.$.linkDialogTitle,
            linkUrlPlaceholder: pmt.$.linkUrlPlaceholder,
            // linkDialogSave: pmt.$.linkDialogSave,
            // linkDialogCancel: pmt.$.linkDialogCancel,
            // linkDialogRemoveLink: pmt.$.linkDialogRemoveLink,
            size,
          })
        )
      )
    })
  )
}

/**
 * Toggles an inline mark (e.g. bold, italic, code) on the current selection
 * and returns focus to the editor.
 *
 * @param view - The ProseMirror editor view.
 * @param markType - The name of the mark type in the schema to toggle.
 */
function toggleMark(view: EditorView, markType: string) {
  const mark = view.state.schema.marks[markType]
  if (mark != null) {
    pmToggleMark(mark)(view.state, view.dispatch)
    view.focus()
  }
}

/**
 * Sets the current block to a heading of the specified level.
 *
 * @param view - The ProseMirror editor view.
 * @param level - The heading level (1-6).
 */
function setHeading(view: EditorView, level: number) {
  const headingType = view.state.schema.nodes.heading
  if (headingType != null) {
    pmSetBlockType(headingType, { level })(view.state, view.dispatch)
    view.focus()
  }
}

/**
 * Toggles a list type (bullet or ordered) on the current selection.
 *
 * Behaviour:
 * - If already in the same list type, removes the list.
 * - If in a different list type, converts to the new type.
 * - Otherwise, wraps the selection in the specified list.
 *
 * The `prosemirror-schema-list` package is lazily imported to avoid bundling
 * it when lists are disabled.
 *
 * @param view - The ProseMirror editor view.
 * @param listType - The node type name of the list (`'bullet_list'` or `'ordered_list'`).
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
 * Toggles a blockquote on the current selection.
 *
 * If the cursor is already inside a blockquote the block is lifted out;
 * otherwise the selection is wrapped in a new blockquote.
 *
 * @param view - The ProseMirror editor view.
 */
function toggleBlockquote(view: EditorView) {
  const blockquoteType = view.state.schema.nodes.blockquote
  if (blockquoteType == null) return

  const { state } = view
  const { $from } = state.selection

  // Check if we're currently in a blockquote
  let inBlockquote = false
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === 'blockquote') {
      inBlockquote = true
      break
    }
  }

  if (inBlockquote) {
    // Remove the blockquote by lifting
    pmLift(state, view.dispatch)
  } else {
    // Wrap in blockquote
    pmWrapIn(blockquoteType)(state, view.dispatch)
  }

  view.focus()
}

/**
 * Toggles a code block on the current selection.
 *
 * If the cursor is inside a code block it is converted back to a paragraph;
 * otherwise the current block is converted to a code block.
 *
 * @param view - The ProseMirror editor view.
 */
function toggleCodeBlock(view: EditorView) {
  const codeBlockType = view.state.schema.nodes.code_block
  const paragraphType = view.state.schema.nodes.paragraph
  if (codeBlockType == null || paragraphType == null) return

  const { state } = view
  const { $from } = state.selection

  // Check if we're currently in a code block
  let inCodeBlock = false
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === 'code_block') {
      inCodeBlock = true
      break
    }
  }

  if (inCodeBlock) {
    // Convert to paragraph
    pmSetBlockType(paragraphType)(state, view.dispatch)
  } else {
    // Convert to code block
    pmSetBlockType(codeBlockType)(state, view.dispatch)
  }

  view.focus()
}

/**
 * Inserts a horizontal rule (`<hr>`) at the current selection position
 * and returns focus to the editor.
 *
 * @param view - The ProseMirror editor view.
 */
function insertHorizontalRule(view: EditorView) {
  const hrType = view.state.schema.nodes.horizontal_rule
  if (hrType != null) {
    const tr = view.state.tr.replaceSelectionWith(hrType.create())
    view.dispatch(tr)
    view.focus()
  }
}

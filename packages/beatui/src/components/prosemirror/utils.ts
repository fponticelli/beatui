/**
 * Utility functions for inspecting ProseMirror editor state.
 *
 * Provides helpers to check whether specific marks or nodes are active in the
 * current selection and to create reactive signals that track mark/node
 * activity as the user navigates the document.
 *
 * @module
 */

import { Signal } from '@tempots/dom'
import { Mark, MarkType, NodeType } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

/**
 * Checks whether a mark of the given type is active in the current editor
 * selection.
 *
 * Works for both empty (collapsed) and non-empty selections. For empty
 * selections it also inspects `storedMarks` and adjacent nodes.
 *
 * @param state - The current ProseMirror editor state.
 * @param markType - The mark type to look for.
 * @returns `true` if the mark type is present in the selection.
 *
 * @example
 * ```ts
 * const bold = editorView.state.schema.marks.strong
 * if (isMarkActive(editorView.state, bold)) {
 *   console.log('Bold is active')
 * }
 * ```
 */
export function isMarkActive(state: EditorState, markType: MarkType) {
  return getMarkByType(state, markType) != null
}

/**
 * Returns the first `Mark` instance of the given type found in the current
 * selection, or `null` if no such mark is present.
 *
 * For empty (collapsed) selections the function checks, in order:
 * 1. `storedMarks` (marks queued for the next typed character)
 * 2. Marks at the resolved cursor position
 * 3. Marks on the node immediately after the cursor
 *
 * For non-empty selections the function iterates over all nodes in the range.
 *
 * Comparisons are done by mark-type name to avoid object-identity issues
 * that can occur with ProseMirror schemas.
 *
 * @param state - The current ProseMirror editor state.
 * @param markType - The mark type to retrieve.
 * @returns The found `Mark` instance, or `null`.
 *
 * @example
 * ```ts
 * const linkMark = getMarkByType(editorView.state, editorView.state.schema.marks.link)
 * if (linkMark) {
 *   console.log('Link href:', linkMark.attrs.href)
 * }
 * ```
 */
export function getMarkByType(
  state: EditorState,
  markType: MarkType
): Mark | null {
  const { from, $from, to, empty } = state.selection
  if (!markType) return null

  if (empty) {
    // Check storedMarks first (marks that will be applied to next typed character)
    if (state.storedMarks) {
      // Compare by mark type name instead of object identity
      const storedMark = state.storedMarks.find(
        m => m.type.name === markType.name
      )
      if (storedMark != null) return storedMark
    }

    // Check marks at current position
    const marksHere = $from.marks()
    const markHere = marksHere.find(m => m.type.name === markType.name)
    if (markHere != null) return markHere

    // Also check the character after the cursor (nodeAfter)
    // This handles the case where cursor is at the start of a marked range
    const nodeAfter = $from.nodeAfter
    if (nodeAfter && nodeAfter.marks) {
      const markAfter = nodeAfter.marks.find(m => m.type.name === markType.name)
      if (markAfter != null) return markAfter
    }

    return null
  }

  // For non-empty selections, check if the range has the mark
  // We need to manually check by name instead of using rangeHasMark
  // which uses object identity comparison
  let myMark: Mark | null = null
  state.doc.nodesBetween(from, to, node => {
    if (myMark != null) return false // Stop iteration if we found the mark
    if (node.marks) {
      const foundMark = node.marks.find(m => m.type.name === markType.name)
      if (foundMark != null) {
        myMark = foundMark
        return false // Stop iteration
      }
    }
  })
  return myMark
}

/**
 * Creates a reactive `Signal<boolean>` that tracks whether a mark of the
 * given type is active in the current ProseMirror selection.
 *
 * The signal recomputes whenever the `state` ticker updates (which is
 * triggered on every editor transaction).
 *
 * @param state - A ticker signal that increments on every editor state change.
 * @param view - A signal holding the current `EditorView`.
 * @param markType - The name of the mark type to track (e.g. `'strong'`, `'em'`, `'link'`).
 * @returns A derived `Signal<boolean>` that is `true` when the mark is active.
 *
 * @example
 * ```ts
 * const isBold = makeActiveMarkSignal(stateUpdate, editorView, 'strong')
 * isBold.on(active => {
 *   console.log('Bold active:', active)
 * })
 * ```
 */
export function makeActiveMarkSignal(
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
 * Checks whether a node of the given type is active at the current selection
 * position.
 *
 * Walks up the document tree from the resolved cursor position and also
 * checks the node at the exact position. If `attrs` are provided, the
 * function additionally verifies that the node's attributes match.
 *
 * @param state - The current ProseMirror editor state.
 * @param nodeType - The node type to look for.
 * @param attrs - Optional attribute constraints to match against the node's attributes.
 * @returns `true` if a matching node is found in the current selection.
 *
 * @example
 * ```ts
 * const heading = editorView.state.schema.nodes.heading
 * if (isNodeActive(editorView.state, heading, { level: 2 })) {
 *   console.log('Currently inside an H2')
 * }
 * ```
 */
export function isNodeActive(
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

/**
 * Creates a reactive `Signal<boolean>` that tracks whether a node of the
 * given type (and optional attributes) is active at the current selection.
 *
 * The signal recomputes whenever the `state` ticker updates.
 *
 * @param state - A ticker signal that increments on every editor state change.
 * @param view - A signal holding the current `EditorView`.
 * @param nodeTypeName - The name of the node type to track (e.g. `'heading'`, `'bullet_list'`).
 * @param attrs - Optional attribute constraints (e.g. `{ level: 2 }` for H2 headings).
 * @returns A derived `Signal<boolean>` that is `true` when the node is active.
 *
 * @example
 * ```ts
 * const isH2 = makeActiveNodeSignal(stateUpdate, editorView, 'heading', { level: 2 })
 * isH2.on(active => {
 *   console.log('Inside H2:', active)
 * })
 * ```
 */
export function makeActiveNodeSignal(
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

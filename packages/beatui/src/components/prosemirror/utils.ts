import { Signal } from '@tempots/dom'
import { Mark, MarkType, NodeType } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

export function isMarkActive(state: EditorState, markType: MarkType) {
  return getMarkByType(state, markType) != null
}

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
 * Check if a node type is active at the current selection
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

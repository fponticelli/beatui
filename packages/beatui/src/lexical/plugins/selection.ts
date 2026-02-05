import type { LexicalEditor } from 'lexical'
import { $getSelection, $isRangeSelection } from 'lexical'
import type { SelectionInfo } from '../types'

/**
 * Get information about the current selection.
 */
export function getSelectionInfo(editor: LexicalEditor): SelectionInfo {
  let info: SelectionInfo = {
    hasSelection: false,
    selectedText: '',
    anchorOffset: 0,
    focusOffset: 0,
  }

  editor.getEditorState().read(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      info = {
        hasSelection: !selection.isCollapsed(),
        selectedText: selection.getTextContent(),
        anchorOffset: selection.anchor.offset,
        focusOffset: selection.focus.offset,
      }
    }
  })

  return info
}

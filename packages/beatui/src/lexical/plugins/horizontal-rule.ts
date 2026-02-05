import type { LexicalEditor } from 'lexical'
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  COMMAND_PRIORITY_LOW,
} from 'lexical'
import { INSERT_HORIZONTAL_RULE_COMMAND } from '../commands'
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from '../horizontal-rule-node'
import type { ElementTransformer } from '@lexical/markdown'

/**
 * Register the INSERT_HORIZONTAL_RULE_COMMAND handler on the given editor.
 * Returns a cleanup function to unregister the handler.
 */
export function registerHorizontalRulePlugin(
  editor: LexicalEditor
): () => void {
  return editor.registerCommand(
    INSERT_HORIZONTAL_RULE_COMMAND,
    () => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return false

      const focusNode = selection.focus.getNode()
      if (focusNode !== null) {
        const hrNode = $createHorizontalRuleNode()
        // Insert HR after the current block
        selection.insertNodes([hrNode])
        // Insert a new paragraph after the HR and move selection there
        const paragraph = $createParagraphNode()
        hrNode.insertAfter(paragraph)
        paragraph.selectStart()
      }
      return true
    },
    COMMAND_PRIORITY_LOW
  )
}

/**
 * Markdown transformer for horizontal rules (---).
 * Use this with $convertToMarkdownString / $convertFromMarkdownString.
 */
export const HR_TRANSFORMER: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: node => {
    return $isHorizontalRuleNode(node) ? '---' : null
  },
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _children, _match, isImport) => {
    const line = $createHorizontalRuleNode()
    // For import, we want to keep the paragraph; for live typing, add one after
    if (isImport) {
      parentNode.replace(line)
    } else {
      parentNode.replace(line)
      const paragraph = $createParagraphNode()
      line.insertAfter(paragraph)
      paragraph.selectStart()
    }
  },
  type: 'element',
}

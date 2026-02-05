import type { LexicalEditor } from 'lexical'
import {
  $convertToMarkdownString,
  $convertFromMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown'
import { HR_TRANSFORMER } from './horizontal-rule'

/** All transformers including BeatUI custom ones (e.g. horizontal rule). */
const ALL_TRANSFORMERS = [...TRANSFORMERS, HR_TRANSFORMER]

/**
 * Convert the editor content to a Markdown string.
 */
export async function exportToMarkdown(editor: LexicalEditor): Promise<string> {
  let markdown = ''
  editor.getEditorState().read(() => {
    markdown = $convertToMarkdownString(ALL_TRANSFORMERS)
  })
  return markdown
}

/**
 * Import Markdown content into the editor, replacing current content.
 */
export async function importFromMarkdown(
  editor: LexicalEditor,
  markdown: string
): Promise<void> {
  editor.update(() => {
    $convertFromMarkdownString(markdown, ALL_TRANSFORMERS)
  })
}

/**
 * Get all markdown transformers including BeatUI custom ones.
 */
export async function getMarkdownTransformers() {
  return ALL_TRANSFORMERS
}

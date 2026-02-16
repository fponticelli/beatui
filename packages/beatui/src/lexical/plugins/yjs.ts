import type { LexicalEditor } from 'lexical'
import { createBinding } from '@lexical/yjs'
import type { CollaborationConfig } from '../types'

/**
 * Register Yjs collaborative editing support.
 * Enables real-time collaboration using Yjs CRDT.
 *
 * Note: This plugin requires the `yjs` package to be installed as a peer dependency.
 */
export async function registerYjsPlugin(
  editor: LexicalEditor,

  config: CollaborationConfig
): Promise<() => void> {
  const docMap = config.docMap ?? new Map()
  const id = config.id ?? 'lexical'

  // Get the Yjs text from the document
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const yText = (config.doc as any).getText(id)

  // Create Yjs binding for the editor
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const binding = (createBinding as any)(
    editor,
    config.provider,
    yText,
    config.doc,
    docMap
  )

  // Register update listener for synchronization
  const removeUpdateListener = editor.registerUpdateListener(() => {
    // Sync happens via the binding
  })

  return () => {
    removeUpdateListener()
    // Clean up the binding
    if (binding && typeof binding.destroy === 'function') {
      binding.destroy()
    }
  }
}

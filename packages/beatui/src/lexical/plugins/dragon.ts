import type { LexicalEditor } from 'lexical'
import * as dragonModule from '@lexical/dragon'

/**
 * Register Dragon NaturallySpeaking support.
 * Provides compatibility with Dragon speech recognition software.
 */
export async function registerDragonPlugin(
  editor: LexicalEditor
): Promise<() => void> {
  // Check if registerDragonSupport exists
  if (
    'registerDragonSupport' in dragonModule &&
    typeof dragonModule.registerDragonSupport === 'function'
  ) {
    return dragonModule.registerDragonSupport(editor)
  }

  // Fallback: return a no-op cleanup function
  return () => {}
}

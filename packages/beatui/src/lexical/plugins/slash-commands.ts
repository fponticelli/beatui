import type { LexicalEditor } from 'lexical'
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  TextNode,
} from 'lexical'
import { mergeRegister } from '@lexical/utils'
import type { SlashCommandPluginOptions } from '../types'

export interface SlashCommandState {
  isActive: boolean
  filterText: string
  anchorNode: TextNode | null
  anchorOffset: number
}

export interface SlashCommandCallbacks {
  onTrigger?: (state: SlashCommandState, removeText: () => void) => void
  onUpdate?: (state: SlashCommandState, removeText: () => void) => void
  onDismiss?: () => void
  onExecute?: (commandId: string, removeText: () => void) => void
}

/**
 * Register slash commands plugin.
 * Detects "/" input and manages the command palette lifecycle.
 */
export async function registerSlashCommandsPlugin(
  editor: LexicalEditor,
  options?: SlashCommandPluginOptions,
  callbacks?: SlashCommandCallbacks
): Promise<() => void> {
  const trigger = options?.trigger || '/'
  let isActive = false
  let slashNode: TextNode | null = null
  let slashOffset = 0

  // Helper to detect if "/" was just typed at the start of a block or after whitespace
  const checkForSlashTrigger = (): boolean => {
    return editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
        return false
      }

      const anchor = selection.anchor
      const node = anchor.getNode()

      if (!$isTextNode(node)) {
        return false
      }

      const textContent = node.getTextContent()
      const offset = anchor.offset

      // Check if we just typed the trigger character
      if (offset === 0) return false

      const charBefore = textContent[offset - 1]
      if (charBefore !== trigger) {
        return false
      }

      // Check if trigger is at start of block or after whitespace
      if (offset === 1) {
        // At start of text node
        return true
      }

      const charBeforeTrigger = textContent[offset - 2]
      if (/\s/.test(charBeforeTrigger)) {
        // After whitespace
        return true
      }

      return false
    })
  }

  // Helper to get filter text after "/"
  const getFilterText = (): string => {
    if (!slashNode) return ''

    return editor.getEditorState().read(() => {
      if (!slashNode) return ''

      const textContent = slashNode.getTextContent()
      const triggerIndex = textContent.indexOf(trigger, slashOffset)
      if (triggerIndex === -1) return ''

      // Get text from trigger to current selection
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return ''

      const anchor = selection.anchor
      const currentNode = anchor.getNode()

      // Make sure we're still in the same node
      if (currentNode.getKey() !== slashNode.getKey()) {
        return ''
      }

      const currentOffset = anchor.offset
      if (currentOffset <= triggerIndex) return ''

      return textContent.slice(triggerIndex + 1, currentOffset)
    })
  }

  // Helper to activate slash command mode
  const activate = () => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor
        const node = anchor.getNode()
        if ($isTextNode(node)) {
          slashNode = node
          slashOffset = anchor.offset - 1 // Position of "/"
          isActive = true

          const state: SlashCommandState = {
            isActive: true,
            filterText: '',
            anchorNode: slashNode,
            anchorOffset: slashOffset,
          }

          callbacks?.onTrigger?.(state, removeSlashText)
          callbacks?.onUpdate?.(state, removeSlashText)
        }
      }
    })
  }

  // Helper to deactivate slash command mode
  const deactivate = () => {
    if (!isActive) return

    isActive = false
    slashNode = null
    slashOffset = 0
    callbacks?.onDismiss?.()
  }

  // Helper to remove the slash and filter text
  const removeSlashText = () => {
    if (!slashNode) return

    editor.update(() => {
      if (!slashNode) return

      const textContent = slashNode.getTextContent()
      const triggerIndex = textContent.indexOf(trigger, slashOffset)
      if (triggerIndex === -1) return

      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      const anchor = selection.anchor
      const currentNode = anchor.getNode()

      // Make sure we're still in the same node
      if (currentNode.getKey() !== slashNode.getKey()) return

      const currentOffset = anchor.offset

      // Remove from trigger position to current cursor
      const before = textContent.slice(0, triggerIndex)
      const after = textContent.slice(currentOffset)
      slashNode.setTextContent(before + after)

      // Move cursor to where the trigger was
      const newSelection = $getSelection()
      if ($isRangeSelection(newSelection)) {
        newSelection.anchor.set(slashNode.getKey(), triggerIndex, 'text')
        newSelection.focus.set(slashNode.getKey(), triggerIndex, 'text')
      }
    })
  }

  // Update filter text
  const updateFilterText = () => {
    if (!isActive) return

    const filterText = getFilterText()
    const state: SlashCommandState = {
      isActive: true,
      filterText,
      anchorNode: slashNode,
      anchorOffset: slashOffset,
    }

    callbacks?.onUpdate?.(state, removeSlashText)
  }

  // Register mutation listener for text changes
  const removeMutationListener = editor.registerMutationListener(
    TextNode,
    mutations => {
      // Check if slash was just typed
      if (!isActive && checkForSlashTrigger()) {
        activate()
        return
      }

      // Update filter text if active
      if (isActive) {
        // Check if slash node was deleted or modified significantly
        if (slashNode && !mutations.has(slashNode.getKey())) {
          // Node still exists, update filter
          updateFilterText()
        } else {
          // Node was deleted or selection moved away
          deactivate()
        }
      }
    }
  )

  // Register command listeners
  const removeCommands = mergeRegister(
    // Handle selection changes - deactivate if selection moves away
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        if (!isActive) return

        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          deactivate()
          return
        }

        const anchor = selection.anchor
        const node = anchor.getNode()

        // Check if we're still in the slash node
        if (!slashNode || node.getKey() !== slashNode.getKey()) {
          deactivate()
          return
        }

        // Check if cursor moved before the slash
        const textContent = slashNode.getTextContent()
        const triggerIndex = textContent.indexOf(trigger, slashOffset)
        if (triggerIndex === -1 || anchor.offset <= triggerIndex) {
          deactivate()
          return
        }
      })
    }),

    // Prevent default arrow key behavior when palette is active
    editor.registerCommand(
      KEY_ARROW_DOWN_COMMAND,
      event => {
        if (isActive) {
          event.preventDefault()
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW
    ),

    editor.registerCommand(
      KEY_ARROW_UP_COMMAND,
      event => {
        if (isActive) {
          event.preventDefault()
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW
    ),

    // Prevent default enter behavior when palette is active
    editor.registerCommand(
      KEY_ENTER_COMMAND,
      event => {
        if (isActive) {
          event?.preventDefault()
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW
    ),

    // Handle escape to close palette
    editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      event => {
        if (isActive) {
          event?.preventDefault()
          deactivate()
          return true
        }
        return false
      },
      COMMAND_PRIORITY_LOW
    )
  )

  // Return cleanup function
  return () => {
    deactivate()
    removeMutationListener()
    removeCommands()
  }
}

/**
 * Execute a slash command by removing the trigger text and running the handler.
 */
export function executeSlashCommand(
  editor: LexicalEditor,
  command: { handler: (editor: LexicalEditor) => void },
  removeText: () => void
): void {
  // First remove the slash and filter text
  removeText()

  // Then execute the command handler
  command.handler(editor)

  // Focus the editor
  editor.focus()
}

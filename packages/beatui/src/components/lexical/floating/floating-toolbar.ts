import {
  Signal,
  prop,
  html,
  attr,
  style,
  When,
  OnDispose,
  WithElement,
  Ensure,
  TNode,
  signal,
} from '@tempots/dom'
import type { LexicalEditor } from 'lexical'
import { FORMAT_TEXT_COMMAND, $getSelection, $isRangeSelection } from 'lexical'
import type { ToolbarGroupId } from '../../../lexical/types'
import { ControlSize } from '../../theme'
import {
  createToolbarHelpers,
  createButtonFactory,
} from '../toolbar/toolbar-helpers'

export interface FloatingToolbarOptions {
  editor: Signal<LexicalEditor | null>
  stateUpdate: Signal<number>
  groups?: ToolbarGroupId[]
  readOnly?: Signal<boolean>
  size?: ControlSize
}

export function FloatingToolbar({
  editor,
  stateUpdate,
  groups = ['text-formatting'],
  readOnly = signal(false),
  size = 'sm',
}: FloatingToolbarOptions): TNode {
  const isVisible = prop(false)
  const top = prop(0)
  const left = prop(0)

  return Ensure(editor, editorSignal => {
    const ed = editorSignal as unknown as Signal<LexicalEditor>

    // Helper to determine if a group should be visible
    const isGroupVisible = (groupId: ToolbarGroupId): boolean => {
      return groups.includes(groupId)
    }

    // Create shared toolbar helpers
    const { textFormatActive, linkActive, dispatch, toggleLink } =
      createToolbarHelpers(ed, stateUpdate)

    // Create button factory
    const button = createButtonFactory(readOnly, size)
    const btn = button(signal(true))

    // Update visibility and position based on native selection.
    // Uses the native Selection API directly for reliability across all
    // selection methods (keyboard, single-click drag, double-click, triple-click).
    const updatePosition = () => {
      const editor = ed.value
      if (!editor) {
        isVisible.value = false
        return
      }

      const rootElement = editor.getRootElement()
      if (!rootElement) {
        isVisible.value = false
        return
      }

      const nativeSelection = window.getSelection()
      if (
        !nativeSelection ||
        nativeSelection.rangeCount === 0 ||
        nativeSelection.isCollapsed
      ) {
        isVisible.value = false
        return
      }

      // If we can determine the selection's anchor, verify it's within the editor.
      // When anchorNode is unavailable (e.g. in test environments), skip this check —
      // stateUpdate-driven calls are already scoped to the editor.
      const anchorNode = nativeSelection.anchorNode
      if (anchorNode && !rootElement.contains(anchorNode)) {
        isVisible.value = false
        return
      }

      const range = nativeSelection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      if (rect.width === 0 && rect.height === 0) {
        isVisible.value = false
        return
      }

      // Position toolbar above selection (using fixed positioning — viewport coords)
      const TOOLBAR_HEIGHT = 40 // Approximate toolbar height
      const GAP = 8

      let toolbarTop = rect.top - TOOLBAR_HEIGHT - GAP
      const toolbarLeft = rect.left + rect.width / 2

      // Check if toolbar would overflow viewport top
      if (toolbarTop < 0) {
        // Show below selection instead
        toolbarTop = rect.bottom + GAP
      }

      top.value = toolbarTop
      left.value = toolbarLeft
      isVisible.value = true
    }

    // Watch for Lexical state updates (keyboard-driven selection changes)
    stateUpdate.onChange(updatePosition)

    // Listen for native selectionchange on the document.
    // This catches double-click word selection, triple-click line selection,
    // and any other selection method that might not trigger Lexical's
    // SELECTION_CHANGE_COMMAND in time.
    const handleSelectionChange = () => {
      updatePosition()
    }
    document.addEventListener('selectionchange', handleSelectionChange)

    // Build toolbar content
    const toolbarContent = html.div(
      attr.class('bc-floating-toolbar'),
      style.position('fixed'),
      style.top(top.map(v => `${v}px`)),
      style.left(left.map(v => `${v}px`)),
      style.transform('translateX(-50%)'),

      // Escape key handler
      WithElement(container => {
        const handleEscape = (e: KeyboardEvent) => {
          if (e.key === 'Escape' && isVisible.value) {
            isVisible.value = false
            const editor = ed.value
            if (editor) {
              editor.focus()
            }
          }
        }

        const handleClickOutside = (e: MouseEvent) => {
          if (isVisible.value && !container.contains(e.target as Node)) {
            // Don't hide if clicking in the editor
            const editor = ed.value
            if (editor) {
              const editorContainer = editor.getRootElement()
              if (
                editorContainer &&
                editorContainer.contains(e.target as Node)
              ) {
                return
              }
            }
            isVisible.value = false
          }
        }

        document.addEventListener('keydown', handleEscape)
        document.addEventListener('mousedown', handleClickOutside)

        return OnDispose(() => {
          document.removeEventListener('keydown', handleEscape)
          document.removeEventListener('mousedown', handleClickOutside)
          document.removeEventListener('selectionchange', handleSelectionChange)
        })
      }),

      // Text formatting buttons
      ...(isGroupVisible('text-formatting')
        ? [
            btn({
              active: textFormatActive('bold'),
              onClick: dispatch(FORMAT_TEXT_COMMAND, 'bold'),
              label: 'Bold',
              icon: 'mdi:format-bold',
            }),
            btn({
              active: textFormatActive('italic'),
              onClick: dispatch(FORMAT_TEXT_COMMAND, 'italic'),
              label: 'Italic',
              icon: 'mdi:format-italic',
            }),
            btn({
              active: textFormatActive('underline'),
              onClick: dispatch(FORMAT_TEXT_COMMAND, 'underline'),
              label: 'Underline',
              icon: 'mdi:format-underline',
            }),
            btn({
              active: textFormatActive('strikethrough'),
              onClick: dispatch(FORMAT_TEXT_COMMAND, 'strikethrough'),
              label: 'Strikethrough',
              icon: 'mdi:format-strikethrough',
            }),
            btn({
              active: textFormatActive('code'),
              onClick: dispatch(FORMAT_TEXT_COMMAND, 'code'),
              label: 'Code',
              icon: 'mdi:code-tags',
            }),
          ]
        : []),

      // Link button
      ...(isGroupVisible('links')
        ? [
            btn({
              active: linkActive(),
              onClick: toggleLink,
              label: 'Link',
              icon: 'mdi:link',
            }),
          ]
        : []),

      // Clipboard buttons
      ...(isGroupVisible('clipboard')
        ? [
            btn({
              active: signal(false),
              onClick: () => {
                const editor = ed.value
                if (!editor) return
                const root = editor.getRootElement()
                if (root) {
                  root.focus()
                  document.execCommand('cut')
                }
              },
              label: 'Cut',
              icon: 'mdi:content-cut',
            }),
            btn({
              active: signal(false),
              onClick: () => {
                const editor = ed.value
                if (!editor) return
                const root = editor.getRootElement()
                if (root) {
                  root.focus()
                  document.execCommand('copy')
                }
              },
              label: 'Copy',
              icon: 'mdi:content-copy',
            }),
            btn({
              active: signal(false),
              onClick: () => {
                const editor = ed.value
                if (!editor) return
                navigator.clipboard
                  .readText()
                  .then(text => {
                    editor.update(() => {
                      const selection = $getSelection()
                      if ($isRangeSelection(selection)) {
                        selection.insertText(text)
                      }
                    })
                    editor.focus()
                  })
                  .catch(() => {})
              },
              label: 'Paste',
              icon: 'mdi:content-paste',
            }),
          ]
        : [])
    )

    return When(isVisible, () => toolbarContent)
  })
}

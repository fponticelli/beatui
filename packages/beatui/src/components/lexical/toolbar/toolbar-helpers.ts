import { Signal, Value } from '@tempots/dom'
import {
  type LexicalEditor,
  type TextFormatType,
  type RangeSelection,
  type ElementNode,
  type LexicalCommand,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
} from 'lexical'
import { $isListNode } from '@lexical/list'
import { $setBlocksType } from '@lexical/selection'
import { TOGGLE_LINK_COMMAND } from '@lexical/link'
import { EditorToolbarButton } from '../../editor-toolbar'
import { ControlSize } from '../../theme'

/**
 * Create reactive state and action helpers for Lexical toolbar integration.
 * Both the docked toolbar and floating toolbar share these helpers.
 */
export function createToolbarHelpers(
  ed: Signal<LexicalEditor>,
  stateUpdate: Signal<number>
) {
  // State helpers

  /** Read editor state within a range selection context */
  const withSelection = <T>(
    fn: (sel: RangeSelection) => T,
    fallback: T
  ): Signal<T> =>
    stateUpdate.map((): T => {
      const editor = ed.value
      if (!editor) return fallback
      return editor.getEditorState().read(() => {
        const sel = $getSelection()
        return $isRangeSelection(sel) ? fn(sel) : fallback
      })
    })

  /** Resolve the top-level element for the current selection anchor */
  const getAnchorElement = (sel: RangeSelection) => {
    const anchor = sel.anchor.getNode()
    return anchor.getKey() === 'root'
      ? anchor
      : anchor.getTopLevelElementOrThrow()
  }

  /** Active state for a text format (bold, italic, etc.) */
  const textFormatActive = (fmt: TextFormatType) =>
    withSelection(sel => sel.hasFormat(fmt), false)

  /** Active state for a block element type */
  const blockTypeActive = (type: string) =>
    withSelection(sel => getAnchorElement(sel).getType() === type, false)

  /** Active state for a list type */
  const listTypeActive = (listType: string) =>
    withSelection(sel => {
      const parent = getAnchorElement(sel).getParent()
      return $isListNode(parent) && parent.getListType() === listType
    }, false)

  /** Active state for a heading level (checks DOM tag) */
  const headingActive = (level: number) =>
    stateUpdate.map((): boolean => {
      const editor = ed.value
      if (!editor) return false
      return editor.getEditorState().read(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const element = getAnchorElement(selection)
          if (element.getType() === 'heading') {
            const elementDOM = editor.getElementByKey(element.getKey())
            return elementDOM?.tagName === `H${level}`
          }
        }
        return false
      })
    })

  /** Active state for link */
  const linkActive = () =>
    withSelection(sel => {
      const node = sel.anchor.getNode()
      const parent = node.getParent()
      return parent?.getType() === 'link' || node.getType() === 'link'
    }, false)

  // Action helpers

  /** Dispatch a command and refocus */
  const dispatch =
    <T>(command: LexicalCommand<T>, payload: T) =>
    () => {
      const editor = ed.value
      if (editor) {
        editor.dispatchCommand(command, payload)
        editor.focus()
      }
    }

  /** Toggle between a block type and paragraph */
  const toggleBlock = (type: string, create: () => ElementNode) => () => {
    const editor = ed.value
    if (!editor) return
    editor.update(() => {
      const sel = $getSelection()
      if ($isRangeSelection(sel)) {
        const el = getAnchorElement(sel)
        $setBlocksType(sel, () =>
          el.getType() === type ? $createParagraphNode() : create()
        )
      }
    })
    editor.focus()
  }

  /** Toggle link (with URL prompt) */
  const toggleLink = () => {
    const editor = ed.value
    if (!editor) return
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const node = selection.anchor.getNode()
        const parent = node.getParent()
        const isLink = parent?.getType() === 'link' || node.getType() === 'link'
        if (isLink) {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
        } else {
          const url = prompt('Enter URL:')
          if (url) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
          }
        }
      }
    })
    editor.focus()
  }

  return {
    withSelection,
    getAnchorElement,
    textFormatActive,
    blockTypeActive,
    listTypeActive,
    headingActive,
    linkActive,
    dispatch,
    toggleBlock,
    toggleLink,
  }
}

/**
 * Create a button factory bound to shared readOnly and size props.
 * Returns a function that takes a display signal and produces
 * a group-specific button builder.
 */
export function createButtonFactory(
  readOnly: Signal<boolean>,
  size: Value<ControlSize>
) {
  return (display: Signal<boolean>) =>
    (opts: {
      active: Signal<boolean>
      onClick: () => void
      label: string
      icon: string
    }) =>
      EditorToolbarButton({
        ...opts,
        display,
        disabled: readOnly,
        size,
      })
}

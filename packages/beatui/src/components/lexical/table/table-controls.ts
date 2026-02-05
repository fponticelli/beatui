import {
  Signal,
  prop,
  html,
  attr,
  style,
  on,
  When,
  OnDispose,
  WithElement,
  TNode,
  signal,
} from '@tempots/dom'
import type { LexicalEditor, LexicalNode } from 'lexical'
import { $getSelection, $isRangeSelection } from 'lexical'
import {
  $isTableCellNode,
  $getTableCellNodeFromLexicalNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $insertTableRowAtSelection,
  $insertTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $deleteTableColumnAtSelection,
} from '@lexical/table'

export interface TableControlsOptions {
  editor: Signal<LexicalEditor | null>
  stateUpdate: Signal<number>
  readOnly?: Signal<boolean>
}

/**
 * Table context menu that appears when a table cell is selected.
 * Provides operations like insert/delete rows/columns.
 */
export function TableControls({
  editor,
  stateUpdate,
  readOnly = signal(false),
}: TableControlsOptions): TNode {
  const isVisible = prop(false)
  const top = prop(0)
  const left = prop(0)

  // Check if a table cell is currently selected and position the menu
  const checkTableSelection = () => {
    const ed = editor.value
    if (!ed) {
      isVisible.value = false
      return
    }

    ed.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        isVisible.value = false
        return
      }

      const anchorNode = selection.anchor.getNode()

      // Check if we're inside a table cell
      let currentNode: LexicalNode | null = anchorNode
      let cellNode = null

      while (currentNode) {
        if ($isTableCellNode(currentNode)) {
          cellNode = currentNode
          break
        }
        currentNode = currentNode.getParent()
        if (!currentNode || currentNode.getKey() === 'root') break
      }

      if (!cellNode) {
        isVisible.value = false
        return
      }

      // Position the menu relative to the cell
      const cellDom = ed.getElementByKey(cellNode.getKey())
      const editorRoot = ed.getRootElement()
      if (cellDom && editorRoot) {
        const cellRect = cellDom.getBoundingClientRect()
        const editorContainer = editorRoot.closest(
          '.bc-lexical-editor-container'
        )
        const containerRect = editorContainer
          ? editorContainer.getBoundingClientRect()
          : editorRoot.getBoundingClientRect()

        top.value = cellRect.bottom - containerRect.top + 4
        left.value = cellRect.left - containerRect.left
      }

      isVisible.value = true
    })
  }

  // Watch for state updates
  stateUpdate.onChange(checkTableSelection)

  // Table operations
  const insertRowAbove = () => {
    const ed = editor.value
    if (!ed) return
    ed.update(() => {
      $insertTableRowAtSelection(false)
    })
    ed.focus()
  }

  const insertRowBelow = () => {
    const ed = editor.value
    if (!ed) return
    ed.update(() => {
      $insertTableRowAtSelection(true)
    })
    ed.focus()
  }

  const insertColumnLeft = () => {
    const ed = editor.value
    if (!ed) return
    ed.update(() => {
      $insertTableColumnAtSelection(false)
    })
    ed.focus()
  }

  const insertColumnRight = () => {
    const ed = editor.value
    if (!ed) return
    ed.update(() => {
      $insertTableColumnAtSelection(true)
    })
    ed.focus()
  }

  const deleteRow = () => {
    const ed = editor.value
    if (!ed) return
    ed.update(() => {
      $deleteTableRowAtSelection()
    })
    ed.focus()
  }

  const deleteColumn = () => {
    const ed = editor.value
    if (!ed) return
    ed.update(() => {
      $deleteTableColumnAtSelection()
    })
    ed.focus()
  }

  const deleteTable = () => {
    const ed = editor.value
    if (!ed) return
    ed.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return
      const anchorNode = selection.anchor.getNode()
      const cellNode = $getTableCellNodeFromLexicalNode(anchorNode)
      if (!cellNode) return
      const tableNode = $getTableNodeFromLexicalNodeOrThrow(cellNode)
      tableNode.remove()
    })
    ed.focus()
  }

  // Build context menu
  const menuContent = html.div(
    attr.class('bc-table-context-menu'),
    attr.role('menu'),
    style.position('absolute'),
    style.top(top.map(v => `${v}px`)),
    style.left(left.map(v => `${v}px`)),
    style.zIndex('1000'),
    style.backgroundColor('var(--color-surface)'),
    style.border('1px solid var(--color-border)'),
    style.borderRadius('var(--radius-md)'),
    style.boxShadow('0 2px 8px rgba(0, 0, 0, 0.15)'),
    style.padding('var(--spacing-xs)'),
    style.minWidth('180px'),

    WithElement(container => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isVisible.value) {
          isVisible.value = false
          const ed = editor.value
          if (ed) ed.focus()
        }
      }

      const handleClickOutside = (e: MouseEvent) => {
        if (isVisible.value && !container.contains(e.target as Node)) {
          const ed = editor.value
          if (ed) {
            const editorContainer = ed.getRootElement()
            if (editorContainer && editorContainer.contains(e.target as Node)) {
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
      })
    }),

    // Menu items
    menuButton('Insert row above', insertRowAbove, readOnly),
    menuButton('Insert row below', insertRowBelow, readOnly),
    menuButton('Insert column left', insertColumnLeft, readOnly),
    menuButton('Insert column right', insertColumnRight, readOnly),
    html.div(
      attr.class('bc-table-menu-separator'),
      style.height('1px'),
      style.backgroundColor('var(--color-border)'),
      style.margin('var(--spacing-xs) 0')
    ),
    menuButton('Delete row', deleteRow, readOnly, 'danger'),
    menuButton('Delete column', deleteColumn, readOnly, 'danger'),
    menuButton('Delete table', deleteTable, readOnly, 'danger')
  )

  return When(isVisible, () => menuContent)
}

function menuButton(
  label: string,
  onClick: () => void,
  disabled: Signal<boolean>,
  variant: 'default' | 'danger' = 'default'
): TNode {
  return html.button(
    attr.class('bc-table-menu-button'),
    attr.type('button'),
    attr.role('menuitem'),
    attr.disabled(disabled),
    on.click(onClick),
    style.display('block'),
    style.width('100%'),
    style.padding('var(--spacing-xs) var(--spacing-sm)'),
    style.border('none'),
    style.backgroundColor('transparent'),
    style.color(
      variant === 'danger'
        ? 'var(--color-danger-600)'
        : 'var(--color-neutral-900)'
    ),
    style.textAlign('left'),
    style.cursor('pointer'),
    style.borderRadius('var(--radius-sm)'),
    style.fontSize('0.875rem'),
    style.transition('background-color 0.15s'),
    html.span(label)
  )
}

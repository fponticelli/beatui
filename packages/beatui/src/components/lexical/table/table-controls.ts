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
  signal,
  Use,
  Ensure,
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
import { Menu, MenuItem, MenuSeparator } from '../../navigation/menu'
import { Icon } from '../../data'
import { BeatUII18n } from '../../../beatui-i18n'

export interface TableControlsOptions {
  editor: Signal<LexicalEditor | null>
  stateUpdate: Signal<number>
  readOnly?: Signal<boolean>
}

/**
 * Table context menu that appears when a table cell is selected.
 * Shows a marker button at the top-right of the selected cell and
 * supports right-click context menu on table cells.
 * Uses BeatUI Menu component for the dropdown.
 */
export function TableControls({
  editor,
  stateUpdate,
  readOnly = signal(false),
}: TableControlsOptions) {
  const isVisible = prop(false)
  const markerTop = prop(0)
  const markerRight = prop(0)
  let showMenuFn: (() => void) | null = null
  let hideMenuFn: (() => void) | null = null
  const isMenuOpen = prop(false)

  const findSelectedTableCell = (ed: LexicalEditor) => {
    let cellNode: LexicalNode | null = null

    ed.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      let currentNode: LexicalNode | null = selection.anchor.getNode()
      while (currentNode) {
        if ($isTableCellNode(currentNode)) {
          cellNode = currentNode
          break
        }
        currentNode = currentNode.getParent()
        if (!currentNode || currentNode.getKey() === 'root') break
      }
    })

    return cellNode as LexicalNode | null
  }

  const positionMarker = (
    cellDom: HTMLElement,
    editorRoot: HTMLElement
  ): boolean => {
    const cellRect = cellDom.getBoundingClientRect()
    const editorContainer = editorRoot.closest('.bc-lexical-editor-container')
    const containerRect = editorContainer
      ? editorContainer.getBoundingClientRect()
      : editorRoot.getBoundingClientRect()

    markerTop.value = cellRect.top - containerRect.top + 2
    markerRight.value = containerRect.right - cellRect.right + 2
    return true
  }

  const checkTableSelection = () => {
    const ed = editor.value
    if (!ed) {
      isVisible.value = false
      return
    }

    const cellNode = findSelectedTableCell(ed)
    if (!cellNode) {
      if (!isMenuOpen.value) {
        isVisible.value = false
      }
      return
    }

    const cellDom = ed.getElementByKey(cellNode.getKey())
    const editorRoot = ed.getRootElement()
    if (cellDom && editorRoot) {
      positionMarker(cellDom, editorRoot)
      isVisible.value = true
    } else {
      isVisible.value = false
    }
  }

  stateUpdate.onChange(checkTableSelection)

  // Table operations
  const makeOperation = (op: () => void) => () => {
    const ed = editor.value
    if (!ed) return
    ed.update(op)
    hideMenuFn?.()
    ed.focus()
  }

  const insertRowAbove = makeOperation(() => $insertTableRowAtSelection(false))
  const insertRowBelow = makeOperation(() => $insertTableRowAtSelection(true))
  const insertColumnLeft = makeOperation(() =>
    $insertTableColumnAtSelection(false)
  )
  const insertColumnRight = makeOperation(() =>
    $insertTableColumnAtSelection(true)
  )
  const deleteRow = makeOperation(() => $deleteTableRowAtSelection())
  const deleteColumn = makeOperation(() => $deleteTableColumnAtSelection())
  const deleteTable = makeOperation(() => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return
    const anchorNode = selection.anchor.getNode()
    const cellNode = $getTableCellNodeFromLexicalNode(anchorNode)
    if (!cellNode) return
    const tableNode = $getTableNodeFromLexicalNodeOrThrow(cellNode)
    tableNode.remove()
  })

  return Use(BeatUII18n, t =>
    Ensure(editor, editorSignal => {
      const ed = editorSignal as unknown as Signal<LexicalEditor>
      const lex = t.$.lexical

      // Right-click handler for table cells
      const handleContextMenu = (e: MouseEvent) => {
        const editorInstance = ed.value
        if (!editorInstance || readOnly.value) return
        const editorRoot = editorInstance.getRootElement()
        if (!editorRoot) return

        const target = e.target as HTMLElement
        const tableCell = target.closest('td, th')
        if (tableCell && editorRoot.contains(tableCell)) {
          e.preventDefault()

          // Position marker at the right-clicked cell
          if (positionMarker(tableCell as HTMLElement, editorRoot)) {
            isVisible.value = true
          }

          // Open menu after the marker is rendered
          requestAnimationFrame(() => {
            showMenuFn?.()
          })
        }
      }

      const editorRoot = ed.value?.getRootElement()
      const editorContainer = editorRoot?.closest(
        '.bc-lexical-editor-container'
      )
      const contextTarget =
        (editorContainer as HTMLElement) ?? editorRoot ?? document

      contextTarget.addEventListener('contextmenu', handleContextMenu)

      return [
        OnDispose(() => {
          contextTarget.removeEventListener('contextmenu', handleContextMenu)
        }),

        When(isVisible, () =>
          html.div(
            attr.class('bc-table-cell-marker'),
            style.position('absolute'),
            style.top(markerTop.map(v => `${v}px`)),
            style.right(markerRight.map(v => `${v}px`)),
            style.zIndex('10'),

            // Prevent mousedown from stealing focus from editor
            WithElement(el => {
              el.addEventListener('mousedown', (e: MouseEvent) => {
                e.preventDefault()
              })
            }),

            html.button(
              attr.class('bc-table-cell-marker__button'),
              attr.type('button'),
              attr.title(lex.map(l => l.tableActions)),
              attr.disabled(readOnly),
              Icon({ icon: 'lucide:chevron-down', size: 'xs' }),

              // Track menu open state via aria-expanded
              WithElement(buttonEl => {
                const observer = new MutationObserver(() => {
                  const expanded =
                    buttonEl.getAttribute('aria-expanded') === 'true'
                  isMenuOpen.value = expanded
                })
                observer.observe(buttonEl, {
                  attributes: true,
                  attributeFilter: ['aria-expanded'],
                })
                return OnDispose(() => observer.disconnect())
              }),

              Menu({
                items: () => [
                  MenuItem({
                    key: 'insert-row-above',
                    content: lex.map(l => l.insertRowAbove),
                    startContent: Icon({
                      icon: 'lucide:arrow-up',
                      size: 'sm',
                    }),
                    onClick: insertRowAbove,
                    disabled: readOnly,
                  }),
                  MenuItem({
                    key: 'insert-row-below',
                    content: lex.map(l => l.insertRowBelow),
                    startContent: Icon({
                      icon: 'lucide:arrow-down',
                      size: 'sm',
                    }),
                    onClick: insertRowBelow,
                    disabled: readOnly,
                  }),
                  MenuItem({
                    key: 'insert-column-left',
                    content: lex.map(l => l.insertColumnLeft),
                    startContent: Icon({
                      icon: 'lucide:arrow-left',
                      size: 'sm',
                    }),
                    onClick: insertColumnLeft,
                    disabled: readOnly,
                  }),
                  MenuItem({
                    key: 'insert-column-right',
                    content: lex.map(l => l.insertColumnRight),
                    startContent: Icon({
                      icon: 'lucide:arrow-right',
                      size: 'sm',
                    }),
                    onClick: insertColumnRight,
                    disabled: readOnly,
                  }),
                  MenuSeparator(),
                  MenuItem({
                    key: 'delete-row',
                    content: lex.map(l => l.deleteRow),
                    startContent: Icon({
                      icon: 'lucide:trash-2',
                      size: 'sm',
                    }),
                    onClick: deleteRow,
                    disabled: readOnly,
                  }),
                  MenuItem({
                    key: 'delete-column',
                    content: lex.map(l => l.deleteColumn),
                    startContent: Icon({
                      icon: 'lucide:trash-2',
                      size: 'sm',
                    }),
                    onClick: deleteColumn,
                    disabled: readOnly,
                  }),
                  MenuItem({
                    key: 'delete-table',
                    content: lex.map(l => l.deleteTable),
                    startContent: Icon({
                      icon: 'lucide:trash-2',
                      size: 'sm',
                    }),
                    onClick: deleteTable,
                    disabled: readOnly,
                  }),
                ],
                placement: 'bottom-end',
                showOn: (show, hide) => {
                  showMenuFn = show
                  hideMenuFn = hide
                  return on.click(() => {
                    if (isMenuOpen.value) {
                      hide()
                    } else {
                      show()
                      isMenuOpen.value = true
                    }
                  })
                },
                showDelay: 0,
                hideDelay: 0,
                mainAxisOffset: 4,
                onClose: () => {
                  const editorInstance = ed.value
                  if (editorInstance) editorInstance.focus()
                },
                ariaLabel: lex.map(l => l.tableActions),
              })
            )
          )
        ),
      ]
    })
  )
}

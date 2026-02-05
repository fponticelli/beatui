import {
  Signal,
  prop,
  html,
  attr,
  style,
  When,
  OnDispose,
  WithElement,
  TNode,
  signal,
  Ensure,
  on,
} from '@tempots/dom'
import type { LexicalEditor } from 'lexical'
import { $getSelection, $isRangeSelection, $createParagraphNode } from 'lexical'
import { $setBlocksType } from '@lexical/selection'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $createCodeNode } from '@lexical/code'
import { INSERT_TABLE_COMMAND } from '@lexical/table'
import {
  INSERT_HORIZONTAL_RULE_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '../../../lexical/commands'
import { Icon } from '../../data'
import { Menu, MenuItem } from '../../navigation/menu'

export interface BlockCommand {
  id: string
  label: string
  icon: string
  handler: (editor: LexicalEditor) => void
}

export const DEFAULT_BLOCK_COMMANDS: BlockCommand[] = [
  {
    id: 'paragraph',
    label: 'Paragraph',
    icon: 'mdi:format-paragraph',
    handler: editor => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode())
        }
      })
    },
  },
  {
    id: 'heading1',
    label: 'Heading 1',
    icon: 'mdi:format-header-1',
    handler: editor => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h1'))
        }
      })
    },
  },
  {
    id: 'heading2',
    label: 'Heading 2',
    icon: 'mdi:format-header-2',
    handler: editor => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h2'))
        }
      })
    },
  },
  {
    id: 'heading3',
    label: 'Heading 3',
    icon: 'mdi:format-header-3',
    handler: editor => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode('h3'))
        }
      })
    },
  },
  {
    id: 'bullet-list',
    label: 'Bullet List',
    icon: 'mdi:format-list-bulleted',
    handler: editor => {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    },
  },
  {
    id: 'ordered-list',
    label: 'Ordered List',
    icon: 'mdi:format-list-numbered',
    handler: editor => {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    },
  },
  {
    id: 'quote',
    label: 'Quote',
    icon: 'mdi:format-quote-close',
    handler: editor => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode())
        }
      })
    },
  },
  {
    id: 'code-block',
    label: 'Code Block',
    icon: 'mdi:code-braces',
    handler: editor => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createCodeNode())
        }
      })
    },
  },
  {
    id: 'divider',
    label: 'Divider',
    icon: 'mdi:minus',
    handler: editor => {
      editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)
    },
  },
  {
    id: 'table',
    label: 'Table',
    icon: 'mdi:table',
    handler: editor => {
      editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        rows: '3',
        columns: '3',
        includeHeaders: true,
      })
    },
  },
]

export interface BlockHandleOptions {
  editor: Signal<LexicalEditor | null>
  stateUpdate: Signal<number>
  readOnly?: Signal<boolean>
  commands?: BlockCommand[]
}

export function BlockHandle({
  editor,
  stateUpdate,
  readOnly = signal(false),
  commands = DEFAULT_BLOCK_COMMANDS,
}: BlockHandleOptions): TNode {
  const isHandleVisible = prop(false)
  const isMenuOpen = prop(false)
  const handleTop = prop(0)
  const handleLeft = prop(0)

  return Ensure(editor, editorSignal => {
    const ed = editorSignal as unknown as Signal<LexicalEditor>
    let activeBlockElement: HTMLElement | null = null
    let rootListenersAttached = false
    let hideTimeout: ReturnType<typeof setTimeout> | null = null
    let menuHideFn: (() => void) | null = null

    const HANDLE_SIZE = 24
    const HANDLE_GAP = 4
    const HIDE_DELAY = 200

    const updateHandleForElement = (el: HTMLElement) => {
      if (el === activeBlockElement && isHandleVisible.value) return
      activeBlockElement = el
      const rect = el.getBoundingClientRect()
      handleTop.value = rect.top
      handleLeft.value = rect.left - HANDLE_SIZE - HANDLE_GAP
      isHandleVisible.value = true
    }

    const cancelHide = () => {
      if (hideTimeout != null) {
        clearTimeout(hideTimeout)
        hideTimeout = null
      }
    }

    const scheduleHide = () => {
      if (isMenuOpen.value) return
      cancelHide()
      hideTimeout = setTimeout(() => {
        hideTimeout = null
        if (!isMenuOpen.value) {
          isHandleVisible.value = false
          activeBlockElement = null
        }
      }, HIDE_DELAY)
    }

    const updateFromCursor = () => {
      const editor = ed.value
      if (!editor) return
      const rootElement = editor.getRootElement()
      if (!rootElement) return

      attachRootListeners(rootElement)

      editor.getEditorState().read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return
        try {
          const anchorNode = selection.anchor.getNode()
          const topLevel = anchorNode.getTopLevelElementOrThrow()
          const dom = editor.getElementByKey(topLevel.getKey())
          if (dom) updateHandleForElement(dom)
        } catch {
          /* ignore — e.g. selection at root level */
        }
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isMenuOpen.value) return
      const editor = ed.value
      if (!editor) return
      const rootElement = editor.getRootElement()
      if (!rootElement) return

      for (const child of Array.from(rootElement.children)) {
        const rect = (child as HTMLElement).getBoundingClientRect()
        if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
          cancelHide()
          updateHandleForElement(child as HTMLElement)
          return
        }
      }
    }

    const handleMouseLeave = () => {
      scheduleHide()
    }

    const attachRootListeners = (rootElement: HTMLElement) => {
      if (rootListenersAttached) return
      rootListenersAttached = true
      rootElement.addEventListener('mousemove', handleMouseMove)
      rootElement.addEventListener('mouseleave', handleMouseLeave)
    }

    // Track cursor movement
    stateUpdate.onChange(updateFromCursor)

    // Cleanup
    const cleanup = OnDispose(() => {
      cancelHide()
      const editor = ed.value
      if (editor) {
        const rootElement = editor.getRootElement()
        if (rootElement && rootListenersAttached) {
          rootElement.removeEventListener('mousemove', handleMouseMove)
          rootElement.removeEventListener('mouseleave', handleMouseLeave)
        }
      }
    })

    return [
      cleanup,
      When(isHandleVisible, () =>
        html.div(
          attr.class('bc-block-handle'),
          style.position('fixed'),
          style.top(handleTop.map(v => `${v}px`)),
          style.left(handleLeft.map(v => `${v}px`)),

          // Cancel hide when mouse enters handle area
          on.mouseenter(cancelHide),
          // Schedule hide when mouse leaves handle (unless menu is open)
          on.mouseleave(() => scheduleHide()),

          // Prevent mousedown from stealing focus from editor
          WithElement(el => {
            el.addEventListener('mousedown', (e: MouseEvent) => {
              e.preventDefault()
            })
          }),

          html.button(
            attr.class('bc-block-handle__button'),
            attr.type('button'),
            attr.title('Change block type'),
            attr.disabled(readOnly),
            Icon({ icon: 'mdi:drag-horizontal-variant', size: 'sm' }),

            // Track menu open state via aria-expanded (set by Flyout)
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

            // Block type menu (uses BeatUI Menu + MenuItem)
            Menu({
              items: () =>
                commands.map(cmd =>
                  MenuItem({
                    key: cmd.id,
                    content: cmd.label,
                    startContent: Icon({ icon: cmd.icon, size: 'sm' }),
                    onClick: () => {
                      const editor = ed.value
                      if (!editor) return
                      cmd.handler(editor)
                      menuHideFn?.()
                      editor.focus()
                    },
                  })
                ),
              placement: 'bottom-start',
              showOn: (show, hide) => {
                menuHideFn = hide
                return on.click(() => {
                  if (isMenuOpen.value) {
                    hide()
                  } else {
                    show()
                    // Set immediately for hover protection
                    isMenuOpen.value = true
                  }
                })
              },
              showDelay: 0,
              hideDelay: 0,
              mainAxisOffset: 4,
              onClose: () => {
                const editor = ed.value
                if (editor) editor.focus()
              },
              ariaLabel: 'Block types',
            })
          )
        )
      ),
    ]
  })
}

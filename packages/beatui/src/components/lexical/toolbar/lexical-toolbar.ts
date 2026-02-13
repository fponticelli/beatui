import {
  Signal,
  signal,
  Value,
  Ensure,
  attr,
  html,
  on,
  When,
} from '@tempots/dom'
import {
  type LexicalEditor,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $createParagraphNode,
} from 'lexical'
import {
  $setBlocksType,
  $patchStyleText,
  $getSelectionStyleValueForProperty,
} from '@lexical/selection'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $createCodeNode } from '@lexical/code'
import { INSERT_TABLE_COMMAND } from '@lexical/table'
import {
  FORMAT_TEXT_COMMAND,
  INSERT_HORIZONTAL_RULE_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from '../../../lexical/commands'
import type {
  ToolbarConfig,
  ToolbarGroupId,
  FontOption,
} from '../../../lexical/types'
import { Toolbar } from '../../navigation/toolbar/toolbar'
import { LexicalToolbarGroup } from './toolbar-group'
import { ControlSize } from '../../theme'
import { createToolbarHelpers, createButtonFactory } from './toolbar-helpers'

const DEFAULT_FONT_FAMILIES: FontOption[] = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Verdana', label: 'Verdana' },
]

const DEFAULT_FONT_SIZES: FontOption[] = [
  { value: '10px', label: '10' },
  { value: '12px', label: '12' },
  { value: '14px', label: '14' },
  { value: '16px', label: '16' },
  { value: '18px', label: '18' },
  { value: '20px', label: '20' },
  { value: '24px', label: '24' },
  { value: '30px', label: '30' },
  { value: '36px', label: '36' },
]

const DEFAULT_ENTRY: FontOption = { value: '', label: 'Default' }

export interface LexicalToolbarOptions {
  editor: Signal<LexicalEditor | null>
  stateUpdate: Signal<number>
  toolbar?: ToolbarConfig
  readOnly?: Signal<boolean>
  size?: Value<ControlSize>
}

export function LexicalToolbar({
  editor,
  stateUpdate,
  toolbar = {},
  readOnly = signal(false),
  size = 'sm',
}: LexicalToolbarOptions) {
  const { visibleGroups, hiddenGroups, maxHeadingLevel = 3 } = toolbar

  // Helper to determine if a group should be visible
  const isGroupVisible = (groupId: ToolbarGroupId): boolean => {
    if (hiddenGroups?.includes(groupId)) return false
    if (visibleGroups && !visibleGroups.includes(groupId)) return false
    return true
  }

  return Ensure(editor, editorSignal => {
    const ed = editorSignal as unknown as Signal<LexicalEditor>

    // Group visibility signals
    const showTextFormatting = signal(isGroupVisible('text-formatting'))
    const showHeadings = signal(isGroupVisible('headings'))
    const showLists = signal(isGroupVisible('lists'))
    const showBlocks = signal(isGroupVisible('blocks'))
    const showLinks = signal(isGroupVisible('links'))
    const showIndent = signal(isGroupVisible('indent'))
    const showTables = signal(isGroupVisible('tables'))
    const showHistory = signal(isGroupVisible('history'))
    const showClipboard = signal(isGroupVisible('clipboard'))
    const showFont = signal(isGroupVisible('font'))
    const showColor = signal(isGroupVisible('color'))
    const showClearFormatting = signal(isGroupVisible('clear-formatting'))

    // Create shared toolbar helpers
    const {
      getAnchorElement,
      textFormatActive,
      blockTypeActive,
      listTypeActive,
      headingActive,
      linkActive,
      dispatch,
      toggleBlock,
      toggleLink: sharedToggleLink,
    } = createToolbarHelpers(ed, stateUpdate)

    // Create button factory
    const button = createButtonFactory(readOnly, size)

    // === Specific handlers (docked toolbar only) ===

    // Format paragraph (revert heading/block to normal paragraph)
    const formatParagraph = () => {
      const editor = ed.value
      if (!editor) return
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode())
        }
      })
      editor.focus()
    }

    // Heading toggle handler (toggle: re-clicking the active heading reverts to paragraph)
    const formatHeading = (level: number) => {
      const editor = ed.value
      if (!editor) return
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const element = getAnchorElement(selection)
          const headingTag = `h${level}` as
            | 'h1'
            | 'h2'
            | 'h3'
            | 'h4'
            | 'h5'
            | 'h6'
          const elementDOM = editor.getElementByKey(element.getKey())
          const isCurrentHeading =
            element.getType() === 'heading' &&
            elementDOM?.tagName === `H${level}`

          if (isCurrentHeading) {
            $setBlocksType(selection, () => $createParagraphNode())
          } else {
            $setBlocksType(selection, () => $createHeadingNode(headingTag))
          }
        }
      })
      editor.focus()
    }

    // === Build the toolbar ===

    const textBtn = button(showTextFormatting)
    const headingBtn = button(showHeadings)
    const listBtn = button(showLists)
    const blockBtn = button(showBlocks)
    const linkBtn = button(showLinks)
    const indentBtn = button(showIndent)
    const tableBtn = button(showTables)
    const clearFmtBtn = button(showClearFormatting)
    const historyBtn = button(showHistory)
    const clipboardBtn = button(showClipboard)

    // Clipboard handlers
    const clipboardCopy = () => {
      const editor = ed.value
      if (!editor) return
      const root = editor.getRootElement()
      if (root) {
        root.focus()
        document.execCommand('copy')
      }
    }
    const clipboardCut = () => {
      const editor = ed.value
      if (!editor) return
      const root = editor.getRootElement()
      if (root) {
        root.focus()
        document.execCommand('cut')
      }
    }
    const clipboardPaste = () => {
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
    }

    // Clear formatting handler
    const clearFormatting = () => {
      const editor = ed.value
      if (!editor) return
      editor.update(() => {
        const sel = $getSelection()
        if ($isRangeSelection(sel)) {
          for (const node of sel.getNodes()) {
            if ($isTextNode(node)) {
              node.setFormat(0)
              node.setStyle('')
            }
          }
        }
      })
      editor.focus()
    }

    // Insert table handler
    const insertTable = () => {
      const editor = ed.value
      if (!editor) return
      editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        rows: '3',
        columns: '3',
        includeHeaders: true,
      })
      editor.focus()
    }

    // Font options (use config overrides or defaults, always prepend Default entry)
    const FONT_FAMILIES = [
      DEFAULT_ENTRY,
      ...(toolbar.fontFamilies ?? DEFAULT_FONT_FAMILIES),
    ]
    const FONT_SIZES = [
      DEFAULT_ENTRY,
      ...(toolbar.fontSizes ?? DEFAULT_FONT_SIZES),
    ]

    // Current font selection (reactive to editor state updates)
    const currentFontFamily = stateUpdate.map(() => {
      const editor = ed.value
      if (!editor) return ''
      return editor.getEditorState().read(() => {
        const sel = $getSelection()
        if ($isRangeSelection(sel)) {
          return $getSelectionStyleValueForProperty(sel, 'font-family', '')
        }
        return ''
      })
    })
    const currentFontSize = stateUpdate.map(() => {
      const editor = ed.value
      if (!editor) return ''
      return editor.getEditorState().read(() => {
        const sel = $getSelection()
        if ($isRangeSelection(sel)) {
          return $getSelectionStyleValueForProperty(sel, 'font-size', '')
        }
        return ''
      })
    })

    const applyFontFamily = (value: string) => {
      const editor = ed.value
      if (!editor) return
      editor.update(() => {
        const sel = $getSelection()
        if ($isRangeSelection(sel)) {
          $patchStyleText(sel, { 'font-family': value || null })
        }
      })
      editor.focus()
    }

    const applyFontSize = (value: string) => {
      const editor = ed.value
      if (!editor) return
      editor.update(() => {
        const sel = $getSelection()
        if ($isRangeSelection(sel)) {
          $patchStyleText(sel, { 'font-size': value || null })
        }
      })
      editor.focus()
    }

    // Color handlers
    const currentFontColor = stateUpdate.map(() => {
      const editor = ed.value
      if (!editor) return '#000000'
      return editor.getEditorState().read(() => {
        const sel = $getSelection()
        if ($isRangeSelection(sel)) {
          return (
            $getSelectionStyleValueForProperty(sel, 'color', '') || '#000000'
          )
        }
        return '#000000'
      })
    })
    const currentHighlight = stateUpdate.map(() => {
      const editor = ed.value
      if (!editor) return '#ffffff'
      return editor.getEditorState().read(() => {
        const sel = $getSelection()
        if ($isRangeSelection(sel)) {
          return (
            $getSelectionStyleValueForProperty(sel, 'background-color', '') ||
            '#ffffff'
          )
        }
        return '#ffffff'
      })
    })
    const currentBgColor = stateUpdate.map(() => {
      const editor = ed.value
      if (!editor) return '#ffffff'
      return editor.getEditorState().read(() => {
        const sel = $getSelection()
        if ($isRangeSelection(sel)) {
          const element = getAnchorElement(sel)
          const dom = editor.getElementByKey(element.getKey())
          return dom?.style.backgroundColor || '#ffffff'
        }
        return '#ffffff'
      })
    })

    const applyFontColor = (value: string) => {
      const editor = ed.value
      if (!editor) return
      editor.update(() => {
        const sel = $getSelection()
        if ($isRangeSelection(sel)) {
          $patchStyleText(sel, { color: value })
        }
      })
      editor.focus()
    }

    const applyHighlight = (value: string) => {
      const editor = ed.value
      if (!editor) return
      editor.update(() => {
        const sel = $getSelection()
        if ($isRangeSelection(sel)) {
          $patchStyleText(sel, { 'background-color': value })
        }
      })
      editor.focus()
    }

    const applyBgColor = (value: string) => {
      const editor = ed.value
      if (!editor) return
      editor.update(() => {
        const sel = $getSelection()
        if ($isRangeSelection(sel)) {
          const element = getAnchorElement(sel)
          const dom = editor.getElementByKey(element.getKey())
          if (dom) {
            dom.style.backgroundColor = value
          }
        }
      })
      editor.focus()
    }

    return Toolbar(
      attr.class('bc-lexical-toolbar'),

      // Font group (font family and font size selects)
      When(showFont, () =>
        LexicalToolbarGroup(
          { display: [showFont] },
          html.select(
            attr.class('bc-lexical-toolbar-select'),
            attr.title('Font Family'),
            attr.disabled(readOnly),
            on.change(e =>
              applyFontFamily((e.target as HTMLSelectElement).value)
            ),
            ...FONT_FAMILIES.map(f =>
              html.option(
                attr.value(f.value),
                attr.selected(currentFontFamily.map(v => v === f.value)),
                f.label
              )
            )
          ),
          html.select(
            attr.class('bc-lexical-toolbar-select'),
            attr.title('Font Size'),
            attr.disabled(readOnly),
            on.change(e =>
              applyFontSize((e.target as HTMLSelectElement).value)
            ),
            ...FONT_SIZES.map(f =>
              html.option(
                attr.value(f.value),
                attr.selected(currentFontSize.map(v => v === f.value)),
                f.label
              )
            )
          )
        )
      ),

      // Color group (font color, highlight, background)
      When(showColor, () =>
        LexicalToolbarGroup(
          { display: [showColor] },
          html.label(
            attr.class('bc-lexical-toolbar-color'),
            attr.title('Font Color'),
            html.input(
              attr.type('color'),
              attr.value(currentFontColor),
              attr.disabled(readOnly),
              on.input(e =>
                applyFontColor((e.target as HTMLInputElement).value)
              )
            ),
            html.span(attr.class('bc-lexical-toolbar-color-icon'), 'A')
          ),
          html.label(
            attr.class('bc-lexical-toolbar-color'),
            attr.title('Highlight Color'),
            html.input(
              attr.type('color'),
              attr.value(currentHighlight),
              attr.disabled(readOnly),
              on.input(e =>
                applyHighlight((e.target as HTMLInputElement).value)
              )
            ),
            html.span(
              attr.class(
                'bc-lexical-toolbar-color-icon bc-lexical-toolbar-color-icon--highlight'
              ),
              'A'
            )
          ),
          html.label(
            attr.class('bc-lexical-toolbar-color'),
            attr.title('Background Color'),
            html.input(
              attr.type('color'),
              attr.value(currentBgColor),
              attr.disabled(readOnly),
              on.input(e => applyBgColor((e.target as HTMLInputElement).value))
            ),
            html.span(
              attr.class(
                'bc-lexical-toolbar-color-icon bc-lexical-toolbar-color-icon--bg'
              ),
              '\u25A0'
            )
          )
        )
      ),

      // Text formatting group
      LexicalToolbarGroup(
        { display: Array(5).fill(showTextFormatting) },
        textBtn({
          active: textFormatActive('bold'),
          onClick: dispatch(FORMAT_TEXT_COMMAND, 'bold'),
          label: 'Bold',
          icon: 'mdi:format-bold',
        }),
        textBtn({
          active: textFormatActive('italic'),
          onClick: dispatch(FORMAT_TEXT_COMMAND, 'italic'),
          label: 'Italic',
          icon: 'mdi:format-italic',
        }),
        textBtn({
          active: textFormatActive('underline'),
          onClick: dispatch(FORMAT_TEXT_COMMAND, 'underline'),
          label: 'Underline',
          icon: 'mdi:format-underline',
        }),
        textBtn({
          active: textFormatActive('strikethrough'),
          onClick: dispatch(FORMAT_TEXT_COMMAND, 'strikethrough'),
          label: 'Strikethrough',
          icon: 'mdi:format-strikethrough',
        }),
        textBtn({
          active: textFormatActive('code'),
          onClick: dispatch(FORMAT_TEXT_COMMAND, 'code'),
          label: 'Code',
          icon: 'mdi:code-tags',
        })
      ),

      // Clear formatting group
      LexicalToolbarGroup(
        { display: [showClearFormatting] },
        clearFmtBtn({
          active: signal(false),
          onClick: clearFormatting,
          label: 'Clear Formatting',
          icon: 'mdi:format-clear',
        })
      ),

      // Headings group (includes "Normal" paragraph button)
      LexicalToolbarGroup(
        {
          display: [showHeadings, ...Array(maxHeadingLevel).fill(showHeadings)],
        },
        headingBtn({
          active: blockTypeActive('paragraph'),
          onClick: formatParagraph,
          label: 'Normal',
          icon: 'mdi:format-paragraph',
        }),
        ...Array.from({ length: maxHeadingLevel }, (_, i) => {
          const level = i + 1
          return headingBtn({
            active: headingActive(level),
            onClick: () => formatHeading(level),
            label: `Heading ${level}`,
            icon: `mdi:format-header-${level}`,
          })
        })
      ),

      // Lists group
      LexicalToolbarGroup(
        { display: Array(3).fill(showLists) },
        listBtn({
          active: listTypeActive('bullet'),
          onClick: dispatch(INSERT_UNORDERED_LIST_COMMAND, undefined),
          label: 'Bullet List',
          icon: 'mdi:format-list-bulleted',
        }),
        listBtn({
          active: listTypeActive('number'),
          onClick: dispatch(INSERT_ORDERED_LIST_COMMAND, undefined),
          label: 'Ordered List',
          icon: 'mdi:format-list-numbered',
        }),
        listBtn({
          active: listTypeActive('check'),
          onClick: dispatch(INSERT_CHECK_LIST_COMMAND, undefined),
          label: 'Check List',
          icon: 'mdi:format-list-checks',
        })
      ),

      // Indent group
      LexicalToolbarGroup(
        { display: Array(2).fill(showIndent) },
        indentBtn({
          active: signal(false),
          onClick: dispatch(INDENT_CONTENT_COMMAND, undefined),
          label: 'Indent',
          icon: 'mdi:format-indent-increase',
        }),
        indentBtn({
          active: signal(false),
          onClick: dispatch(OUTDENT_CONTENT_COMMAND, undefined),
          label: 'Outdent',
          icon: 'mdi:format-indent-decrease',
        })
      ),

      // Blocks group
      LexicalToolbarGroup(
        { display: Array(3).fill(showBlocks) },
        blockBtn({
          active: blockTypeActive('quote'),
          onClick: toggleBlock('quote', $createQuoteNode),
          label: 'Blockquote',
          icon: 'mdi:format-quote-close',
        }),
        blockBtn({
          active: blockTypeActive('code'),
          onClick: toggleBlock('code', $createCodeNode),
          label: 'Code Block',
          icon: 'mdi:code-braces',
        }),
        blockBtn({
          active: signal(false),
          onClick: dispatch(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
          label: 'Horizontal Rule',
          icon: 'mdi:minus',
        })
      ),

      // Tables group
      LexicalToolbarGroup(
        { display: [showTables] },
        tableBtn({
          active: signal(false),
          onClick: insertTable,
          label: 'Insert Table',
          icon: 'mdi:table-plus',
        })
      ),

      // Links group
      LexicalToolbarGroup(
        { display: [showLinks] },
        linkBtn({
          active: linkActive(),
          onClick: sharedToggleLink,
          label: 'Link',
          icon: 'mdi:link',
        })
      ),

      // History group
      LexicalToolbarGroup(
        { display: Array(2).fill(showHistory) },
        historyBtn({
          active: signal(false),
          onClick: dispatch(UNDO_COMMAND, undefined),
          label: 'Undo',
          icon: 'mdi:undo',
        }),
        historyBtn({
          active: signal(false),
          onClick: dispatch(REDO_COMMAND, undefined),
          label: 'Redo',
          icon: 'mdi:redo',
        })
      ),

      // Clipboard group
      LexicalToolbarGroup(
        { display: Array(3).fill(showClipboard) },
        clipboardBtn({
          active: signal(false),
          onClick: clipboardCut,
          label: 'Cut',
          icon: 'mdi:content-cut',
        }),
        clipboardBtn({
          active: signal(false),
          onClick: clipboardCopy,
          label: 'Copy',
          icon: 'mdi:content-copy',
        }),
        clipboardBtn({
          active: signal(false),
          onClick: clipboardPaste,
          label: 'Paste',
          icon: 'mdi:content-paste',
        })
      )
    )
  })
}

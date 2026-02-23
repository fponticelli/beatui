import {
  Signal,
  signal,
  TNode,
  Value,
  Ensure,
  Use,
  attr,
  html,
  on,
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
  ToolbarButtonId,
  ToolbarConfig,
  ToolbarLayoutEntry,
  FontOption,
} from '../../../lexical/types'
import { Toolbar, ToolbarDivider } from '../../navigation/toolbar/toolbar'
import { LexicalToolbarGroup } from './toolbar-group'
import { ControlSize } from '../../theme'
import { createToolbarHelpers, createButtonFactory } from './toolbar-helpers'
import { BeatUII18n } from '../../../beatui-i18n'
import { GROUP_BUTTONS, resolveLayout } from './toolbar-registry'
import {
  mergeElementStyle,
  getElementStyleProperty,
} from '../../../lexical/plugins/element-style'

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
  const { maxHeadingLevel = 3 } = toolbar

  // Resolve the layout from config (handles layout/visibleGroups/hiddenGroups)
  const layout = resolveLayout(toolbar)

  return Use(BeatUII18n, t =>
    Ensure(editor, editorSignal => {
      const ed = editorSignal as unknown as Signal<LexicalEditor>
      const lex = t.$.lexical

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
      } = createToolbarHelpers(ed, stateUpdate, {
        enterUrlMessage: () => t.value.lexical.enterUrl,
      })

      // Create button factory (all buttons use signal(true) — visibility
      // is controlled by which buttons appear in the layout, not by signals)
      const button = createButtonFactory(readOnly, size)
      const btn = button(signal(true))

      // === Handlers ===

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

      // Font options
      const defaultEntry: FontOption = {
        value: '',
        label: t.value.lexical.defaultOption,
      }
      const FONT_FAMILIES = [
        defaultEntry,
        ...(toolbar.fontFamilies ?? DEFAULT_FONT_FAMILIES),
      ]
      const FONT_SIZES = [
        defaultEntry,
        ...(toolbar.fontSizes ?? DEFAULT_FONT_SIZES),
      ]

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
            const style = element.getStyle()
            return (
              getElementStyleProperty(style, 'background-color') || '#ffffff'
            )
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
            const currentStyle = element.getStyle()
            const newStyle = mergeElementStyle(
              currentStyle,
              'background-color',
              value
            )
            element.setStyle(newStyle)
          }
        })
        editor.focus()
      }

      // === Button registry ===
      // Maps each ToolbarButtonId to a render function for that button/widget.
      const registry = new Map<ToolbarButtonId, () => TNode>()

      // text-formatting
      registry.set('bold', () =>
        btn({
          active: textFormatActive('bold'),
          onClick: dispatch(FORMAT_TEXT_COMMAND, 'bold'),
          label: lex.map(l => l.bold),
          icon: 'mdi:format-bold',
        })
      )
      registry.set('italic', () =>
        btn({
          active: textFormatActive('italic'),
          onClick: dispatch(FORMAT_TEXT_COMMAND, 'italic'),
          label: lex.map(l => l.italic),
          icon: 'mdi:format-italic',
        })
      )
      registry.set('underline', () =>
        btn({
          active: textFormatActive('underline'),
          onClick: dispatch(FORMAT_TEXT_COMMAND, 'underline'),
          label: lex.map(l => l.underline),
          icon: 'mdi:format-underline',
        })
      )
      registry.set('strikethrough', () =>
        btn({
          active: textFormatActive('strikethrough'),
          onClick: dispatch(FORMAT_TEXT_COMMAND, 'strikethrough'),
          label: lex.map(l => l.strikethrough),
          icon: 'mdi:format-strikethrough',
        })
      )
      registry.set('code', () =>
        btn({
          active: textFormatActive('code'),
          onClick: dispatch(FORMAT_TEXT_COMMAND, 'code'),
          label: lex.map(l => l.code),
          icon: 'mdi:code-tags',
        })
      )

      // clear-formatting
      registry.set('clear-formatting', () =>
        btn({
          active: signal(false),
          onClick: clearFormatting,
          label: lex.map(l => l.clearFormatting),
          icon: 'mdi:format-clear',
        })
      )

      // headings
      registry.set('paragraph', () =>
        btn({
          active: blockTypeActive('paragraph'),
          onClick: formatParagraph,
          label: lex.map(l => l.normal),
          icon: 'mdi:format-paragraph',
        })
      )
      for (let level = 1; level <= maxHeadingLevel; level++) {
        registry.set(`heading-${level}` as ToolbarButtonId, () =>
          btn({
            active: headingActive(level),
            onClick: () => formatHeading(level),
            label: lex.map(l => l.heading(level)),
            icon: `mdi:format-header-${level}`,
          })
        )
      }

      // lists
      registry.set('bullet-list', () =>
        btn({
          active: listTypeActive('bullet'),
          onClick: dispatch(INSERT_UNORDERED_LIST_COMMAND, undefined),
          label: lex.map(l => l.bulletList),
          icon: 'mdi:format-list-bulleted',
        })
      )
      registry.set('ordered-list', () =>
        btn({
          active: listTypeActive('number'),
          onClick: dispatch(INSERT_ORDERED_LIST_COMMAND, undefined),
          label: lex.map(l => l.orderedList),
          icon: 'mdi:format-list-numbered',
        })
      )
      registry.set('check-list', () =>
        btn({
          active: listTypeActive('check'),
          onClick: dispatch(INSERT_CHECK_LIST_COMMAND, undefined),
          label: lex.map(l => l.checkList),
          icon: 'mdi:format-list-checks',
        })
      )

      // indent
      registry.set('indent', () =>
        btn({
          active: signal(false),
          onClick: dispatch(INDENT_CONTENT_COMMAND, undefined),
          label: lex.map(l => l.indent),
          icon: 'mdi:format-indent-increase',
        })
      )
      registry.set('outdent', () =>
        btn({
          active: signal(false),
          onClick: dispatch(OUTDENT_CONTENT_COMMAND, undefined),
          label: lex.map(l => l.outdent),
          icon: 'mdi:format-indent-decrease',
        })
      )

      // blocks
      registry.set('blockquote', () =>
        btn({
          active: blockTypeActive('quote'),
          onClick: toggleBlock('quote', $createQuoteNode),
          label: lex.map(l => l.blockquote),
          icon: 'mdi:format-quote-close',
        })
      )
      registry.set('code-block', () =>
        btn({
          active: blockTypeActive('code'),
          onClick: toggleBlock('code', $createCodeNode),
          label: lex.map(l => l.codeBlock),
          icon: 'mdi:code-braces',
        })
      )
      registry.set('horizontal-rule', () =>
        btn({
          active: signal(false),
          onClick: dispatch(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
          label: lex.map(l => l.horizontalRule),
          icon: 'mdi:minus',
        })
      )

      // tables
      registry.set('insert-table', () =>
        btn({
          active: signal(false),
          onClick: insertTable,
          label: lex.map(l => l.insertTable),
          icon: 'mdi:table-plus',
        })
      )

      // links
      registry.set('link', () =>
        btn({
          active: linkActive(),
          onClick: sharedToggleLink,
          label: lex.map(l => l.link),
          icon: 'mdi:link',
        })
      )

      // history
      registry.set('undo', () =>
        btn({
          active: signal(false),
          onClick: dispatch(UNDO_COMMAND, undefined),
          label: lex.map(l => l.undo),
          icon: 'mdi:undo',
        })
      )
      registry.set('redo', () =>
        btn({
          active: signal(false),
          onClick: dispatch(REDO_COMMAND, undefined),
          label: lex.map(l => l.redo),
          icon: 'mdi:redo',
        })
      )

      // clipboard
      registry.set('cut', () =>
        btn({
          active: signal(false),
          onClick: clipboardCut,
          label: lex.map(l => l.cut),
          icon: 'mdi:content-cut',
        })
      )
      registry.set('copy', () =>
        btn({
          active: signal(false),
          onClick: clipboardCopy,
          label: lex.map(l => l.copy),
          icon: 'mdi:content-copy',
        })
      )
      registry.set('paste', () =>
        btn({
          active: signal(false),
          onClick: clipboardPaste,
          label: lex.map(l => l.paste),
          icon: 'mdi:content-paste',
        })
      )

      // font (select widgets)
      registry.set('font-family', () =>
        html.select(
          attr.class('bc-lexical-toolbar-select'),
          attr.title(lex.map(l => l.fontFamily)),
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
        )
      )
      registry.set('font-size', () =>
        html.select(
          attr.class('bc-lexical-toolbar-select'),
          attr.title(lex.map(l => l.fontSize)),
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

      // color (color picker widgets)
      registry.set('font-color', () =>
        html.label(
          attr.class('bc-lexical-toolbar-color'),
          attr.title(lex.map(l => l.fontColor)),
          html.input(
            attr.type('color'),
            attr.value(currentFontColor),
            attr.disabled(readOnly),
            on.input(e =>
              applyFontColor((e.target as HTMLInputElement).value)
            )
          ),
          html.span(attr.class('bc-lexical-toolbar-color-icon'), 'A')
        )
      )
      registry.set('highlight-color', () =>
        html.label(
          attr.class('bc-lexical-toolbar-color'),
          attr.title(lex.map(l => l.highlightColor)),
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
        )
      )
      registry.set('background-color', () =>
        html.label(
          attr.class('bc-lexical-toolbar-color'),
          attr.title(lex.map(l => l.backgroundColor)),
          html.input(
            attr.type('color'),
            attr.value(currentBgColor),
            attr.disabled(readOnly),
            on.input(e =>
              applyBgColor((e.target as HTMLInputElement).value)
            )
          ),
          html.span(
            attr.class(
              'bc-lexical-toolbar-color-icon bc-lexical-toolbar-color-icon--bg'
            ),
            '\u25A0'
          )
        )
      )

      // === Render from layout ===
      return Toolbar(
        attr.class('bc-lexical-toolbar'),
        ...renderLayout(layout, registry, maxHeadingLevel)
      )
    })
  )
}

/**
 * Renders the resolved layout into TNode children for the Toolbar component.
 */
function renderLayout(
  layout: ToolbarLayoutEntry[],
  registry: Map<ToolbarButtonId, () => TNode>,
  maxHeadingLevel: number
): TNode[] {
  const nodes: TNode[] = []

  for (const entry of layout) {
    if ('separator' in entry) {
      nodes.push(ToolbarDivider())
      continue
    }

    // Determine which button IDs to render in this group
    let itemIds = entry.items ?? GROUP_BUTTONS[entry.group] ?? []

    // Filter heading items by maxHeadingLevel when items are not explicitly specified
    if (entry.group === 'headings' && !entry.items) {
      itemIds = itemIds.filter(id => {
        if (!id.startsWith('heading-')) return true // keep 'paragraph'
        const level = parseInt(id.split('-')[1], 10)
        return level <= maxHeadingLevel
      })
    }

    // Collect renderable items (skip any not in registry)
    const children: TNode[] = []
    for (const itemId of itemIds) {
      const renderFn = registry.get(itemId)
      if (!renderFn) continue
      children.push(renderFn())
    }

    if (children.length === 0) continue

    // Wrap in a group with display signals (all true — layout controls visibility)
    const displaySignals = children.map(() => signal(true))
    nodes.push(LexicalToolbarGroup({ display: displaySignals }, ...children))
  }

  return nodes
}

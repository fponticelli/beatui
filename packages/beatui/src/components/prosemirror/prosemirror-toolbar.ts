import {
  TNode,
  Value,
  Use,
  attr,
  When,
  Signal,
  signal,
  Repeat,
  computedOf,
  Ensure,
} from '@tempots/dom'
import { Icon } from '@/components/data/icon'
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
} from '@/components/navigation/toolbar/toolbar'
import { BeatUII18n } from '@/beatui-i18n'
import type { EditorView } from 'prosemirror-view'
import type { MarkdownFeatures } from './prosemirror-markdown-input'
import { LinkDialogButton } from './link-dialog-button'
import { ButtonVariant, ControlSize } from '../theme'
import { MarkType } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'

export interface ProseMirrorToolbarOptions {
  /** The ProseMirror editor view */
  view: Signal<EditorView | null>
  stateUpdate: Signal<number>
  /** Enabled markdown features */
  features: Signal<MarkdownFeatures>
  /** Whether the editor is readonly */
  readOnly?: Signal<boolean>
  size?: Value<ControlSize>
}

function EToolbarButton({
  active,
  display,
  onClick,
  disabled,
  label,
  icon,
  size,
}: {
  active: Signal<boolean>
  display: Signal<boolean>
  onClick: () => void
  disabled: Signal<boolean>
  label: Value<string>
  icon: Value<string>
  size: Value<ControlSize>
}) {
  return When(display, () =>
    ToolbarButton(
      {
        onClick,
        disabled,
        variant: active.map(v => (v ? 'filled' : 'light') as ButtonVariant),
        size,
      },
      attr.title(label),
      Icon({ icon, size })
    )
  )
}

function EToolbarGroup(
  {
    display,
  }: {
    display: Signal<boolean>[]
  },
  ...children: TNode[]
) {
  return When(
    computedOf(...display)((...v) => v.some(Boolean)),
    () => ToolbarGroup(...children)
  )
}

function isMarkActive(state: EditorState, markType: MarkType) {
  const { from, $from, to, empty } = state.selection
  if (!markType) return false
  if (empty) return !!markType.isInSet(state.storedMarks || $from.marks())
  return state.doc.rangeHasMark(from, to, markType)
}

function makeActiveMarkSignal(
  state: Signal<number>,
  view: EditorView,
  markType: string
) {
  return state.map(() => {
    const mark = view.state.schema.marks[markType]
    console.log(mark)
    return isMarkActive(view.state, mark)
  })
}

/**
 * Create a toolbar for the ProseMirror markdown editor
 */
export function ProseMirrorToolbar({
  view,
  stateUpdate,
  features,
  readOnly = signal(false),
  size = 'md',
}: ProseMirrorToolbarOptions): TNode {
  return Ensure(view, v =>
    Use(BeatUII18n, t => {
      const view = v as unknown as Signal<EditorView>
      const pmt = t.$.prosemirror
      return Toolbar(
        // Text formatting group
        EToolbarGroup(
          { display: [features.$.bold, features.$.italic, features.$.code] },
          EToolbarButton({
            active: makeActiveMarkSignal(stateUpdate, view.value, 'strong'),
            display: features.$.bold,
            onClick: () => toggleMark(view.value, 'strong'),
            disabled: readOnly,
            label: pmt.$.bold,
            icon: 'mdi:format-bold',
            size,
          }),
          EToolbarButton({
            active: makeActiveMarkSignal(stateUpdate, view.value, 'em'),
            display: features.$.italic,
            onClick: () => toggleMark(view.value, 'em'),
            disabled: readOnly,
            label: pmt.$.italic,
            icon: 'mdi:format-italic',
            size,
          }),
          EToolbarButton({
            active: makeActiveMarkSignal(stateUpdate, view.value, 'code'),
            display: features.$.code,
            onClick: () => toggleMark(view.value, 'code'),
            disabled: readOnly,
            label: pmt.$.code,
            icon: 'mdi:code-tags',
            size,
          })
        ),

        // Headings group
        EToolbarGroup(
          { display: [features.$.headings] },
          Repeat(
            features.$.headerLevels.map(level =>
              Math.min(Math.max(level, 1), 6)
            ),
            ({ counter: level }) => {
              return EToolbarButton({
                active: signal(false),
                display: features.$.headings,
                onClick: () => setHeading(view.value, level),
                disabled: readOnly,
                label: pmt.map(v => v.heading(level)),
                icon: `mdi:format-header-${level}`,
                size,
              })
            }
          )
        ),

        // Lists group
        EToolbarGroup(
          { display: [features.$.bulletList, features.$.orderedList] },
          EToolbarButton({
            active: signal(false),
            display: features.$.bulletList,
            onClick: () => toggleList(view.value, 'bullet_list'),
            disabled: readOnly,
            label: pmt.$.bulletList,
            icon: 'mdi:format-list-bulleted',
            size,
          }),
          EToolbarButton({
            active: signal(false),
            display: features.$.orderedList,
            onClick: () => toggleList(view.value, 'ordered_list'),
            disabled: readOnly,
            label: pmt.$.orderedList,
            icon: 'mdi:format-list-numbered',
            size,
          })
        ),

        // Block formatting group
        EToolbarGroup(
          {
            display: [
              features.$.blockquote,
              features.$.codeBlock,
              features.$.horizontalRule,
            ],
          },
          EToolbarButton({
            active: signal(false),
            display: features.$.blockquote,
            onClick: () => toggleBlockquote(view.value),
            disabled: readOnly,
            label: pmt.$.blockquote,
            icon: 'mdi:format-quote-close',
            size,
          }),
          EToolbarButton({
            active: signal(false),
            display: features.$.codeBlock,
            onClick: () => toggleCodeBlock(view.value),
            disabled: readOnly,
            label: pmt.$.codeBlock,
            icon: 'mdi:code-braces',
            size,
          }),
          EToolbarButton({
            active: signal(false),
            display: features.$.horizontalRule,
            onClick: () => insertHorizontalRule(view.value),
            disabled: readOnly,
            label: pmt.$.horizontalRule,
            icon: 'mdi:minus',
            size,
          })
        ),

        When(features.$.links, () =>
          LinkDialogButton({
            view: view.value,
            isReadOnly: readOnly,
            label: pmt.$.link,
            linkDialogTitle: pmt.$.linkDialogTitle,
            linkDialogUrlPlaceholder: pmt.$.linkDialogUrlPlaceholder,
            linkDialogSave: pmt.$.linkDialogSave,
            linkDialogCancel: pmt.$.linkDialogCancel,
            linkDialogRemoveLink: pmt.$.linkDialogRemoveLink,
          })
        )
      )
    })
  )
}

/**
 * Toggle a mark (bold, italic, code)
 */
async function toggleMark(view: EditorView, markType: string) {
  const { toggleMark } = await import('prosemirror-commands')
  const mark = view.state.schema.marks[markType]
  if (mark != null) {
    toggleMark(mark)(view.state, view.dispatch)
    view.focus()
  }
}

/**
 * Set heading level
 */
async function setHeading(view: EditorView, level: number) {
  const { setBlockType } = await import('prosemirror-commands')
  const headingType = view.state.schema.nodes.heading
  if (headingType != null) {
    setBlockType(headingType, { level })(view.state, view.dispatch)
    view.focus()
  }
}

/**
 * Toggle list (bullet or ordered)
 */
async function toggleList(view: EditorView, listType: string) {
  const { wrapInList } = await import('prosemirror-schema-list')
  const type = view.state.schema.nodes[listType]
  if (type != null) {
    wrapInList(type)(view.state, view.dispatch)
    view.focus()
  }
}

/**
 * Toggle blockquote
 */
async function toggleBlockquote(view: EditorView) {
  const { wrapIn } = await import('prosemirror-commands')
  const blockquoteType = view.state.schema.nodes.blockquote
  if (blockquoteType != null) {
    wrapIn(blockquoteType)(view.state, view.dispatch)
    view.focus()
  }
}

/**
 * Toggle code block
 */
async function toggleCodeBlock(view: EditorView) {
  const { setBlockType } = await import('prosemirror-commands')
  const codeBlockType = view.state.schema.nodes.code_block
  if (codeBlockType != null) {
    setBlockType(codeBlockType)(view.state, view.dispatch)
    view.focus()
  }
}

/**
 * Insert horizontal rule
 */
function insertHorizontalRule(view: EditorView) {
  const hrType = view.state.schema.nodes.horizontal_rule
  if (hrType != null) {
    const tr = view.state.tr.replaceSelectionWith(hrType.create())
    view.dispatch(tr)
    view.focus()
  }
}

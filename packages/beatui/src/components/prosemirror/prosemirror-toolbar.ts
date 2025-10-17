import { TNode, Value, html, prop, on, MapSignal } from '@tempots/dom'
import { Icon } from '@/components/data/icon'
import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarGroup,
} from '@/components/navigation/toolbar/toolbar'
import { Use } from '@tempots/dom'
import { BeatUII18n } from '@/beatui-i18n'
import type { EditorView } from 'prosemirror-view'
import type { MarkdownFeatures } from './prosemirror-markdown-input'

export interface ProseMirrorToolbarOptions {
  /** The ProseMirror editor view */
  view: EditorView
  /** Enabled markdown features */
  features: Value<MarkdownFeatures>
}

/**
 * Create a toolbar for the ProseMirror markdown editor
 */
export function ProseMirrorToolbar(options: ProseMirrorToolbarOptions): TNode {
  const { view, features } = options

  return Use(BeatUII18n, t => {
    const i18n = Value.get(t)
    return Toolbar(
      // Text formatting group
      ToolbarGroup(
        MapSignal(features, f =>
          f.bold
            ? ToolbarButton(
                {
                  onClick: () => toggleMark(view, 'strong'),
                },
                Icon({ icon: 'mdi:format-bold', size: 'sm' })
              )
            : null
        ),
        MapSignal(features, f =>
          f.italic
            ? ToolbarButton(
                {
                  onClick: () => toggleMark(view, 'em'),
                },
                Icon({ icon: 'mdi:format-italic', size: 'sm' })
              )
            : null
        ),
        MapSignal(features, f =>
          f.code
            ? ToolbarButton(
                {
                  onClick: () => toggleMark(view, 'code'),
                },
                Icon({ icon: 'mdi:code-tags', size: 'sm' })
              )
            : null
        )
      ),

      ToolbarDivider(),

      // Headings group
      MapSignal(features, f =>
        f.headings
          ? ToolbarGroup(
              ToolbarButton(
                {
                  onClick: () => setHeading(view, 1),
                },
                Icon({ icon: 'mdi:format-header-1', size: 'sm' })
              ),
              ToolbarButton(
                {
                  onClick: () => setHeading(view, 2),
                },
                Icon({ icon: 'mdi:format-header-2', size: 'sm' })
              ),
              ToolbarButton(
                {
                  onClick: () => setHeading(view, 3),
                },
                Icon({ icon: 'mdi:format-header-3', size: 'sm' })
              )
            )
          : null
      ),

      MapSignal(features, f => (f.headings ? ToolbarDivider() : null)),

      // Lists group
      ToolbarGroup(
        MapSignal(features, f =>
          f.bulletList
            ? ToolbarButton(
                {
                  onClick: () => toggleList(view, 'bullet_list'),
                },
                Icon({ icon: 'mdi:format-list-bulleted', size: 'sm' })
              )
            : null
        ),
        MapSignal(features, f =>
          f.orderedList
            ? ToolbarButton(
                {
                  onClick: () => toggleList(view, 'ordered_list'),
                },
                Icon({ icon: 'mdi:format-list-numbered', size: 'sm' })
              )
            : null
        )
      ),

      ToolbarDivider(),

      // Block formatting group
      ToolbarGroup(
        MapSignal(features, f =>
          f.blockquote
            ? ToolbarButton(
                {
                  onClick: () => toggleBlockquote(view),
                },
                Icon({ icon: 'mdi:format-quote-close', size: 'sm' })
              )
            : null
        ),
        MapSignal(features, f =>
          f.codeBlock
            ? ToolbarButton(
                {
                  onClick: () => toggleCodeBlock(view),
                },
                Icon({ icon: 'mdi:code-braces', size: 'sm' })
              )
            : null
        ),
        MapSignal(features, f =>
          f.horizontalRule
            ? ToolbarButton(
                {
                  onClick: () => insertHorizontalRule(view),
                },
                Icon({ icon: 'mdi:minus', size: 'sm' })
              )
            : null
        )
      ),

      ToolbarDivider(),

      // Link group
      MapSignal(features, f =>
        f.links
          ? ToolbarGroup(
              ToolbarButton(
                {
                  onClick: () => insertLink(view),
                },
                Icon({ icon: 'mdi:link-variant', size: 'sm' })
              )
            )
          : null
      )
    )
  })
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
    const { from } = view.state.selection
    const tr = view.state.tr.replaceSelectionWith(hrType.create())
    view.dispatch(tr)
    view.focus()
  }
}

/**
 * Insert or edit link
 */
async function insertLink(view: EditorView) {
  const { toggleMark } = await import('prosemirror-commands')
  const linkMark = view.state.schema.marks.link
  if (linkMark == null) return

  const { from, to } = view.state.selection
  const hasLink = view.state.doc.rangeHasMark(from, to, linkMark)

  if (hasLink) {
    // Remove link
    toggleMark(linkMark)(view.state, view.dispatch)
  } else {
    // Add link
    const href = prompt('Enter URL:')
    if (href != null && href !== '') {
      const tr = view.state.tr.addMark(
        from,
        to,
        linkMark.create({ href, title: null })
      )
      view.dispatch(tr)
    }
  }
  view.focus()
}

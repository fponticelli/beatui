import {
  Ensure,
  Fragment,
  OnDispose,
  prop,
  signal,
  Signal,
  TNode,
  Value,
} from '@tempots/dom'
import { EditorView } from 'prosemirror-view'
import { EditorState } from 'prosemirror-state'
import { ToolbarButton, ToolbarGroup } from '../navigation'
import { TextInput } from '../form'
import { getMarkByType, isMarkActive, makeActiveMarkSignal } from './utils'
import { EToolbarButton } from './etoolbar-button'
import { ControlSize } from '../theme'

export interface LinkDialogButtonProps {
  stateUpdate: Signal<number>
  view: Signal<EditorView>
  isReadOnly: Signal<boolean>
  label: Value<string>
  linkUrlPlaceholder: Value<string>
  size: Value<ControlSize>
}

/**
 * Apply a link to the current selection
 */
function applyLink(view: EditorView, href: string) {
  const linkMark = view.state.schema.marks.link
  if (linkMark == null) return

  const { from, to } = view.state.selection
  const tr = view.state.tr.addMark(
    from,
    to,
    linkMark.create({ href, title: null })
  )
  view.dispatch(tr)
  view.focus()
}

function findLinkRange(view: EditorView) {
  const { state } = view
  const { $from, $to } = state.selection

  if (!isLinkActive(state)) return null

  // Find the range of the link mark by walking backwards and forwards
  let start = $from.pos
  let end = $to.pos

  // Walk backwards to find the start of the link
  const doc = state.doc
  while (start > 0) {
    const $pos = doc.resolve(start - 1)
    // Check if the node after this position has a link mark
    const hasLink = $pos.nodeAfter?.marks?.some(m => m.type.name === 'link')
    if (!hasLink) break
    start--
  }

  // Walk forwards to find the end of the link
  while (end < doc.content.size) {
    const $pos = doc.resolve(end)
    // Check if the node after this position has a link mark
    const hasLink = $pos.nodeAfter?.marks?.some(m => m.type.name === 'link')
    if (!hasLink) break
    end++
  }

  return { start, end }
}

function updateLink(view: EditorView, href: string) {
  const linkMark = view.state.schema.marks.link
  if (linkMark == null) return

  const range = findLinkRange(view)
  if (range == null) return

  const { start, end } = range
  // Create a transaction that removes the old link and adds the new one
  const tr = view.state.tr
    .removeMark(start, end, linkMark)
    .addMark(start, end, linkMark.create({ href, title: null }))

  view.dispatch(tr)
}

/**
 * Remove link from the current selection
 */
function removeLink(view: EditorView) {
  const linkMark = view.state.schema.marks.link
  if (linkMark == null) return

  const range = findLinkRange(view)
  if (range == null) return

  const { start, end } = range
  const tr = view.state.tr.removeMark(start, end, linkMark)
  view.dispatch(tr)
  view.focus()
}

/**
 * Check if the current selection has a link mark
 */
function isLinkActive(state: EditorState): boolean {
  return isMarkActive(state, state.schema.marks.link)
}

export function LinkControl({
  stateUpdate,
  view,
  isReadOnly,
  label,
  // linkDialogTitle,
  linkUrlPlaceholder,
  // linkDialogSave,
  // linkDialogCancel,
  // linkDialogRemoveLink,
  size,
}: LinkDialogButtonProps): TNode {
  const urlInput = prop(null as string | null)

  urlInput.on(v => {
    if (v == null) return
    updateLink(view.value, v)
  })

  const clear = stateUpdate.on(() => {
    const linkMark = getMarkByType(
      view.value.state,
      view.value.state.schema.marks.link
    )

    if (linkMark != null) {
      // Set urlInput to the link's href
      urlInput.set((linkMark.attrs.href as string) ?? '')
    } else {
      // No link at current position, clear the input
      urlInput.set(null)
    }
  })

  return Fragment(
    OnDispose(urlInput.dispose, clear),
    ToolbarGroup(
      EToolbarButton({
        display: signal(true),
        active: makeActiveMarkSignal(stateUpdate, view, 'link'),
        disabled: isReadOnly,
        label,
        icon: 'mdi:link-variant',
        size,
        onClick: () => {
          const state = view.value.state
          // Toggle link: if link is active, remove it; otherwise show input
          if (isLinkActive(state)) {
            removeLink(view.value)
            urlInput.set(null)
          } else {
            const url = ''
            applyLink(view.value, url)
            urlInput.set(url)
          }
        },
      }),
      Ensure(urlInput, value =>
        TextInput({
          value,
          autofocus: true,
          onInput: urlInput.set,
          placeholder: linkUrlPlaceholder,
          size,
        })
      )
    ),
    Ensure(urlInput, value =>
      ToolbarButton(
        {
          disabled: value.map(v => v.trim() === ''),
          variant: 'text',
          onClick: () => {
            // open urlInput.value in new tab
            const url = urlInput.value
            if (url) window.open(url, '_blank')
          },
          size,
        },
        'go'
      )
    )
  )
}

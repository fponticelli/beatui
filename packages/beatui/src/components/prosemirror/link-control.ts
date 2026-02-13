/**
 * ProseMirror link editing control for the editor toolbar.
 *
 * Renders a toolbar button that toggles link marks on/off, along with an
 * inline URL text input and a "go" button that opens the entered URL in a
 * new tab.
 *
 * @module
 */

import {
  Ensure,
  Fragment,
  OnDispose,
  prop,
  signal,
  Signal,
  Value,
} from '@tempots/dom'
import { EditorView } from 'prosemirror-view'
import { EditorState } from 'prosemirror-state'
import { ToolbarButton, ToolbarGroup } from '../navigation'
import { TextInput } from '../form'
import { getMarkByType, isMarkActive, makeActiveMarkSignal } from './utils'
import { EditorToolbarButton } from '../editor-toolbar'
import { ControlSize } from '../theme'

/**
 * Configuration properties for the {@link LinkControl} component.
 */
export interface LinkDialogButtonProps {
  /** Ticker signal that increments on every ProseMirror state change. */
  stateUpdate: Signal<number>
  /** Signal holding the current ProseMirror `EditorView`. */
  view: Signal<EditorView>
  /** Signal indicating whether the editor is in read-only mode. */
  isReadOnly: Signal<boolean>
  /** Accessible label for the link toolbar button. */
  label: Value<string>
  /** Placeholder text shown in the URL input field. */
  linkUrlPlaceholder: Value<string>
  /** Size of the toolbar button and input controls. */
  size: Value<ControlSize>
}

/**
 * Applies a link mark with the given `href` to the current text selection.
 *
 * @param view - The ProseMirror editor view.
 * @param href - The URL to use for the link mark.
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

/**
 * Finds the start and end positions of the link mark surrounding the current
 * selection by walking backwards and forwards through the document.
 *
 * @param view - The ProseMirror editor view.
 * @returns An object with `start` and `end` positions, or `null` if no link is active.
 */
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

/**
 * Updates the `href` attribute of the link mark surrounding the current
 * selection. Removes the old link mark and applies a new one with the
 * updated URL.
 *
 * @param view - The ProseMirror editor view.
 * @param href - The new URL to set on the link mark.
 */
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
 * Removes the link mark from the text surrounding the current selection.
 * After removal, focus is returned to the editor.
 *
 * @param view - The ProseMirror editor view.
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
 * Checks whether the current selection contains a link mark.
 *
 * @param state - The current ProseMirror editor state.
 * @returns `true` if a link mark is active.
 */
function isLinkActive(state: EditorState): boolean {
  return isMarkActive(state, state.schema.marks.link)
}

/**
 * A toolbar control for editing hyperlinks in a ProseMirror editor.
 *
 * Renders a link toggle button that creates or removes link marks on the
 * current selection. When a link is active, an inline `TextInput` appears
 * allowing the user to edit the URL, along with a "go" button to open the
 * URL in a new browser tab.
 *
 * @param props - Configuration for the link control (view, state, labels, etc.).
 * @returns A `TNode` renderable for inclusion in a ProseMirror toolbar.
 *
 * @example
 * ```ts
 * LinkControl({
 *   stateUpdate: editorStateNotifier,
 *   view: editorViewSignal,
 *   isReadOnly: signal(false),
 *   label: 'Link',
 *   linkUrlPlaceholder: 'Enter URL...',
 *   size: 'sm',
 * })
 * ```
 */
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
}: LinkDialogButtonProps) {
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
    OnDispose(clear),
    ToolbarGroup(
      EditorToolbarButton({
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

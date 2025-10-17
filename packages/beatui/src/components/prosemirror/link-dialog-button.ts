import {
  attr,
  html,
  on,
  prop,
  Signal,
  TNode,
  Value,
  When,
  WithElement,
} from '@tempots/dom'
import { EditorView } from 'prosemirror-view'
import { ToolbarButton } from '../navigation'
import { Icon } from '../data'
import { AutoFocus } from '@tempots/ui'
import { Button } from '@/components/button/button'

export interface LinkDialogButtonProps {
  view: EditorView
  isReadOnly: Signal<boolean>
  label: Value<string>
  linkDialogTitle: Value<string>
  linkDialogUrlPlaceholder: Value<string>
  linkDialogSave: Value<string>
  linkDialogCancel: Value<string>
  linkDialogRemoveLink: Value<string>
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

/**
 * Remove link from the current selection
 */
async function removeLink(view: EditorView) {
  const linkMark = view.state.schema.marks.link
  if (linkMark == null) return

  const { from, to } = view.state.selection
  const tr = view.state.tr.removeMark(from, to, linkMark)
  view.dispatch(tr)
  view.focus()
}

/**
 * Link dialog button with flyout for entering URL
 * Positioned above the selected text in the editor
 */
export function LinkDialogButton({
  view,
  isReadOnly,
  label,
  linkDialogTitle,
  linkDialogUrlPlaceholder,
  linkDialogSave,
  linkDialogCancel,
  linkDialogRemoveLink,
}: LinkDialogButtonProps): TNode {
  const urlInput = prop('')
  const showDialog = prop(false)

  return (
    ToolbarButton(
      {
        disabled: isReadOnly,
      },
      attr.title(label),
      Icon({ icon: 'mdi:link-variant', size: 'sm' }),
      on.click(() => {
        const { from, to } = view.state.selection
        const linkMark = view.state.schema.marks.link
        if (linkMark == null) return

        // Find the link mark in the selection
        let href = ''
        view.state.doc.nodesBetween(from, to, node => {
          node.marks.forEach(mark => {
            if (mark.type === linkMark) {
              href = mark.attrs.href as string
            }
          })
        })

        // Show dialog to edit link
        urlInput.set(href)
        showDialog.set(true)
      })
    ),
    // Anchor element positioned at the selection with Flyout as child
    When(showDialog, () => {
      return html.div(
        WithElement(el => {
          const { from } = view.state.selection
          const coords = view.coordsAtPos(from)
          el.style.position = 'fixed'
          el.style.left = coords.left + 'px'
          el.style.top = coords.top + 'px'
          el.style.pointerEvents = 'none'
          el.style.width = '0'
          el.style.height = '0'
          el.style.zIndex = '9999'
          html.div(
            attr.class('p-4 space-y-3 min-w-64'),
            html.h4(attr.class('font-semibold text-sm'), linkDialogTitle),
            html.div(
              html.input(
                attr.type('text'),
                attr.class('bc-input'),
                attr.placeholder(linkDialogUrlPlaceholder),
                attr.value(urlInput),
                on.input(e =>
                  urlInput.set((e.target as HTMLInputElement).value)
                ),
                AutoFocus()
              )
            ),
            html.div(
              attr.class('flex gap-2 justify-end'),
              Button(
                {
                  variant: 'light',
                  size: 'sm',
                  onClick: () => {
                    showDialog.set(false)
                    urlInput.set('')
                  },
                },
                linkDialogCancel
              ),
              Button(
                {
                  variant: 'filled',
                  color: 'primary',
                  size: 'sm',
                  onClick: () => removeLink(view),
                },
                linkDialogRemoveLink
              ),
              Button(
                {
                  variant: 'filled',
                  color: 'primary',
                  size: 'sm',
                  onClick: () => {
                    const href = urlInput.value
                    if (href != null && href !== '') {
                      applyLink(view, href)
                    }
                    showDialog.set(false)
                    urlInput.set('')
                  },
                },
                linkDialogSave
              )
            )
          )
        })
      )
    })
  )
}

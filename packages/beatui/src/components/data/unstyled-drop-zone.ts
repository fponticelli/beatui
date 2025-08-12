import {
  TNode,
  Value,
  html,
  attr,
  on,
  prop,
  Signal,
  WithElement,
  Use,
} from '@tempots/dom'
import { BeatUII18n } from '@/beatui-i18n'

export type DropZoneOptions = {
  onDrop: (files: File[]) => void
  accept?: Value<string>
  enableClick?: Value<boolean>
  content: (options: { files: Signal<File[]>; clear: () => void }) => TNode
  allowMultiple?: Value<boolean>
}

export function UnstyledDropZone({
  onDrop,
  accept = '*/*',
  enableClick = true,
  content,
  allowMultiple = true,
}: DropZoneOptions) {
  return Use(BeatUII18n, t => {
    const files = prop<File[]>([])
    const isDragOver = prop(false)

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      isDragOver.value = true
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      // Only set to false if we're leaving the drop zone itself, not a child element
      if (
        !e.currentTarget ||
        !(e.currentTarget as Element).contains(e.relatedTarget as Node)
      ) {
        isDragOver.value = false
      }
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      isDragOver.value = false

      const droppedFiles = Array.from(e.dataTransfer?.files || [])
      if (droppedFiles.length > 0) {
        files.value = droppedFiles
        onDrop(droppedFiles)
      }
    }

    const handleClick = (e: Event) => {
      if (Value.get(enableClick)) {
        // Find the hidden input element and click it
        const target = e.currentTarget as HTMLElement
        const input = target.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement
        input?.click()
      }
    }

    let input: HTMLInputElement | null = null

    const handleFileInputChange = () => {
      if (input == null) return
      const selectedFiles = Array.from(input.files ?? [])
      if (selectedFiles.length > 0) {
        files.value = selectedFiles
        onDrop(selectedFiles)
      }
      // Reset input value to allow selecting the same file again
      input.value = ''
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (Value.get(enableClick) && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        handleClick(e)
      }
    }

    return html.div(
      attr.role('button'),
      attr.tabindex(
        Value.map(enableClick, enabled => (enabled ? 0 : -1) as number)
      ),
      attr.style('position: relative;'),
      on.dragover(handleDragOver),
      on.dragleave(handleDragLeave),
      on.drop(handleDrop),
      on.click(handleClick),
      on.keydown(handleKeyDown),

      // Hidden file input
      html.input(
        attr.type('file'),
        attr.accept(accept),
        attr.multiple(allowMultiple),
        attr.style(
          'position: absolute; left: -9999px; opacity: 0; pointer-events: none;'
        ),
        on.change(handleFileInputChange),
        WithElement(el => {
          input = el as HTMLInputElement
        })
      ),

      // Screen reader instructions
      html.div(
        attr.id('drop-zone-instructions'),
        attr.style(
          'position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden;'
        ),
        enableClick
          ? t.dropZoneInstructionsWithClick()
          : t.dropZoneInstructions()
      ),

      // Content
      content({ files, clear: () => (files.value = []) })
    )
  })
}

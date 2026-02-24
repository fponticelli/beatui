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
  aria,
  bind,
  Empty,
} from '@tempots/dom'
import { BeatUII18n } from '../../beatui-i18n'

/**
 * Configuration options for the {@link UnstyledDropZone} component.
 */
export type DropZoneOptions = {
  /**
   * Callback invoked when files are selected, either via drag-and-drop
   * or the file picker dialog. The `via` parameter indicates the selection method.
   */
  onChange: (files: File[], via: 'dragdrop' | 'click') => void
  /**
   * Optional external reactive file list. When provided, the drop zone
   * derives its internal file state from this value.
   */
  value?: Value<File[]>
  /**
   * MIME type filter for accepted files (e.g., `'image/*'`, `'application/pdf'`).
   * Passed to the hidden `<input type="file">` element.
   * @default '*\/*'
   */
  accept?: Value<string>
  /**
   * Whether clicking the drop zone opens the native file picker dialog.
   * @default true
   */
  enableClick?: Value<boolean>
  /**
   * Render function for the drop zone content. Receives reactive state
   * and control functions to build a custom UI.
   *
   * @param options.files - Reactive signal containing the current file list.
   * @param options.clear - Clears the current file selection.
   * @param options.change - Programmatically sets the file list.
   */
  content: (options: {
    files: Signal<File[]>
    clear: () => void
    change: (files: File[]) => void
  }) => TNode
  /**
   * Whether the drop zone is disabled. Disabled zones do not accept drops or clicks.
   * @default false
   */
  disabled?: Value<boolean>
  /**
   * Whether multiple files can be selected at once.
   */
  allowMultiple?: Value<boolean>
}

/**
 * Renders an unstyled file drop zone that supports both drag-and-drop and
 * click-to-browse file selection. This component provides the behavior
 * and accessibility without any visual styling, allowing complete UI
 * customization through the `content` render function.
 *
 * The component:
 * - Handles `dragover`, `dragleave`, and `drop` events
 * - Opens a native file picker on click (when `enableClick` is `true`)
 * - Supports keyboard activation (Enter/Space)
 * - Applies `role="button"` and ARIA labels for accessibility
 * - Synchronizes a hidden `<input type="file">` with the reactive file state
 *
 * @param options - Configuration options for the drop zone.
 * @returns A renderable drop zone container.
 *
 * @example
 * ```typescript
 * UnstyledDropZone({
 *   accept: 'image/*',
 *   allowMultiple: true,
 *   onChange: (files, via) => {
 *     console.log(`${files.length} files selected via ${via}`)
 *   },
 *   content: ({ files, clear }) =>
 *     html.div(
 *       attr.class('drop-area'),
 *       files.map(f => f.length > 0
 *         ? html.div(
 *             `${f.length} file(s) selected`,
 *             html.button(on.click(clear), 'Clear')
 *           )
 *         : html.div('Drop files here or click to browse')
 *       )
 *     ),
 * })
 * ```
 */
export function UnstyledDropZone({
  onChange,
  value,
  accept = '*/*',
  enableClick = true,
  content,
  disabled = false,
  allowMultiple,
}: DropZoneOptions) {
  return Use(BeatUII18n, t => {
    const files = Value.deriveProp(value ?? [])
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
        onChange(droppedFiles, 'dragdrop')
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
        onChange(selectedFiles, 'click')
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
        attr.disabled(disabled),
        attr.accept(accept),
        attr.multiple(allowMultiple),
        attr.style(
          'position: absolute; left: -9999px; opacity: 0; pointer-events: none;'
        ),
        on.change(handleFileInputChange),
        WithElement((el: HTMLInputElement) => {
          input = el
          files.on(files => {
            // In non-browser test environments DataTransfer may be undefined.
            // Guard to avoid ReferenceError while still allowing normal behavior in browsers.
            const DT = (
              globalThis as unknown as {
                DataTransfer?: { new (): DataTransfer }
              }
            ).DataTransfer
            if (DT != null) {
              const dataTransfer = new DT()
              files.forEach(file => dataTransfer.items.add(file))
              el.files = dataTransfer.files
            }
          })
          return Empty
        })
      ),

      // Screen reader instructions
      aria.label(bind(t.$.dropZoneInstructions)(enableClick)),

      // Content
      content({
        files,
        clear: () => (files.value = []),
        change: v => files.set(v),
      })
    )
  })
}

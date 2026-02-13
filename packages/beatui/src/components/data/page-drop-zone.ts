import {
  TNode,
  Value,
  prop,
  Signal,
  OnDispose,
  Fragment,
  When,
  html,
  attr,
  on,
  style,
  WithElement,
} from '@tempots/dom'

/**
 * Configuration options for the {@link PageDropZone} component.
 */
export type PageDropZoneOptions = {
  /**
   * Callback invoked when valid files are dropped or selected via the file picker.
   * The `via` parameter indicates whether files came from drag-and-drop or the
   * click-triggered file dialog.
   */
  onChange: (files: File[], via: 'dragdrop' | 'click') => void
  /**
   * MIME type filter for accepted files (e.g., `'image/*'`, `'application/pdf'`).
   * Files that do not match are filtered out and reported via `onInvalidSelection`.
   * @default '*\/*'
   */
  accept?: Value<string>
  /**
   * Render function for overlay content shown while files are being dragged
   * over the page. Receives the reactive file signal. Only rendered when
   * `isDragging` is `true`.
   */
  onDragContent?: (options: { files: Signal<File[]> }) => TNode
  /**
   * Render function for persistent content. Receives reactive drag state,
   * file list, and a function to programmatically open the file picker.
   */
  content?: (options: {
    /** Reactive signal that is `true` while files are being dragged over the page. */
    isDragging: Signal<boolean>
    /** Reactive signal containing the current file list. */
    files: Signal<File[]>
    /** Opens the native file picker dialog programmatically. */
    selectFiles: () => void
  }) => TNode
  /**
   * Callback invoked when dropped files do not match the `accept` filter.
   * Receives the full list of dropped files (including invalid ones).
   */
  onInvalidSelection?: (files: File[]) => void
  /**
   * Whether the drop zone is disabled. Disabled zones ignore all drag events.
   * @default false
   */
  disabled?: Value<boolean>
}

/**
 * Detects filesystem drag-and-drop events at the page/document level.
 *
 * Unlike {@link UnstyledDropZone} which scopes drag events to a specific element,
 * `PageDropZone` listens for drag events on the entire `document`, making it
 * ideal for full-page drop targets. It uses a drag counter to correctly track
 * nested `dragenter`/`dragleave` events, and automatically filters dropped
 * files against the `accept` MIME type pattern.
 *
 * The component provides two render slots:
 * - `onDragContent` - Overlay shown only while files are being dragged over the page
 * - `content` - Persistent content with reactive drag state and file selection utilities
 *
 * Document event listeners are automatically cleaned up when the component is disposed.
 *
 * @param options - Configuration options for the page drop zone.
 * @returns A renderable fragment containing the hidden file input, optional drag
 *   overlay, and persistent content.
 *
 * @example
 * ```typescript
 * // Full-page drop zone with overlay and content
 * PageDropZone({
 *   accept: 'image/*',
 *   onChange: (files, via) => console.log('Files:', files, 'via:', via),
 *   onInvalidSelection: (files) => console.warn('Invalid files:', files),
 *   onDragContent: () =>
 *     html.div(
 *       attr.class('overlay'),
 *       'Drop images here'
 *     ),
 *   content: ({ isDragging, files, selectFiles }) =>
 *     html.div(
 *       html.button(on.click(selectFiles), 'Browse files'),
 *       files.map(f => html.div(`${f.length} file(s) selected`))
 *     ),
 * })
 * ```
 */
export function PageDropZone({
  onChange,
  accept = '*/*',
  onDragContent,
  content,
  onInvalidSelection,
  disabled = false,
}: PageDropZoneOptions) {
  const isDragging = prop(false)
  const files = prop<File[]>([])
  let input: HTMLInputElement | null = null

  // Counter to track nested drag enter/leave events
  let dragCounter = 0

  const isFileDrag = (e: DragEvent): boolean => {
    // Check if the drag contains files (filesystem drag)
    return e.dataTransfer?.types.includes('Files') ?? false
  }

  const matchesAcceptFilter = (file: File, acceptFilter: string): boolean => {
    if (acceptFilter === '*/*') return true

    const acceptTypes = acceptFilter.split(',').map(t => t.trim())

    return acceptTypes.some(type => {
      if (type === '*/*') return true
      if (type.endsWith('/*')) {
        // e.g., "image/*"
        const category = type.slice(0, -2)
        return file.type.startsWith(category + '/')
      }
      // Exact match or extension match
      return file.type === type || file.name.endsWith(type)
    })
  }

  const handleDragEnter = (e: DragEvent) => {
    if (Value.get(disabled)) return
    if (!isFileDrag(e)) return

    e.preventDefault()
    e.stopPropagation()

    dragCounter++
    if (dragCounter === 1) {
      isDragging.value = true
    }
  }

  const handleDragOver = (e: DragEvent) => {
    if (Value.get(disabled)) return
    if (!isFileDrag(e)) return

    e.preventDefault()
    e.stopPropagation()

    // Set dropEffect to indicate this is a valid drop target
    if (e.dataTransfer != null) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  const handleDragLeave = (e: DragEvent) => {
    if (Value.get(disabled)) return
    if (!isFileDrag(e)) return

    e.preventDefault()
    e.stopPropagation()

    dragCounter--
    if (dragCounter === 0) {
      isDragging.value = false
    }
  }

  const handleDrop = (e: DragEvent) => {
    if (Value.get(disabled)) return
    if (!isFileDrag(e)) return

    e.preventDefault()
    e.stopPropagation()

    // Reset drag state
    dragCounter = 0
    isDragging.value = false

    const droppedFiles = Array.from(e.dataTransfer?.files ?? [])

    if (droppedFiles.length > 0) {
      const acceptFilter = Value.get(accept)
      const filteredFiles = droppedFiles.filter(file =>
        matchesAcceptFilter(file, acceptFilter)
      )
      const invalidFiles = droppedFiles.filter(
        file => !filteredFiles.includes(file)
      )

      if (filteredFiles.length > 0) {
        files.value = filteredFiles
        onChange(filteredFiles, 'dragdrop')
      }
      if (invalidFiles.length > 0) {
        onInvalidSelection?.(droppedFiles)
      }
    }
  }

  // Attach document-level event listeners
  if (typeof document !== 'undefined') {
    document.addEventListener('dragenter', handleDragEnter)
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('dragleave', handleDragLeave)
    document.addEventListener('drop', handleDrop)
  }

  // Cleanup function to remove event listeners
  const cleanup = () => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('drop', handleDrop)
    }
    // Reset state
    dragCounter = 0
  }

  const selectFiles = () => {
    if (input != null) {
      input.click()
    }
  }

  const handleFileInputChange = (e: Event) => {
    const input = e.target as HTMLInputElement
    const selectedFiles = Array.from(input.files ?? [])
    if (selectedFiles.length > 0) {
      files.value = selectedFiles
      onChange(selectedFiles, 'click')
    }
    // Reset the input so the same file can be selected again
    input.value = ''
  }

  return Fragment(
    OnDispose(cleanup),
    // Hidden file input for programmatic file selection
    html.input(
      attr.type('file'),
      attr.name('bui-page-drop-zone'),
      attr.multiple(true),
      attr.accept(accept),
      style.position('absolute'),
      style.opacity('0'),
      style.pointerEvents('none'),
      style.width('0'),
      style.height('0'),
      on.change(handleFileInputChange),
      WithElement(el => {
        input = el as HTMLInputElement
        return OnDispose(() => {
          if (input != null) {
            input.value = ''
          }
        })
      })
    ),
    // Render overlay content to body when dragging (if content is provided)
    onDragContent != null
      ? When(isDragging, () => onDragContent({ files }))
      : null,
    content != null ? content({ isDragging, files, selectFiles }) : null
  )
}

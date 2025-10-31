import {
  TNode,
  Value,
  prop,
  Signal,
  OnDispose,
  Fragment,
  When,
} from '@tempots/dom'

export type PageDropZoneOptions = {
  onChange: (files: File[]) => void
  accept?: Value<string>
  content?: (options: {
    isDragging: Signal<boolean>
    files: Signal<File[]>
  }) => TNode
  disabled?: Value<boolean>
}

/**
 * Detects filesystem drag-and-drop events at the page/document level.
 *
 * This component listens for drag events at the document level and provides
 * reactive state about drag operations. It can optionally render an overlay
 * when files are being dragged over the page.
 *
 * @example
 * ```typescript
 * PageDropZone({
 *   onChange: (files) => console.log('Files dropped:', files),
 *   content: ({ isDragging }) =>
 *     html.div(
 *       attr.class('fixed inset-0 bg-black/50 flex items-center justify-center'),
 *       html.div('Drop files here')
 *     )
 * })
 * ```
 */
export function PageDropZone({
  onChange,
  accept = '*/*',
  content,
  disabled = false,
}: PageDropZoneOptions) {
  const isDragging = prop(false)
  const files = prop<File[]>([])

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

      if (filteredFiles.length > 0) {
        files.value = filteredFiles
        onChange(filteredFiles)
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

  return Fragment(
    OnDispose(cleanup, isDragging, files),

    // Render overlay content to body when dragging (if content is provided)
    content != null
      ? When(isDragging, () => content({ isDragging, files }))
      : null
  )
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { LexicalEditor, EditorState } from 'lexical'

// Mock Lexical modules before imports
vi.mock('lexical', () => ({
  $getRoot: vi.fn(() => ({
    clear: vi.fn(),
  })),
  $insertNodes: vi.fn(),
}))

vi.mock('../../../src/lexical/plugins/markdown-io', () => ({
  exportToMarkdown: vi.fn(async () => '# Test'),
  importFromMarkdown: vi.fn(async () => {}),
}))

vi.mock('../../../src/lexical/plugins/html-io', () => ({
  exportToHtml: vi.fn(async () => '<p>Test</p>'),
  importFromHtml: vi.fn(async () => {}),
}))

describe('File I/O Plugin', () => {
  let mockEditor: Partial<LexicalEditor>
  let originalCreateElement: typeof document.createElement

  beforeEach(() => {
    vi.clearAllMocks()

    mockEditor = {
      getEditorState: vi.fn(() => ({
        read: vi.fn((fn: () => void) => fn()),
        toJSON: vi.fn(() => ({ root: { children: [] } })),
      } as unknown as EditorState)),
      update: vi.fn((fn: () => void) => fn()),
      parseEditorState: vi.fn((json: string) => ({
        toJSON: () => JSON.parse(json),
      })),
      setEditorState: vi.fn(),
    }

    // Save original createElement
    originalCreateElement = document.createElement.bind(document)

    // Mock URL APIs
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    // Restore createElement if overridden
    document.createElement = originalCreateElement
  })

  it('should export exportEditorToFile function', async () => {
    const { exportEditorToFile } = await import(
      '../../../src/lexical/plugins/file-io'
    )
    expect(exportEditorToFile).toBeDefined()
    expect(typeof exportEditorToFile).toBe('function')
  })

  it('should export importFileToEditor function', async () => {
    const { importFileToEditor } = await import(
      '../../../src/lexical/plugins/file-io'
    )
    expect(importFileToEditor).toBeDefined()
    expect(typeof importFileToEditor).toBe('function')
  })

  it('should create a download when exporting to file', async () => {
    const { exportEditorToFile } = await import(
      '../../../src/lexical/plugins/file-io'
    )

    const clickSpy = vi.fn()
    document.createElement = ((tag: string) => {
      if (tag === 'a') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { href: '', download: '', click: clickSpy } as any
      }
      return originalCreateElement(tag)
    }) as typeof document.createElement

    await exportEditorToFile(mockEditor as LexicalEditor, 'markdown')

    expect(clickSpy).toHaveBeenCalled()
    expect(global.URL.createObjectURL).toHaveBeenCalled()
    expect(global.URL.revokeObjectURL).toHaveBeenCalled()
  })

  it('should export markdown format with .md extension', async () => {
    const { exportEditorToFile } = await import(
      '../../../src/lexical/plugins/file-io'
    )
    const markdownModule = await import(
      '../../../src/lexical/plugins/markdown-io'
    )

    const clickSpy = vi.fn()
    let downloadAttr = ''
    document.createElement = ((tag: string) => {
      if (tag === 'a') {
        const obj = { href: '', download: '', click: clickSpy }
        Object.defineProperty(obj, 'download', {
          get: () => downloadAttr,
          set: (v: string) => { downloadAttr = v },
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return obj as any
      }
      return originalCreateElement(tag)
    }) as typeof document.createElement

    await exportEditorToFile(mockEditor as LexicalEditor, 'markdown')

    expect(markdownModule.exportToMarkdown).toHaveBeenCalledWith(mockEditor)
    expect(downloadAttr).toBe('document.md')
  })

  it('should export HTML format with .html extension', async () => {
    const { exportEditorToFile } = await import(
      '../../../src/lexical/plugins/file-io'
    )
    const htmlModule = await import(
      '../../../src/lexical/plugins/html-io'
    )

    let downloadAttr = ''
    document.createElement = ((tag: string) => {
      if (tag === 'a') {
        const obj = { href: '', download: '', click: vi.fn() }
        Object.defineProperty(obj, 'download', {
          get: () => downloadAttr,
          set: (v: string) => { downloadAttr = v },
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return obj as any
      }
      return originalCreateElement(tag)
    }) as typeof document.createElement

    await exportEditorToFile(mockEditor as LexicalEditor, 'html')

    expect(htmlModule.exportToHtml).toHaveBeenCalledWith(mockEditor)
    expect(downloadAttr).toBe('document.html')
  })

  it('should export JSON format with .json extension', async () => {
    const { exportEditorToFile } = await import(
      '../../../src/lexical/plugins/file-io'
    )

    let downloadAttr = ''
    document.createElement = ((tag: string) => {
      if (tag === 'a') {
        const obj = { href: '', download: '', click: vi.fn() }
        Object.defineProperty(obj, 'download', {
          get: () => downloadAttr,
          set: (v: string) => { downloadAttr = v },
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return obj as any
      }
      return originalCreateElement(tag)
    }) as typeof document.createElement

    await exportEditorToFile(mockEditor as LexicalEditor, 'json')

    expect(mockEditor.getEditorState).toHaveBeenCalled()
    expect(downloadAttr).toBe('document.json')
  })

  it('should use custom filename when provided', async () => {
    const { exportEditorToFile } = await import(
      '../../../src/lexical/plugins/file-io'
    )

    let downloadAttr = ''
    document.createElement = ((tag: string) => {
      if (tag === 'a') {
        const obj = { href: '', download: '', click: vi.fn() }
        Object.defineProperty(obj, 'download', {
          get: () => downloadAttr,
          set: (v: string) => { downloadAttr = v },
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return obj as any
      }
      return originalCreateElement(tag)
    }) as typeof document.createElement

    await exportEditorToFile(mockEditor as LexicalEditor, 'markdown', 'my-doc.md')

    expect(downloadAttr).toBe('my-doc.md')
  })

  it('should detect markdown format from .md extension', async () => {
    const { importFileToEditor } = await import(
      '../../../src/lexical/plugins/file-io'
    )
    const markdownModule = await import(
      '../../../src/lexical/plugins/markdown-io'
    )

    const file = new File(['# Test'], 'test.md', { type: 'text/markdown' })
    await importFileToEditor(mockEditor as LexicalEditor, file)

    expect(markdownModule.importFromMarkdown).toHaveBeenCalled()
  })

  it('should detect HTML format from .html extension', async () => {
    const { importFileToEditor } = await import(
      '../../../src/lexical/plugins/file-io'
    )
    const htmlModule = await import(
      '../../../src/lexical/plugins/html-io'
    )

    const file = new File(['<p>Test</p>'], 'test.html', { type: 'text/html' })
    await importFileToEditor(mockEditor as LexicalEditor, file)

    expect(htmlModule.importFromHtml).toHaveBeenCalled()
  })

  it('should detect HTML format from .htm extension', async () => {
    const { importFileToEditor } = await import(
      '../../../src/lexical/plugins/file-io'
    )
    const htmlModule = await import(
      '../../../src/lexical/plugins/html-io'
    )

    const file = new File(['<p>Test</p>'], 'test.htm', { type: 'text/html' })
    await importFileToEditor(mockEditor as LexicalEditor, file)

    expect(htmlModule.importFromHtml).toHaveBeenCalled()
  })

  it('should use explicit format parameter if provided', async () => {
    const { importFileToEditor } = await import(
      '../../../src/lexical/plugins/file-io'
    )
    const markdownModule = await import(
      '../../../src/lexical/plugins/markdown-io'
    )

    // File has .txt extension but we specify markdown format
    const file = new File(['# Test'], 'test.txt', { type: 'text/plain' })
    await importFileToEditor(mockEditor as LexicalEditor, file, 'markdown')

    expect(markdownModule.importFromMarkdown).toHaveBeenCalled()
  })

  it('should read file content as text for markdown', async () => {
    const { importFileToEditor } = await import(
      '../../../src/lexical/plugins/file-io'
    )
    const markdownModule = await import(
      '../../../src/lexical/plugins/markdown-io'
    )

    const content = '# Test Content'
    const file = new File([content], 'test.md', { type: 'text/markdown' })

    await importFileToEditor(mockEditor as LexicalEditor, file)

    expect(markdownModule.importFromMarkdown).toHaveBeenCalledWith(mockEditor, content)
  })

  it('should default to json format for unknown extensions', async () => {
    const { importFileToEditor } = await import(
      '../../../src/lexical/plugins/file-io'
    )

    const json = JSON.stringify({ root: { children: [] } })
    const file = new File([json], 'test.dat', { type: 'application/octet-stream' })
    await importFileToEditor(mockEditor as LexicalEditor, file)

    expect(mockEditor.parseEditorState).toHaveBeenCalled()
  })

  it('should create blob with correct MIME type for markdown', async () => {
    const { exportEditorToFile } = await import(
      '../../../src/lexical/plugins/file-io'
    )

    document.createElement = ((tag: string) => {
      if (tag === 'a') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { href: '', download: '', click: vi.fn() } as any
      }
      return originalCreateElement(tag)
    }) as typeof document.createElement

    const blobSpy = vi.spyOn(global, 'Blob')

    await exportEditorToFile(mockEditor as LexicalEditor, 'markdown')

    expect(blobSpy).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ type: 'text/markdown' })
    )

    blobSpy.mockRestore()
  })

  it('should create blob with correct MIME type for HTML', async () => {
    const { exportEditorToFile } = await import(
      '../../../src/lexical/plugins/file-io'
    )

    document.createElement = ((tag: string) => {
      if (tag === 'a') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { href: '', download: '', click: vi.fn() } as any
      }
      return originalCreateElement(tag)
    }) as typeof document.createElement

    const blobSpy = vi.spyOn(global, 'Blob')

    await exportEditorToFile(mockEditor as LexicalEditor, 'html')

    expect(blobSpy).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ type: 'text/html' })
    )

    blobSpy.mockRestore()
  })

  it('should create blob with correct MIME type for JSON', async () => {
    const { exportEditorToFile } = await import(
      '../../../src/lexical/plugins/file-io'
    )

    document.createElement = ((tag: string) => {
      if (tag === 'a') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { href: '', download: '', click: vi.fn() } as any
      }
      return originalCreateElement(tag)
    }) as typeof document.createElement

    const blobSpy = vi.spyOn(global, 'Blob')

    await exportEditorToFile(mockEditor as LexicalEditor, 'json')

    expect(blobSpy).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ type: 'application/json' })
    )

    blobSpy.mockRestore()
  })
})

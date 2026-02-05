import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { LexicalEditor, EditorState } from 'lexical'

// Mock Lexical modules before imports
vi.mock('lexical', () => ({
  $getRoot: vi.fn(() => ({
    clear: vi.fn(),
  })),
  $insertNodes: vi.fn(),
}))

vi.mock('@lexical/html', () => ({
  $generateHtmlFromNodes: vi.fn(() => '<p>Hello World</p>'),
  $generateNodesFromDOM: vi.fn(() => []),
}))

describe('HTML I/O Plugin', () => {
  let mockEditor: Partial<LexicalEditor>

  beforeEach(() => {
    mockEditor = {
      getEditorState: vi.fn(() => ({
        read: vi.fn((fn) => fn()),
        toJSON: vi.fn(() => ({ root: {} })),
      } as unknown as EditorState)),
      update: vi.fn((fn) => fn()),
    }
    vi.clearAllMocks()
  })

  it('should export exportToHtml function', async () => {
    const { exportToHtml } = await import(
      '../../../src/lexical/plugins/html-io'
    )
    expect(exportToHtml).toBeDefined()
    expect(typeof exportToHtml).toBe('function')
  })

  it('should export importFromHtml function', async () => {
    const { importFromHtml } = await import(
      '../../../src/lexical/plugins/html-io'
    )
    expect(importFromHtml).toBeDefined()
    expect(typeof importFromHtml).toBe('function')
  })

  it('should return HTML string from exportToHtml', async () => {
    const { exportToHtml } = await import(
      '../../../src/lexical/plugins/html-io'
    )
    const { $generateHtmlFromNodes } = await import('@lexical/html')

    const html = await exportToHtml(mockEditor as LexicalEditor)

    expect(html).toBe('<p>Hello World</p>')
    expect($generateHtmlFromNodes).toHaveBeenCalledWith(mockEditor)
  })

  it('should read editor state when exporting to HTML', async () => {
    const { exportToHtml } = await import(
      '../../../src/lexical/plugins/html-io'
    )
    const readSpy = vi.fn((fn) => fn())
    mockEditor.getEditorState = vi.fn(() => ({
      read: readSpy,
      toJSON: vi.fn(() => ({ root: {} })),
    } as unknown as EditorState))

    await exportToHtml(mockEditor as LexicalEditor)

    expect(mockEditor.getEditorState).toHaveBeenCalled()
    expect(readSpy).toHaveBeenCalled()
  })

  it('should accept HTML string in importFromHtml', async () => {
    const { importFromHtml } = await import(
      '../../../src/lexical/plugins/html-io'
    )
    const html = '<p>Test content</p>'

    await importFromHtml(mockEditor as LexicalEditor, html)

    expect(mockEditor.update).toHaveBeenCalled()
  })

  it('should clear existing content before importing HTML', async () => {
    const { importFromHtml } = await import(
      '../../../src/lexical/plugins/html-io'
    )
    const { $getRoot } = await import('lexical')
    const mockRoot = { clear: vi.fn() }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($getRoot as any).mockReturnValue(mockRoot)

    const html = '<p>New content</p>'
    await importFromHtml(mockEditor as LexicalEditor, html)

    expect($getRoot).toHaveBeenCalled()
    expect(mockRoot.clear).toHaveBeenCalled()
  })

  it('should generate nodes from DOM when importing HTML', async () => {
    const { importFromHtml } = await import(
      '../../../src/lexical/plugins/html-io'
    )
    const { $generateNodesFromDOM } = await import('@lexical/html')

    const html = '<p>Test</p>'
    await importFromHtml(mockEditor as LexicalEditor, html)

    expect($generateNodesFromDOM).toHaveBeenCalledWith(
      mockEditor,
      expect.any(Object) // DOM object
    )
  })

  it('should insert generated nodes after clearing root', async () => {
    const { importFromHtml } = await import(
      '../../../src/lexical/plugins/html-io'
    )
    const { $insertNodes } = await import('lexical')
    const mockNodes = [{ type: 'paragraph' }]
    const { $generateNodesFromDOM } = await import('@lexical/html')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($generateNodesFromDOM as any).mockReturnValue(mockNodes)

    const html = '<p>Content</p>'
    await importFromHtml(mockEditor as LexicalEditor, html)

    expect($insertNodes).toHaveBeenCalledWith(mockNodes)
  })

  it('should parse HTML using DOMParser', async () => {
    const { importFromHtml } = await import(
      '../../../src/lexical/plugins/html-io'
    )
    const { $generateNodesFromDOM } = await import('@lexical/html')

    const html = '<div><p>Test</p></div>'
    await importFromHtml(mockEditor as LexicalEditor, html)

    // Verify DOMParser was used (indirectly via $generateNodesFromDOM call)
    expect($generateNodesFromDOM).toHaveBeenCalledWith(
      mockEditor,
      expect.objectContaining({
        // DOM document object
        nodeType: expect.any(Number),
      })
    )
  })

  it('should handle round-trip conversion (export then import)', async () => {
    const { exportToHtml, importFromHtml } = await import(
      '../../../src/lexical/plugins/html-io'
    )
    const { $generateHtmlFromNodes } = await import('@lexical/html')

    // Export
    const exportedHtml = await exportToHtml(mockEditor as LexicalEditor)
    expect(exportedHtml).toBe('<p>Hello World</p>')

    // Import the same HTML back
    await importFromHtml(mockEditor as LexicalEditor, exportedHtml)

    expect($generateHtmlFromNodes).toHaveBeenCalled()
    expect(mockEditor.update).toHaveBeenCalled()
  })

  it('should handle empty HTML string', async () => {
    const { importFromHtml } = await import(
      '../../../src/lexical/plugins/html-io'
    )

    await importFromHtml(mockEditor as LexicalEditor, '')

    expect(mockEditor.update).toHaveBeenCalled()
  })

  it('should handle complex HTML with multiple elements', async () => {
    const { importFromHtml } = await import(
      '../../../src/lexical/plugins/html-io'
    )
    const { $generateNodesFromDOM } = await import('@lexical/html')

    const html = `
      <div>
        <h1>Title</h1>
        <p>Paragraph 1</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </div>
    `

    await importFromHtml(mockEditor as LexicalEditor, html)

    expect($generateNodesFromDOM).toHaveBeenCalled()
  })

  it('should return string type from exportToHtml', async () => {
    const { exportToHtml } = await import(
      '../../../src/lexical/plugins/html-io'
    )

    const result = await exportToHtml(mockEditor as LexicalEditor)

    expect(typeof result).toBe('string')
  })

  it('should return promise from both export and import', async () => {
    const { exportToHtml, importFromHtml } = await import(
      '../../../src/lexical/plugins/html-io'
    )

    const exportResult = exportToHtml(mockEditor as LexicalEditor)
    expect(exportResult).toBeInstanceOf(Promise)
    await exportResult

    const importResult = importFromHtml(
      mockEditor as LexicalEditor,
      '<p>Test</p>'
    )
    expect(importResult).toBeInstanceOf(Promise)
    await importResult

    expect(true).toBe(true)
  })
})

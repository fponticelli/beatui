import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Lexical modules before imports
vi.mock('lexical', () => ({
  createEditor: vi.fn(() => ({
    update: vi.fn((fn) => fn()),
    getEditorState: vi.fn(() => ({
      toJSON: vi.fn(() => ({ root: {} })),
    })),
    parseEditorState: vi.fn((json) => ({
      toJSON: vi.fn(() => JSON.parse(json)),
    })),
    setEditorState: vi.fn(),
  })),
}))

vi.mock('../../src/lexical/plugins/markdown-io', () => ({
  importFromMarkdown: vi.fn(() => Promise.resolve()),
  exportToMarkdown: vi.fn(() => Promise.resolve('# Test')),
}))

vi.mock('../../src/lexical/plugins/html-io', () => ({
  importFromHtml: vi.fn(() => Promise.resolve()),
  exportToHtml: vi.fn(() => Promise.resolve('<h1>Test</h1>')),
}))

describe('Headless Editor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should export createHeadlessEditor function', async () => {
    const { createHeadlessEditor } = await import('../../src/lexical/headless')

    expect(createHeadlessEditor).toBeDefined()
    expect(typeof createHeadlessEditor).toBe('function')
  })

  it('should export markdownToLexicalJson function', async () => {
    const { markdownToLexicalJson } = await import('../../src/lexical/headless')

    expect(markdownToLexicalJson).toBeDefined()
    expect(typeof markdownToLexicalJson).toBe('function')
  })

  it('should export lexicalJsonToMarkdown function', async () => {
    const { lexicalJsonToMarkdown } = await import('../../src/lexical/headless')

    expect(lexicalJsonToMarkdown).toBeDefined()
    expect(typeof lexicalJsonToMarkdown).toBe('function')
  })

  it('should export htmlToLexicalJson function', async () => {
    const { htmlToLexicalJson } = await import('../../src/lexical/headless')

    expect(htmlToLexicalJson).toBeDefined()
    expect(typeof htmlToLexicalJson).toBe('function')
  })

  it('should export lexicalJsonToHtml function', async () => {
    const { lexicalJsonToHtml } = await import('../../src/lexical/headless')

    expect(lexicalJsonToHtml).toBeDefined()
    expect(typeof lexicalJsonToHtml).toBe('function')
  })

  it('should create a headless editor without options', async () => {
    const { createHeadlessEditor } = await import('../../src/lexical/headless')

    const editor = await createHeadlessEditor()

    expect(editor).toBeDefined()
  })

  it('should create a headless editor with custom nodes', async () => {
    const { createHeadlessEditor } = await import('../../src/lexical/headless')

    const editor = await createHeadlessEditor({
      nodes: [],
    })

    expect(editor).toBeDefined()
  })

  it('should create a headless editor with plugins', async () => {
    const { createHeadlessEditor } = await import('../../src/lexical/headless')

    const mockPlugin = {
      register: vi.fn(),
    }

    const editor = await createHeadlessEditor({
      plugins: [mockPlugin],
    })

    expect(editor).toBeDefined()
    expect(mockPlugin.register).toHaveBeenCalled()
  })

  it('should create a headless editor with onError callback', async () => {
    const { createHeadlessEditor } = await import('../../src/lexical/headless')
    const onError = vi.fn()

    const editor = await createHeadlessEditor({
      onError,
    })

    expect(editor).toBeDefined()
  })

  it('should set editable to false for headless editors', async () => {
    const { createHeadlessEditor } = await import('../../src/lexical/headless')
    const { createEditor } = await import('lexical')

    await createHeadlessEditor()

    expect(createEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        editable: false,
      })
    )
  })

  it('should use BeatUIHeadless namespace', async () => {
    const { createHeadlessEditor } = await import('../../src/lexical/headless')
    const { createEditor } = await import('lexical')

    await createHeadlessEditor()

    expect(createEditor).toHaveBeenCalledWith(
      expect.objectContaining({
        namespace: 'BeatUIHeadless',
      })
    )
  })

  it('should convert markdown to Lexical JSON', async () => {
    const { markdownToLexicalJson } = await import('../../src/lexical/headless')

    const markdown = '# Test\n\nParagraph'
    const json = await markdownToLexicalJson(markdown)

    expect(json).toBeDefined()
    expect(typeof json).toBe('object')
  })

  it('should convert Lexical JSON to markdown', async () => {
    const { lexicalJsonToMarkdown } = await import('../../src/lexical/headless')

    const json = { root: {} }
    const markdown = await lexicalJsonToMarkdown(json)

    expect(markdown).toBeDefined()
    expect(typeof markdown).toBe('string')
  })

  it('should convert HTML to Lexical JSON', async () => {
    const { htmlToLexicalJson } = await import('../../src/lexical/headless')

    const html = '<h1>Test</h1><p>Paragraph</p>'
    const json = await htmlToLexicalJson(html)

    expect(json).toBeDefined()
    expect(typeof json).toBe('object')
  })

  it('should convert Lexical JSON to HTML', async () => {
    const { lexicalJsonToHtml } = await import('../../src/lexical/headless')

    const json = { root: {} }
    const html = await lexicalJsonToHtml(json)

    expect(html).toBeDefined()
    expect(typeof html).toBe('string')
  })

  it('should return a promise from createHeadlessEditor', async () => {
    const { createHeadlessEditor } = await import('../../src/lexical/headless')

    const result = createHeadlessEditor()

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should return a promise from markdownToLexicalJson', async () => {
    const { markdownToLexicalJson } = await import('../../src/lexical/headless')

    const result = markdownToLexicalJson('# Test')

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should return a promise from lexicalJsonToMarkdown', async () => {
    const { lexicalJsonToMarkdown } = await import('../../src/lexical/headless')

    const result = lexicalJsonToMarkdown({ root: {} })

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should return a promise from htmlToLexicalJson', async () => {
    const { htmlToLexicalJson } = await import('../../src/lexical/headless')

    const result = htmlToLexicalJson('<p>Test</p>')

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should return a promise from lexicalJsonToHtml', async () => {
    const { lexicalJsonToHtml } = await import('../../src/lexical/headless')

    const result = lexicalJsonToHtml({ root: {} })

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should register custom plugins when provided', async () => {
    const { createHeadlessEditor } = await import('../../src/lexical/headless')

    const plugin1 = { register: vi.fn() }
    const plugin2 = { register: vi.fn() }

    await createHeadlessEditor({
      plugins: [plugin1, plugin2],
    })

    expect(plugin1.register).toHaveBeenCalled()
    expect(plugin2.register).toHaveBeenCalled()
  })

  it('should handle empty markdown string', async () => {
    const { markdownToLexicalJson } = await import('../../src/lexical/headless')

    const json = await markdownToLexicalJson('')

    expect(json).toBeDefined()
  })

  it('should handle empty HTML string', async () => {
    const { htmlToLexicalJson } = await import('../../src/lexical/headless')

    const json = await htmlToLexicalJson('')

    expect(json).toBeDefined()
  })

  it('should create headless editor with default empty options', async () => {
    const { createHeadlessEditor } = await import('../../src/lexical/headless')

    const editor = await createHeadlessEditor({})

    expect(editor).toBeDefined()
  })
})

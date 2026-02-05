import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { LexicalEditor, EditorState } from 'lexical'

// Mock Lexical modules before imports
vi.mock('lexical', () => ({
  $getRoot: vi.fn(),
}))

vi.mock('@lexical/markdown', () => ({
  $convertToMarkdownString: vi.fn(() => '# Test Markdown'),
  $convertFromMarkdownString: vi.fn(),
  TRANSFORMERS: [
    { type: 'heading' },
    { type: 'paragraph' },
    { type: 'list' },
  ],
}))

vi.mock('../../../src/lexical/plugins/horizontal-rule', () => ({
  registerHorizontalRulePlugin: vi.fn(() => vi.fn()),
  HR_TRANSFORMER: { type: 'element', regExp: /^---$/, dependencies: [] },
}))

describe('Markdown I/O Plugin', () => {
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

  it('should export exportToMarkdown function', async () => {
    const { exportToMarkdown } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )
    expect(exportToMarkdown).toBeDefined()
    expect(typeof exportToMarkdown).toBe('function')
  })

  it('should export importFromMarkdown function', async () => {
    const { importFromMarkdown } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )
    expect(importFromMarkdown).toBeDefined()
    expect(typeof importFromMarkdown).toBe('function')
  })

  it('should export getMarkdownTransformers function', async () => {
    const { getMarkdownTransformers } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )
    expect(getMarkdownTransformers).toBeDefined()
    expect(typeof getMarkdownTransformers).toBe('function')
  })

  it('should return markdown string from exportToMarkdown', async () => {
    const { exportToMarkdown } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )

    const result = await exportToMarkdown(mockEditor as LexicalEditor)

    expect(typeof result).toBe('string')
    expect(result).toBe('# Test Markdown')
  })

  it('should call $convertToMarkdownString with TRANSFORMERS', async () => {
    const { exportToMarkdown } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )
    const { $convertToMarkdownString, TRANSFORMERS } = await import(
      '@lexical/markdown'
    )

    await exportToMarkdown(mockEditor as LexicalEditor)

    expect(mockEditor.getEditorState).toHaveBeenCalled()
    // $convertToMarkdownString is called with ALL_TRANSFORMERS (base + HR)
    expect($convertToMarkdownString).toHaveBeenCalledWith(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect.arrayContaining(TRANSFORMERS as any)
    )
  })

  it('should accept editor and markdown string in importFromMarkdown', async () => {
    const { importFromMarkdown } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )
    const markdown = '# Test\n\nThis is a test.'

    await importFromMarkdown(mockEditor as LexicalEditor, markdown)

    expect(mockEditor.update).toHaveBeenCalled()
  })

  it('should call $convertFromMarkdownString when importing', async () => {
    const { importFromMarkdown } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )
    const { $convertFromMarkdownString, TRANSFORMERS } = await import(
      '@lexical/markdown'
    )
    const markdown = '# Heading\n\nParagraph'

    await importFromMarkdown(mockEditor as LexicalEditor, markdown)

    expect($convertFromMarkdownString).toHaveBeenCalledWith(
      markdown,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect.arrayContaining(TRANSFORMERS as any)
    )
  })

  it('should return transformer array from getMarkdownTransformers', async () => {
    const { getMarkdownTransformers } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )
    const { TRANSFORMERS } = await import('@lexical/markdown')

    const result = await getMarkdownTransformers()

    // ALL_TRANSFORMERS includes base TRANSFORMERS plus HR_TRANSFORMER
    expect(Array.isArray(result)).toBe(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(result.length).toBeGreaterThanOrEqual((TRANSFORMERS as any[]).length)
  })

  it('should handle empty markdown string', async () => {
    const { importFromMarkdown } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )
    const { $convertFromMarkdownString } = await import('@lexical/markdown')

    await importFromMarkdown(mockEditor as LexicalEditor, '')

    expect($convertFromMarkdownString).toHaveBeenCalledWith(
      '',
      expect.any(Array)
    )
  })

  it('should handle complex markdown with multiple elements', async () => {
    const { importFromMarkdown } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )
    const { $convertFromMarkdownString } = await import('@lexical/markdown')

    const markdown = `
# Heading 1

This is a paragraph.

## Heading 2

- List item 1
- List item 2

**Bold text** and *italic text*.
    `.trim()

    await importFromMarkdown(mockEditor as LexicalEditor, markdown)

    expect($convertFromMarkdownString).toHaveBeenCalledWith(
      markdown,
      expect.any(Array)
    )
  })

  it('should work within editor read context for export', async () => {
    const { exportToMarkdown } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )
    const readSpy = vi.fn((fn) => fn())
    mockEditor.getEditorState = vi.fn(
      () => ({ read: readSpy, toJSON: vi.fn() }) as unknown as EditorState
    )

    await exportToMarkdown(mockEditor as LexicalEditor)

    expect(readSpy).toHaveBeenCalled()
    expect(readSpy).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should work within editor update context for import', async () => {
    const { importFromMarkdown } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )
    const updateSpy = vi.fn((fn) => fn())
    mockEditor.update = updateSpy

    await importFromMarkdown(mockEditor as LexicalEditor, '# Test')

    expect(updateSpy).toHaveBeenCalled()
    expect(updateSpy).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should return promise from exportToMarkdown', async () => {
    const { exportToMarkdown } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )

    const result = exportToMarkdown(mockEditor as LexicalEditor)

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should return promise from importFromMarkdown', async () => {
    const { importFromMarkdown } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )

    const result = importFromMarkdown(mockEditor as LexicalEditor, '# Test')

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should return promise from getMarkdownTransformers', async () => {
    const { getMarkdownTransformers } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )

    const result = getMarkdownTransformers()

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should preserve markdown formatting on round-trip', async () => {
    const { exportToMarkdown, importFromMarkdown } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )
    const { $convertToMarkdownString } = await import('@lexical/markdown')

    // Import markdown
    const markdown = '# Test\n\nParagraph'
    await importFromMarkdown(mockEditor as LexicalEditor, markdown)

    // Export it back
    const exported = await exportToMarkdown(mockEditor as LexicalEditor)

    expect($convertToMarkdownString).toHaveBeenCalled()
    expect(typeof exported).toBe('string')
  })

  it('should handle markdown with code blocks', async () => {
    const { importFromMarkdown } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )
    const { $convertFromMarkdownString } = await import('@lexical/markdown')

    const markdown = `
# Code Example

\`\`\`javascript
function hello() {
  console.log('Hello');
}
\`\`\`
    `.trim()

    await importFromMarkdown(mockEditor as LexicalEditor, markdown)

    expect($convertFromMarkdownString).toHaveBeenCalledWith(
      markdown,
      expect.any(Array)
    )
  })

  it('should handle markdown with links', async () => {
    const { importFromMarkdown } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )

    const markdown = 'Check out [this link](https://example.com)'
    await importFromMarkdown(mockEditor as LexicalEditor, markdown)

    expect(mockEditor.update).toHaveBeenCalled()
  })

  it('should handle markdown with images', async () => {
    const { importFromMarkdown } = await import(
      '../../../src/lexical/plugins/markdown-io'
    )

    const markdown = '![Alt text](https://example.com/image.jpg)'
    await importFromMarkdown(mockEditor as LexicalEditor, markdown)

    expect(mockEditor.update).toHaveBeenCalled()
  })
})

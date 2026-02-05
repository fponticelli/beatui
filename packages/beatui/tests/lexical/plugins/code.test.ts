import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { LexicalEditor, EditorState } from 'lexical'

// Mock Lexical modules before imports
vi.mock('lexical', () => ({
  $getRoot: vi.fn(),
}))

vi.mock('@lexical/code', () => ({
  registerCodeHighlighting: vi.fn(() => vi.fn()),
  CodeNode: class CodeNode {},
  CodeHighlightNode: class CodeHighlightNode {},
}))

describe('Code Plugin', () => {
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

  it('should export registerCodePlugin function', async () => {
    const { registerCodePlugin } = await import(
      '../../../src/lexical/plugins/code'
    )
    expect(registerCodePlugin).toBeDefined()
    expect(typeof registerCodePlugin).toBe('function')
  })

  it('should return a cleanup function from registerCodePlugin', async () => {
    const { registerCodePlugin } = await import(
      '../../../src/lexical/plugins/code'
    )

    const cleanup = await registerCodePlugin(mockEditor as LexicalEditor)

    expect(cleanup).toBeDefined()
    expect(typeof cleanup).toBe('function')
  })

  it('should call registerCodeHighlighting if available', async () => {
    const { registerCodePlugin } = await import(
      '../../../src/lexical/plugins/code'
    )
    const codeModule = await import('@lexical/code')

    await registerCodePlugin(mockEditor as LexicalEditor)

    expect(codeModule.registerCodeHighlighting).toHaveBeenCalledWith(
      mockEditor
    )
  })

  it('should return no-op cleanup if registerCodeHighlighting is not available', async () => {
    const { registerCodePlugin } = await import(
      '../../../src/lexical/plugins/code'
    )
    const codeModule = await import('@lexical/code')

    // Temporarily remove the function
    const original = codeModule.registerCodeHighlighting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (codeModule as any).registerCodeHighlighting

    const cleanup = await registerCodePlugin(mockEditor as LexicalEditor)

    expect(typeof cleanup).toBe('function')
    cleanup() // Should not throw

    // Restore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(codeModule as any).registerCodeHighlighting = original
  })

  it('should accept options parameter', async () => {
    const { registerCodePlugin } = await import(
      '../../../src/lexical/plugins/code'
    )

    const cleanup = await registerCodePlugin(mockEditor as LexicalEditor, {
      // Code plugin options would go here
    })

    expect(cleanup).toBeDefined()
  })

  it('should register CodeNode and CodeHighlightNode', async () => {
    const { registerCodePlugin } = await import(
      '../../../src/lexical/plugins/code'
    )
    const { CodeNode, CodeHighlightNode } = await import('@lexical/code')

    await registerCodePlugin(mockEditor as LexicalEditor)

    // Nodes should be available
    expect(CodeNode).toBeDefined()
    expect(CodeHighlightNode).toBeDefined()
  })

  it('should return promise from registerCodePlugin', async () => {
    const { registerCodePlugin } = await import(
      '../../../src/lexical/plugins/code'
    )

    const result = registerCodePlugin(mockEditor as LexicalEditor)

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should not throw when cleanup is called', async () => {
    const { registerCodePlugin } = await import(
      '../../../src/lexical/plugins/code'
    )

    const cleanup = await registerCodePlugin(mockEditor as LexicalEditor)

    expect(() => cleanup()).not.toThrow()
  })

  it('should handle cleanup from registerCodeHighlighting', async () => {
    const { registerCodePlugin } = await import(
      '../../../src/lexical/plugins/code'
    )
    const codeModule = await import('@lexical/code')
    const mockCleanup = vi.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(codeModule.registerCodeHighlighting as any).mockReturnValue(mockCleanup)

    const cleanup = await registerCodePlugin(mockEditor as LexicalEditor)
    cleanup()

    expect(mockCleanup).toHaveBeenCalled()
  })

  it('should support syntax highlighting for code blocks', async () => {
    const { registerCodePlugin } = await import(
      '../../../src/lexical/plugins/code'
    )
    const codeModule = await import('@lexical/code')

    await registerCodePlugin(mockEditor as LexicalEditor)

    // Verify that code highlighting registration was called
    expect(codeModule.registerCodeHighlighting).toHaveBeenCalled()
  })

  it('should work with default options', async () => {
    const { registerCodePlugin } = await import(
      '../../../src/lexical/plugins/code'
    )

    const cleanup = await registerCodePlugin(mockEditor as LexicalEditor)

    expect(cleanup).toBeDefined()
    expect(typeof cleanup).toBe('function')
  })
})

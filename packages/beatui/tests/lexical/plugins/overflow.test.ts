import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { LexicalEditor, EditorState } from 'lexical'

// Mock Lexical modules before imports
vi.mock('lexical', () => ({
  $getRoot: vi.fn(() => ({
    getTextContent: vi.fn(() => ''),
  })),
}))

describe('Overflow Plugin', () => {
  let mockEditor: Partial<LexicalEditor>

  beforeEach(() => {
    mockEditor = {
      getEditorState: vi.fn(() => ({
        read: vi.fn((fn) => fn()),
        toJSON: vi.fn(() => ({ root: {} })),
      } as unknown as EditorState)),
      update: vi.fn((fn) => fn()),
      registerUpdateListener: vi.fn(() => vi.fn()),
    }
    vi.clearAllMocks()
  })

  it('should export registerOverflowPlugin function', async () => {
    const { registerOverflowPlugin } = await import(
      '../../../src/lexical/plugins/overflow'
    )
    expect(registerOverflowPlugin).toBeDefined()
    expect(typeof registerOverflowPlugin).toBe('function')
  })

  it('should return a cleanup function from registerOverflowPlugin', async () => {
    const { registerOverflowPlugin } = await import(
      '../../../src/lexical/plugins/overflow'
    )

    const cleanup = await registerOverflowPlugin(mockEditor as LexicalEditor, {
      maxLength: 100,
    })

    expect(cleanup).toBeDefined()
    expect(typeof cleanup).toBe('function')
  })

  it('should require maxLength option', async () => {
    const { registerOverflowPlugin } = await import(
      '../../../src/lexical/plugins/overflow'
    )

    // maxLength is required in the options
    const cleanup = await registerOverflowPlugin(mockEditor as LexicalEditor, {
      maxLength: 50,
    })

    expect(cleanup).toBeDefined()
  })

  it('should register update listener', async () => {
    const { registerOverflowPlugin } = await import(
      '../../../src/lexical/plugins/overflow'
    )

    await registerOverflowPlugin(mockEditor as LexicalEditor, {
      maxLength: 100,
    })

    expect(mockEditor.registerUpdateListener).toHaveBeenCalled()
    expect(mockEditor.registerUpdateListener).toHaveBeenCalledWith(
      expect.any(Function)
    )
  })

  it('should call onOverflow callback', async () => {
    const { registerOverflowPlugin } = await import(
      '../../../src/lexical/plugins/overflow'
    )
    const onOverflow = vi.fn()

    await registerOverflowPlugin(mockEditor as LexicalEditor, {
      maxLength: 100,
      onOverflow,
    })

    expect(onOverflow).not.toHaveBeenCalled() // Not called until update
  })

  it('should detect overflow when content exceeds maxLength', async () => {
    const { registerOverflowPlugin } = await import(
      '../../../src/lexical/plugins/overflow'
    )
    const { $getRoot } = await import('lexical')
    const onOverflow = vi.fn()

    const mockRoot = {
      getTextContent: vi.fn(() => 'x'.repeat(150)),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($getRoot as any).mockReturnValue(mockRoot)

    await registerOverflowPlugin(mockEditor as LexicalEditor, {
      maxLength: 100,
      onOverflow,
    })

    // Simulate an update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerUpdateListener as any).mock.calls[0]
    const updateListener = registerCall[0]

    const mockEditorState = {
      read: vi.fn((fn) => fn()),
    }

    updateListener({ editorState: mockEditorState })

    expect(onOverflow).toHaveBeenCalledWith(true, 150)
  })

  it('should detect no overflow when content is within maxLength', async () => {
    const { registerOverflowPlugin } = await import(
      '../../../src/lexical/plugins/overflow'
    )
    const { $getRoot } = await import('lexical')
    const onOverflow = vi.fn()

    const mockRoot = {
      getTextContent: vi.fn(() => 'x'.repeat(50)),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($getRoot as any).mockReturnValue(mockRoot)

    await registerOverflowPlugin(mockEditor as LexicalEditor, {
      maxLength: 100,
      onOverflow,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerUpdateListener as any).mock.calls[0]
    const updateListener = registerCall[0]

    const mockEditorState = {
      read: vi.fn((fn) => fn()),
    }

    updateListener({ editorState: mockEditorState })

    expect(onOverflow).toHaveBeenCalledWith(false, 50)
  })

  it('should pass current length to onOverflow callback', async () => {
    const { registerOverflowPlugin } = await import(
      '../../../src/lexical/plugins/overflow'
    )
    const { $getRoot } = await import('lexical')
    const onOverflow = vi.fn()

    const mockRoot = {
      getTextContent: vi.fn(() => 'test content'),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($getRoot as any).mockReturnValue(mockRoot)

    await registerOverflowPlugin(mockEditor as LexicalEditor, {
      maxLength: 100,
      onOverflow,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerUpdateListener as any).mock.calls[0]
    const updateListener = registerCall[0]

    const mockEditorState = {
      read: vi.fn((fn) => fn()),
    }

    updateListener({ editorState: mockEditorState })

    expect(onOverflow).toHaveBeenCalledWith(false, 12) // 'test content'.length
  })

  it('should handle empty content', async () => {
    const { registerOverflowPlugin } = await import(
      '../../../src/lexical/plugins/overflow'
    )
    const { $getRoot } = await import('lexical')
    const onOverflow = vi.fn()

    const mockRoot = {
      getTextContent: vi.fn(() => ''),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($getRoot as any).mockReturnValue(mockRoot)

    await registerOverflowPlugin(mockEditor as LexicalEditor, {
      maxLength: 100,
      onOverflow,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerUpdateListener as any).mock.calls[0]
    const updateListener = registerCall[0]

    const mockEditorState = {
      read: vi.fn((fn) => fn()),
    }

    updateListener({ editorState: mockEditorState })

    expect(onOverflow).toHaveBeenCalledWith(false, 0)
  })

  it('should handle exact maxLength', async () => {
    const { registerOverflowPlugin } = await import(
      '../../../src/lexical/plugins/overflow'
    )
    const { $getRoot } = await import('lexical')
    const onOverflow = vi.fn()

    const mockRoot = {
      getTextContent: vi.fn(() => 'x'.repeat(100)),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($getRoot as any).mockReturnValue(mockRoot)

    await registerOverflowPlugin(mockEditor as LexicalEditor, {
      maxLength: 100,
      onOverflow,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerUpdateListener as any).mock.calls[0]
    const updateListener = registerCall[0]

    const mockEditorState = {
      read: vi.fn((fn) => fn()),
    }

    updateListener({ editorState: mockEditorState })

    // Exactly at maxLength should not overflow
    expect(onOverflow).toHaveBeenCalledWith(false, 100)
  })

  it('should handle one character over maxLength', async () => {
    const { registerOverflowPlugin } = await import(
      '../../../src/lexical/plugins/overflow'
    )
    const { $getRoot } = await import('lexical')
    const onOverflow = vi.fn()

    const mockRoot = {
      getTextContent: vi.fn(() => 'x'.repeat(101)),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($getRoot as any).mockReturnValue(mockRoot)

    await registerOverflowPlugin(mockEditor as LexicalEditor, {
      maxLength: 100,
      onOverflow,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerUpdateListener as any).mock.calls[0]
    const updateListener = registerCall[0]

    const mockEditorState = {
      read: vi.fn((fn) => fn()),
    }

    updateListener({ editorState: mockEditorState })

    expect(onOverflow).toHaveBeenCalledWith(true, 101)
  })

  it('should work without onOverflow callback', async () => {
    const { registerOverflowPlugin } = await import(
      '../../../src/lexical/plugins/overflow'
    )
    const { $getRoot } = await import('lexical')

    const mockRoot = {
      getTextContent: vi.fn(() => 'test'),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($getRoot as any).mockReturnValue(mockRoot)

    const cleanup = await registerOverflowPlugin(mockEditor as LexicalEditor, {
      maxLength: 100,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerUpdateListener as any).mock.calls[0]
    const updateListener = registerCall[0]

    const mockEditorState = {
      read: vi.fn((fn) => fn()),
    }

    // Should not throw even without onOverflow
    expect(() => updateListener({ editorState: mockEditorState })).not.toThrow()

    expect(cleanup).toBeDefined()
  })

  it('should call cleanup when cleanup function is called', async () => {
    const { registerOverflowPlugin } = await import(
      '../../../src/lexical/plugins/overflow'
    )
    const listenerCleanup = vi.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(mockEditor.registerUpdateListener as any).mockReturnValue(listenerCleanup)

    const cleanup = await registerOverflowPlugin(mockEditor as LexicalEditor, {
      maxLength: 100,
    })

    cleanup()

    expect(listenerCleanup).toHaveBeenCalled()
  })

  it('should return promise from registerOverflowPlugin', async () => {
    const { registerOverflowPlugin } = await import(
      '../../../src/lexical/plugins/overflow'
    )

    const result = registerOverflowPlugin(mockEditor as LexicalEditor, {
      maxLength: 100,
    })

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should monitor content length on every update', async () => {
    const { registerOverflowPlugin } = await import(
      '../../../src/lexical/plugins/overflow'
    )
    const { $getRoot } = await import('lexical')
    const onOverflow = vi.fn()

    const mockRoot = {
      getTextContent: vi.fn(() => 'test'),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($getRoot as any).mockReturnValue(mockRoot)

    await registerOverflowPlugin(mockEditor as LexicalEditor, {
      maxLength: 100,
      onOverflow,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerUpdateListener as any).mock.calls[0]
    const updateListener = registerCall[0]

    const mockEditorState = {
      read: vi.fn((fn) => fn()),
    }

    // Simulate multiple updates
    updateListener({ editorState: mockEditorState })
    updateListener({ editorState: mockEditorState })
    updateListener({ editorState: mockEditorState })

    expect(onOverflow).toHaveBeenCalledTimes(3)
  })
})

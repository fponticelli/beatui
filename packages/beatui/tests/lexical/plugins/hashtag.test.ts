import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { LexicalEditor, EditorState } from 'lexical'

// Mock Lexical modules before imports
vi.mock('lexical', () => ({
  $getRoot: vi.fn(),
  CLICK_COMMAND: 'CLICK',
  COMMAND_PRIORITY_LOW: 1,
}))

vi.mock('@lexical/text', () => ({
  registerLexicalTextEntity: vi.fn(() => [vi.fn()]),
}))

vi.mock('@lexical/hashtag', () => ({
  HashtagNode: class HashtagNode {
    constructor(public text: string) {}
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $isHashtagNode: vi.fn((node) => node instanceof (HashtagNode as any)),
}))

describe('Hashtag Plugin', () => {
  let mockEditor: Partial<LexicalEditor>

  beforeEach(() => {
    mockEditor = {
      getEditorState: vi.fn(() => ({
        read: vi.fn((fn) => fn()),
        toJSON: vi.fn(() => ({ root: {} })),
      } as unknown as EditorState)),
      update: vi.fn((fn) => fn()),
      registerCommand: vi.fn(() => vi.fn()),
    }
    vi.clearAllMocks()
  })

  it('should export registerHashtagPlugin function', async () => {
    const { registerHashtagPlugin } = await import(
      '../../../src/lexical/plugins/hashtag'
    )
    expect(registerHashtagPlugin).toBeDefined()
    expect(typeof registerHashtagPlugin).toBe('function')
  })

  it('should return a cleanup function from registerHashtagPlugin', async () => {
    const { registerHashtagPlugin } = await import(
      '../../../src/lexical/plugins/hashtag'
    )

    const cleanup = await registerHashtagPlugin(mockEditor as LexicalEditor)

    expect(cleanup).toBeDefined()
    expect(typeof cleanup).toBe('function')
  })

  it('should register HashtagNode using registerLexicalTextEntity', async () => {
    const { registerHashtagPlugin } = await import(
      '../../../src/lexical/plugins/hashtag'
    )
    const { registerLexicalTextEntity } = await import('@lexical/text')

    await registerHashtagPlugin(mockEditor as LexicalEditor)

    expect(registerLexicalTextEntity).toHaveBeenCalledWith(
      mockEditor,
      expect.any(Function),
      expect.any(Function),
      expect.any(Function)
    )
  })

  it('should accept onHashtagClick callback option', async () => {
    const { registerHashtagPlugin } = await import(
      '../../../src/lexical/plugins/hashtag'
    )
    const onHashtagClick = vi.fn()

    const cleanup = await registerHashtagPlugin(mockEditor as LexicalEditor, {
      onHashtagClick,
    })

    expect(cleanup).toBeDefined()
  })

  it('should register click command listener when onHashtagClick is provided', async () => {
    const { registerHashtagPlugin } = await import(
      '../../../src/lexical/plugins/hashtag'
    )
    const { CLICK_COMMAND, COMMAND_PRIORITY_LOW } = await import('lexical')
    const onHashtagClick = vi.fn()

    await registerHashtagPlugin(mockEditor as LexicalEditor, {
      onHashtagClick,
    })

    expect(mockEditor.registerCommand).toHaveBeenCalledWith(
      CLICK_COMMAND,
      expect.any(Function),
      COMMAND_PRIORITY_LOW
    )
  })

  it('should not register click listener when onHashtagClick is not provided', async () => {
    const { registerHashtagPlugin } = await import(
      '../../../src/lexical/plugins/hashtag'
    )

    await registerHashtagPlugin(mockEditor as LexicalEditor)

    expect(mockEditor.registerCommand).not.toHaveBeenCalled()
  })

  it('should call onHashtagClick when hashtag is clicked', async () => {
    const { registerHashtagPlugin } = await import(
      '../../../src/lexical/plugins/hashtag'
    )
    const onHashtagClick = vi.fn()

    await registerHashtagPlugin(mockEditor as LexicalEditor, {
      onHashtagClick,
    })

    // Get the click handler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerCommand as any).mock.calls[0]
    const clickHandler = registerCall[1]

    // Simulate clicking a hashtag element
    const mockEvent = {
      target: {
        classList: {
          contains: (cls: string) => cls === 'bc-lexical-hashtag',
        },
        textContent: '#example',
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    const result = clickHandler(mockEvent)

    expect(onHashtagClick).toHaveBeenCalledWith('example')
    expect(result).toBe(true)
  })

  it('should remove # from hashtag text when calling onHashtagClick', async () => {
    const { registerHashtagPlugin } = await import(
      '../../../src/lexical/plugins/hashtag'
    )
    const onHashtagClick = vi.fn()

    await registerHashtagPlugin(mockEditor as LexicalEditor, {
      onHashtagClick,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerCommand as any).mock.calls[0]
    const clickHandler = registerCall[1]

    const mockEvent = {
      target: {
        classList: {
          contains: (cls: string) => cls === 'bc-lexical-hashtag',
        },
        textContent: '#test123',
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    clickHandler(mockEvent)

    expect(onHashtagClick).toHaveBeenCalledWith('test123')
  })

  it('should return false when clicking non-hashtag element', async () => {
    const { registerHashtagPlugin } = await import(
      '../../../src/lexical/plugins/hashtag'
    )
    const onHashtagClick = vi.fn()

    await registerHashtagPlugin(mockEditor as LexicalEditor, {
      onHashtagClick,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerCommand as any).mock.calls[0]
    const clickHandler = registerCall[1]

    const mockEvent = {
      target: {
        classList: {
          contains: (_cls: string) => false,
        },
        textContent: 'regular text',
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    const result = clickHandler(mockEvent)

    expect(onHashtagClick).not.toHaveBeenCalled()
    expect(result).toBe(false)
  })

  it('should cleanup all listeners when cleanup is called', async () => {
    const { registerHashtagPlugin } = await import(
      '../../../src/lexical/plugins/hashtag'
    )
    const { registerLexicalTextEntity } = await import('@lexical/text')
    const onHashtagClick = vi.fn()

    const textEntityCleanup = vi.fn()
    const clickCleanup = vi.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(registerLexicalTextEntity as any).mockReturnValue([textEntityCleanup])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(mockEditor.registerCommand as any).mockReturnValue(clickCleanup)

    const cleanup = await registerHashtagPlugin(mockEditor as LexicalEditor, {
      onHashtagClick,
    })

    cleanup()

    expect(textEntityCleanup).toHaveBeenCalled()
    expect(clickCleanup).toHaveBeenCalled()
  })

  it('should handle array of cleanups from registerLexicalTextEntity', async () => {
    const { registerHashtagPlugin } = await import(
      '../../../src/lexical/plugins/hashtag'
    )
    const { registerLexicalTextEntity } = await import('@lexical/text')

    const cleanup1 = vi.fn()
    const cleanup2 = vi.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(registerLexicalTextEntity as any).mockReturnValue([cleanup1, cleanup2])

    const cleanup = await registerHashtagPlugin(mockEditor as LexicalEditor)

    cleanup()

    expect(cleanup1).toHaveBeenCalled()
    expect(cleanup2).toHaveBeenCalled()
  })

  it('should handle single cleanup function from registerLexicalTextEntity', async () => {
    const { registerHashtagPlugin } = await import(
      '../../../src/lexical/plugins/hashtag'
    )
    const { registerLexicalTextEntity } = await import('@lexical/text')

    const cleanupFn = vi.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(registerLexicalTextEntity as any).mockReturnValue(cleanupFn)

    const cleanup = await registerHashtagPlugin(mockEditor as LexicalEditor)

    cleanup()

    expect(cleanupFn).toHaveBeenCalled()
  })

  it('should return promise from registerHashtagPlugin', async () => {
    const { registerHashtagPlugin } = await import(
      '../../../src/lexical/plugins/hashtag'
    )

    const result = registerHashtagPlugin(mockEditor as LexicalEditor)

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should not throw when cleanup is called without onHashtagClick', async () => {
    const { registerHashtagPlugin } = await import(
      '../../../src/lexical/plugins/hashtag'
    )

    const cleanup = await registerHashtagPlugin(mockEditor as LexicalEditor)

    expect(() => cleanup()).not.toThrow()
  })
})

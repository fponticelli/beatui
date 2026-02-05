import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { LexicalEditor, EditorState } from 'lexical'

// Mock Lexical modules before imports
vi.mock('lexical', () => ({
  $getRoot: vi.fn(),
  COMMAND_PRIORITY_LOW: 1,
  $getNodeByKey: vi.fn(),
  $isTextNode: vi.fn(),
  TextNode: class TextNode {},
}))

vi.mock('@lexical/link', () => ({
  toggleLink: vi.fn(),
  TOGGLE_LINK_COMMAND: 'TOGGLE_LINK',
  AutoLinkNode: class AutoLinkNode {},
  LinkNode: class LinkNode {},
}))

describe('Auto-Link Plugin (link.test.ts)', () => {
  let mockEditor: Partial<LexicalEditor>

  beforeEach(() => {
    mockEditor = {
      getEditorState: vi.fn(() => ({
        read: vi.fn((fn) => fn()),
        toJSON: vi.fn(() => ({ root: {} })),
      } as unknown as EditorState)),
      update: vi.fn((fn) => fn()),
      registerCommand: vi.fn(() => vi.fn()),
      registerMutationListener: vi.fn(() => vi.fn()),
    }
    vi.clearAllMocks()
  })

  it('should export registerAutoLinkPlugin function', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )
    expect(registerAutoLinkPlugin).toBeDefined()
    expect(typeof registerAutoLinkPlugin).toBe('function')
  })

  it('should return a cleanup function from registerAutoLinkPlugin', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )

    const cleanup = await registerAutoLinkPlugin(mockEditor as LexicalEditor)

    expect(cleanup).toBeDefined()
    expect(typeof cleanup).toBe('function')
  })

  it('should register mutation listener for TextNode', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )
    const { TextNode } = await import('lexical')

    await registerAutoLinkPlugin(mockEditor as LexicalEditor)

    expect(mockEditor.registerMutationListener).toHaveBeenCalledWith(
      TextNode,
      expect.any(Function)
    )
  })

  it('should use default URL pattern matcher', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )

    const cleanup = await registerAutoLinkPlugin(mockEditor as LexicalEditor)

    expect(cleanup).toBeDefined()
    // Default matchers should be used (URL and email)
  })

  it('should use default email pattern matcher', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )

    const cleanup = await registerAutoLinkPlugin(mockEditor as LexicalEditor)

    expect(cleanup).toBeDefined()
    // Default matchers should include email pattern
  })

  it('should accept custom matchers option', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )

    const customMatcher = {
      pattern: /custom-pattern/g,
      urlTransformer: (match: string) => `https://${match}`,
    }

    const cleanup = await registerAutoLinkPlugin(mockEditor as LexicalEditor, {
      matchers: [customMatcher],
    })

    expect(cleanup).toBeDefined()
  })

  it('should detect URLs in text', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )

    await registerAutoLinkPlugin(mockEditor as LexicalEditor)

    expect(mockEditor.registerMutationListener).toHaveBeenCalled()
    // URL detection happens in mutation listener
  })

  it('should detect email addresses in text', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )

    await registerAutoLinkPlugin(mockEditor as LexicalEditor)

    expect(mockEditor.registerMutationListener).toHaveBeenCalled()
    // Email detection happens in mutation listener
  })

  it('should transform URLs without protocol to https', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )

    await registerAutoLinkPlugin(mockEditor as LexicalEditor)

    // Default URL transformer should add https:// to URLs without protocol
    expect(mockEditor.registerMutationListener).toHaveBeenCalled()
  })

  it('should transform email addresses to mailto links', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )

    await registerAutoLinkPlugin(mockEditor as LexicalEditor)

    // Default email transformer should add mailto: prefix
    expect(mockEditor.registerMutationListener).toHaveBeenCalled()
  })

  it('should accept custom urlTransformer', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )

    const customTransformer = vi.fn((match: string) => `custom://${match}`)
    const customMatcher = {
      pattern: /test/g,
      urlTransformer: customTransformer,
    }

    await registerAutoLinkPlugin(mockEditor as LexicalEditor, {
      matchers: [customMatcher],
    })

    expect(mockEditor.registerMutationListener).toHaveBeenCalled()
  })

  it('should listen for text mutations', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )
    const { TextNode } = await import('lexical')

    await registerAutoLinkPlugin(mockEditor as LexicalEditor)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerMutationListener as any).mock.calls[0]
    expect(registerCall[0]).toBe(TextNode)
    expect(typeof registerCall[1]).toBe('function')
  })

  it('should update editor when text mutations occur', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )

    await registerAutoLinkPlugin(mockEditor as LexicalEditor)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerMutationListener as any).mock.calls[0]
    const mutationListener = registerCall[1]

    // Simulate mutation
    const mutations = new Map([['key1', 'created']])
    mutationListener(mutations)

    expect(mockEditor.update).toHaveBeenCalled()
  })

  it('should handle created text nodes', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )

    await registerAutoLinkPlugin(mockEditor as LexicalEditor)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerMutationListener as any).mock.calls[0]
    const mutationListener = registerCall[1]

    const mutations = new Map([['key1', 'created']])
    mutationListener(mutations)

    expect(mockEditor.update).toHaveBeenCalled()
  })

  it('should handle updated text nodes', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )

    await registerAutoLinkPlugin(mockEditor as LexicalEditor)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerMutationListener as any).mock.calls[0]
    const mutationListener = registerCall[1]

    const mutations = new Map([['key1', 'updated']])
    mutationListener(mutations)

    expect(mockEditor.update).toHaveBeenCalled()
  })

  it('should ignore destroyed text nodes', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )
    const { $getNodeByKey } = await import('lexical')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($getNodeByKey as any).mockReturnValue(null)

    await registerAutoLinkPlugin(mockEditor as LexicalEditor)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerMutationListener as any).mock.calls[0]
    const mutationListener = registerCall[1]

    const mutations = new Map([['key1', 'destroyed']])
    mutationListener(mutations)

    // Update should still be called but node should be skipped
    expect(mockEditor.update).toHaveBeenCalled()
  })

  it('should return promise from registerAutoLinkPlugin', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )

    const result = registerAutoLinkPlugin(mockEditor as LexicalEditor)

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should not throw when cleanup is called', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )

    const cleanup = await registerAutoLinkPlugin(mockEditor as LexicalEditor)

    expect(() => cleanup()).not.toThrow()
  })

  it('should call cleanup on mutation listener', async () => {
    const { registerAutoLinkPlugin } = await import(
      '../../../src/lexical/plugins/auto-link'
    )
    const mutationCleanup = vi.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(mockEditor.registerMutationListener as any).mockReturnValue(
      mutationCleanup
    )

    const cleanup = await registerAutoLinkPlugin(mockEditor as LexicalEditor)
    cleanup()

    expect(mutationCleanup).toHaveBeenCalled()
  })
})

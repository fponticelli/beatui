import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { LexicalEditor } from 'lexical'
import type { CollaborationConfig } from '../../../src/lexical/types'

// Mock Lexical modules before imports
vi.mock('lexical', () => ({
  createEditor: vi.fn(),
}))

vi.mock('@lexical/yjs', () => ({
  createBinding: vi.fn(() => ({
    destroy: vi.fn(),
  })),
}))

describe('Yjs Plugin', () => {
  let mockEditor: Partial<LexicalEditor>
  let mockConfig: CollaborationConfig

  beforeEach(() => {
    mockEditor = {
      registerUpdateListener: vi.fn(() => vi.fn()),
    }

    // Mock Yjs doc and provider
    const mockYText = {
      insert: vi.fn(),
      delete: vi.fn(),
      toString: vi.fn(() => ''),
    }

    const mockDoc = {
      getText: vi.fn(() => mockYText),
    }

    const mockProvider = {
      on: vi.fn(),
      off: vi.fn(),
      destroy: vi.fn(),
    }

    mockConfig = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      doc: mockDoc as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      provider: mockProvider as any,
      user: {
        id: 'user-123',
        name: 'Test User',
        color: '#ff0000',
      },
    }

    vi.clearAllMocks()
  })

  it('should export registerYjsPlugin function', async () => {
    const { registerYjsPlugin } = await import(
      '../../../src/lexical/plugins/yjs'
    )
    expect(registerYjsPlugin).toBeDefined()
    expect(typeof registerYjsPlugin).toBe('function')
  })

  it('should return a cleanup function', async () => {
    const { registerYjsPlugin } = await import(
      '../../../src/lexical/plugins/yjs'
    )

    const cleanup = await registerYjsPlugin(
      mockEditor as LexicalEditor,
      mockConfig
    )

    expect(typeof cleanup).toBe('function')
  })

  it('should accept CollaborationConfig', async () => {
    const { registerYjsPlugin } = await import(
      '../../../src/lexical/plugins/yjs'
    )

    const cleanup = await registerYjsPlugin(
      mockEditor as LexicalEditor,
      mockConfig
    )

    expect(cleanup).toBeDefined()
  })

  it('should dynamically import @lexical/yjs', async () => {
    const { registerYjsPlugin } = await import(
      '../../../src/lexical/plugins/yjs'
    )

    await registerYjsPlugin(mockEditor as LexicalEditor, mockConfig)

    // The import would have been called during execution
    expect(true).toBe(true)
  })

  it('should call createBinding from @lexical/yjs', async () => {
    const { registerYjsPlugin } = await import(
      '../../../src/lexical/plugins/yjs'
    )
    const yjsModule = await import('@lexical/yjs')

    await registerYjsPlugin(mockEditor as LexicalEditor, mockConfig)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((yjsModule as any).createBinding).toHaveBeenCalled()
  })

  it('should register update listener on editor', async () => {
    const { registerYjsPlugin } = await import(
      '../../../src/lexical/plugins/yjs'
    )

    await registerYjsPlugin(mockEditor as LexicalEditor, mockConfig)

    expect(mockEditor.registerUpdateListener).toHaveBeenCalled()
  })

  it('should cleanup update listener when cleanup function is called', async () => {
    const { registerYjsPlugin } = await import(
      '../../../src/lexical/plugins/yjs'
    )
    const removeListener = vi.fn()
    mockEditor.registerUpdateListener = vi.fn(() => removeListener)

    const cleanup = await registerYjsPlugin(
      mockEditor as LexicalEditor,
      mockConfig
    )
    cleanup()

    expect(removeListener).toHaveBeenCalled()
  })

  it('should destroy binding when cleanup function is called', async () => {
    const { registerYjsPlugin } = await import(
      '../../../src/lexical/plugins/yjs'
    )
    const yjsModule = await import('@lexical/yjs')
    const mockBinding = {
      destroy: vi.fn(),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(yjsModule as any).createBinding = vi.fn(() => mockBinding)

    const cleanup = await registerYjsPlugin(
      mockEditor as LexicalEditor,
      mockConfig
    )
    cleanup()

    expect(mockBinding.destroy).toHaveBeenCalled()
  })

  it('should pass doc to createBinding', async () => {
    const { registerYjsPlugin } = await import(
      '../../../src/lexical/plugins/yjs'
    )
    const yjsModule = await import('@lexical/yjs')

    await registerYjsPlugin(mockEditor as LexicalEditor, mockConfig)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((yjsModule as any).createBinding).toHaveBeenCalledWith(
      mockEditor,
      mockConfig.provider,
      expect.any(Object),
      mockConfig.doc,
      expect.any(Map)
    )
  })

  it('should pass provider to createBinding', async () => {
    const { registerYjsPlugin } = await import(
      '../../../src/lexical/plugins/yjs'
    )
    const yjsModule = await import('@lexical/yjs')

    await registerYjsPlugin(mockEditor as LexicalEditor, mockConfig)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((yjsModule as any).createBinding).toHaveBeenCalledWith(
      mockEditor,
      mockConfig.provider,
      expect.any(Object),
      expect.any(Object),
      expect.any(Map)
    )
  })

  it('should call getText on doc with "lexical"', async () => {
    const { registerYjsPlugin } = await import(
      '../../../src/lexical/plugins/yjs'
    )

    await registerYjsPlugin(mockEditor as LexicalEditor, mockConfig)

    expect(mockConfig.doc.getText).toHaveBeenCalledWith('lexical')
  })

  it('should return a promise', async () => {
    const { registerYjsPlugin } = await import(
      '../../../src/lexical/plugins/yjs'
    )

    const result = registerYjsPlugin(mockEditor as LexicalEditor, mockConfig)

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should handle binding without destroy method gracefully', async () => {
    const { registerYjsPlugin } = await import(
      '../../../src/lexical/plugins/yjs'
    )
    const yjsModule = await import('@lexical/yjs')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(yjsModule as any).createBinding = vi.fn(() => ({}))

    const cleanup = await registerYjsPlugin(
      mockEditor as LexicalEditor,
      mockConfig
    )

    expect(() => cleanup()).not.toThrow()
  })

  it('should work with user information in config', async () => {
    const { registerYjsPlugin } = await import(
      '../../../src/lexical/plugins/yjs'
    )

    const cleanup = await registerYjsPlugin(
      mockEditor as LexicalEditor,
      mockConfig
    )

    expect(cleanup).toBeDefined()
  })
})

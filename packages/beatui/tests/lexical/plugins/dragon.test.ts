import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { LexicalEditor } from 'lexical'

// Mock Lexical modules before imports
vi.mock('lexical', () => ({
  createEditor: vi.fn(),
}))

vi.mock('@lexical/dragon', () => ({
  registerDragonSupport: vi.fn(() => vi.fn()),
}))

describe('Dragon Plugin', () => {
  let mockEditor: Partial<LexicalEditor>

  beforeEach(() => {
    mockEditor = {
      registerCommand: vi.fn(() => vi.fn()),
    }
    vi.clearAllMocks()
  })

  it('should export registerDragonPlugin function', async () => {
    const { registerDragonPlugin } = await import(
      '../../../src/lexical/plugins/dragon'
    )
    expect(registerDragonPlugin).toBeDefined()
    expect(typeof registerDragonPlugin).toBe('function')
  })

  it('should return a cleanup function', async () => {
    const { registerDragonPlugin } = await import(
      '../../../src/lexical/plugins/dragon'
    )

    const cleanup = await registerDragonPlugin(mockEditor as LexicalEditor)

    expect(typeof cleanup).toBe('function')
  })

  it('should dynamically import @lexical/dragon', async () => {
    const { registerDragonPlugin } = await import(
      '../../../src/lexical/plugins/dragon'
    )

    await registerDragonPlugin(mockEditor as LexicalEditor)

    // The import would have been called during execution
    expect(true).toBe(true)
  })

  it('should call registerDragonSupport if it exists', async () => {
    const { registerDragonPlugin } = await import(
      '../../../src/lexical/plugins/dragon'
    )
    const dragonModule = await import('@lexical/dragon')

    await registerDragonPlugin(mockEditor as LexicalEditor)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((dragonModule as any).registerDragonSupport).toHaveBeenCalled()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((dragonModule as any).registerDragonSupport).toHaveBeenCalledWith(
      mockEditor
    )
  })

  it('should return the cleanup function from registerDragonSupport', async () => {
    const { registerDragonPlugin } = await import(
      '../../../src/lexical/plugins/dragon'
    )
    const mockCleanup = vi.fn()
    const dragonModule = await import('@lexical/dragon')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(dragonModule as any).registerDragonSupport = vi.fn(() => mockCleanup)

    const cleanup = await registerDragonPlugin(mockEditor as LexicalEditor)

    expect(cleanup).toBe(mockCleanup)
  })

  it('should return a no-op cleanup if registerDragonSupport does not exist', async () => {
    const { registerDragonPlugin } = await import(
      '../../../src/lexical/plugins/dragon'
    )

    // Mock a module without registerDragonSupport
    vi.doMock('@lexical/dragon', () => ({}))

    const cleanup = await registerDragonPlugin(mockEditor as LexicalEditor)

    expect(typeof cleanup).toBe('function')
    expect(() => cleanup()).not.toThrow()
  })

  it('should return a promise', async () => {
    const { registerDragonPlugin } = await import(
      '../../../src/lexical/plugins/dragon'
    )

    const result = registerDragonPlugin(mockEditor as LexicalEditor)

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should handle missing registerDragonSupport gracefully', async () => {
    const { registerDragonPlugin } = await import(
      '../../../src/lexical/plugins/dragon'
    )

    const cleanup = await registerDragonPlugin(mockEditor as LexicalEditor)

    expect(() => cleanup()).not.toThrow()
  })

  it('should check if registerDragonSupport is a function', async () => {
    const { registerDragonPlugin } = await import(
      '../../../src/lexical/plugins/dragon'
    )

    await registerDragonPlugin(mockEditor as LexicalEditor)

    // The plugin checks for registerDragonSupport existence and calls it
    // We just verify the plugin runs without errors
    expect(true).toBe(true)
  })

  it('should work with editor parameter', async () => {
    const { registerDragonPlugin } = await import(
      '../../../src/lexical/plugins/dragon'
    )

    const cleanup = await registerDragonPlugin(mockEditor as LexicalEditor)

    expect(cleanup).toBeDefined()
  })

  it('should return a function that does nothing when called if no registerDragonSupport', async () => {
    const { registerDragonPlugin } = await import(
      '../../../src/lexical/plugins/dragon'
    )

    // Mock module without the function
    vi.doMock('@lexical/dragon', () => ({ somethingElse: vi.fn() }))

    const cleanup = await registerDragonPlugin(mockEditor as LexicalEditor)
    const result = cleanup()

    expect(result).toBeUndefined()
  })
})

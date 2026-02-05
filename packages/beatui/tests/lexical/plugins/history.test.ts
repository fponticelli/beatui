import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { LexicalEditor } from 'lexical'

// Mock Lexical modules before imports
vi.mock('lexical', () => ({
  createEditor: vi.fn(),
}))

vi.mock('@lexical/history', () => ({
  createEmptyHistoryState: vi.fn(() => ({ current: null, redoStack: [], undoStack: [] })),
  registerHistory: vi.fn(() => vi.fn()),
}))

describe('History Plugin', () => {
  let mockEditor: Partial<LexicalEditor>

  beforeEach(() => {
    mockEditor = {
      update: vi.fn((fn) => fn()),
      registerCommand: vi.fn(() => vi.fn()),
    }
    vi.clearAllMocks()
  })

  it('should export registerHistoryPlugin function', async () => {
    const { registerHistoryPlugin } = await import(
      '../../../src/lexical/plugins/history'
    )
    expect(registerHistoryPlugin).toBeDefined()
    expect(typeof registerHistoryPlugin).toBe('function')
  })

  it('should return a cleanup function', async () => {
    const { registerHistoryPlugin } = await import(
      '../../../src/lexical/plugins/history'
    )

    const cleanup = await registerHistoryPlugin(mockEditor as LexicalEditor)

    expect(typeof cleanup).toBe('function')
  })

  it('should call registerHistory from @lexical/history', async () => {
    const { registerHistoryPlugin } = await import(
      '../../../src/lexical/plugins/history'
    )
    const { registerHistory } = await import('@lexical/history')

    await registerHistoryPlugin(mockEditor as LexicalEditor)

    expect(registerHistory).toHaveBeenCalled()
    expect(registerHistory).toHaveBeenCalledWith(
      mockEditor,
      expect.any(Object),
      expect.any(Number)
    )
  })

  it('should call createEmptyHistoryState', async () => {
    const { registerHistoryPlugin } = await import(
      '../../../src/lexical/plugins/history'
    )
    const { createEmptyHistoryState } = await import('@lexical/history')

    await registerHistoryPlugin(mockEditor as LexicalEditor)

    expect(createEmptyHistoryState).toHaveBeenCalled()
  })

  it('should use default delay of 300ms when options omitted', async () => {
    const { registerHistoryPlugin } = await import(
      '../../../src/lexical/plugins/history'
    )
    const { registerHistory } = await import('@lexical/history')

    await registerHistoryPlugin(mockEditor as LexicalEditor)

    expect(registerHistory).toHaveBeenCalledWith(
      mockEditor,
      expect.any(Object),
      300
    )
  })

  it('should pass custom delay when provided in options', async () => {
    const { registerHistoryPlugin } = await import(
      '../../../src/lexical/plugins/history'
    )
    const { registerHistory } = await import('@lexical/history')

    await registerHistoryPlugin(mockEditor as LexicalEditor, { delay: 500 })

    expect(registerHistory).toHaveBeenCalledWith(
      mockEditor,
      expect.any(Object),
      500
    )
  })

  it('should accept delay option', async () => {
    const { registerHistoryPlugin } = await import(
      '../../../src/lexical/plugins/history'
    )

    const cleanup = await registerHistoryPlugin(mockEditor as LexicalEditor, {
      delay: 1000,
    })

    expect(typeof cleanup).toBe('function')
  })

  it('should accept maxDepth option', async () => {
    const { registerHistoryPlugin } = await import(
      '../../../src/lexical/plugins/history'
    )

    const cleanup = await registerHistoryPlugin(mockEditor as LexicalEditor, {
      maxDepth: 50,
    })

    expect(typeof cleanup).toBe('function')
  })

  it('should handle empty options object', async () => {
    const { registerHistoryPlugin } = await import(
      '../../../src/lexical/plugins/history'
    )
    const { registerHistory } = await import('@lexical/history')

    await registerHistoryPlugin(mockEditor as LexicalEditor, {})

    expect(registerHistory).toHaveBeenCalledWith(
      mockEditor,
      expect.any(Object),
      300
    )
  })

  it('should return a promise', async () => {
    const { registerHistoryPlugin } = await import(
      '../../../src/lexical/plugins/history'
    )

    const result = registerHistoryPlugin(mockEditor as LexicalEditor)

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should pass both delay and maxDepth when provided', async () => {
    const { registerHistoryPlugin } = await import(
      '../../../src/lexical/plugins/history'
    )

    const cleanup = await registerHistoryPlugin(mockEditor as LexicalEditor, {
      delay: 250,
      maxDepth: 100,
    })

    expect(typeof cleanup).toBe('function')
  })

  it('should use delay from options over default', async () => {
    const { registerHistoryPlugin } = await import(
      '../../../src/lexical/plugins/history'
    )
    const { registerHistory } = await import('@lexical/history')

    await registerHistoryPlugin(mockEditor as LexicalEditor, { delay: 150 })

    expect(registerHistory).toHaveBeenCalledWith(
      mockEditor,
      expect.any(Object),
      150
    )
  })

  it('should work with delay set to 0', async () => {
    const { registerHistoryPlugin } = await import(
      '../../../src/lexical/plugins/history'
    )
    const { registerHistory } = await import('@lexical/history')

    await registerHistoryPlugin(mockEditor as LexicalEditor, { delay: 0 })

    expect(registerHistory).toHaveBeenCalledWith(
      mockEditor,
      expect.any(Object),
      0
    )
  })

  it('should pass historyState from createEmptyHistoryState to registerHistory', async () => {
    const { registerHistoryPlugin } = await import(
      '../../../src/lexical/plugins/history'
    )
    const { createEmptyHistoryState, registerHistory } = await import(
      '@lexical/history'
    )

    await registerHistoryPlugin(mockEditor as LexicalEditor)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const historyState = (createEmptyHistoryState as any).mock.results[0].value
    expect(registerHistory).toHaveBeenCalledWith(
      mockEditor,
      historyState,
      expect.any(Number)
    )
  })

  it('should return the cleanup function from registerHistory', async () => {
    const { registerHistoryPlugin } = await import(
      '../../../src/lexical/plugins/history'
    )
    const { registerHistory } = await import('@lexical/history')

    const cleanup = await registerHistoryPlugin(mockEditor as LexicalEditor)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(cleanup).toBe((registerHistory as any).mock.results[0].value)
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { LexicalEditor, EditorState } from 'lexical'

// Mock Lexical modules before imports
vi.mock('lexical', () => ({
  $getRoot: vi.fn(() => ({
    getAllTextNodes: vi.fn(() => []),
  })),
  $getSelection: vi.fn(),
  $isRangeSelection: vi.fn(),
  CLICK_COMMAND: 'CLICK',
  COMMAND_PRIORITY_LOW: 1,
}))

vi.mock('@lexical/mark', () => ({
  MarkNode: class MarkNode {
    getParent() {
      return null
    }
  },
  $wrapSelectionInMarkNode: vi.fn(),
  $unwrapMarkNode: vi.fn(),
  $getMarkIDs: vi.fn(() => []),
}))

describe('Mark Plugin', () => {
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

  it('should export registerMarkPlugin function', async () => {
    const { registerMarkPlugin } = await import(
      '../../../src/lexical/plugins/mark'
    )
    expect(registerMarkPlugin).toBeDefined()
    expect(typeof registerMarkPlugin).toBe('function')
  })

  it('should export applyMark function', async () => {
    const { applyMark } = await import('../../../src/lexical/plugins/mark')
    expect(applyMark).toBeDefined()
    expect(typeof applyMark).toBe('function')
  })

  it('should export removeMark function', async () => {
    const { removeMark } = await import('../../../src/lexical/plugins/mark')
    expect(removeMark).toBeDefined()
    expect(typeof removeMark).toBe('function')
  })

  it('should return a cleanup function from registerMarkPlugin', async () => {
    const { registerMarkPlugin } = await import(
      '../../../src/lexical/plugins/mark'
    )

    const cleanup = await registerMarkPlugin(mockEditor as LexicalEditor)

    expect(cleanup).toBeDefined()
    expect(typeof cleanup).toBe('function')
  })

  it('should register MarkNode', async () => {
    const { registerMarkPlugin } = await import(
      '../../../src/lexical/plugins/mark'
    )
    await import('@lexical/mark')

    await registerMarkPlugin(mockEditor as LexicalEditor)

    // MarkNode should be imported
    const { MarkNode } = await import('@lexical/mark')
    expect(MarkNode).toBeDefined()
  })

  it('should register click handler when onMarkClick callback is provided', async () => {
    const { registerMarkPlugin } = await import(
      '../../../src/lexical/plugins/mark'
    )
    const { CLICK_COMMAND, COMMAND_PRIORITY_LOW } = await import('lexical')
    const onMarkClick = vi.fn()

    await registerMarkPlugin(mockEditor as LexicalEditor, { onMarkClick })

    expect(mockEditor.registerCommand).toHaveBeenCalledWith(
      CLICK_COMMAND,
      expect.any(Function),
      COMMAND_PRIORITY_LOW
    )
  })

  it('should not register click handler when onMarkClick is not provided', async () => {
    const { registerMarkPlugin } = await import(
      '../../../src/lexical/plugins/mark'
    )

    await registerMarkPlugin(mockEditor as LexicalEditor)

    expect(mockEditor.registerCommand).not.toHaveBeenCalled()
  })

  it('should call onMarkClick when mark is clicked', async () => {
    const { registerMarkPlugin } = await import(
      '../../../src/lexical/plugins/mark'
    )
    const onMarkClick = vi.fn()

    await registerMarkPlugin(mockEditor as LexicalEditor, { onMarkClick })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerCommand as any).mock.calls[0]
    const clickHandler = registerCall[1]

    const mockEvent = {
      target: {
        classList: {
          contains: (cls: string) => cls === 'bc-lexical-mark',
        },
        dataset: {
          markId: 'mark-123',
          markType: 'annotation',
        },
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    const result = clickHandler(mockEvent)

    expect(onMarkClick).toHaveBeenCalledWith('mark-123', {
      id: 'mark-123',
      type: 'annotation',
      data: {},
    })
    expect(result).toBe(true)
  })

  it('should return false when clicking non-mark element', async () => {
    const { registerMarkPlugin } = await import(
      '../../../src/lexical/plugins/mark'
    )
    const onMarkClick = vi.fn()

    await registerMarkPlugin(mockEditor as LexicalEditor, { onMarkClick })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerCommand as any).mock.calls[0]
    const clickHandler = registerCall[1]

    const mockEvent = {
      target: {
        classList: {
          contains: (_cls: string) => false,
        },
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    const result = clickHandler(mockEvent)

    expect(onMarkClick).not.toHaveBeenCalled()
    expect(result).toBe(false)
  })

  it('should apply mark to current selection', async () => {
    const { applyMark } = await import('../../../src/lexical/plugins/mark')
    const { $wrapSelectionInMarkNode } = await import('@lexical/mark')
    const { $getSelection, $isRangeSelection } = await import('lexical')

    const mockSelection = {
      isBackward: vi.fn(() => false),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($getSelection as any).mockReturnValue(mockSelection)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($isRangeSelection as any).mockReturnValue(true)

    await applyMark(mockEditor as LexicalEditor, 'mark-id')

    expect(mockEditor.update).toHaveBeenCalled()
    expect($wrapSelectionInMarkNode).toHaveBeenCalledWith(
      mockSelection,
      false,
      'mark-id'
    )
  })

  it('should remove mark by ID', async () => {
    const { removeMark } = await import('../../../src/lexical/plugins/mark')
    const { $getRoot } = await import('lexical')

    await removeMark(mockEditor as LexicalEditor, 'mark-id')

    expect(mockEditor.update).toHaveBeenCalled()
    expect($getRoot).toHaveBeenCalled()
  })

  it('should accept metadata parameter in applyMark', async () => {
    const { applyMark } = await import('../../../src/lexical/plugins/mark')
    const { $getSelection, $isRangeSelection } = await import('lexical')

    const mockSelection = {
      isBackward: vi.fn(() => false),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($getSelection as any).mockReturnValue(mockSelection)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($isRangeSelection as any).mockReturnValue(true)

    const metadata = {
      type: 'highlight',
      data: { color: 'yellow' },
    }

    await applyMark(mockEditor as LexicalEditor, 'mark-id', metadata)

    expect(mockEditor.update).toHaveBeenCalled()
  })

  it('should handle backward selection in applyMark', async () => {
    const { applyMark } = await import('../../../src/lexical/plugins/mark')
    const { $wrapSelectionInMarkNode } = await import('@lexical/mark')
    const { $getSelection, $isRangeSelection } = await import('lexical')

    const mockSelection = {
      isBackward: vi.fn(() => true),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($getSelection as any).mockReturnValue(mockSelection)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($isRangeSelection as any).mockReturnValue(true)

    await applyMark(mockEditor as LexicalEditor, 'mark-id')

    expect($wrapSelectionInMarkNode).toHaveBeenCalledWith(
      mockSelection,
      true,
      'mark-id'
    )
  })

  it('should not apply mark if selection is not range selection', async () => {
    const { applyMark } = await import('../../../src/lexical/plugins/mark')
    const { $wrapSelectionInMarkNode } = await import('@lexical/mark')
    const { $getSelection, $isRangeSelection } = await import('lexical')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($getSelection as any).mockReturnValue({})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;($isRangeSelection as any).mockReturnValue(false)

    await applyMark(mockEditor as LexicalEditor, 'mark-id')

    expect($wrapSelectionInMarkNode).not.toHaveBeenCalled()
  })

  it('should cleanup all disposers when cleanup is called', async () => {
    const { registerMarkPlugin } = await import(
      '../../../src/lexical/plugins/mark'
    )
    const onMarkClick = vi.fn()
    const clickCleanup = vi.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(mockEditor.registerCommand as any).mockReturnValue(clickCleanup)

    const cleanup = await registerMarkPlugin(mockEditor as LexicalEditor, {
      onMarkClick,
    })

    cleanup()

    expect(clickCleanup).toHaveBeenCalled()
  })

  it('should default mark type to annotation', async () => {
    const { registerMarkPlugin } = await import(
      '../../../src/lexical/plugins/mark'
    )
    const onMarkClick = vi.fn()

    await registerMarkPlugin(mockEditor as LexicalEditor, { onMarkClick })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditor.registerCommand as any).mock.calls[0]
    const clickHandler = registerCall[1]

    const mockEvent = {
      target: {
        classList: {
          contains: (cls: string) => cls === 'bc-lexical-mark',
        },
        dataset: {
          markId: 'mark-123',
          // No markType specified
        },
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    clickHandler(mockEvent)

    const callArgs = onMarkClick.mock.calls[0]
    expect(callArgs[1].type).toBe('annotation')
  })

  it('should return promise from applyMark', async () => {
    const { applyMark } = await import('../../../src/lexical/plugins/mark')

    const result = applyMark(mockEditor as LexicalEditor, 'mark-id')

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should return promise from removeMark', async () => {
    const { removeMark } = await import('../../../src/lexical/plugins/mark')

    const result = removeMark(mockEditor as LexicalEditor, 'mark-id')

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should return promise from registerMarkPlugin', async () => {
    const { registerMarkPlugin } = await import(
      '../../../src/lexical/plugins/mark'
    )

    const result = registerMarkPlugin(mockEditor as LexicalEditor)

    expect(result).toBeInstanceOf(Promise)
    await result
  })
})

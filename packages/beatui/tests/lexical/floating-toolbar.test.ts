import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.setConfig({ testTimeout: 20000 })

import { render, prop, signal } from '@tempots/dom'
import { FloatingToolbar } from '../../src/components/lexical/floating/floating-toolbar'
import { WithProviders } from '../helpers/test-providers'
import type { LexicalEditor, EditorState } from 'lexical'

// Mock editor setup
const createMockEditor = (): Partial<LexicalEditor> => ({
  dispatchCommand: vi.fn(),
  getEditorState: vi.fn(() => ({
    toJSON: vi.fn(() => ({ root: {} })),
    read: vi.fn((fn) => {
      try {
        return fn()
      } catch (_e) {
        return undefined
      }
    }),
  } as unknown as EditorState)),
  focus: vi.fn(),
  registerCommand: vi.fn(() => vi.fn()),
  getRootElement: vi.fn(() => document.createElement('div')),
})

// Mock window.getSelection
const mockWindowGetSelection = () => {
  const mockRange = {
    getBoundingClientRect: vi.fn(() => ({
      top: 100,
      left: 200,
      bottom: 120,
      right: 300,
      width: 100,
      height: 20,
      x: 200,
      y: 100,
    })),
  }

  return {
    rangeCount: 1,
    getRangeAt: vi.fn(() => mockRange),
  }
}

// Mock lexical core modules
vi.mock('lexical', async () => {
  const actual = await vi.importActual('lexical')
  const mockGetSelection = vi.fn()
  const mockIsRangeSelection = vi.fn()

  return {
    ...actual,
    $getSelection: mockGetSelection,
    $isRangeSelection: mockIsRangeSelection,
    FORMAT_TEXT_COMMAND: 'format-text',
  }
})

vi.mock('@lexical/link', () => ({
  TOGGLE_LINK_COMMAND: 'toggle-link',
}))

describe('FloatingToolbar Component', () => {
  let container: HTMLDivElement
  let mockEditor: Partial<LexicalEditor>
  let mockLexicalGetSelection: ReturnType<typeof vi.fn>
  let mockIsRangeSelection: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    mockEditor = createMockEditor()
    vi.clearAllMocks()

    // Import mocked functions
    const lexical = await import('lexical')
    mockLexicalGetSelection = lexical.$getSelection as unknown as ReturnType<typeof vi.fn>
    mockIsRangeSelection = lexical.$isRangeSelection as unknown as ReturnType<typeof vi.fn>

    // Mock window.getSelection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.window.getSelection = vi.fn(mockWindowGetSelection as any)

    // Set default return values for Lexical mocks
    mockLexicalGetSelection.mockReturnValue({
      isCollapsed: vi.fn(() => false),
      hasFormat: vi.fn(() => false),
      anchor: {
        getNode: vi.fn(() => ({
          getParent: vi.fn(() => null),
          getType: vi.fn(() => 'text'),
        })),
      },
    })
    mockIsRangeSelection.mockReturnValue(true)
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('should not render when editor is null', () => {
    const editorSignal = prop<LexicalEditor | null>(null)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        FloatingToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const toolbar = container.querySelector('.bc-floating-toolbar')
    expect(toolbar).toBeNull()
  })

  it('should not render when no text is selected (collapsed selection)', () => {
    mockLexicalGetSelection.mockReturnValueOnce({
      isCollapsed: vi.fn(() => true),
      hasFormat: vi.fn(() => false),
    })

    // Mock native selection as collapsed too
    global.window.getSelection = vi.fn(() => ({
      rangeCount: 1,
      isCollapsed: true,
      getRangeAt: vi.fn(() => ({
        getBoundingClientRect: vi.fn(() => ({
          top: 100, left: 200, bottom: 120, right: 300,
          width: 0, height: 0, x: 200, y: 100,
        })),
      })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any)

    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        FloatingToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    // Trigger state update to check visibility
    stateUpdate.set(1)

    const toolbar = container.querySelector('.bc-floating-toolbar')
    expect(toolbar).toBeNull()
  })

  it('should render with correct CSS class when text is selected', async () => {
    mockIsRangeSelection.mockReturnValue(true)
    mockLexicalGetSelection.mockReturnValue({
      isCollapsed: vi.fn(() => false),
      hasFormat: vi.fn(() => false),
      anchor: {
        getNode: vi.fn(() => ({
          getParent: vi.fn(() => null),
          getType: vi.fn(() => 'text'),
        })),
      },
    })

    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        FloatingToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    // Trigger state update to show toolbar
    stateUpdate.set(1)
    await new Promise(resolve => setTimeout(resolve, 50))

    const toolbar = container.querySelector('.bc-floating-toolbar')
    expect(toolbar).not.toBeNull()
  })

  it('should contain text formatting buttons (bold, italic, underline, strikethrough, code)', async () => {
    mockIsRangeSelection.mockReturnValue(true)
    mockLexicalGetSelection.mockReturnValue({
      isCollapsed: vi.fn(() => false),
      hasFormat: vi.fn(() => false),
      anchor: {
        getNode: vi.fn(() => ({
          getParent: vi.fn(() => null),
          getType: vi.fn(() => 'text'),
        })),
      },
    })

    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        FloatingToolbar({
          editor: editorSignal,
          stateUpdate,
          groups: ['text-formatting'],
        })
      ),
      container
    )

    // Trigger state update to show toolbar
    stateUpdate.set(1)
    await new Promise(resolve => setTimeout(resolve, 50))

    const toolbar = container.querySelector('.bc-floating-toolbar')
    expect(toolbar).not.toBeNull()

    const buttons = toolbar?.querySelectorAll('button')
    expect(buttons).toBeDefined()
    expect(buttons!.length).toBeGreaterThanOrEqual(5)

    // Check for formatting buttons by their title attributes
    const buttonTitles = Array.from(buttons!).map(btn => btn.getAttribute('title'))
    expect(buttonTitles).toContain('Bold')
    expect(buttonTitles).toContain('Italic')
    expect(buttonTitles).toContain('Underline')
    expect(buttonTitles).toContain('Strikethrough')
    expect(buttonTitles).toContain('Code')
  })

  it('should contain link button when links group included', async () => {
    mockIsRangeSelection.mockReturnValue(true)
    mockLexicalGetSelection.mockReturnValue({
      isCollapsed: vi.fn(() => false),
      hasFormat: vi.fn(() => false),
      anchor: {
        getNode: vi.fn(() => ({
          getParent: vi.fn(() => null),
          getType: vi.fn(() => 'text'),
        })),
      },
    })

    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        FloatingToolbar({
          editor: editorSignal,
          stateUpdate,
          groups: ['text-formatting', 'links'],
        })
      ),
      container
    )

    // Trigger state update to show toolbar
    stateUpdate.set(1)
    await new Promise(resolve => setTimeout(resolve, 50))

    const toolbar = container.querySelector('.bc-floating-toolbar')
    expect(toolbar).not.toBeNull()

    const buttons = toolbar?.querySelectorAll('button')
    const buttonTitles = Array.from(buttons!).map(btn => btn.getAttribute('title'))
    expect(buttonTitles).toContain('Link')
  })

  it('should hide when Escape is pressed', async () => {
    mockIsRangeSelection.mockReturnValue(true)
    mockLexicalGetSelection.mockReturnValue({
      isCollapsed: vi.fn(() => false),
      hasFormat: vi.fn(() => false),
      anchor: {
        getNode: vi.fn(() => ({
          getParent: vi.fn(() => null),
          getType: vi.fn(() => 'text'),
        })),
      },
    })

    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        FloatingToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    // Trigger state update to show toolbar
    stateUpdate.set(1)
    await new Promise(resolve => setTimeout(resolve, 50))

    let toolbar = container.querySelector('.bc-floating-toolbar')
    expect(toolbar).not.toBeNull()

    // Simulate Escape key press
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    document.dispatchEvent(escapeEvent)

    await new Promise(resolve => setTimeout(resolve, 50))

    toolbar = container.querySelector('.bc-floating-toolbar')
    expect(toolbar).toBeNull()
  })

  it('should update visibility based on stateUpdate signal', async () => {
    mockIsRangeSelection.mockReturnValue(true)

    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        FloatingToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    // Initially collapsed selection (native mock must also reflect this)
    mockLexicalGetSelection.mockReturnValue({
      isCollapsed: vi.fn(() => true),
      hasFormat: vi.fn(() => false),
    })
    global.window.getSelection = vi.fn(() => ({
      rangeCount: 1,
      isCollapsed: true,
      getRangeAt: vi.fn(() => ({
        getBoundingClientRect: vi.fn(() => ({
          top: 100, left: 200, bottom: 120, right: 300,
          width: 0, height: 0, x: 200, y: 100,
        })),
      })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any)

    stateUpdate.set(1)
    await new Promise(resolve => setTimeout(resolve, 50))

    let toolbar = container.querySelector('.bc-floating-toolbar')
    expect(toolbar).toBeNull()

    // Now with non-collapsed selection
    mockLexicalGetSelection.mockReturnValue({
      isCollapsed: vi.fn(() => false),
      hasFormat: vi.fn(() => false),
      anchor: {
        getNode: vi.fn(() => ({
          getParent: vi.fn(() => null),
          getType: vi.fn(() => 'text'),
        })),
      },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.window.getSelection = vi.fn(mockWindowGetSelection as any)

    stateUpdate.set(2)
    await new Promise(resolve => setTimeout(resolve, 50))

    toolbar = container.querySelector('.bc-floating-toolbar')
    expect(toolbar).not.toBeNull()
  })

  it('should dispatch FORMAT_TEXT_COMMAND on button clicks', async () => {
    mockIsRangeSelection.mockReturnValue(true)
    mockLexicalGetSelection.mockReturnValue({
      isCollapsed: vi.fn(() => false),
      hasFormat: vi.fn(() => false),
      anchor: {
        getNode: vi.fn(() => ({
          getParent: vi.fn(() => null),
          getType: vi.fn(() => 'text'),
        })),
      },
    })

    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        FloatingToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    // Trigger state update to show toolbar
    stateUpdate.set(1)
    await new Promise(resolve => setTimeout(resolve, 50))

    const toolbar = container.querySelector('.bc-floating-toolbar')
    const buttons = toolbar?.querySelectorAll('button')
    const boldButton = Array.from(buttons!).find(btn => btn.getAttribute('title') === 'Bold')

    expect(boldButton).not.toBeUndefined()
    boldButton?.click()

    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith('format-text', 'bold')
    expect(mockEditor.focus).toHaveBeenCalled()
  })

  it('should not render when readOnly is true (all buttons disabled)', async () => {
    mockIsRangeSelection.mockReturnValue(true)
    mockLexicalGetSelection.mockReturnValue({
      isCollapsed: vi.fn(() => false),
      hasFormat: vi.fn(() => false),
      anchor: {
        getNode: vi.fn(() => ({
          getParent: vi.fn(() => null),
          getType: vi.fn(() => 'text'),
        })),
      },
    })

    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)
    const readOnly = signal(true)

    render(
      WithProviders(() =>
        FloatingToolbar({
          editor: editorSignal,
          stateUpdate,
          readOnly,
        })
      ),
      container
    )

    // Trigger state update to show toolbar
    stateUpdate.set(1)
    await new Promise(resolve => setTimeout(resolve, 50))

    const toolbar = container.querySelector('.bc-floating-toolbar')
    expect(toolbar).not.toBeNull()

    // All buttons should be disabled
    const buttons = toolbar?.querySelectorAll('button')
    buttons?.forEach(button => {
      expect(button.disabled).toBe(true)
    })
  })
})

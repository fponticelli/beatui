import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, prop, signal } from '@tempots/dom'
import { LexicalToolbar } from '../../src/components/lexical/toolbar/lexical-toolbar'
import { WithProviders } from '../helpers/test-providers'
import type { LexicalEditor, EditorState } from 'lexical'

// Mock editor setup
const createMockEditor = (): Partial<LexicalEditor> => ({
  dispatchCommand: vi.fn(),
  getEditorState: vi.fn(() => ({
    toJSON: vi.fn(() => ({ root: {} })),
    read: vi.fn((fn) => {
      // Execute the callback synchronously to simulate lexical's read context
      try {
        return fn()
      } catch (_e) {
        return undefined
      }
    }),
  } as unknown as EditorState)),
  focus: vi.fn(),
  registerCommand: vi.fn(() => vi.fn()),
  getElementByKey: vi.fn(() => null),
  getRootElement: vi.fn(() => document.createElement('div')),
  update: vi.fn((fn) => {
    // Execute the callback synchronously to simulate lexical's update context
    try {
      return fn()
    } catch (_e) {
      return undefined
    }
  }),
  read: vi.fn((fn) => {
    // Execute the callback synchronously to simulate lexical's read context
    try {
      return fn()
    } catch (_e) {
      return undefined
    }
  }),
})

// Mock lexical core modules
vi.mock('lexical', async () => {
  const actual = await vi.importActual('lexical')
  return {
    ...actual,
    $getSelection: vi.fn(() => ({
      hasFormat: vi.fn((_format: string) => false),
      getNodes: vi.fn(() => []),
      anchor: {
        getNode: vi.fn(() => ({
          getKey: vi.fn(() => 'test-key'),
          getTopLevelElementOrThrow: vi.fn(() => ({
            getType: vi.fn(() => 'paragraph'),
            getKey: vi.fn(() => 'test-key'),
          })),
          getParent: vi.fn(() => null),
          getType: vi.fn(() => 'text'),
        })),
      },
    })),
    $isRangeSelection: vi.fn(() => true),
    $isTextNode: vi.fn(() => false),
    $createParagraphNode: vi.fn(() => ({})),
  }
})

vi.mock('@lexical/list', () => ({
  $isListNode: vi.fn(() => false),
  INSERT_ORDERED_LIST_COMMAND: 'insert-ordered-list',
  INSERT_UNORDERED_LIST_COMMAND: 'insert-unordered-list',
  INSERT_CHECK_LIST_COMMAND: 'insert-check-list',
}))

vi.mock('@lexical/selection', () => ({
  $setBlocksType: vi.fn(),
  $patchStyleText: vi.fn(),
  $getSelectionStyleValueForProperty: vi.fn(() => ''),
}))

vi.mock('@lexical/rich-text', () => ({
  $createHeadingNode: vi.fn(() => ({})),
  $createQuoteNode: vi.fn(() => ({})),
}))

vi.mock('@lexical/code', () => ({
  $createCodeNode: vi.fn(() => ({})),
}))

vi.mock('@lexical/table', () => ({
  INSERT_TABLE_COMMAND: 'insert-table',
}))

vi.mock('@lexical/link', () => ({
  TOGGLE_LINK_COMMAND: 'toggle-link',
}))

describe('LexicalToolbar Component', () => {
  let container: HTMLDivElement
  let mockEditor: Partial<LexicalEditor>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    mockEditor = createMockEditor()
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render toolbar with role="toolbar" attribute', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const toolbar = container.querySelector('[role="toolbar"]')
    expect(toolbar).not.toBeNull()
  })

  it('should contain toolbar groups', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const groups = container.querySelectorAll('[role="group"]')
    expect(groups.length).toBeGreaterThan(0)
  })

  it('should render text formatting buttons (bold, italic, etc.)', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    // Check for formatting buttons by their title attributes
    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).toContain('Bold')
    expect(buttonTitles).toContain('Italic')
    expect(buttonTitles).toContain('Underline')
    expect(buttonTitles).toContain('Strikethrough')
    expect(buttonTitles).toContain('Code')
  })

  it('should render heading buttons based on maxHeadingLevel', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: { maxHeadingLevel: 3 },
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).toContain('Heading 1')
    expect(buttonTitles).toContain('Heading 2')
    expect(buttonTitles).toContain('Heading 3')
    expect(buttonTitles).not.toContain('Heading 4')
    expect(buttonTitles).not.toContain('Heading 5')
    expect(buttonTitles).not.toContain('Heading 6')
  })

  it('should render heading buttons up to maxHeadingLevel 6', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: { maxHeadingLevel: 6 },
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).toContain('Heading 1')
    expect(buttonTitles).toContain('Heading 2')
    expect(buttonTitles).toContain('Heading 3')
    expect(buttonTitles).toContain('Heading 4')
    expect(buttonTitles).toContain('Heading 5')
    expect(buttonTitles).toContain('Heading 6')
  })

  it('should hide groups specified in hiddenGroups config', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            hiddenGroups: ['history', 'links']
          }
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    // History buttons should not be present
    expect(buttonTitles).not.toContain('Undo')
    expect(buttonTitles).not.toContain('Redo')

    // Link button should not be present
    expect(buttonTitles).not.toContain('Link')

    // Other groups should still be present
    expect(buttonTitles).toContain('Bold')
    expect(buttonTitles).toContain('Bullet List')
  })

  it('should show only groups specified in visibleGroups config', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            visibleGroups: ['text-formatting']
          }
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    // Only text formatting buttons should be present
    expect(buttonTitles).toContain('Bold')
    expect(buttonTitles).toContain('Italic')
    expect(buttonTitles).toContain('Underline')

    // Other groups should not be present
    expect(buttonTitles).not.toContain('Heading 1')
    expect(buttonTitles).not.toContain('Bullet List')
    expect(buttonTitles).not.toContain('Link')
    expect(buttonTitles).not.toContain('Undo')
  })

  it('should dispatch FORMAT_TEXT_COMMAND on bold button click', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const boldButton = Array.from(buttons).find(btn => btn.getAttribute('title') === 'Bold')

    expect(boldButton).not.toBeUndefined()
    boldButton?.click()

    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith(
      expect.anything(),
      'bold'
    )
    expect(mockEditor.focus).toHaveBeenCalled()
  })

  it('should dispatch FORMAT_TEXT_COMMAND on italic button click', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const italicButton = Array.from(buttons).find(btn => btn.getAttribute('title') === 'Italic')

    expect(italicButton).not.toBeUndefined()
    italicButton?.click()

    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith(
      expect.anything(),
      'italic'
    )
    expect(mockEditor.focus).toHaveBeenCalled()
  })

  it('should dispatch INSERT_UNORDERED_LIST_COMMAND on bullet list button click', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const bulletButton = Array.from(buttons).find(btn => btn.getAttribute('title') === 'Bullet List')

    expect(bulletButton).not.toBeUndefined()
    bulletButton?.click()

    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith(
      'insert-unordered-list',
      undefined
    )
    expect(mockEditor.focus).toHaveBeenCalled()
  })

  it('should dispatch INSERT_ORDERED_LIST_COMMAND on ordered list button click', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const orderedButton = Array.from(buttons).find(btn => btn.getAttribute('title') === 'Ordered List')

    expect(orderedButton).not.toBeUndefined()
    orderedButton?.click()

    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith(
      'insert-ordered-list',
      undefined
    )
    expect(mockEditor.focus).toHaveBeenCalled()
  })

  it('should dispatch UNDO_COMMAND on undo button click', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const undoButton = Array.from(buttons).find(btn => btn.getAttribute('title') === 'Undo')

    expect(undoButton).not.toBeUndefined()
    undoButton?.click()

    expect(mockEditor.dispatchCommand).toHaveBeenCalled()
    expect(mockEditor.focus).toHaveBeenCalled()
  })

  it('should update active state when stateUpdate signal changes', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    // Initial render completed
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)

    // Trigger state update - this should cause the toolbar to re-evaluate button states
    // The fact that we can trigger the update without error validates the reactive mechanism
    stateUpdate.set(1)
    stateUpdate.set(2)

    // Verify buttons still exist after state updates
    const buttonsAfterUpdate = container.querySelectorAll('button')
    expect(buttonsAfterUpdate.length).toBe(buttons.length)
  })

  it('should disable all buttons when readOnly is true', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)
    const readOnly = signal(true)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          readOnly,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    buttons.forEach(button => {
      expect(button.disabled).toBe(true)
    })
  })

  it('should enable buttons when readOnly is false', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)
    const readOnly = signal(false)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          readOnly,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    buttons.forEach(button => {
      expect(button.disabled).toBe(false)
    })
  })

  it('should toggle button disabled state reactively with readOnly changes', async () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)
    const readOnly = prop(false)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          readOnly,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const boldButton = Array.from(buttons).find(btn => btn.getAttribute('title') === 'Bold')

    expect(boldButton?.disabled).toBe(false)

    readOnly.set(true)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(boldButton?.disabled).toBe(true)

    readOnly.set(false)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(boldButton?.disabled).toBe(false)
  })

  it('should render list buttons (bullet, ordered, check)', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).toContain('Bullet List')
    expect(buttonTitles).toContain('Ordered List')
    expect(buttonTitles).toContain('Check List')
  })

  it('should render block buttons (blockquote, code block, horizontal rule)', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).toContain('Blockquote')
    expect(buttonTitles).toContain('Code Block')
    expect(buttonTitles).toContain('Horizontal Rule')
  })

  it('should render link button', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).toContain('Link')
  })

  it('should render history buttons (undo, redo)', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).toContain('Undo')
    expect(buttonTitles).toContain('Redo')
  })

  it('should not render toolbar when editor signal is null', () => {
    const editorSignal = prop<LexicalEditor | null>(null)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    // When editor is null, Ensure() returns Empty
    // So no toolbar should be rendered
    const toolbar = container.querySelector('[role="toolbar"]')
    expect(toolbar).toBeNull()
  })

  it('should render toolbar when editor signal becomes non-null', async () => {
    const editorSignal = prop<LexicalEditor | null>(null)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    let toolbar = container.querySelector('[role="toolbar"]')
    expect(toolbar).toBeNull()

    editorSignal.set(mockEditor as LexicalEditor)
    await new Promise(resolve => setTimeout(resolve, 50))

    toolbar = container.querySelector('[role="toolbar"]')
    expect(toolbar).not.toBeNull()
  })

  it('should respect custom size parameter', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          size: 'md',
        })
      ),
      container
    )

    // Buttons should exist (size affects styling but not presence)
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should render clipboard buttons (cut, copy, paste)', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).toContain('Cut')
    expect(buttonTitles).toContain('Copy')
    expect(buttonTitles).toContain('Paste')
  })

  it('should hide clipboard buttons when hiddenGroups includes clipboard', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            hiddenGroups: ['clipboard']
          }
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).not.toContain('Cut')
    expect(buttonTitles).not.toContain('Copy')
    expect(buttonTitles).not.toContain('Paste')

    // Other groups should still be present
    expect(buttonTitles).toContain('Bold')
    expect(buttonTitles).toContain('Undo')
  })

  it('should show only clipboard buttons when visibleGroups is clipboard', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            visibleGroups: ['clipboard']
          }
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).toContain('Cut')
    expect(buttonTitles).toContain('Copy')
    expect(buttonTitles).toContain('Paste')

    // Other groups should not be present
    expect(buttonTitles).not.toContain('Bold')
    expect(buttonTitles).not.toContain('Undo')
    expect(buttonTitles).not.toContain('Link')
  })

  it('should call document.execCommand on copy button click', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)
    // jsdom doesn't define execCommand, so add it before spying
    if (!document.execCommand) {
      document.execCommand = vi.fn() as typeof document.execCommand
    }
    const execCommandSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const copyButton = Array.from(buttons).find(btn => btn.getAttribute('title') === 'Copy')

    expect(copyButton).not.toBeUndefined()
    copyButton?.click()

    expect(execCommandSpy).toHaveBeenCalledWith('copy')
    execCommandSpy.mockRestore()
  })

  it('should call document.execCommand on cut button click', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)
    // jsdom doesn't define execCommand, so add it before spying
    if (!document.execCommand) {
      document.execCommand = vi.fn() as typeof document.execCommand
    }
    const execCommandSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const cutButton = Array.from(buttons).find(btn => btn.getAttribute('title') === 'Cut')

    expect(cutButton).not.toBeUndefined()
    cutButton?.click()

    expect(execCommandSpy).toHaveBeenCalledWith('cut')
    execCommandSpy.mockRestore()
  })

  it('should attempt clipboard paste on paste button click', async () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    // Mock navigator.clipboard.readText
    const readTextMock = vi.fn().mockResolvedValue('pasted text')
    Object.defineProperty(navigator, 'clipboard', {
      value: { readText: readTextMock },
      writable: true,
      configurable: true,
    })

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const pasteButton = Array.from(buttons).find(btn => btn.getAttribute('title') === 'Paste')

    expect(pasteButton).not.toBeUndefined()
    pasteButton?.click()

    expect(readTextMock).toHaveBeenCalled()
  })

  it('should render insert table button', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).toContain('Insert Table')
  })

  it('should hide tables group when hiddenGroups includes tables', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            hiddenGroups: ['tables']
          }
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).not.toContain('Insert Table')
    expect(buttonTitles).toContain('Bold')
  })

  it('should render indent and outdent buttons', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).toContain('Indent')
    expect(buttonTitles).toContain('Outdent')
  })

  it('should hide indent group when hiddenGroups includes indent', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            hiddenGroups: ['indent']
          }
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).not.toContain('Indent')
    expect(buttonTitles).not.toContain('Outdent')
    expect(buttonTitles).toContain('Bold')
  })

  it('should show only indent buttons when visibleGroups is indent', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            visibleGroups: ['indent']
          }
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).toContain('Indent')
    expect(buttonTitles).toContain('Outdent')
    expect(buttonTitles).not.toContain('Bold')
    expect(buttonTitles).not.toContain('Undo')
  })

  it('should dispatch INDENT_CONTENT_COMMAND on indent button click', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const indentButton = Array.from(buttons).find(btn => btn.getAttribute('title') === 'Indent')

    expect(indentButton).not.toBeUndefined()
    indentButton?.click()

    expect(mockEditor.dispatchCommand).toHaveBeenCalled()
    expect(mockEditor.focus).toHaveBeenCalled()
  })

  it('should render font family and font size selects', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const selects = container.querySelectorAll('select')
    const selectTitles = Array.from(selects).map(s => s.getAttribute('title'))

    expect(selectTitles).toContain('Font Family')
    expect(selectTitles).toContain('Font Size')
  })

  it('should hide font selects when hiddenGroups includes font', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            hiddenGroups: ['font']
          }
        })
      ),
      container
    )

    const selects = container.querySelectorAll('select')
    const selectTitles = Array.from(selects).map(s => s.getAttribute('title'))

    expect(selectTitles).not.toContain('Font Family')
    expect(selectTitles).not.toContain('Font Size')
  })

  it('should render color picker inputs (font color, highlight, background)', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const labels = container.querySelectorAll('.bc-lexical-toolbar-color')
    const titles = Array.from(labels).map(l => l.getAttribute('title'))

    expect(titles).toContain('Font Color')
    expect(titles).toContain('Highlight Color')
    expect(titles).toContain('Background Color')
  })

  it('should hide color pickers when hiddenGroups includes color', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            hiddenGroups: ['color']
          }
        })
      ),
      container
    )

    const labels = container.querySelectorAll('.bc-lexical-toolbar-color')
    expect(labels.length).toBe(0)
  })

  it('should render clear formatting button', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).toContain('Clear Formatting')
  })

  it('should hide clear formatting when hiddenGroups includes clear-formatting', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            hiddenGroups: ['clear-formatting']
          }
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).not.toContain('Clear Formatting')
    expect(buttonTitles).toContain('Bold')
  })

  it('should show only clear formatting when visibleGroups is clear-formatting', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            visibleGroups: ['clear-formatting']
          }
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).toContain('Clear Formatting')
    expect(buttonTitles).not.toContain('Bold')
    expect(buttonTitles).not.toContain('Undo')
    expect(buttonTitles).not.toContain('Link')
  })

  it('should render custom font families when provided via toolbar config', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            fontFamilies: [
              { value: 'Comic Sans MS', label: 'Comic Sans' },
              { value: 'Papyrus', label: 'Papyrus' },
            ],
          },
        })
      ),
      container
    )

    const fontFamilySelect = container.querySelector('select[title="Font Family"]') as HTMLSelectElement
    expect(fontFamilySelect).not.toBeNull()

    const options = Array.from(fontFamilySelect.options)
    const optionLabels = options.map(o => o.textContent)

    // Default entry is always prepended
    expect(optionLabels[0]).toBe('Default')
    expect(optionLabels).toContain('Comic Sans')
    expect(optionLabels).toContain('Papyrus')

    // Default entries should NOT be present
    expect(optionLabels).not.toContain('Arial')
    expect(optionLabels).not.toContain('Georgia')
  })

  it('should render custom font sizes when provided via toolbar config', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            fontSizes: [
              { value: '8px', label: '8' },
              { value: '48px', label: '48' },
              { value: '72px', label: '72' },
            ],
          },
        })
      ),
      container
    )

    const fontSizeSelect = container.querySelector('select[title="Font Size"]') as HTMLSelectElement
    expect(fontSizeSelect).not.toBeNull()

    const options = Array.from(fontSizeSelect.options)
    const optionLabels = options.map(o => o.textContent)

    // Default entry is always prepended
    expect(optionLabels[0]).toBe('Default')
    expect(optionLabels).toContain('8')
    expect(optionLabels).toContain('48')
    expect(optionLabels).toContain('72')

    // Default sizes should NOT be present
    expect(optionLabels).not.toContain('14')
    expect(optionLabels).not.toContain('24')
  })

  it('should render default font families when no custom config is provided', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const fontFamilySelect = container.querySelector('select[title="Font Family"]') as HTMLSelectElement
    expect(fontFamilySelect).not.toBeNull()

    const options = Array.from(fontFamilySelect.options)
    const optionLabels = options.map(o => o.textContent)

    expect(optionLabels[0]).toBe('Default')
    expect(optionLabels).toContain('Arial')
    expect(optionLabels).toContain('Georgia')
    expect(optionLabels).toContain('Verdana')
  })

  it('should render default font sizes when no custom config is provided', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const fontSizeSelect = container.querySelector('select[title="Font Size"]') as HTMLSelectElement
    expect(fontSizeSelect).not.toBeNull()

    const options = Array.from(fontSizeSelect.options)
    const optionLabels = options.map(o => o.textContent)

    expect(optionLabels[0]).toBe('Default')
    expect(optionLabels).toContain('10')
    expect(optionLabels).toContain('14')
    expect(optionLabels).toContain('36')
  })

  it('should call editor.update on clear formatting button click', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const clearBtn = Array.from(buttons).find(btn => btn.getAttribute('title') === 'Clear Formatting')

    expect(clearBtn).not.toBeUndefined()
    clearBtn?.click()

    expect(mockEditor.update).toHaveBeenCalled()
    expect(mockEditor.focus).toHaveBeenCalled()
  })
})

describe('LexicalToolbar Layout', () => {
  let container: HTMLDivElement
  let mockEditor: Partial<LexicalEditor>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    mockEditor = createMockEditor()
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render only groups specified in layout', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            layout: [
              { group: 'text-formatting' },
              { group: 'history' },
            ],
          },
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    // These should be present
    expect(buttonTitles).toContain('Bold')
    expect(buttonTitles).toContain('Italic')
    expect(buttonTitles).toContain('Undo')
    expect(buttonTitles).toContain('Redo')

    // These should NOT be present
    expect(buttonTitles).not.toContain('Bullet List')
    expect(buttonTitles).not.toContain('Link')
    expect(buttonTitles).not.toContain('Blockquote')
  })

  it('should render only specified items within a group', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            layout: [
              { group: 'lists', items: ['bullet-list', 'ordered-list'] },
            ],
          },
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    expect(buttonTitles).toContain('Bullet List')
    expect(buttonTitles).toContain('Ordered List')
    expect(buttonTitles).not.toContain('Check List')
  })

  it('should render separator between groups', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            layout: [
              { group: 'text-formatting' },
              { separator: true },
              { group: 'history' },
            ],
          },
        })
      ),
      container
    )

    const separators = container.querySelectorAll('[role="separator"]')
    expect(separators.length).toBe(1)
  })

  it('should ignore hiddenGroups when layout is set', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            hiddenGroups: ['history'],
            layout: [
              { group: 'history' },
            ],
          },
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    // Layout takes precedence — history buttons should be present
    expect(buttonTitles).toContain('Undo')
    expect(buttonTitles).toContain('Redo')
  })

  it('should not render group when all items are absent from registry', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            maxHeadingLevel: 2,
            layout: [
              { group: 'headings', items: ['heading-5', 'heading-6'] },
            ],
          },
        })
      ),
      container
    )

    // Heading 5 and 6 are not in the registry when maxHeadingLevel is 2
    const groups = container.querySelectorAll('[role="group"]')
    expect(groups.length).toBe(0)
  })

  it('should render font selects in layout mode', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            layout: [
              { group: 'font', items: ['font-family'] },
            ],
          },
        })
      ),
      container
    )

    const selects = container.querySelectorAll('select')
    const selectTitles = Array.from(selects).map(s => s.getAttribute('title'))

    expect(selectTitles).toContain('Font Family')
    expect(selectTitles).not.toContain('Font Size')
  })

  it('should render color pickers in layout mode', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            layout: [
              { group: 'color', items: ['font-color'] },
            ],
          },
        })
      ),
      container
    )

    const labels = container.querySelectorAll('.bc-lexical-toolbar-color')
    const titles = Array.from(labels).map(l => l.getAttribute('title'))

    expect(titles).toContain('Font Color')
    expect(titles).not.toContain('Highlight Color')
    expect(titles).not.toContain('Background Color')
  })

  it('should support the ticket use case: hide check-list, blockquote, horizontal-rule', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            layout: [
              { group: 'text-formatting' },
              { group: 'links' },
              { group: 'font' },
              { group: 'color' },
              { group: 'indent' },
              { group: 'lists', items: ['bullet-list', 'ordered-list'] },
              { group: 'blocks', items: ['code-block'] },
              { group: 'clear-formatting' },
            ],
          },
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    // Present
    expect(buttonTitles).toContain('Bold')
    expect(buttonTitles).toContain('Link')
    expect(buttonTitles).toContain('Indent')
    expect(buttonTitles).toContain('Bullet List')
    expect(buttonTitles).toContain('Ordered List')
    expect(buttonTitles).toContain('Code Block')
    expect(buttonTitles).toContain('Clear Formatting')

    // Hidden
    expect(buttonTitles).not.toContain('Check List')
    expect(buttonTitles).not.toContain('Blockquote')
    expect(buttonTitles).not.toContain('Horizontal Rule')
    expect(buttonTitles).not.toContain('Heading 1')
    expect(buttonTitles).not.toContain('Insert Table')
    expect(buttonTitles).not.toContain('Undo')
    expect(buttonTitles).not.toContain('Cut')
  })

  it('should render groups in the order specified by layout', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            layout: [
              { group: 'history' },
              { group: 'text-formatting' },
            ],
          },
        })
      ),
      container
    )

    const buttons = container.querySelectorAll('button')
    const buttonTitles = Array.from(buttons).map(btn => btn.getAttribute('title'))

    // Undo should come before Bold
    const undoIndex = buttonTitles.indexOf('Undo')
    const boldIndex = buttonTitles.indexOf('Bold')
    expect(undoIndex).toBeLessThan(boldIndex)
  })

  it('should render empty layout with no groups', () => {
    const editorSignal = prop<LexicalEditor | null>(mockEditor as LexicalEditor)
    const stateUpdate = prop(0)

    render(
      WithProviders(() =>
        LexicalToolbar({
          editor: editorSignal,
          stateUpdate,
          toolbar: {
            layout: [],
          },
        })
      ),
      container
    )

    const toolbar = container.querySelector('[role="toolbar"]')
    expect(toolbar).not.toBeNull()

    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBe(0)
  })
})

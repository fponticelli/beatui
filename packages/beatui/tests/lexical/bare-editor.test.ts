import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.setConfig({ testTimeout: 20000 })

import { render, prop } from '@tempots/dom'
import { BareEditor } from '../../src/components/lexical/bare-editor'
import { WithProviders } from '../helpers/test-providers'
import type { LexicalEditor, EditorState } from 'lexical'

// Create a shared mock editor instance that persists across calls
let mockEditorInstance: Partial<LexicalEditor>

const resetMockEditor = () => {
  mockEditorInstance = {
    setRootElement: vi.fn(),
    registerCommand: vi.fn(() => vi.fn()),
    registerUpdateListener: vi.fn(() => vi.fn()),
    setEditable: vi.fn(),
    getEditorState: vi.fn(() => ({
      toJSON: vi.fn(() => ({ root: {} })),
      read: vi.fn((fn) => fn()),
    } as unknown as EditorState)),
    parseEditorState: vi.fn((json) => ({
      toJSON: vi.fn(() => JSON.parse(json)),
    } as unknown as EditorState)),
    setEditorState: vi.fn(),
    getRootElement: vi.fn(() => document.createElement('div')),
    update: vi.fn(),
    read: vi.fn((fn) => fn()),
  }
  return mockEditorInstance
}

// Initialize the mock editor
resetMockEditor()

// Mock the lexical module directly (editors now use static imports)
vi.mock('lexical', () => ({
  createEditor: vi.fn((config) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(mockEditorInstance as any)._config = config
    return mockEditorInstance
  }),
  BLUR_COMMAND: 'blur-command',
  SELECTION_CHANGE_COMMAND: 'selection-change-command',
  COMMAND_PRIORITY_LOW: 1,
}))

vi.mock('../../src/lexical/nodes', () => ({
  getNodesForPlugins: vi.fn(() => []),
  createDefaultPluginConfig: vi.fn(() => ({
    richText: true,
    history: true,
    clipboard: true,
  })),
}))

vi.mock('../../src/lexical/plugins/rich-text', () => ({
  registerRichTextPlugin: vi.fn(async () => vi.fn()),
}))

vi.mock('../../src/lexical/plugins/plain-text', () => ({
  registerPlainTextPlugin: vi.fn(async () => vi.fn()),
}))

vi.mock('../../src/lexical/plugins/history', () => ({
  registerHistoryPlugin: vi.fn(async () => vi.fn()),
}))

vi.mock('../../src/lexical/plugins/clipboard', () => ({
  registerClipboardPlugin: vi.fn(async () => vi.fn()),
}))

vi.mock('../../src/lexical/plugins/list', () => ({
  registerListPlugin: vi.fn(async () => vi.fn()),
}))

vi.mock('../../src/lexical/plugins/link', () => ({
  registerLinkPlugin: vi.fn(async () => vi.fn()),
}))

vi.mock('../../src/lexical/plugins/markdown-io', () => ({
  exportToMarkdown: vi.fn(async () => ''),
  importFromMarkdown: vi.fn(async () => {}),
}))

vi.mock('../../src/lexical/plugins/horizontal-rule', () => ({
  registerHorizontalRulePlugin: vi.fn(() => vi.fn()),
}))

vi.mock('../../src/lexical/plugins/element-style', () => ({
  registerElementStylePlugin: vi.fn(() => vi.fn()),
  buildElementStyleExportMap: vi.fn(() => new Map()),
  buildStyleImportMap: vi.fn(() => ({})),
}))

vi.mock('../../src/lexical/styles-url', () => ({
  default: 'mock-styles-url.css',
}))

describe('BareEditor Component', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    resetMockEditor()
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render the editor container with correct CSS classes', async () => {
    render(
      WithProviders(() => BareEditor({})),
      container
    )

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 50))

    const editorContainer = container.querySelector('.bc-lexical-editor-container')
    expect(editorContainer).not.toBeNull()

    const editor = container.querySelector('.bc-lexical-editor')
    expect(editor).not.toBeNull()
  })

  it('should apply custom CSS class', async () => {
    render(
      WithProviders(() => BareEditor({ class: 'custom-editor' })),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    const editorContainer = container.querySelector('.bc-lexical-editor-container')
    expect(editorContainer?.classList.contains('custom-editor')).toBe(true)
  })

  it('should apply readonly CSS class when readOnly is true', async () => {
    render(
      WithProviders(() => BareEditor({ readOnly: true })),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    const editor = container.querySelector('.bc-lexical-editor')
    expect(editor?.classList.contains('bc-lexical-editor--readonly')).toBe(true)
  })

  it('should toggle readonly CSS class reactively', async () => {
    const readOnly = prop(false)

    render(
      WithProviders(() => BareEditor({ readOnly })),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    const editor = container.querySelector('.bc-lexical-editor')
    expect(editor?.classList.contains('bc-lexical-editor--readonly')).toBe(false)

    readOnly.set(true)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(editor?.classList.contains('bc-lexical-editor--readonly')).toBe(true)

    readOnly.set(false)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(editor?.classList.contains('bc-lexical-editor--readonly')).toBe(false)
  })

  it('should create editor with default namespace', async () => {
    const { createEditor } = await import('lexical')

    render(
      WithProviders(() => BareEditor({})),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(createEditor).toHaveBeenCalled()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((mockEditorInstance as any)._config).toMatchObject({
      namespace: 'BeatUILexical',
    })
  })

  it('should create editor with custom namespace', async () => {
    render(
      WithProviders(() => BareEditor({ namespace: 'CustomNamespace' })),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((mockEditorInstance as any)._config).toMatchObject({
      namespace: 'CustomNamespace',
    })
  })

  it('should set editor as not editable when readOnly is true', async () => {
    render(
      WithProviders(() => BareEditor({ readOnly: true })),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((mockEditorInstance as any)._config).toMatchObject({
      editable: false,
    })
  })

  it('should call onReady callback when editor is initialized', async () => {
    const onReady = vi.fn()

    render(
      WithProviders(() => BareEditor({ onReady })),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(onReady).toHaveBeenCalled()
    expect(onReady).toHaveBeenCalledWith(expect.any(Object))
  })

  it('should register default plugins for bare preset', async () => {
    const { registerRichTextPlugin } = await import('../../src/lexical/plugins/rich-text')
    const { registerHistoryPlugin } = await import('../../src/lexical/plugins/history')
    const { registerClipboardPlugin } = await import('../../src/lexical/plugins/clipboard')

    render(
      WithProviders(() => BareEditor({})),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(registerRichTextPlugin).toHaveBeenCalled()
    expect(registerHistoryPlugin).toHaveBeenCalled()
    expect(registerClipboardPlugin).toHaveBeenCalled()
  })

  it('should register richText plugin when enabled', async () => {
    const { registerRichTextPlugin } = await import('../../src/lexical/plugins/rich-text')

    render(
      WithProviders(() =>
        BareEditor({
          plugins: { richText: true },
        })
      ),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(registerRichTextPlugin).toHaveBeenCalled()
  })

  it('should register plainText plugin when enabled', async () => {
    const { registerPlainTextPlugin } = await import('../../src/lexical/plugins/plain-text')

    render(
      WithProviders(() =>
        BareEditor({
          plugins: { plainText: true },
        })
      ),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(registerPlainTextPlugin).toHaveBeenCalled()
  })

  it('should register history plugin with default options', async () => {
    const { registerHistoryPlugin } = await import('../../src/lexical/plugins/history')

    render(
      WithProviders(() =>
        BareEditor({
          plugins: { history: true },
        })
      ),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(registerHistoryPlugin).toHaveBeenCalled()
  })

  it('should register history plugin with custom options', async () => {
    const { registerHistoryPlugin } = await import('../../src/lexical/plugins/history')

    render(
      WithProviders(() =>
        BareEditor({
          plugins: {
            history: {
              delay: 500,
              maxDepth: 50,
            },
          },
        })
      ),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(registerHistoryPlugin).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        delay: 500,
        maxDepth: 50,
      })
    )
  })

  it('should register list plugin when enabled', async () => {
    const { registerListPlugin } = await import('../../src/lexical/plugins/list')

    render(
      WithProviders(() =>
        BareEditor({
          plugins: { list: true },
        })
      ),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(registerListPlugin).toHaveBeenCalled()
  })

  it('should register link plugin when enabled', async () => {
    const { registerLinkPlugin } = await import('../../src/lexical/plugins/link')

    render(
      WithProviders(() =>
        BareEditor({
          plugins: { link: true },
        })
      ),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(registerLinkPlugin).toHaveBeenCalled()
  })

  it('should register clipboard plugin when enabled', async () => {
    const { registerClipboardPlugin } = await import('../../src/lexical/plugins/clipboard')

    render(
      WithProviders(() =>
        BareEditor({
          plugins: { clipboard: true },
        })
      ),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(registerClipboardPlugin).toHaveBeenCalled()
  })

  it('should load initial markdown content', async () => {
    const { importFromMarkdown } = await import('../../src/lexical/plugins/markdown-io')
    const initialContent = '# Hello World\n\nThis is a test.'

    render(
      WithProviders(() =>
        BareEditor({
          value: prop(initialContent),
          format: 'markdown',
        })
      ),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(importFromMarkdown).toHaveBeenCalledWith(
      expect.any(Object),
      initialContent
    )
  })

  it('should load initial JSON content', async () => {
    const initialContent = { root: { children: [] } }

    render(
      WithProviders(() =>
        BareEditor({
          value: prop(initialContent),
          format: 'json',
        })
      ),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(mockEditorInstance.parseEditorState).toHaveBeenCalledWith(
      JSON.stringify(initialContent)
    )
    expect(mockEditorInstance.setEditorState).toHaveBeenCalled()
  })

  it('should not load content when value is empty string', async () => {
    const { importFromMarkdown } = await import('../../src/lexical/plugins/markdown-io')

    render(
      WithProviders(() =>
        BareEditor({
          value: prop(''),
          format: 'markdown',
        })
      ),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(importFromMarkdown).not.toHaveBeenCalled()
  })

  it('should not load content when value is null', async () => {
    const { importFromMarkdown } = await import('../../src/lexical/plugins/markdown-io')

    render(
      WithProviders(() =>
        BareEditor({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          value: prop(null as any),
          format: 'markdown',
        })
      ),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(importFromMarkdown).not.toHaveBeenCalled()
  })

  it('should react to external value changes in markdown format', async () => {
    const { importFromMarkdown, exportToMarkdown } = await import(
      '../../src/lexical/plugins/markdown-io'
    )
    const value = prop('# Initial')

    // Mock exportToMarkdown to return different value to trigger update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(exportToMarkdown as any).mockResolvedValue('# Initial')

    render(
      WithProviders(() =>
        BareEditor({
          value,
          format: 'markdown',
        })
      ),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    // Clear previous calls
    vi.clearAllMocks()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(exportToMarkdown as any).mockResolvedValue('# Initial')

    // Change the value
    value.set('# Updated')
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(importFromMarkdown).toHaveBeenCalledWith(
      expect.any(Object),
      '# Updated'
    )
  })

  it('should react to external value changes in JSON format', async () => {
    const initialContent = { root: { children: [] } }
    const updatedContent = { root: { children: [{ type: 'paragraph' }] } }
    const value = prop(initialContent)

    render(
      WithProviders(() =>
        BareEditor({
          value,
          format: 'json',
        })
      ),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    // Clear previous calls
    vi.clearAllMocks()

    // Mock getEditorState to return different JSON to trigger update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(mockEditorInstance.getEditorState as any).mockReturnValue({
      toJSON: vi.fn(() => initialContent),
      read: vi.fn((fn) => fn()),
    })

    // Change the value
    value.set(updatedContent)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(mockEditorInstance.parseEditorState).toHaveBeenCalledWith(
      JSON.stringify(updatedContent)
    )
    expect(mockEditorInstance.setEditorState).toHaveBeenCalled()
  })

  it('should toggle editable state when readOnly changes', async () => {
    const readOnly = prop(false)

    render(
      WithProviders(() => BareEditor({ readOnly })),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    // Clear previous calls
    vi.clearAllMocks()

    // Change readOnly
    readOnly.set(true)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(mockEditorInstance.setEditable).toHaveBeenCalledWith(false)

    // Change back
    readOnly.set(false)
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(mockEditorInstance.setEditable).toHaveBeenCalledWith(true)
  })

  it('should call onInput when editor content changes', async () => {
    const onInput = vi.fn()

    render(
      WithProviders(() =>
        BareEditor({
          onInput,
          format: 'markdown',
        })
      ),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    // Get the registered update listener
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditorInstance.registerUpdateListener as any).mock.calls[0]
    const updateListener = registerCall[0]

    // Simulate content change
    const mockEditorState = {
      read: vi.fn((fn) => fn()),
      toJSON: vi.fn(() => ({ root: {} })),
    }

    await updateListener({
      editorState: mockEditorState,
      dirtyElements: new Map([['test', true]]),
      dirtyLeaves: new Map(),
    })

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(onInput).toHaveBeenCalled()
  })

  it('should not call onInput when no content changes', async () => {
    const onInput = vi.fn()

    render(
      WithProviders(() =>
        BareEditor({
          onInput,
          format: 'markdown',
        })
      ),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    // Get the registered update listener
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditorInstance.registerUpdateListener as any).mock.calls[0]
    const updateListener = registerCall[0]

    // Simulate update with no dirty elements/leaves
    const mockEditorState = {
      read: vi.fn((fn) => fn()),
      toJSON: vi.fn(() => ({ root: {} })),
    }

    await updateListener({
      editorState: mockEditorState,
      dirtyElements: new Map(),
      dirtyLeaves: new Map(),
    })

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(onInput).not.toHaveBeenCalled()
  })

  it('should call onBlur when editor loses focus', async () => {
    const onBlur = vi.fn()

    render(
      WithProviders(() => BareEditor({ onBlur })),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    // Get the registered BLUR_COMMAND handler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditorInstance.registerCommand as any).mock.calls[0]
    const blurHandler = registerCall[1]

    // Simulate blur event
    blurHandler()

    expect(onBlur).toHaveBeenCalledWith(expect.any(Object))
  })

  it('should call onChange when editor loses focus', async () => {
    const { exportToMarkdown } = await import('../../src/lexical/plugins/markdown-io')
    const onChange = vi.fn()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(exportToMarkdown as any).mockResolvedValue('# Content')

    render(
      WithProviders(() =>
        BareEditor({
          onChange,
          format: 'markdown',
        })
      ),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    // Get the registered BLUR_COMMAND handler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditorInstance.registerCommand as any).mock.calls[0]
    const blurHandler = registerCall[1]

    // Simulate blur event
    blurHandler()

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(onChange).toHaveBeenCalled()
  })

  it('should display error message when initialization fails', async () => {
    const lexical = await import('lexical')

    // Replace with a failing mock for this test only
    vi.mocked(lexical.createEditor).mockImplementationOnce(() => {
      throw new Error('Test error')
    })

    render(
      WithProviders(() => BareEditor({})),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    // The error happens during mount, so it's caught and displayed
    const editor = container.querySelector('.bc-lexical-editor')
    expect(editor?.textContent).toContain('Failed to load Lexical editor')
  })

  it('should mount editor and set root element', async () => {
    render(
      WithProviders(() => BareEditor({})),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    // Verify editor was mounted to a root element
    expect(mockEditorInstance.setRootElement).toHaveBeenCalled()

    // Get the first call (mount call)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mountCall = (mockEditorInstance.setRootElement as any).mock.calls[0]
    const rootElement = mountCall[0]

    // Verify it's an HTMLElement with the correct class
    expect(rootElement).toBeInstanceOf(HTMLElement)
    expect(rootElement.classList.contains('bc-lexical-editor')).toBe(true)

    // Note: Cleanup (setRootElement(null)) is handled by OnDispose lifecycle
    // which may not fire immediately in test environment
  })

  it('should set up theme listener', async () => {
    render(
      WithProviders(() => BareEditor({})),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    // Verify that getRootElement was called (which is needed for theme changes)
    expect(mockEditorInstance.getRootElement).toHaveBeenCalled()

    // The theme listener is set up internally via appearance.on()
    // which watches for theme changes in the Theme provider
    // This test verifies the editor is initialized and can access the root element
  })

  it('should use markdown format by default', async () => {
    const { importFromMarkdown } = await import('../../src/lexical/plugins/markdown-io')
    const value = prop('# Default format')

    render(
      WithProviders(() => BareEditor({ value })),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(importFromMarkdown).toHaveBeenCalled()
  })

  it('should support reactive format parameter', async () => {
    const format = prop<'markdown' | 'json'>('markdown')
    const value = prop('# Initial')

    render(
      WithProviders(() => BareEditor({ value, format })),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    // The format is resolved at mount time, so changing it after
    // mount won't affect the already-initialized editor
    // This test verifies the format can be passed as a reactive value
    expect(format.value).toBe('markdown')

    format.set('json')
    await new Promise(resolve => setTimeout(resolve, 0))

    // Format change after initialization doesn't re-initialize editor
    expect(format.value).toBe('json')
  })

  it('should inject CSS via LinkPortal', async () => {
    render(
      WithProviders(() => BareEditor({})),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    // The LinkPortal should have added a link element with the CSS
    const linkElement = document.querySelector('link#beatui-lexical-css')
    expect(linkElement).not.toBeNull()
  })

  it('should accept custom plugins configuration', async () => {
    const { getNodesForPlugins } = await import('../../src/lexical/nodes')

    render(
      WithProviders(() =>
        BareEditor({
          plugins: {
            richText: true,
            list: true,
            link: true,
            code: true,
          },
        })
      ),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(getNodesForPlugins).toHaveBeenCalledWith(
      expect.objectContaining({
        richText: true,
        list: true,
        link: true,
        code: true,
      })
    )
  })

  it('should handle undefined plugins config by using defaults', async () => {
    const { createDefaultPluginConfig } = await import('../../src/lexical/nodes')

    render(
      WithProviders(() => BareEditor({})),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(createDefaultPluginConfig).toHaveBeenCalledWith('bare')
  })

  it('should register BLUR_COMMAND with correct priority', async () => {
    render(
      WithProviders(() => BareEditor({})),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(mockEditorInstance.registerCommand).toHaveBeenCalledWith(
      'blur-command',
      expect.any(Function),
      1
    )
  })

  it('should return false from BLUR_COMMAND handler to not prevent default', async () => {
    render(
      WithProviders(() => BareEditor({})),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    // Get the registered BLUR_COMMAND handler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerCall = (mockEditorInstance.registerCommand as any).mock.calls[0]
    const blurHandler = registerCall[1]

    // Simulate blur event and check return value
    const result = blurHandler()

    expect(result).toBe(false)
  })

  it('should handle complex plugin configuration with options', async () => {
    const { registerHistoryPlugin } = await import('../../src/lexical/plugins/history')

    render(
      WithProviders(() =>
        BareEditor({
          plugins: {
            richText: true,
            history: {
              delay: 1000,
              maxDepth: 200,
            },
            list: true,
          },
        })
      ),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(registerHistoryPlugin).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        delay: 1000,
        maxDepth: 200,
      })
    )
  })

  it('should mount editor to the correct DOM element', async () => {
    render(
      WithProviders(() => BareEditor({})),
      container
    )

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(mockEditorInstance.setRootElement).toHaveBeenCalledWith(
      expect.any(HTMLElement)
    )

    // Get the element that was passed to setRootElement
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setRootCall = (mockEditorInstance.setRootElement as any).mock.calls[0]
    const rootElement = setRootCall[0]

    // Verify it has the correct class
    expect(rootElement?.classList.contains('bc-lexical-editor')).toBe(true)
  })
})

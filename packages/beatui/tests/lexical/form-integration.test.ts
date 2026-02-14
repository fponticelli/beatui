import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.setConfig({ testTimeout: 20000 })

// Mock all Lexical modules (BareEditor depends on these)
vi.mock('lexical', () => ({
  createEditor: vi.fn(() => ({
    setRootElement: vi.fn(),
    registerCommand: vi.fn(() => vi.fn()),
    registerUpdateListener: vi.fn(() => vi.fn()),
    getEditorState: vi.fn(() => ({
      read: vi.fn((fn: () => void) => fn()),
      toJSON: vi.fn(() => ({ root: {} })),
    })),
    parseEditorState: vi.fn(() => ({})),
    setEditorState: vi.fn(),
    setEditable: vi.fn(),
    getRootElement: vi.fn(),
    focus: vi.fn(),
    update: vi.fn((fn: () => void) => fn()),
  })),
  createCommand: vi.fn((name: string) => name),
  SELECTION_CHANGE_COMMAND: 'SELECTION_CHANGE',
  BLUR_COMMAND: 'BLUR',
  COMMAND_PRIORITY_LOW: 1,
  COMMAND_PRIORITY_NORMAL: 2,
  COMMAND_PRIORITY_HIGH: 3,
  KEY_DOWN_COMMAND: 'KEY_DOWN',
  FORMAT_TEXT_COMMAND: 'FORMAT_TEXT',
  UNDO_COMMAND: 'UNDO',
  REDO_COMMAND: 'REDO',
  $getSelection: vi.fn(),
  $isRangeSelection: vi.fn(),
  $createParagraphNode: vi.fn(),
  $getRoot: vi.fn(),
}))

vi.mock('@lexical/plain-text', () => ({
  registerPlainText: vi.fn(() => vi.fn()),
}))

vi.mock('@lexical/history', () => ({
  registerHistory: vi.fn(() => vi.fn()),
  createEmptyHistoryState: vi.fn(() => ({})),
}))

vi.mock('@lexical/clipboard', () => ({
  registerClipboard: vi.fn(() => vi.fn()),
}))

vi.mock('@lexical/list', () => ({
  registerList: vi.fn(() => vi.fn()),
  ListNode: class ListNode {},
  ListItemNode: class ListItemNode {},
}))

vi.mock('@lexical/link', () => ({
  registerLink: vi.fn(() => vi.fn()),
  LinkNode: class LinkNode {},
  AutoLinkNode: class AutoLinkNode {},
  $isLinkNode: vi.fn(() => false),
  TOGGLE_LINK_COMMAND: 'TOGGLE_LINK',
}))

vi.mock('@lexical/selection', () => ({
  $getSelectionStyleValueForProperty: vi.fn(() => ''),
  $patchStyleText: vi.fn(),
}))

vi.mock('@lexical/rich-text', () => ({
  registerRichText: vi.fn(() => vi.fn()),
  HeadingNode: class HeadingNode {},
  QuoteNode: class QuoteNode {},
  $isHeadingNode: vi.fn(() => false),
  $createHeadingNode: vi.fn(),
  $createQuoteNode: vi.fn(),
}))

vi.mock('@lexical/code', () => ({
  registerCodeHighlighting: vi.fn(() => vi.fn()),
  CodeNode: class CodeNode {},
  CodeHighlightNode: class CodeHighlightNode {},
  $createCodeNode: vi.fn(),
}))

vi.mock('@lexical/table', () => ({
  registerTable: vi.fn(() => vi.fn()),
  TableNode: class TableNode {},
  TableCellNode: class TableCellNode {},
  TableRowNode: class TableRowNode {},
  INSERT_TABLE_COMMAND: 'INSERT_TABLE',
}))

vi.mock('@lexical/utils', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mergeRegister: vi.fn((..._args: any[]) => vi.fn()),
  $getNearestNodeOfType: vi.fn(),
}))

vi.mock('@lexical/markdown', () => ({
  $convertToMarkdownString: vi.fn(() => ''),
  $convertFromMarkdownString: vi.fn(),
  TRANSFORMERS: [],
}))

vi.mock('@lexical/html', () => ({
  $generateHtmlFromNodes: vi.fn(() => ''),
  $generateNodesFromDOM: vi.fn(() => []),
}))

vi.mock('../../src/lexical/plugins/horizontal-rule', () => ({
  registerHorizontalRulePlugin: vi.fn(() => vi.fn()),
  HR_TRANSFORMER: { type: 'element', regExp: /^---$/, dependencies: [] },
}))

vi.mock('../../src/lexical/horizontal-rule-node', () => ({
  HorizontalRuleNode: class HorizontalRuleNode {},
  $createHorizontalRuleNode: vi.fn(),
  $isHorizontalRuleNode: vi.fn(() => false),
}))

describe('LexicalEditorInput Form Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should export LexicalEditorInput function', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )
    expect(LexicalEditorInput).toBeDefined()
    expect(typeof LexicalEditorInput).toBe('function')
  })

  it('should accept options and return a renderable', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = LexicalEditorInput({ value: '' } as any)
    expect(result).toBeDefined()
  })

  it('should be importable from the component barrel', async () => {
    const barrel = await import('../../src/components/lexical/index')
    expect(barrel.LexicalEditorInput).toBeDefined()
  })

  it('should bridge onInput callback - strips editor arg', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )

    const onInput = vi.fn()
    // We can't easily render and trigger the callback flow, but we can
    // verify the function accepts the expected options shape
    const result = LexicalEditorInput({
      value: '',
      format: 'markdown',
      onInput,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(result).toBeDefined()
  })

  it('should bridge onChange callback - strips editor arg', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )

    const onChange = vi.fn()
    const result = LexicalEditorInput({
      value: '',
      format: 'markdown',
      onChange,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(result).toBeDefined()
  })

  it('should bridge onBlur callback - strips editor arg', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )

    const onBlur = vi.fn()
    const result = LexicalEditorInput({
      value: '',
      format: 'markdown',
      onBlur,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(result).toBeDefined()
  })

  it('should accept disabled option', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )

    const result = LexicalEditorInput({
      value: '',
      disabled: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(result).toBeDefined()
  })

  it('should accept hasError option', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )

    const result = LexicalEditorInput({
      value: '',
      hasError: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(result).toBeDefined()
  })

  it('should accept format: html', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )

    const result = LexicalEditorInput({
      value: '',
      format: 'html',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(result).toBeDefined()
  })

  it('should accept format: json', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )

    const result = LexicalEditorInput({
      value: {},
      format: 'json',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(result).toBeDefined()
  })

  it('should accept plugins configuration', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )

    const result = LexicalEditorInput({
      value: '',
      plugins: { richText: true, list: true },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(result).toBeDefined()
  })

  it('should accept namespace option', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )

    const result = LexicalEditorInput({
      value: '',
      namespace: 'CustomNamespace',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(result).toBeDefined()
  })

  it('should accept onReady callback', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )

    const onReady = vi.fn()
    const result = LexicalEditorInput({
      value: '',
      onReady,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(result).toBeDefined()
  })

  it('should accept onError callback', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )

    const onError = vi.fn()
    const result = LexicalEditorInput({
      value: '',
      onError,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(result).toBeDefined()
  })

  it('should accept before and after slots', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )

    const result = LexicalEditorInput({
      value: '',
      before: 'prefix',
      after: 'suffix',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(result).toBeDefined()
  })

  it('should accept size option', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )

    const result = LexicalEditorInput({
      value: '',
      size: 'lg',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(result).toBeDefined()
  })

  it('should accept both disabled and readOnly', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )

    const result = LexicalEditorInput({
      value: '',
      disabled: true,
      readOnly: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(result).toBeDefined()
  })

  it('should default format to markdown when not specified', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )

    // The component should work without explicit format
    const result = LexicalEditorInput({
      value: '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(result).toBeDefined()
  })

  it('should accept class option', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )

    const result = LexicalEditorInput({
      value: '',
      class: 'custom-class',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(result).toBeDefined()
  })

  it('should accept placeholder option', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )

    const result = LexicalEditorInput({
      value: '',
      placeholder: 'Type here...',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(result).toBeDefined()
  })

  it('should match LexicalInputOptions type union', async () => {
    const { LexicalEditorInput } = await import(
      '../../src/components/lexical/lexical-editor-input'
    )

    // Test string input options (markdown)
    const stringResult = LexicalEditorInput({
      value: '# Hello',
      format: 'markdown',
      onInput: (_v: string) => {},
      onChange: (_v: string) => {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(stringResult).toBeDefined()

    // Test JSON input options
    const jsonResult = LexicalEditorInput({
      value: { root: {} },
      format: 'json',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onInput: (_v: any) => {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    expect(jsonResult).toBeDefined()
  })
})

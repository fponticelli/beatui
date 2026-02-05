import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { LexicalEditor, EditorState } from 'lexical'

// Mock Lexical modules before imports
vi.mock('lexical', () => ({
  $getRoot: vi.fn(),
}))

vi.mock('@lexical/table', () => ({
  registerTablePlugin: vi.fn(() => vi.fn()),
  INSERT_TABLE_COMMAND: 'INSERT_TABLE',
  TableNode: class TableNode {},
  TableCellNode: class TableCellNode {},
  TableRowNode: class TableRowNode {},
}))

describe('Table Plugin', () => {
  let mockEditor: Partial<LexicalEditor>

  beforeEach(() => {
    mockEditor = {
      getEditorState: vi.fn(() => ({
        read: vi.fn((fn) => fn()),
        toJSON: vi.fn(() => ({ root: {} })),
      } as unknown as EditorState)),
      update: vi.fn((fn) => fn()),
      dispatchCommand: vi.fn(),
    }
    vi.clearAllMocks()
  })

  it('should export registerTablePlugin function', async () => {
    const { registerTablePlugin } = await import(
      '../../../src/lexical/plugins/table'
    )
    expect(registerTablePlugin).toBeDefined()
    expect(typeof registerTablePlugin).toBe('function')
  })

  it('should export insertTable function', async () => {
    const { insertTable } = await import('../../../src/lexical/plugins/table')
    expect(insertTable).toBeDefined()
    expect(typeof insertTable).toBe('function')
  })

  it('should return a cleanup function from registerTablePlugin', async () => {
    const { registerTablePlugin } = await import(
      '../../../src/lexical/plugins/table'
    )

    const cleanup = await registerTablePlugin(mockEditor as LexicalEditor)

    expect(cleanup).toBeDefined()
    expect(typeof cleanup).toBe('function')
  })

  it('should call @lexical/table registerTablePlugin if available', async () => {
    const { registerTablePlugin } = await import(
      '../../../src/lexical/plugins/table'
    )
    const tableModule = await import('@lexical/table')

    await registerTablePlugin(mockEditor as LexicalEditor)

    expect(tableModule.registerTablePlugin).toHaveBeenCalledWith(mockEditor)
  })

  it('should return no-op cleanup if @lexical/table does not export registerTablePlugin', async () => {
    const { registerTablePlugin } = await import(
      '../../../src/lexical/plugins/table'
    )
    const tableModule = await import('@lexical/table')

    // Temporarily remove the function
    const original = tableModule.registerTablePlugin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (tableModule as any).registerTablePlugin

    const cleanup = await registerTablePlugin(mockEditor as LexicalEditor)

    expect(typeof cleanup).toBe('function')
    cleanup() // Should not throw

    // Restore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(tableModule as any).registerTablePlugin = original
  })

  it('should accept options parameter', async () => {
    const { registerTablePlugin } = await import(
      '../../../src/lexical/plugins/table'
    )

    const cleanup = await registerTablePlugin(mockEditor as LexicalEditor, {
      // Plugin options would go here
    })

    expect(cleanup).toBeDefined()
  })

  it('should insertTable with default dimensions', async () => {
    const { insertTable } = await import('../../../src/lexical/plugins/table')
    const { INSERT_TABLE_COMMAND } = await import('@lexical/table')

    await insertTable(mockEditor as LexicalEditor)

    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith(
      INSERT_TABLE_COMMAND,
      {
        rows: '3',
        columns: '3',
        includeHeaders: true,
      }
    )
  })

  it('should insertTable with custom rows and columns', async () => {
    const { insertTable } = await import('../../../src/lexical/plugins/table')
    const { INSERT_TABLE_COMMAND } = await import('@lexical/table')

    await insertTable(mockEditor as LexicalEditor, 5, 4)

    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith(
      INSERT_TABLE_COMMAND,
      {
        rows: '5',
        columns: '4',
        includeHeaders: true,
      }
    )
  })

  it('should insertTable with only rows specified', async () => {
    const { insertTable } = await import('../../../src/lexical/plugins/table')
    const { INSERT_TABLE_COMMAND } = await import('@lexical/table')

    await insertTable(mockEditor as LexicalEditor, 2)

    expect(mockEditor.dispatchCommand).toHaveBeenCalledWith(
      INSERT_TABLE_COMMAND,
      {
        rows: '2',
        columns: '3', // Default
        includeHeaders: true,
      }
    )
  })

  it('should include headers when inserting table', async () => {
    const { insertTable } = await import('../../../src/lexical/plugins/table')

    await insertTable(mockEditor as LexicalEditor, 3, 3)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dispatchCall = (mockEditor.dispatchCommand as any).mock.calls[0]
    expect(dispatchCall[1].includeHeaders).toBe(true)
  })

  it('should convert dimensions to strings for INSERT_TABLE_COMMAND', async () => {
    const { insertTable } = await import('../../../src/lexical/plugins/table')

    await insertTable(mockEditor as LexicalEditor, 10, 8)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dispatchCall = (mockEditor.dispatchCommand as any).mock.calls[0]
    expect(typeof dispatchCall[1].rows).toBe('string')
    expect(typeof dispatchCall[1].columns).toBe('string')
    expect(dispatchCall[1].rows).toBe('10')
    expect(dispatchCall[1].columns).toBe('8')
  })

  it('should dispatch INSERT_TABLE_COMMAND when inserting table', async () => {
    const { insertTable } = await import('../../../src/lexical/plugins/table')
    const { INSERT_TABLE_COMMAND } = await import('@lexical/table')

    await insertTable(mockEditor as LexicalEditor, 3, 3)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dispatchCall = (mockEditor.dispatchCommand as any).mock.calls[0]
    expect(dispatchCall[0]).toBe(INSERT_TABLE_COMMAND)
  })

  it('should return promise from registerTablePlugin', async () => {
    const { registerTablePlugin } = await import(
      '../../../src/lexical/plugins/table'
    )

    const result = registerTablePlugin(mockEditor as LexicalEditor)

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should return promise from insertTable', async () => {
    const { insertTable } = await import('../../../src/lexical/plugins/table')

    const result = insertTable(mockEditor as LexicalEditor)

    expect(result).toBeInstanceOf(Promise)
    await result
  })

  it('should not throw when cleanup is called', async () => {
    const { registerTablePlugin } = await import(
      '../../../src/lexical/plugins/table'
    )

    const cleanup = await registerTablePlugin(mockEditor as LexicalEditor)

    expect(() => cleanup()).not.toThrow()
  })
})

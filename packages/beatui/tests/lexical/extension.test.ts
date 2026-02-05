import { describe, it, expect, vi } from 'vitest'

// Mock Lexical modules before imports
vi.mock('lexical', () => ({
  createCommand: vi.fn((name: string) => name),
  ElementNode: class ElementNode {},
  DecoratorNode: class DecoratorNode {},
  TextNode: class TextNode {},
  COMMAND_PRIORITY_LOW: 1,
  COMMAND_PRIORITY_NORMAL: 2,
  COMMAND_PRIORITY_HIGH: 3,
  COMMAND_PRIORITY_EDITOR: 4,
  COMMAND_PRIORITY_CRITICAL: 5,
}))

describe('Lexical Extension Framework', () => {
  it('should re-export createCommand from lexical', async () => {
    const { createCommand } = await import('../../src/lexical')

    expect(createCommand).toBeDefined()
    expect(typeof createCommand).toBe('function')
  })

  it('should re-export ElementNode from lexical', async () => {
    const { ElementNode } = await import('../../src/lexical')

    expect(ElementNode).toBeDefined()
    expect(typeof ElementNode).toBe('function')
  })

  it('should re-export DecoratorNode from lexical', async () => {
    const { DecoratorNode } = await import('../../src/lexical')

    expect(DecoratorNode).toBeDefined()
    expect(typeof DecoratorNode).toBe('function')
  })

  it('should re-export TextNode from lexical', async () => {
    const { TextNode } = await import('../../src/lexical')

    expect(TextNode).toBeDefined()
    expect(typeof TextNode).toBe('function')
  })

  it('should re-export COMMAND_PRIORITY_LOW', async () => {
    const { COMMAND_PRIORITY_LOW } = await import('../../src/lexical')

    expect(COMMAND_PRIORITY_LOW).toBeDefined()
    expect(typeof COMMAND_PRIORITY_LOW).toBe('number')
  })

  it('should re-export COMMAND_PRIORITY_NORMAL', async () => {
    const { COMMAND_PRIORITY_NORMAL } = await import('../../src/lexical')

    expect(COMMAND_PRIORITY_NORMAL).toBeDefined()
    expect(typeof COMMAND_PRIORITY_NORMAL).toBe('number')
  })

  it('should re-export COMMAND_PRIORITY_HIGH', async () => {
    const { COMMAND_PRIORITY_HIGH } = await import('../../src/lexical')

    expect(COMMAND_PRIORITY_HIGH).toBeDefined()
    expect(typeof COMMAND_PRIORITY_HIGH).toBe('number')
  })

  it('should re-export COMMAND_PRIORITY_EDITOR', async () => {
    const { COMMAND_PRIORITY_EDITOR } = await import('../../src/lexical')

    expect(COMMAND_PRIORITY_EDITOR).toBeDefined()
    expect(typeof COMMAND_PRIORITY_EDITOR).toBe('number')
  })

  it('should re-export COMMAND_PRIORITY_CRITICAL', async () => {
    const { COMMAND_PRIORITY_CRITICAL } = await import('../../src/lexical')

    expect(COMMAND_PRIORITY_CRITICAL).toBeDefined()
    expect(typeof COMMAND_PRIORITY_CRITICAL).toBe('number')
  })

  it('should have correct priority values', async () => {
    const {
      COMMAND_PRIORITY_LOW,
      COMMAND_PRIORITY_NORMAL,
      COMMAND_PRIORITY_HIGH,
      COMMAND_PRIORITY_EDITOR,
      COMMAND_PRIORITY_CRITICAL,
    } = await import('../../src/lexical')

    expect(COMMAND_PRIORITY_LOW).toBe(1)
    expect(COMMAND_PRIORITY_NORMAL).toBe(2)
    expect(COMMAND_PRIORITY_HIGH).toBe(3)
    expect(COMMAND_PRIORITY_EDITOR).toBe(4)
    expect(COMMAND_PRIORITY_CRITICAL).toBe(5)
  })

  it('should allow creating commands with createCommand', async () => {
    const { createCommand } = await import('../../src/lexical')

    const command = createCommand('MY_COMMAND')

    expect(command).toBe('MY_COMMAND')
  })

  it('should verify ElementNode is a class', async () => {
    const { ElementNode } = await import('../../src/lexical')

    expect(ElementNode.prototype).toBeDefined()
  })

  it('should verify DecoratorNode is a class', async () => {
    const { DecoratorNode } = await import('../../src/lexical')

    expect(DecoratorNode.prototype).toBeDefined()
  })

  it('should verify TextNode is a class', async () => {
    const { TextNode } = await import('../../src/lexical')

    expect(TextNode.prototype).toBeDefined()
  })

  it('should export all extension framework types', async () => {
    const lexical = await import('../../src/lexical')

    // Verify the module has the expected exports
    expect(lexical.createCommand).toBeDefined()
    expect(lexical.ElementNode).toBeDefined()
    expect(lexical.DecoratorNode).toBeDefined()
    expect(lexical.TextNode).toBeDefined()
    expect(lexical.COMMAND_PRIORITY_LOW).toBeDefined()
    expect(lexical.COMMAND_PRIORITY_NORMAL).toBeDefined()
    expect(lexical.COMMAND_PRIORITY_HIGH).toBeDefined()
    expect(lexical.COMMAND_PRIORITY_EDITOR).toBeDefined()
    expect(lexical.COMMAND_PRIORITY_CRITICAL).toBeDefined()
  })

  it('should export headless editor functions', async () => {
    const {
      createHeadlessEditor,
      markdownToLexicalJson,
      lexicalJsonToMarkdown,
      htmlToLexicalJson,
      lexicalJsonToHtml,
    } = await import('../../src/lexical')

    expect(createHeadlessEditor).toBeDefined()
    expect(markdownToLexicalJson).toBeDefined()
    expect(lexicalJsonToMarkdown).toBeDefined()
    expect(htmlToLexicalJson).toBeDefined()
    expect(lexicalJsonToHtml).toBeDefined()
  })

  it('should export plugin functions', async () => {
    const {
      registerRichTextPlugin,
      registerPlainTextPlugin,
      registerHistoryPlugin,
      registerClipboardPlugin,
      registerListPlugin,
      registerLinkPlugin,
    } = await import('../../src/lexical')

    expect(registerRichTextPlugin).toBeDefined()
    expect(registerPlainTextPlugin).toBeDefined()
    expect(registerHistoryPlugin).toBeDefined()
    expect(registerClipboardPlugin).toBeDefined()
    expect(registerListPlugin).toBeDefined()
    expect(registerLinkPlugin).toBeDefined()
  })

  it('should export I/O functions', async () => {
    const {
      exportToMarkdown,
      importFromMarkdown,
      exportToHtml,
      importFromHtml,
    } = await import('../../src/lexical')

    expect(exportToMarkdown).toBeDefined()
    expect(importFromMarkdown).toBeDefined()
    expect(exportToHtml).toBeDefined()
    expect(importFromHtml).toBeDefined()
  })

  it('should export utility functions', async () => {
    const { getNodesForPlugins, createDefaultPluginConfig } = await import(
      '../../src/lexical'
    )

    expect(getNodesForPlugins).toBeDefined()
    expect(createDefaultPluginConfig).toBeDefined()
  })

  it('should export lazy loader', async () => {
    const { loadLexicalCore } = await import('../../src/lexical')

    expect(loadLexicalCore).toBeDefined()
  })

  it('should support custom node development', async () => {
    const { ElementNode, DecoratorNode, TextNode } = await import(
      '../../src/lexical'
    )

    // These should be usable as base classes for custom nodes
    expect(ElementNode).toBeDefined()
    expect(DecoratorNode).toBeDefined()
    expect(TextNode).toBeDefined()
  })

  it('should support custom command development', async () => {
    const { createCommand, COMMAND_PRIORITY_NORMAL } = await import(
      '../../src/lexical'
    )

    const customCommand = createCommand('CUSTOM_COMMAND')

    expect(customCommand).toBe('CUSTOM_COMMAND')
    expect(COMMAND_PRIORITY_NORMAL).toBe(2)
  })

  it('should provide priority constants for command handlers', async () => {
    const {
      COMMAND_PRIORITY_LOW,
      COMMAND_PRIORITY_NORMAL,
      COMMAND_PRIORITY_HIGH,
      COMMAND_PRIORITY_EDITOR,
      COMMAND_PRIORITY_CRITICAL,
    } = await import('../../src/lexical')

    // Verify all priority levels are available
    expect(COMMAND_PRIORITY_LOW).toBeLessThan(COMMAND_PRIORITY_NORMAL)
    expect(COMMAND_PRIORITY_NORMAL).toBeLessThan(COMMAND_PRIORITY_HIGH)
    expect(COMMAND_PRIORITY_HIGH).toBeLessThan(COMMAND_PRIORITY_EDITOR)
    expect(COMMAND_PRIORITY_EDITOR).toBeLessThan(COMMAND_PRIORITY_CRITICAL)
  })
})

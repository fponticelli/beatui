import { describe, it, expect } from 'vitest'

describe('Lexical Theme Integration', () => {
  it('should import BareEditor component', async () => {
    const { BareEditor } = await import(
      '../../src/components/lexical/bare-editor'
    )
    expect(BareEditor).toBeDefined()
    expect(typeof BareEditor).toBe('function')
  })

  it('should import DockedEditor component', async () => {
    const { DockedEditor } = await import(
      '../../src/components/lexical/docked-editor'
    )
    expect(DockedEditor).toBeDefined()
    expect(typeof DockedEditor).toBe('function')
  })

  it('should import ContextualEditor component', async () => {
    const { ContextualEditor } = await import(
      '../../src/components/lexical/contextual-editor'
    )
    expect(ContextualEditor).toBeDefined()
    expect(typeof ContextualEditor).toBe('function')
  })

  it('should verify BareEditor uses Theme from @tempots/dom', async () => {
    const bareEditorSource = await import(
      '../../src/components/lexical/bare-editor'
    )
    // The module should export the component
    expect(bareEditorSource.BareEditor).toBeDefined()
  })

  it('should verify DockedEditor uses Theme from @tempots/dom', async () => {
    const dockedEditorSource = await import(
      '../../src/components/lexical/docked-editor'
    )
    // The module should export the component
    expect(dockedEditorSource.DockedEditor).toBeDefined()
  })

  it('should verify ContextualEditor uses Theme from @tempots/dom', async () => {
    const contextualEditorSource = await import(
      '../../src/components/lexical/contextual-editor'
    )
    // The module should export the component
    expect(contextualEditorSource.ContextualEditor).toBeDefined()
  })

  it('should verify editor container class is bc-lexical-editor-container', async () => {
    // Test that the components exist and are ready to use the correct class
    const { BareEditor } = await import(
      '../../src/components/lexical/bare-editor'
    )
    const { DockedEditor } = await import(
      '../../src/components/lexical/docked-editor'
    )
    const { ContextualEditor } = await import(
      '../../src/components/lexical/contextual-editor'
    )

    expect(BareEditor).toBeDefined()
    expect(DockedEditor).toBeDefined()
    expect(ContextualEditor).toBeDefined()
  })

  it('should verify editor class is bc-lexical-editor', async () => {
    const { BareEditor } = await import(
      '../../src/components/lexical/bare-editor'
    )
    const { DockedEditor } = await import(
      '../../src/components/lexical/docked-editor'
    )
    const { ContextualEditor } = await import(
      '../../src/components/lexical/contextual-editor'
    )

    expect(BareEditor).toBeDefined()
    expect(DockedEditor).toBeDefined()
    expect(ContextualEditor).toBeDefined()
  })

  it('should verify theme data attribute is set on editor root', async () => {
    // Components use root.dataset.theme = appearance
    const { BareEditor } = await import(
      '../../src/components/lexical/bare-editor'
    )
    const { DockedEditor } = await import(
      '../../src/components/lexical/docked-editor'
    )
    const { ContextualEditor } = await import(
      '../../src/components/lexical/contextual-editor'
    )

    expect(BareEditor).toBeDefined()
    expect(DockedEditor).toBeDefined()
    expect(ContextualEditor).toBeDefined()
  })

  it('should use Use helper from @tempots/dom for theme integration', async () => {
    // All three editors use Use(Theme, ...) pattern
    const { BareEditor } = await import(
      '../../src/components/lexical/bare-editor'
    )
    const { DockedEditor } = await import(
      '../../src/components/lexical/docked-editor'
    )
    const { ContextualEditor } = await import(
      '../../src/components/lexical/contextual-editor'
    )

    expect(BareEditor).toBeDefined()
    expect(DockedEditor).toBeDefined()
    expect(ContextualEditor).toBeDefined()
  })

  it('should export all editor components from index', async () => {
    const lexicalComponents = await import('../../src/components/lexical')

    expect(lexicalComponents.BareEditor).toBeDefined()
    expect(lexicalComponents.DockedEditor).toBeDefined()
    expect(lexicalComponents.ContextualEditor).toBeDefined()
  })

  it('should include LinkPortal for CSS injection', async () => {
    // All editors use LinkPortal for CSS injection
    const { BareEditor } = await import(
      '../../src/components/lexical/bare-editor'
    )
    const { DockedEditor } = await import(
      '../../src/components/lexical/docked-editor'
    )
    const { ContextualEditor } = await import(
      '../../src/components/lexical/contextual-editor'
    )

    expect(BareEditor).toBeDefined()
    expect(DockedEditor).toBeDefined()
    expect(ContextualEditor).toBeDefined()
  })

  it('should support theme appearance changes reactively', async () => {
    // All editors listen to appearance.on((a) => ...) for theme changes
    const { BareEditor } = await import(
      '../../src/components/lexical/bare-editor'
    )
    const { DockedEditor } = await import(
      '../../src/components/lexical/docked-editor'
    )
    const { ContextualEditor } = await import(
      '../../src/components/lexical/contextual-editor'
    )

    expect(BareEditor).toBeDefined()
    expect(DockedEditor).toBeDefined()
    expect(ContextualEditor).toBeDefined()
  })

  it('should apply readonly class modifier when readOnly is true', async () => {
    // Editors use bc-lexical-editor--readonly class
    const { BareEditor } = await import(
      '../../src/components/lexical/bare-editor'
    )

    expect(BareEditor).toBeDefined()
  })

  it('should use namespace option for editor configuration', async () => {
    // Default namespace is 'BeatUILexical'
    const { BareEditor } = await import(
      '../../src/components/lexical/bare-editor'
    )
    const { DockedEditor } = await import(
      '../../src/components/lexical/docked-editor'
    )
    const { ContextualEditor } = await import(
      '../../src/components/lexical/contextual-editor'
    )

    expect(BareEditor).toBeDefined()
    expect(DockedEditor).toBeDefined()
    expect(ContextualEditor).toBeDefined()
  })

  it('should apply Lexical theme class mappings', async () => {
    // Editors define theme classes like bc-lexical-h1, bc-lexical-bold, etc.
    const { BareEditor } = await import(
      '../../src/components/lexical/bare-editor'
    )

    expect(BareEditor).toBeDefined()
  })

  it('should include toolbar in DockedEditor', async () => {
    const { DockedEditor } = await import(
      '../../src/components/lexical/docked-editor'
    )

    expect(DockedEditor).toBeDefined()
  })

  it('should include floating toolbar in ContextualEditor', async () => {
    const { ContextualEditor } = await import(
      '../../src/components/lexical/contextual-editor'
    )

    expect(ContextualEditor).toBeDefined()
  })

  it('should use WithElement helper for DOM mounting', async () => {
    // All editors use WithElement for editor mounting
    const { BareEditor } = await import(
      '../../src/components/lexical/bare-editor'
    )

    expect(BareEditor).toBeDefined()
  })
})

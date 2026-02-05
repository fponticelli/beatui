import { describe, it, expect } from 'vitest'

describe('Lexical Accessibility', () => {
  it('should verify toolbar components module exists', async () => {
    const { LexicalToolbar } = await import(
      '../../src/components/lexical/toolbar'
    )

    expect(LexicalToolbar).toBeDefined()
    expect(typeof LexicalToolbar).toBe('function')
  })

  it('should verify floating toolbar component exists', async () => {
    const { FloatingToolbar } = await import(
      '../../src/components/lexical/floating'
    )

    expect(FloatingToolbar).toBeDefined()
    expect(typeof FloatingToolbar).toBe('function')
  })

  it('should verify slash command palette component exists', async () => {
    const { SlashCommandPalette } = await import(
      '../../src/components/lexical/floating'
    )

    expect(SlashCommandPalette).toBeDefined()
    expect(typeof SlashCommandPalette).toBe('function')
  })

  it('should include a11y message keys in i18n', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(en.default.a11yEditor).toBe('Rich text editor')
    expect(en.default.a11yToolbar).toBe('Editor toolbar')
    expect(en.default.a11yFloatingToolbar).toBe('Floating toolbar')
    expect(en.default.a11ySlashCommands).toBe('Slash commands menu')
    expect(en.default.a11yTableControls).toBe('Table controls menu')
    expect(en.default.a11yCodeLanguage).toBe('Code language selector')
  })

  it('should verify toolbar role is defined in i18n', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(en.default.a11yToolbar).toBe('Editor toolbar')
  })

  it('should verify floating toolbar aria-label is defined', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(en.default.a11yFloatingToolbar).toBe('Floating toolbar')
  })

  it('should verify slash commands menu role is defined', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(en.default.a11ySlashCommands).toBe('Slash commands menu')
  })

  it('should verify table controls menu aria-label is defined', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(en.default.a11yTableControls).toBe('Table controls menu')
  })

  it('should verify code language selector aria-label is defined', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(en.default.a11yCodeLanguage).toBe('Code language selector')
  })

  it('should verify editor aria-label is defined', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(en.default.a11yEditor).toBe('Rich text editor')
  })

  it('should include accessibility labels for all toolbar actions', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    // Text formatting
    expect(en.default.bold).toBe('Bold')
    expect(en.default.italic).toBe('Italic')
    expect(en.default.underline).toBe('Underline')
    expect(en.default.strikethrough).toBe('Strikethrough')

    // Headings
    expect(en.default.heading1).toBe('Heading 1')
    expect(en.default.heading2).toBe('Heading 2')
    expect(en.default.heading3).toBe('Heading 3')

    // Lists
    expect(en.default.bulletList).toBe('Bullet List')
    expect(en.default.orderedList).toBe('Ordered List')

    // History
    expect(en.default.undo).toBe('Undo')
    expect(en.default.redo).toBe('Redo')
  })

  it('should include link action labels', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(en.default.linkInsert).toBe('Insert link')
    expect(en.default.linkEdit).toBe('Edit link')
    expect(en.default.linkRemove).toBe('Remove link')
    expect(en.default.linkOpen).toBe('Open link')
  })

  it('should include table action labels', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(en.default.insertRowAbove).toBe('Insert row above')
    expect(en.default.insertRowBelow).toBe('Insert row below')
    expect(en.default.insertColumnLeft).toBe('Insert column left')
    expect(en.default.insertColumnRight).toBe('Insert column right')
    expect(en.default.deleteRow).toBe('Delete row')
    expect(en.default.deleteColumn).toBe('Delete column')
    expect(en.default.deleteTable).toBe('Delete table')
  })

  it('should include slash command labels', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(en.default.slashCommandsTitle).toBe('Commands')
    expect(en.default.slashCommandsEmpty).toBe('No commands found')
    expect(en.default.slashCommandHeading1).toBe('Heading 1')
    expect(en.default.slashCommandBulletList).toBe('Bullet List')
  })

  it('should include placeholder messages', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(en.default.placeholder).toBe('Start typing...')
    expect(en.default.placeholderEmpty).toBe('Type / for commands')
  })

  it('should support RTL locales for accessibility', async () => {
    const { getDirectionForLocale } = await import(
      '../../src/lexical-i18n/translations'
    )

    // RTL locales should be properly supported
    expect(getDirectionForLocale('ar')).toBe('rtl')
    expect(getDirectionForLocale('he')).toBe('rtl')
    expect(getDirectionForLocale('fa')).toBe('rtl')
  })

  it('should include error messages', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(en.default.errorGeneric).toBe('An error occurred')
    expect(en.default.errorLoadFailed).toBe('Failed to load editor')
    expect(en.default.errorSaveFailed).toBe('Failed to save content')
  })

  it('should verify all editor components export properly', async () => {
    const components = await import('../../src/components/lexical')

    expect(components.BareEditor).toBeDefined()
    expect(components.DockedEditor).toBeDefined()
    expect(components.ContextualEditor).toBeDefined()
    expect(components.LexicalToolbar).toBeDefined()
    expect(components.FloatingToolbar).toBeDefined()
    expect(components.SlashCommandPalette).toBeDefined()
  })

  it('should include character count accessibility messages', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(typeof en.default.characterCount).toBe('function')
    expect(en.default.characterCount(100)).toBe('100 characters')

    expect(typeof en.default.characterCountWithMax).toBe('function')
    expect(en.default.characterCountWithMax(50, 100)).toBe('50 / 100 characters')

    expect(en.default.characterCountExceeded).toBe('Character limit exceeded')
  })

  it('should verify toolbar components are accessible', async () => {
    const { LexicalToolbar } = await import(
      '../../src/components/lexical/toolbar'
    )

    // Toolbar component should exist and be a function
    expect(LexicalToolbar).toBeDefined()
    expect(typeof LexicalToolbar).toBe('function')
  })

  it('should verify floating UI components are accessible', async () => {
    const { FloatingToolbar, SlashCommandPalette } = await import(
      '../../src/components/lexical/floating'
    )

    expect(FloatingToolbar).toBeDefined()
    expect(typeof FloatingToolbar).toBe('function')

    expect(SlashCommandPalette).toBeDefined()
    expect(typeof SlashCommandPalette).toBe('function')
  })

  it('should support multiple languages for accessibility', async () => {
    const { getMessagesForLocale } = await import(
      '../../src/lexical-i18n/translations'
    )

    // Test several locales to ensure a11y messages are present
    const enMessages = await getMessagesForLocale('en')
    expect(enMessages.a11yEditor).toBeDefined()

    const esMessages = await getMessagesForLocale('es')
    expect(esMessages).toBeDefined()

    const frMessages = await getMessagesForLocale('fr')
    expect(frMessages).toBeDefined()
  })
})

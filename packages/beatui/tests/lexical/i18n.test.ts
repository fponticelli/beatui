import { describe, it, expect } from 'vitest'

describe('Lexical i18n', () => {
  it('should export English default messages', async () => {
    const { defaultMessages } = await import('../../src/lexical-i18n/default')

    expect(defaultMessages).toBeDefined()
    expect(typeof defaultMessages).toBe('object')
  })

  it('should export default locale as "en"', async () => {
    const { defaultLocale } = await import('../../src/lexical-i18n/default')

    expect(defaultLocale).toBe('en')
  })

  it('should export en locale module', async () => {
    const { en } = await import('../../src/lexical-i18n')

    expect(en).toBeDefined()
    expect(typeof en).toBe('object')
  })

  it('should include expected message keys in English messages', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(en.default.bold).toBe('Bold')
    expect(en.default.italic).toBe('Italic')
    expect(en.default.underline).toBe('Underline')
    expect(en.default.strikethrough).toBe('Strikethrough')
    expect(en.default.code).toBe('Code')
    expect(en.default.heading1).toBe('Heading 1')
    expect(en.default.heading2).toBe('Heading 2')
    expect(en.default.heading3).toBe('Heading 3')
    expect(en.default.undo).toBe('Undo')
    expect(en.default.redo).toBe('Redo')
  })

  it('should include slash command message keys', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(en.default.slashCommandsTitle).toBe('Commands')
    expect(en.default.slashCommandsEmpty).toBe('No commands found')
    expect(en.default.slashCommandHeading1).toBe('Heading 1')
    expect(en.default.slashCommandBulletList).toBe('Bullet List')
  })

  it('should include table action message keys', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(en.default.insertRowAbove).toBe('Insert row above')
    expect(en.default.insertRowBelow).toBe('Insert row below')
    expect(en.default.deleteTable).toBe('Delete table')
  })

  it('should include link action message keys', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(en.default.linkUrl).toBe('URL')
    expect(en.default.linkInsert).toBe('Insert link')
    expect(en.default.linkEdit).toBe('Edit link')
  })

  it('should include accessibility message keys', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(en.default.a11yEditor).toBe('Rich text editor')
    expect(en.default.a11yToolbar).toBe('Editor toolbar')
    expect(en.default.a11yFloatingToolbar).toBe('Floating toolbar')
  })

  it('should include function-based messages for character count', async () => {
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(typeof en.default.characterCount).toBe('function')
    expect(en.default.characterCount(10)).toBe('10 characters')
    expect(typeof en.default.characterCountWithMax).toBe('function')
    expect(en.default.characterCountWithMax(5, 10)).toBe('5 / 10 characters')
  })

  it('should export getMessagesForLocale function', async () => {
    const { getMessagesForLocale } = await import(
      '../../src/lexical-i18n/translations'
    )

    expect(getMessagesForLocale).toBeDefined()
    expect(typeof getMessagesForLocale).toBe('function')
  })

  it('should export getDirectionForLocale function', async () => {
    const { getDirectionForLocale } = await import(
      '../../src/lexical-i18n/translations'
    )

    expect(getDirectionForLocale).toBeDefined()
    expect(typeof getDirectionForLocale).toBe('function')
  })

  it('should return messages for supported locales', async () => {
    const { getMessagesForLocale } = await import(
      '../../src/lexical-i18n/translations'
    )

    const enMessages = await getMessagesForLocale('en')
    expect(enMessages).toBeDefined()
    expect(enMessages.bold).toBe('Bold')

    const esMessages = await getMessagesForLocale('es')
    expect(esMessages).toBeDefined()

    const frMessages = await getMessagesForLocale('fr')
    expect(frMessages).toBeDefined()
  })

  it('should return rtl for Arabic locale', async () => {
    const { getDirectionForLocale } = await import(
      '../../src/lexical-i18n/translations'
    )

    expect(getDirectionForLocale('ar')).toBe('rtl')
  })

  it('should return rtl for Hebrew locale', async () => {
    const { getDirectionForLocale } = await import(
      '../../src/lexical-i18n/translations'
    )

    expect(getDirectionForLocale('he')).toBe('rtl')
  })

  it('should return rtl for Farsi locale', async () => {
    const { getDirectionForLocale } = await import(
      '../../src/lexical-i18n/translations'
    )

    expect(getDirectionForLocale('fa')).toBe('rtl')
  })

  it('should return rtl for Urdu locale', async () => {
    const { getDirectionForLocale } = await import(
      '../../src/lexical-i18n/translations'
    )

    expect(getDirectionForLocale('ur')).toBe('rtl')
  })

  it('should return ltr for English locale', async () => {
    const { getDirectionForLocale } = await import(
      '../../src/lexical-i18n/translations'
    )

    expect(getDirectionForLocale('en')).toBe('ltr')
  })

  it('should return ltr for Spanish locale', async () => {
    const { getDirectionForLocale } = await import(
      '../../src/lexical-i18n/translations'
    )

    expect(getDirectionForLocale('es')).toBe('ltr')
  })

  it('should return ltr for French locale', async () => {
    const { getDirectionForLocale } = await import(
      '../../src/lexical-i18n/translations'
    )

    expect(getDirectionForLocale('fr')).toBe('ltr')
  })

  it('should return ltr for non-RTL locales', async () => {
    const { getDirectionForLocale } = await import(
      '../../src/lexical-i18n/translations'
    )

    expect(getDirectionForLocale('de')).toBe('ltr')
    expect(getDirectionForLocale('ja')).toBe('ltr')
    expect(getDirectionForLocale('zh')).toBe('ltr')
  })

  it('should fallback to default messages for unsupported locale', async () => {
    const { getMessagesForLocale } = await import(
      '../../src/lexical-i18n/translations'
    )
    const { defaultMessages } = await import('../../src/lexical-i18n/default')

    const messages = await getMessagesForLocale('unsupported-locale')
    expect(messages).toEqual(defaultMessages)
  })

  it('should export t function for message translation', async () => {
    const { t } = await import('../../src/lexical-i18n/translations')

    expect(t).toBeDefined()
    expect(typeof t).toBe('function')
  })

  it('should translate message keys using t function', async () => {
    const { t } = await import('../../src/lexical-i18n/translations')
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(t(en.default, 'bold')).toBe('Bold')
    expect(t(en.default, 'italic')).toBe('Italic')
  })

  it('should handle function-based messages with t function', async () => {
    const { t } = await import('../../src/lexical-i18n/translations')
    const en = await import('../../src/lexical-i18n/locales/en')

    expect(t(en.default, 'characterCount', 15)).toBe('15 characters')
  })

  it('should export all supported locale modules', async () => {
    const i18n = await import('../../src/lexical-i18n')

    expect(i18n.en).toBeDefined()
    expect(i18n.es).toBeDefined()
    expect(i18n.fr).toBeDefined()
    expect(i18n.de).toBeDefined()
    expect(i18n.ar).toBeDefined()
    expect(i18n.he).toBeDefined()
    expect(i18n.fa).toBeDefined()
    expect(i18n.ur).toBeDefined()
    expect(i18n.it).toBeDefined()
    expect(i18n.ja).toBeDefined()
    expect(i18n.ko).toBeDefined()
    expect(i18n.nl).toBeDefined()
    expect(i18n.pl).toBeDefined()
    expect(i18n.pt).toBeDefined()
    expect(i18n.ru).toBeDefined()
    expect(i18n.tr).toBeDefined()
    expect(i18n.vi).toBeDefined()
    expect(i18n.zh).toBeDefined()
    expect(i18n.hi).toBeDefined()
  })

  it('should export getDefaultLocale function', async () => {
    const { getDefaultLocale } = await import(
      '../../src/lexical-i18n/translations'
    )

    expect(getDefaultLocale).toBeDefined()
    expect(typeof getDefaultLocale).toBe('function')
    expect(getDefaultLocale()).toBe('en')
  })

  it('should export getDefaultMessages function', async () => {
    const { getDefaultMessages } = await import(
      '../../src/lexical-i18n/translations'
    )

    expect(getDefaultMessages).toBeDefined()
    expect(typeof getDefaultMessages).toBe('function')
    expect(getDefaultMessages()).toBeDefined()
  })
})

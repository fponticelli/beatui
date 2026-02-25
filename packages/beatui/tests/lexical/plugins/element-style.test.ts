import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { LexicalNode, TextFormatType } from 'lexical'

// Track format and style state per mock TextNode instance
interface MockTextNodeState {
  formats: Set<TextFormatType>
  style: string
}

const mockTextNodes = new Map<object, MockTextNodeState>()

function createMockTextNode(): LexicalNode {
  const state: MockTextNodeState = { formats: new Set(), style: '' }
  const node = {
    hasFormat: vi.fn((fmt: TextFormatType) => state.formats.has(fmt)),
    toggleFormat: vi.fn((fmt: TextFormatType) => {
      if (state.formats.has(fmt)) {
        state.formats.delete(fmt)
      } else {
        state.formats.add(fmt)
      }
    }),
    getStyle: vi.fn(() => state.style),
    setStyle: vi.fn((s: string) => {
      state.style = s
    }),
  }
  mockTextNodes.set(node, state)
  return node as unknown as LexicalNode
}

// Mock lexical — $isTextNode returns true for our mock text nodes
vi.mock('lexical', async () => {
  const actual = await vi.importActual<typeof import('lexical')>('lexical')
  return {
    ...actual,
    $isTextNode: vi.fn((node: unknown) => mockTextNodes.has(node as object)),
    $isElementNode: actual.$isElementNode,
    $isRootNode: actual.$isRootNode,
    $getRoot: actual.$getRoot,
    $getNodeByKey: actual.$getNodeByKey,
    $createParagraphNode: actual.$createParagraphNode,
    ParagraphNode: actual.ParagraphNode,
  }
})

vi.mock('@lexical/rich-text', () => ({
  $createHeadingNode: vi.fn(),
  HeadingNode: class {},
  QuoteNode: class {},
}))

vi.mock('@lexical/utils', () => ({
  isHTMLElement: vi.fn((el: unknown) => el instanceof HTMLElement),
}))

describe('element-style inline imports', () => {
  beforeEach(() => {
    mockTextNodes.clear()
    vi.clearAllMocks()
  })

  describe('DEFAULT_INLINE_STYLE_PROPERTIES', () => {
    it('contains the toolbar-supported CSS properties', async () => {
      const { DEFAULT_INLINE_STYLE_PROPERTIES } = await import(
        '../../../src/lexical/plugins/element-style'
      )
      expect(DEFAULT_INLINE_STYLE_PROPERTIES).toEqual([
        'color',
        'font-size',
        'font-family',
        'background-color',
        'line-height',
      ])
    })
  })

  describe('buildInlineStyleImportMap', () => {
    it('returns entries for all inline tags', async () => {
      const { buildInlineStyleImportMap } = await import(
        '../../../src/lexical/plugins/element-style'
      )
      const map = buildInlineStyleImportMap()
      const expectedTags = [
        'span',
        'b',
        'em',
        'i',
        'strong',
        'u',
        's',
        'sub',
        'sup',
        'code',
        'mark',
      ]
      for (const tag of expectedTags) {
        expect(map[tag], `missing entry for <${tag}>`).toBeDefined()
      }
    })

    it('uses priority 1 to override Lexical defaults', async () => {
      const { buildInlineStyleImportMap } = await import(
        '../../../src/lexical/plugins/element-style'
      )
      const map = buildInlineStyleImportMap()

      const el = document.createElement('span')
      const conversion = (
        map.span as (node: HTMLElement) => { priority: number }
      )(el)
      expect(conversion.priority).toBe(1)
    })

    it('preserves color from <span style="color: red">', async () => {
      const { buildInlineStyleImportMap } = await import(
        '../../../src/lexical/plugins/element-style'
      )
      const map = buildInlineStyleImportMap()

      const el = document.createElement('span')
      el.style.color = 'red'

      const conversion = (
        map.span as (node: HTMLElement) => {
          conversion: () => {
            node: null
            forChild: (n: LexicalNode) => LexicalNode
          }
        }
      )(el)
      const { forChild } = conversion.conversion()

      const textNode = createMockTextNode()
      forChild(textNode)

      const state = mockTextNodes.get(textNode as unknown as object)!
      expect(state.style).toContain('color: red')
    })

    it('preserves font-size from <span style="font-size: 24px">', async () => {
      const { buildInlineStyleImportMap } = await import(
        '../../../src/lexical/plugins/element-style'
      )
      const map = buildInlineStyleImportMap()

      const el = document.createElement('span')
      el.style.fontSize = '24px'

      const conversion = (
        map.span as (node: HTMLElement) => {
          conversion: () => {
            node: null
            forChild: (n: LexicalNode) => LexicalNode
          }
        }
      )(el)
      const { forChild } = conversion.conversion()

      const textNode = createMockTextNode()
      forChild(textNode)

      const state = mockTextNodes.get(textNode as unknown as object)!
      expect(state.style).toContain('font-size: 24px')
    })

    it('preserves font-family from <span>', async () => {
      const { buildInlineStyleImportMap } = await import(
        '../../../src/lexical/plugins/element-style'
      )
      const map = buildInlineStyleImportMap()

      const el = document.createElement('span')
      el.style.fontFamily = 'Georgia, serif'

      const conversion = (
        map.span as (node: HTMLElement) => {
          conversion: () => {
            node: null
            forChild: (n: LexicalNode) => LexicalNode
          }
        }
      )(el)
      const { forChild } = conversion.conversion()

      const textNode = createMockTextNode()
      forChild(textNode)

      const state = mockTextNodes.get(textNode as unknown as object)!
      expect(state.style).toContain('font-family')
    })

    it('preserves multiple CSS properties at once', async () => {
      const { buildInlineStyleImportMap } = await import(
        '../../../src/lexical/plugins/element-style'
      )
      const map = buildInlineStyleImportMap()

      const el = document.createElement('span')
      el.style.color = 'blue'
      el.style.fontSize = '14px'
      el.style.backgroundColor = 'yellow'

      const conversion = (
        map.span as (node: HTMLElement) => {
          conversion: () => {
            node: null
            forChild: (n: LexicalNode) => LexicalNode
          }
        }
      )(el)
      const { forChild } = conversion.conversion()

      const textNode = createMockTextNode()
      forChild(textNode)

      const state = mockTextNodes.get(textNode as unknown as object)!
      expect(state.style).toContain('color: blue')
      expect(state.style).toContain('font-size: 14px')
      expect(state.style).toContain('background-color: yellow')
    })

    it('toggles italic AND preserves font-size from <em>', async () => {
      const { buildInlineStyleImportMap } = await import(
        '../../../src/lexical/plugins/element-style'
      )
      const map = buildInlineStyleImportMap()

      const el = document.createElement('em')
      el.style.fontSize = '16px'

      const conversion = (
        map.em as (node: HTMLElement) => {
          conversion: () => {
            node: null
            forChild: (n: LexicalNode) => LexicalNode
          }
        }
      )(el)
      const { forChild } = conversion.conversion()

      const textNode = createMockTextNode()
      forChild(textNode)

      const state = mockTextNodes.get(textNode as unknown as object)!
      expect(state.formats.has('italic')).toBe(true)
      expect(state.style).toContain('font-size: 16px')
    })

    it('toggles bold from <strong> and preserves color', async () => {
      const { buildInlineStyleImportMap } = await import(
        '../../../src/lexical/plugins/element-style'
      )
      const map = buildInlineStyleImportMap()

      const el = document.createElement('strong')
      el.style.color = 'blue'

      const conversion = (
        map.strong as (node: HTMLElement) => {
          conversion: () => {
            node: null
            forChild: (n: LexicalNode) => LexicalNode
          }
        }
      )(el)
      const { forChild } = conversion.conversion()

      const textNode = createMockTextNode()
      forChild(textNode)

      const state = mockTextNodes.get(textNode as unknown as object)!
      expect(state.formats.has('bold')).toBe(true)
      expect(state.style).toContain('color: blue')
    })

    it('does NOT include font-weight in style string (format-toggle property)', async () => {
      const { buildInlineStyleImportMap } = await import(
        '../../../src/lexical/plugins/element-style'
      )
      const map = buildInlineStyleImportMap([
        'color',
        'font-weight',
        'font-size',
      ])

      const el = document.createElement('span')
      el.style.color = 'red'
      el.style.fontWeight = 'bold'
      el.style.fontSize = '14px'

      const conversion = (
        map.span as (node: HTMLElement) => {
          conversion: () => {
            node: null
            forChild: (n: LexicalNode) => LexicalNode
          }
        }
      )(el)
      const { forChild } = conversion.conversion()

      const textNode = createMockTextNode()
      forChild(textNode)

      const state = mockTextNodes.get(textNode as unknown as object)!
      // font-weight should be handled as format toggle, not in style
      expect(state.formats.has('bold')).toBe(true)
      expect(state.style).toContain('color: red')
      expect(state.style).toContain('font-size: 14px')
      expect(state.style).not.toContain('font-weight')
    })

    it('toggles bold from font-weight: 700 in inline style', async () => {
      const { buildInlineStyleImportMap } = await import(
        '../../../src/lexical/plugins/element-style'
      )
      const map = buildInlineStyleImportMap()

      const el = document.createElement('span')
      el.style.fontWeight = '700'

      const conversion = (
        map.span as (node: HTMLElement) => {
          conversion: () => {
            node: null
            forChild: (n: LexicalNode) => LexicalNode
          }
        }
      )(el)
      const { forChild } = conversion.conversion()

      const textNode = createMockTextNode()
      forChild(textNode)

      const state = mockTextNodes.get(textNode as unknown as object)!
      expect(state.formats.has('bold')).toBe(true)
    })

    it('toggles italic from font-style: italic in inline style', async () => {
      const { buildInlineStyleImportMap } = await import(
        '../../../src/lexical/plugins/element-style'
      )
      const map = buildInlineStyleImportMap()

      const el = document.createElement('span')
      el.style.fontStyle = 'italic'

      const conversion = (
        map.span as (node: HTMLElement) => {
          conversion: () => {
            node: null
            forChild: (n: LexicalNode) => LexicalNode
          }
        }
      )(el)
      const { forChild } = conversion.conversion()

      const textNode = createMockTextNode()
      forChild(textNode)

      const state = mockTextNodes.get(textNode as unknown as object)!
      expect(state.formats.has('italic')).toBe(true)
    })

    it('<b style="font-weight: normal"> does NOT apply bold (Google Docs)', async () => {
      const { buildInlineStyleImportMap } = await import(
        '../../../src/lexical/plugins/element-style'
      )
      const map = buildInlineStyleImportMap()

      const el = document.createElement('b')
      el.style.fontWeight = 'normal'

      const conversion = (
        map.b as (node: HTMLElement) => {
          conversion: () => {
            node: null
            forChild: (n: LexicalNode) => LexicalNode
          }
        }
      )(el)
      const { forChild } = conversion.conversion()

      const textNode = createMockTextNode()
      forChild(textNode)

      const state = mockTextNodes.get(textNode as unknown as object)!
      expect(state.formats.has('bold')).toBe(false)
    })

    it('accepts custom property list', async () => {
      const { buildInlineStyleImportMap } = await import(
        '../../../src/lexical/plugins/element-style'
      )
      const map = buildInlineStyleImportMap(['color', 'letter-spacing'])

      const el = document.createElement('span')
      el.style.color = 'green'
      el.style.letterSpacing = '2px'
      el.style.fontSize = '20px' // not in allowed list

      const conversion = (
        map.span as (node: HTMLElement) => {
          conversion: () => {
            node: null
            forChild: (n: LexicalNode) => LexicalNode
          }
        }
      )(el)
      const { forChild } = conversion.conversion()

      const textNode = createMockTextNode()
      forChild(textNode)

      const state = mockTextNodes.get(textNode as unknown as object)!
      expect(state.style).toContain('color: green')
      expect(state.style).toContain('letter-spacing: 2px')
      expect(state.style).not.toContain('font-size')
    })

    it('returns node: null in conversion output', async () => {
      const { buildInlineStyleImportMap } = await import(
        '../../../src/lexical/plugins/element-style'
      )
      const map = buildInlineStyleImportMap()

      const el = document.createElement('span')
      const conversion = (
        map.span as (node: HTMLElement) => {
          conversion: () => { node: null; forChild: unknown }
        }
      )(el)
      const output = conversion.conversion()
      expect(output.node).toBeNull()
    })

    it('does not modify non-TextNode children', async () => {
      const { buildInlineStyleImportMap } = await import(
        '../../../src/lexical/plugins/element-style'
      )
      const map = buildInlineStyleImportMap()

      const el = document.createElement('span')
      el.style.color = 'red'

      const conversion = (
        map.span as (node: HTMLElement) => {
          conversion: () => {
            node: null
            forChild: (n: LexicalNode) => LexicalNode
          }
        }
      )(el)
      const { forChild } = conversion.conversion()

      // A non-TextNode (not in mockTextNodes map)
      const nonTextNode = {} as LexicalNode
      const result = forChild(nonTextNode)
      expect(result).toBe(nonTextNode)
    })
  })

  describe('buildStyleImportMap', () => {
    it('includes both block-level and inline entries', async () => {
      const { buildStyleImportMap } = await import(
        '../../../src/lexical/plugins/element-style'
      )
      const map = buildStyleImportMap()

      // Block-level entries
      expect(map.p).toBeDefined()
      expect(map.h1).toBeDefined()
      expect(map.h2).toBeDefined()
      expect(map.h3).toBeDefined()
      expect(map.h4).toBeDefined()
      expect(map.h5).toBeDefined()
      expect(map.h6).toBeDefined()

      // Inline entries
      expect(map.span).toBeDefined()
      expect(map.em).toBeDefined()
      expect(map.strong).toBeDefined()
      expect(map.b).toBeDefined()
      expect(map.i).toBeDefined()
      expect(map.u).toBeDefined()
      expect(map.s).toBeDefined()
      expect(map.sub).toBeDefined()
      expect(map.sup).toBeDefined()
      expect(map.code).toBeDefined()
      expect(map.mark).toBeDefined()
    })

    it('passes custom inline properties through', async () => {
      const { buildStyleImportMap } = await import(
        '../../../src/lexical/plugins/element-style'
      )
      const map = buildStyleImportMap(['color'])

      const el = document.createElement('span')
      el.style.color = 'red'
      el.style.fontSize = '14px' // not in allowed list

      const conversion = (
        map.span as (node: HTMLElement) => {
          conversion: () => {
            node: null
            forChild: (n: LexicalNode) => LexicalNode
          }
        }
      )(el)
      const { forChild } = conversion.conversion()

      const textNode = createMockTextNode()
      forChild(textNode)

      const state = mockTextNodes.get(textNode as unknown as object)!
      expect(state.style).toContain('color: red')
      expect(state.style).not.toContain('font-size')
    })
  })
})

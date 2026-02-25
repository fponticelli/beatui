import type {
  LexicalEditor,
  LexicalNode,
  DOMExportOutput,
  DOMExportOutputMap,
  DOMConversionMap,
  ElementFormatType,
  TextFormatType,
} from 'lexical'
import {
  $getRoot,
  $isElementNode,
  $isRootNode,
  $getNodeByKey,
  $isTextNode,
  $createParagraphNode,
  ParagraphNode,
} from 'lexical'
import { $createHeadingNode, HeadingNode, QuoteNode } from '@lexical/rich-text'
import { isHTMLElement } from '@lexical/utils'

/**
 * Merge a CSS property into an existing CSS text string.
 * Replaces the property if it already exists, appends it otherwise.
 * If value is empty, removes the property.
 */
export function mergeElementStyle(
  cssText: string,
  prop: string,
  value: string
): string {
  const properties = new Map<string, string>()
  if (cssText) {
    for (const part of cssText.split(';')) {
      const trimmed = part.trim()
      if (!trimmed) continue
      const colonIndex = trimmed.indexOf(':')
      if (colonIndex === -1) continue
      const key = trimmed.slice(0, colonIndex).trim()
      const val = trimmed.slice(colonIndex + 1).trim()
      properties.set(key, val)
    }
  }

  if (value) {
    properties.set(prop, value)
  } else {
    properties.delete(prop)
  }

  if (properties.size === 0) return ''
  return Array.from(properties.entries())
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ')
}

/**
 * Extract a single CSS property value from a CSS text string.
 */
export function getElementStyleProperty(cssText: string, prop: string): string {
  if (!cssText) return ''
  const regex = new RegExp(
    `(?:^|;)\\s*${prop.replace(/-/g, '\\-')}:\\s*([^;]+)`
  )
  const match = cssText.match(regex)
  return match ? match[1].trim() : ''
}

/**
 * Apply custom style properties from an ElementNode's style to its DOM element.
 * Only touches properties that Lexical's reconciler does not handle natively
 * (background-color, line-height) to avoid interfering with Lexical's own
 * format/indent/direction handling.
 */
function syncElementStyleToDOM(editor: LexicalEditor, key: string): void {
  const dom = editor.getElementByKey(key)
  if (!dom) return

  editor.getEditorState().read(() => {
    const node = $getNodeByKey(key)
    if (!$isElementNode(node) || $isRootNode(node)) return

    const style = node.getStyle()
    const bgColor = getElementStyleProperty(style, 'background-color')
    dom.style.backgroundColor = bgColor || ''
    const lineHeight = getElementStyleProperty(style, 'line-height')
    dom.style.lineHeight = lineHeight || ''
  })
}

/**
 * Plugin that synchronizes ElementNode.__style to the DOM.
 *
 * Lexical's reconciler does not apply ElementNode.__style to the DOM
 * automatically. This plugin bridges that gap by listening for updates
 * and syncing background-color from node state to the DOM element.
 */
export function registerElementStylePlugin(editor: LexicalEditor): () => void {
  const removeUpdateListener = editor.registerUpdateListener(
    ({ dirtyElements }) => {
      if (dirtyElements.size === 0) return
      for (const [key] of dirtyElements) {
        syncElementStyleToDOM(editor, key)
      }
    }
  )

  // Sync on initial load for element nodes that already have styles
  editor.getEditorState().read(() => {
    const root = $getRoot()
    for (const child of root.getChildren()) {
      if ($isElementNode(child)) {
        const style = child.getStyle()
        if (style) {
          const dom = editor.getElementByKey(child.getKey())
          if (dom) {
            const bgColor = getElementStyleProperty(style, 'background-color')
            if (bgColor) {
              dom.style.backgroundColor = bgColor
            }
            const lineHeight = getElementStyleProperty(style, 'line-height')
            if (lineHeight) {
              dom.style.lineHeight = lineHeight
            }
          }
        }
      }
    }
  })

  return removeUpdateListener
}

/**
 * Custom exportDOM for element nodes that includes __style in the output.
 * Used as an html.export override in createEditor config.
 */
function exportElementWithStyle(
  editor: LexicalEditor,
  target: LexicalNode
): DOMExportOutput {
  const output = target.exportDOM(editor)
  if (
    output.element &&
    isHTMLElement(output.element) &&
    $isElementNode(target)
  ) {
    const style = target.getStyle()
    const bgColor = getElementStyleProperty(style, 'background-color')
    if (bgColor) {
      output.element.style.backgroundColor = bgColor
    }
    const lineHeight = getElementStyleProperty(style, 'line-height')
    if (lineHeight) {
      output.element.style.lineHeight = lineHeight
    }
  }
  return output
}

/**
 * Build an html.export Map that overrides exportDOM for block element nodes
 * to include __style (background-color) in the serialized HTML.
 */
export function buildElementStyleExportMap(): DOMExportOutputMap {
  const map: DOMExportOutputMap = new Map()
  map.set(ParagraphNode, exportElementWithStyle)
  map.set(HeadingNode, exportElementWithStyle)
  map.set(QuoteNode, exportElementWithStyle)
  return map
}

/**
 * Build an html.import DOMConversionMap that preserves background-color
 * from imported HTML elements onto the Lexical node style.
 */
export function buildElementStyleImportMap(): DOMConversionMap {
  const makeImporter = (
    createNode: (element: HTMLElement) => LexicalNode | null
  ) => {
    return () => ({
      conversion: (element: HTMLElement) => {
        const node = createNode(element)
        if (node && $isElementNode(node)) {
          if (element.style?.textAlign) {
            node.setFormat(element.style.textAlign as ElementFormatType)
          }
          let nodeStyle = ''
          if (element.style?.backgroundColor) {
            nodeStyle = mergeElementStyle(
              nodeStyle,
              'background-color',
              element.style.backgroundColor
            )
          }
          if (element.style?.lineHeight) {
            nodeStyle = mergeElementStyle(
              nodeStyle,
              'line-height',
              element.style.lineHeight
            )
          }
          if (nodeStyle) {
            node.setStyle(nodeStyle)
          }
        }
        return { node }
      },
      priority: 1 as const,
    })
  }

  return {
    p: makeImporter(() => $createParagraphNode()),
    h1: makeImporter(() => $createHeadingNode('h1')),
    h2: makeImporter(() => $createHeadingNode('h2')),
    h3: makeImporter(() => $createHeadingNode('h3')),
    h4: makeImporter(() => $createHeadingNode('h4')),
    h5: makeImporter(() => $createHeadingNode('h5')),
    h6: makeImporter(() => $createHeadingNode('h6')),
  }
}

// ---------------------------------------------------------------------------
// Inline style import
// ---------------------------------------------------------------------------

/**
 * Default set of CSS properties to preserve on inline text nodes during
 * HTML import. Matches the properties the toolbar applies via
 * `$patchStyleText()`.
 */
export const DEFAULT_INLINE_STYLE_PROPERTIES: readonly string[] = [
  'color',
  'font-size',
  'font-family',
  'background-color',
  'line-height',
]

/**
 * CSS properties that are handled by Lexical text format toggles.
 * These must NOT be copied into TextNode.__style to avoid
 * double-application on export.
 */
const FORMAT_TOGGLE_PROPERTIES = new Set([
  'font-weight',
  'font-style',
  'text-decoration',
  'text-decoration-line',
  'vertical-align',
])

/**
 * Map from HTML tag name to the Lexical TextFormatType it represents.
 * Replicates Lexical's internal `nodeNameToTextFormat`.
 */
const TAG_TO_FORMAT: Record<string, TextFormatType> = {
  code: 'code',
  em: 'italic',
  i: 'italic',
  mark: 'highlight',
  s: 'strikethrough',
  strong: 'bold',
  sub: 'subscript',
  sup: 'superscript',
  u: 'underline',
}

/**
 * All inline element tag names that need style-preserving import handlers.
 */
const INLINE_TAGS = [
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
] as const

/**
 * Replicate Lexical's `applyTextFormatFromStyle` logic.
 * Examines CSS properties on the element to toggle text formats
 * (bold from font-weight, italic from font-style, etc.), then
 * optionally applies the tag-specific format.
 */
function applyFormatsFromStyle(
  style: CSSStyleDeclaration,
  node: LexicalNode,
  tagFormat?: TextFormatType
): void {
  if (!$isTextNode(node)) return

  const fontWeight = style.fontWeight
  const textDecoration = style.textDecoration.split(' ')

  if (
    (fontWeight === '700' || fontWeight === 'bold') &&
    !node.hasFormat('bold')
  ) {
    node.toggleFormat('bold')
  }

  if (style.fontStyle === 'italic' && !node.hasFormat('italic')) {
    node.toggleFormat('italic')
  }

  if (
    textDecoration.includes('line-through') &&
    !node.hasFormat('strikethrough')
  ) {
    node.toggleFormat('strikethrough')
  }

  if (textDecoration.includes('underline') && !node.hasFormat('underline')) {
    node.toggleFormat('underline')
  }

  if (style.verticalAlign === 'sub' && !node.hasFormat('subscript')) {
    node.toggleFormat('subscript')
  }

  if (style.verticalAlign === 'super' && !node.hasFormat('superscript')) {
    node.toggleFormat('superscript')
  }

  if (tagFormat && !node.hasFormat(tagFormat)) {
    node.toggleFormat(tagFormat)
  }
}

/**
 * Build a DOMConversionMap that preserves inline CSS styles from inline
 * HTML elements onto Lexical TextNode.__style.
 *
 * Also replicates Lexical's default format toggling (bold from
 * font-weight, italic from font-style, etc.) since our priority-1
 * handler replaces the default priority-0 handler.
 *
 * @param properties - CSS properties to preserve. Defaults to
 *   {@link DEFAULT_INLINE_STYLE_PROPERTIES}.
 */
export function buildInlineStyleImportMap(
  properties: readonly string[] = DEFAULT_INLINE_STYLE_PROPERTIES
): DOMConversionMap {
  const map: DOMConversionMap = {}

  for (const tag of INLINE_TAGS) {
    map[tag] = (domNode: HTMLElement) => {
      const style = domNode.style
      const tagFormat = TAG_TO_FORMAT[tag]

      // <b> with font-weight: normal should NOT apply bold (Google Docs pattern)
      const resolvedFormat: TextFormatType | undefined =
        tag === 'b'
          ? style.fontWeight !== 'normal'
            ? 'bold'
            : undefined
          : tagFormat

      return {
        conversion: () => ({
          node: null,
          forChild: lexicalNode => {
            if (!$isTextNode(lexicalNode)) return lexicalNode

            // 1. Apply format toggles (replicate Lexical default behaviour)
            applyFormatsFromStyle(style, lexicalNode, resolvedFormat)

            // 2. Merge preserved inline styles onto the TextNode
            let merged = lexicalNode.getStyle()
            for (const prop of properties) {
              if (FORMAT_TOGGLE_PROPERTIES.has(prop)) continue
              const value = style.getPropertyValue(prop)
              if (value) {
                merged = mergeElementStyle(merged, prop, value)
              }
            }
            if (merged) {
              lexicalNode.setStyle(merged)
            }

            return lexicalNode
          },
        }),
        priority: 1 as const,
      }
    }
  }

  return map
}

/**
 * Build a combined DOMConversionMap that preserves styles for both
 * block-level elements (text-align, background-color on p/h1-h6)
 * and inline elements (color, font-size, font-family, background-color
 * on span/em/strong/etc.).
 *
 * @param inlineProperties - CSS properties to preserve on inline text
 *   nodes. Defaults to {@link DEFAULT_INLINE_STYLE_PROPERTIES}.
 */
export function buildStyleImportMap(
  inlineProperties?: readonly string[]
): DOMConversionMap {
  return {
    ...buildElementStyleImportMap(),
    ...buildInlineStyleImportMap(inlineProperties),
  }
}

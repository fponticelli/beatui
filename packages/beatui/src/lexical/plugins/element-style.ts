import type {
  LexicalEditor,
  LexicalNode,
  DOMExportOutput,
  DOMExportOutputMap,
  DOMConversionMap,
  ElementFormatType,
} from 'lexical'
import {
  $getRoot,
  $isElementNode,
  $isRootNode,
  $getNodeByKey,
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
export function getElementStyleProperty(
  cssText: string,
  prop: string
): string {
  if (!cssText) return ''
  const regex = new RegExp(
    `(?:^|;)\\s*${prop.replace(/-/g, '\\-')}:\\s*([^;]+)`
  )
  const match = cssText.match(regex)
  return match ? match[1].trim() : ''
}

/**
 * Apply background-color from an ElementNode's style to its DOM element.
 * Only touches background-color to avoid interfering with Lexical's own
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
  })
}

/**
 * Plugin that synchronizes ElementNode.__style to the DOM.
 *
 * Lexical's reconciler does not apply ElementNode.__style to the DOM
 * automatically. This plugin bridges that gap by listening for updates
 * and syncing background-color from node state to the DOM element.
 */
export function registerElementStylePlugin(
  editor: LexicalEditor
): () => void {
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
            const bgColor = getElementStyleProperty(
              style,
              'background-color'
            )
            if (bgColor) {
              dom.style.backgroundColor = bgColor
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
          if (element.style?.backgroundColor) {
            node.setStyle(
              mergeElementStyle(
                '',
                'background-color',
                element.style.backgroundColor
              )
            )
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

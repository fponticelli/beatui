import {
  DecoratorNode,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type LexicalNode,
  type SerializedLexicalNode,
  type Spread,
  $applyNodeReplacement,
} from 'lexical'

export type SerializedHorizontalRuleNode = Spread<
  { type: 'horizontal-rule'; version: 1 },
  SerializedLexicalNode
>

export class HorizontalRuleNode extends DecoratorNode<null> {
  static getType(): string {
    return 'horizontal-rule'
  }

  static clone(node: HorizontalRuleNode): HorizontalRuleNode {
    return new HorizontalRuleNode(node.__key)
  }

  static importJSON(
    _serializedNode: SerializedHorizontalRuleNode
  ): HorizontalRuleNode {
    return $createHorizontalRuleNode()
  }

  static importDOM(): DOMConversionMap | null {
    return {
      hr: () => ({
        conversion: convertHorizontalRuleElement,
        priority: 0,
      }),
    }
  }

  exportJSON(): SerializedHorizontalRuleNode {
    return {
      ...super.exportJSON(),
      type: 'horizontal-rule',
      version: 1,
    }
  }

  exportDOM(): DOMExportOutput {
    return { element: document.createElement('hr') }
  }

  createDOM(): HTMLElement {
    return document.createElement('hr')
  }

  updateDOM(): false {
    return false
  }

  getTextContent(): string {
    return '\n'
  }

  isInline(): false {
    return false
  }

  decorate(): null {
    return null
  }
}

function convertHorizontalRuleElement(): DOMConversionOutput {
  return { node: $createHorizontalRuleNode() }
}

export function $createHorizontalRuleNode(): HorizontalRuleNode {
  return $applyNodeReplacement(new HorizontalRuleNode())
}

export function $isHorizontalRuleNode(
  node: LexicalNode | null | undefined
): node is HorizontalRuleNode {
  return node instanceof HorizontalRuleNode
}

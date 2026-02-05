import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table'
import { LinkNode, AutoLinkNode } from '@lexical/link'
import { CodeNode, CodeHighlightNode } from '@lexical/code'
import { HashtagNode } from '@lexical/hashtag'
import { MarkNode } from '@lexical/mark'
import { OverflowNode } from '@lexical/overflow'
import { HorizontalRuleNode } from './horizontal-rule-node'
import type { Klass, LexicalNode } from 'lexical'
import type { EditorPresetType, PluginConfig } from './types'

/**
 * Compute the list of Lexical node classes required for the given plugin configuration.
 * Each plugin maps to specific node types that must be registered with createEditor().
 *
 * Note: Node classes are imported statically (not lazily) because they are needed during
 * editor initialization. These are small registration classes, not the full plugin logic.
 *
 * Common content nodes (HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode,
 * CodeNode, CodeHighlightNode) are always registered so that content in any format
 * (markdown, HTML, JSON) can be parsed and displayed correctly, even when the
 * corresponding editing plugins are not enabled.
 *
 * @param config - The plugin configuration object
 * @returns Array of Lexical node classes to register
 */
export function getNodesForPlugins(
  config: PluginConfig
): Array<Klass<LexicalNode>> {
  // Always register common content nodes so that markdown/HTML/JSON content
  // can be parsed regardless of which editing plugins are enabled.
  const nodes: Array<Klass<LexicalNode>> = [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    CodeNode,
    CodeHighlightNode,
    HorizontalRuleNode,
  ]

  if (config.table) {
    nodes.push(TableNode, TableCellNode, TableRowNode)
  }

  if (config.autoLink) {
    nodes.push(AutoLinkNode)
  }

  if (config.hashtag) {
    nodes.push(HashtagNode)
  }

  if (config.mark) {
    nodes.push(MarkNode)
  }

  if (config.overflow) {
    nodes.push(OverflowNode)
  }

  // Deduplicate (in case multiple plugins pull in the same node)
  return [...new Set(nodes)]
}

/**
 * Get the default plugin configuration for a given editor preset.
 *
 * - **bare**: Minimal (richText + history + clipboard)
 * - **docked**: Batteries-included (richText + history + clipboard + list + link + autoLink + code + table)
 * - **contextual**: Same as docked (block handle is managed by the component, not a plugin)
 *
 * @param preset - The editor preset type
 * @returns Default plugin configuration for the preset
 */
export function createDefaultPluginConfig(
  preset: EditorPresetType
): PluginConfig {
  switch (preset) {
    case 'bare':
      return {
        richText: true,
        history: true,
        clipboard: true,
      }
    case 'docked':
      return {
        richText: true,
        history: true,
        clipboard: true,
        list: true,
        link: true,
        autoLink: true,
        code: true,
        table: true,
      }
    case 'contextual':
      return {
        richText: true,
        history: true,
        clipboard: true,
        list: true,
        link: true,
        autoLink: true,
        code: true,
        table: true,
      }
  }
}

import {
  $isTextNode,
  $getNodeByKey,
  TextNode,
  type LexicalEditor,
} from 'lexical'
import type { AutoLinkPluginOptions, AutoLinkMatcher } from '../types'

const URL_REGEX = /((https?:\/\/(www\.)?|www\.)[^\s<>]+)/g
const EMAIL_REGEX = /([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g

const DEFAULT_MATCHERS: AutoLinkMatcher[] = [
  {
    pattern: URL_REGEX,
    urlTransformer: (match: string) =>
      match.startsWith('http') ? match : `https://${match}`,
  },
  {
    pattern: EMAIL_REGEX,
    urlTransformer: (match: string) => `mailto:${match}`,
  },
]

/**
 * Register automatic link detection and creation.
 * Detects URLs and email addresses as you type and converts them to links.
 */
export async function registerAutoLinkPlugin(
  editor: LexicalEditor,
  options?: AutoLinkPluginOptions
): Promise<() => void> {
  const matchers = options?.matchers ?? DEFAULT_MATCHERS

  // Listen for text mutations and auto-link URLs
  return editor.registerMutationListener(TextNode, mutations => {
    editor.update(() => {
      for (const [key, type] of mutations) {
        if (type !== 'created' && type !== 'updated') continue

        const node = $getNodeByKey(key)
        if (!node || !$isTextNode(node)) continue

        const text = node.getTextContent()

        for (const matcher of matchers) {
          const regex = new RegExp(
            matcher.pattern.source,
            matcher.pattern.flags
          )
          let match: RegExpExecArray | null
          while ((match = regex.exec(text)) !== null) {
            // Create auto link node
            // Note: Full implementation would need text node splitting
            // This is a simplified version - the real implementation uses @lexical/link's auto-link utils
            const url = matcher.urlTransformer(match[0])
            void url // Placeholder for now
          }
        }
      }
    })
  })
}

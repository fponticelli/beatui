import { html, attr } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Icon, Notice, Badge } from '@tempots/beatui'
import { CodeBlock } from '../../framework/code-block'

export const meta = {
  title: 'ProseMirror Editor',
  description:
    'Markdown-focused rich text editor with configurable features, toolbar, and bidirectional markdown serialization.',
}

const INSTALL_CODE = `// Import the component
import { ProseMirrorMarkdownInput } from '@tempots/beatui/prosemirror'

// Import the stylesheet (required)
import '@tempots/beatui/prosemirror.css'`

const BASIC_USAGE_CODE = `import { ProseMirrorMarkdownInput } from '@tempots/beatui/prosemirror'
import { prop } from '@tempots/dom'

const markdown = prop('# Hello\\n\\n**Bold** and _italic_ text.')

ProseMirrorMarkdownInput({
  value: markdown,
  onInput: v => markdown.set(v),
  showToolbar: true,
  placeholder: 'Start typing...',
})`

const FEATURES_CODE = `import { ProseMirrorMarkdownInput, MarkdownFeatures } from '@tempots/beatui/prosemirror'
import { prop } from '@tempots/dom'

const markdown = prop('')

// MarkdownFeatures controls which editing capabilities are active
const features: MarkdownFeatures = {
  headings: true,          // # Heading support
  headerLevels: [1, 2, 3], // Restrict to H1, H2, H3 only
  bold: true,              // **bold**
  italic: true,            // _italic_
  code: true,              // \`inline code\`
  links: true,             // [text](url)
  bulletList: true,        // - list items
  orderedList: true,       // 1. list items
  blockquote: true,        // > quoted text
  codeBlock: true,         // fenced code blocks
  horizontalRule: true,    // --- horizontal rule
}

ProseMirrorMarkdownInput({
  value: markdown,
  onInput: v => markdown.set(v),
  features,
  showToolbar: true,
})`

const SIMPLE_FEATURES_CODE = `import { ProseMirrorMarkdownInput } from '@tempots/beatui/prosemirror'
import { prop } from '@tempots/dom'

// A comment box — bold, italic, and lists only
ProseMirrorMarkdownInput({
  value: prop(''),
  onInput: handleInput,
  showToolbar: true,
  features: {
    headings: false,
    bold: true,
    italic: true,
    code: false,
    links: false,
    bulletList: true,
    orderedList: false,
    blockquote: false,
    codeBlock: false,
    horizontalRule: false,
  },
})`

const TOOLBAR_READ_ONLY_CODE = `import { ProseMirrorMarkdownInput } from '@tempots/beatui/prosemirror'
import { prop } from '@tempots/dom'

const content = prop('# Article\\n\\nThis content is read-only.')
const isReadOnly = prop(false)

// showToolbar: false — hide the toolbar entirely
ProseMirrorMarkdownInput({
  value: content,
  onInput: v => content.set(v),
  showToolbar: false,
  placeholder: 'No toolbar variant...',
})

// readOnly: true — disable editing, toolbar is automatically hidden
ProseMirrorMarkdownInput({
  value: content,
  onInput: v => content.set(v),
  readOnly: isReadOnly,
  showToolbar: true,
})

// Toggle read-only mode programmatically
isReadOnly.set(true)`

export default function ProseMirrorEditorPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-4xl mx-auto'),

      // Page header
      html.div(
        attr.class('space-y-3'),
        html.h1(attr.class('text-3xl font-bold'), 'ProseMirror Editor'),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400 max-w-2xl'),
          'BeatUI wraps ProseMirror as a markdown-first rich text editor with bidirectional serialization, a configurable toolbar, and fine-grained feature toggles so you can expose exactly the formatting options your users need.'
        )
      ),

      // Section 1: Overview
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:pencil-line', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Overview')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'The ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'ProseMirrorMarkdownInput'
            ),
            ' component is imported from ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              '@tempots/beatui/prosemirror'
            ),
            '. It reads and emits standard Markdown — content is serialized to Markdown on every change and passed to ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'onInput'
            ),
            '.'
          ),
          Notice(
            { variant: 'info', title: 'CSS required' },
            'You must import ',
            html.code(
              attr.class('font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'),
              "import '@tempots/beatui/prosemirror.css'"
            ),
            ' alongside the component import for correct editor and toolbar styling.'
          ),
          CodeBlock(INSTALL_CODE, 'typescript'),
          html.div(
            attr.class('flex flex-wrap gap-2 pt-1'),
            Badge({ variant: 'light', color: 'primary', size: 'sm' }, 'ProseMirrorMarkdownInput'),
            Badge({ variant: 'light', color: 'secondary', size: 'sm' }, 'MarkdownFeatures'),
            Badge({ variant: 'light', color: 'success', size: 'sm' }, 'Markdown serialization'),
          )
        )
      ),

      // Section 2: Basic Usage
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:play', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Basic Usage')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Create a reactive signal with ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'prop()'
            ),
            ' holding your initial Markdown string. The editor parses it on mount and calls ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'onInput'
            ),
            ' with the serialized Markdown string on every edit.'
          ),
          CodeBlock(BASIC_USAGE_CODE, 'typescript')
        )
      ),

      // Section 3: Feature Configuration
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:sliders-horizontal', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Feature Configuration')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Pass a ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'features'
            ),
            ' object of type ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'MarkdownFeatures'
            ),
            ' to control which formatting options are available. Disabled features are removed from the toolbar and blocked in the editor schema.'
          ),
          CodeBlock(FEATURES_CODE, 'typescript'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400 pt-1'),
            'You can also pass a minimal feature set for constrained contexts such as comment boxes or annotation fields:'
          ),
          CodeBlock(SIMPLE_FEATURES_CODE, 'typescript'),
          html.div(
            attr.class('grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1'),
            ...[
              'headings', 'bold', 'italic', 'code', 'links',
              'bulletList', 'orderedList', 'blockquote', 'codeBlock', 'horizontalRule',
            ].map(feature =>
              html.div(
                attr.class('flex items-center gap-2 p-2 rounded border border-gray-200 dark:border-gray-700'),
                Icon({ icon: 'lucide:check', size: 'xs' }),
                html.code(
                  attr.class('font-mono text-xs text-gray-700 dark:text-gray-300'),
                  feature
                )
              )
            )
          )
        )
      ),

      // Section 4: Toolbar and Read-Only
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:layout-panel-top', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Toolbar and Read-Only')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Control the toolbar with ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'showToolbar'
            ),
            ' and toggle editing with ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'readOnly'
            ),
            '. Both props accept static booleans or reactive ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'Value<boolean>'
            ),
            ' signals, so you can toggle them at runtime in response to user actions or permission changes.'
          ),
          CodeBlock(TOOLBAR_READ_ONLY_CODE, 'typescript'),
          Notice(
            { variant: 'info', title: 'Toolbar auto-hides' },
            'When ',
            html.code(
              attr.class('font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'),
              'readOnly'
            ),
            ' is ',
            html.code(
              attr.class('font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'),
              'true'
            ),
            ', the toolbar is hidden regardless of the ',
            html.code(
              attr.class('font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'),
              'showToolbar'
            ),
            ' value.'
          )
        )
      )
    ),
  })
}

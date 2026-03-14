import { html, attr, prop } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Icon, Notice, Badge } from '@tempots/beatui'
import { DockedEditor, ContextualEditor } from '@tempots/beatui/lexical'
import { CodeBlock } from '../../framework/code-block'

export const meta = {
  title: 'Lexical Editor',
  description:
    'Extensible rich text editor with docked toolbar, contextual toolbar, and bare presets. Supports markdown, HTML, and JSON content formats.',
}

const INSTALL_CODE = `// Import the component
import { BareEditor, DockedEditor, ContextualEditor } from '@tempots/beatui/lexical'

// Import the stylesheet (required)
import '@tempots/beatui/lexical.css'`

const PRESETS_CODE = `import { BareEditor, DockedEditor, ContextualEditor } from '@tempots/beatui/lexical'

// Minimal editor surface — no built-in toolbar
BareEditor({ value: '# Hello', format: 'markdown', onInput: handleInput })

// Full toolbar docked above the editor
DockedEditor({
  value: '# Hello',
  format: 'markdown',
  onInput: handleInput,
  toolbar: { hiddenGroups: [] },
})

// Floating toolbar that appears on text selection
ContextualEditor({
  value: '# Hello',
  format: 'markdown',
  onInput: handleInput,
  floatingToolbarGroups: ['text-formatting', 'links'],
})`

const FORMATS_CODE = `import { DockedEditor } from '@tempots/beatui/lexical'

// Markdown format (default)
DockedEditor({
  value: '# Hello\\n\\nSome **bold** and _italic_ text.',
  format: 'markdown',
  onInput: (md) => console.log('markdown:', md),
})

// HTML format
DockedEditor({
  value: '<h1>Hello</h1><p>Some <strong>bold</strong> text.</p>',
  format: 'html',
  onInput: (html) => console.log('html:', html),
})

// JSON format (Lexical editor state)
DockedEditor({
  value: JSON.stringify({ root: { children: [], direction: null, format: '', indent: 0, type: 'root', version: 1 } }),
  format: 'json',
  onInput: (json) => console.log('editor state:', json),
})`

const PLUGINS_CODE = `import { createDefaultPluginConfig } from '@tempots/beatui/lexical'

// Returns a full plugin configuration for the given preset
const plugins = createDefaultPluginConfig('docked')

// Available plugins in the configuration:
// - richText       Core rich text editing support
// - history        Undo / redo
// - clipboard      Copy / paste handling
// - list           Ordered and unordered lists
// - link           Hyperlink nodes
// - autoLink       Auto-detect URLs and convert to links
// - code           Inline code and fenced code blocks
// - table          Table insertion and editing
// - hashtag        Hashtag node support
// - mark           Highlighted text marks
// - dragon         Dragon NaturallySpeaking dictation support

// Pass a custom plugin config to BareEditor for full control
BareEditor({
  value: '# Hello',
  format: 'markdown',
  onInput: handleInput,
  plugins,
})`

const READ_ONLY_CODE = `import { DockedEditor } from '@tempots/beatui/lexical'
import { prop } from '@tempots/dom'

const isReadOnly = prop(false)

DockedEditor({
  value: '# Terms of Service\\n\\nPlease read carefully.',
  format: 'markdown',
  readOnly: isReadOnly,
  onInput: handleInput,
})

// Toggle programmatically
isReadOnly.set(true)`

export default function LexicalEditorPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-4xl mx-auto'),

      // Page header
      html.div(
        attr.class('space-y-3'),
        html.h1(attr.class('text-3xl font-bold'), 'Lexical Editor'),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400 max-w-2xl'),
          'BeatUI wraps the Lexical editor framework with three ready-to-use presets. Choose from a minimal bare surface, a full docked toolbar, or a floating contextual toolbar that appears on selection.'
        )
      ),

      // Section 1: Overview
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:file-text', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Overview')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Three editor presets are exported from ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              '@tempots/beatui/lexical'
            ),
            ': ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'BareEditor'
            ),
            ' (minimal surface), ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'DockedEditor'
            ),
            ' (persistent toolbar), and ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'ContextualEditor'
            ),
            ' (floating toolbar on selection).'
          ),
          Notice(
            { variant: 'info', title: 'CSS required' },
            'You must import ',
            html.code(
              attr.class('font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'),
              "import '@tempots/beatui/lexical.css'"
            ),
            ' alongside the component imports, or the editor will render without styles.'
          ),
          CodeBlock(INSTALL_CODE, 'typescript'),
          html.div(
            attr.class('flex flex-wrap gap-2 pt-1'),
            Badge({ variant: 'light', color: 'primary', size: 'sm' }, 'BareEditor'),
            Badge({ variant: 'light', color: 'secondary', size: 'sm' }, 'DockedEditor'),
            Badge({ variant: 'light', color: 'success', size: 'sm' }, 'ContextualEditor'),
          )
        )
      ),

      // Section 2: Editor Presets
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:layout-panel-top', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Editor Presets')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'All three presets share the same core props — ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'value'
            ),
            ', ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'format'
            ),
            ', ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'onInput'
            ),
            ', and ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'readOnly'
            ),
            '. Each preset adds its own toolbar configuration on top.'
          ),
          CodeBlock(PRESETS_CODE, 'typescript'),
          // Live preview: DockedEditor
          (() => {
            const content = prop('# Hello\n\nTry editing this **rich text** with the toolbar above.')
            return html.div(
              attr.class('space-y-2 pt-2'),
              html.div(
                attr.class('flex items-center gap-2'),
                Icon({ icon: 'lucide:eye', size: 'xs' }),
                html.span(attr.class('text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'), 'Live Preview — DockedEditor')
              ),
              html.div(
                attr.class('rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden'),
                DockedEditor({
                  value: content,
                  format: 'markdown',
                  onInput: v => content.set(v),
                })
              )
            )
          })(),
          // Live preview: ContextualEditor
          (() => {
            const content2 = prop('Select some text to see the **floating toolbar** appear.')
            return html.div(
              attr.class('space-y-2 pt-2'),
              html.div(
                attr.class('flex items-center gap-2'),
                Icon({ icon: 'lucide:eye', size: 'xs' }),
                html.span(attr.class('text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'), 'Live Preview — ContextualEditor')
              ),
              html.div(
                attr.class('rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden'),
                ContextualEditor({
                  value: content2,
                  format: 'markdown',
                  onInput: v => content2.set(v),
                })
              )
            )
          })(),
          html.div(
            attr.class('grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1'),
            ...[
              { name: 'BareEditor', desc: 'No toolbar. Ideal for embedding in custom layouts where you supply your own controls.' },
              { name: 'DockedEditor', desc: 'Toolbar docked above the editing area. Use hiddenGroups to suppress unwanted tool groups.' },
              { name: 'ContextualEditor', desc: 'Toolbar floats above selected text. Configure which groups appear with floatingToolbarGroups.' },
            ].map(({ name, desc }) =>
              html.div(
                attr.class('flex flex-col gap-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700'),
                html.code(
                  attr.class('font-mono text-xs text-primary-600 dark:text-primary-400 font-medium'),
                  name
                ),
                html.p(attr.class('text-xs text-gray-600 dark:text-gray-400'), desc)
              )
            )
          )
        )
      ),

      // Section 3: Content Formats
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:braces', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Content Formats')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'The ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'format'
            ),
            ' prop controls how the editor reads and emits content. Choose ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              "'markdown'"
            ),
            ', ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              "'html'"
            ),
            ', or ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              "'json'"
            ),
            ' (serialized Lexical editor state).'
          ),
          CodeBlock(FORMATS_CODE, 'typescript'),
          Notice(
            { variant: 'warning', title: 'JSON round-tripping' },
            "The ",
            html.code(
              attr.class('font-mono text-xs bg-yellow-100 dark:bg-yellow-900 px-1 rounded'),
              "'json'"
            ),
            " format preserves the full Lexical editor state, including custom node types added by plugins. Use it when you need lossless serialization. For interoperability with other tools, prefer ",
            html.code(
              attr.class('font-mono text-xs bg-yellow-100 dark:bg-yellow-900 px-1 rounded'),
              "'markdown'"
            ),
            " or ",
            html.code(
              attr.class('font-mono text-xs bg-yellow-100 dark:bg-yellow-900 px-1 rounded'),
              "'html'"
            ),
            "."
          )
        )
      ),

      // Section 4: Plugin System
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:puzzle', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Plugin System')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Call ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'createDefaultPluginConfig(preset)'
            ),
            ' to get the default plugin set for a given preset, then pass it to ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'BareEditor'
            ),
            ' for full control. Available plugins: ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'richText'
            ),
            ', ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'history'
            ),
            ', ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'clipboard'
            ),
            ', ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'list'
            ),
            ', ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'link'
            ),
            ', ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'autoLink'
            ),
            ', ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'code'
            ),
            ', ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'table'
            ),
            ', ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'hashtag'
            ),
            ', ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'mark'
            ),
            ', and ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'dragon'
            ),
            '.'
          ),
          CodeBlock(PLUGINS_CODE, 'typescript')
        )
      ),

      // Section 5: Read-Only Mode
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:lock', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Read-Only Mode')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Set ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'readOnly: true'
            ),
            ' (or pass a reactive ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'Value<boolean>'
            ),
            ') to disable editing. The toolbar is automatically hidden in read-only mode. This is useful for preview panes, terms of service displays, and permission-gated content.'
          ),
          CodeBlock(READ_ONLY_CODE, 'typescript')
        )
      )
    ),
  })
}

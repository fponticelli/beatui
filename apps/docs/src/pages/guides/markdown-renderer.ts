import { html, attr, prop } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Icon, Notice, Badge, TextArea } from '@tempots/beatui'
import { Markdown } from '@tempots/beatui/markdown'
import { CodeBlock } from '../../framework/code-block'

export const meta = {
  title: 'Markdown Renderer',
  description:
    'Render Markdown content to styled HTML with optional GFM support, using micromark under the hood.',
}

const INSTALL_CODE = `// Import the component
import { Markdown } from '@tempots/beatui/markdown'

// Option A: Import CSS yourself (default)
import '@tempots/beatui/markdown.css'

// Option B: Let the component inject it via a <link> tag
// No manual import needed — set cssInjection: 'link' instead`

const BASIC_USAGE_CODE = `import { Markdown } from '@tempots/beatui/markdown'
import { prop } from '@tempots/dom'

const content = prop('# Hello\\n\\nSome **markdown** content.')

Markdown({ content })`

const REACTIVE_CODE = `import { Markdown } from '@tempots/beatui/markdown'
import { prop } from '@tempots/dom'

// content is a reactive signal — Markdown re-renders on every change
const content = prop('# Initial heading')

// Later: content.set('# Updated heading') — renderer updates in place
Markdown({ content })`

const GFM_CODE = `import { Markdown } from '@tempots/beatui/markdown'
import { prop } from '@tempots/dom'

const content = prop(\`
# GFM Demo

| Column A | Column B |
|----------|----------|
| Cell 1   | Cell 2   |

~~Strikethrough~~ text and https://auto-linked-url.example.com

- [x] Checked task
- [ ] Unchecked task
\`)

Markdown({
  content,
  features: { gfm: true },  // Enables tables, strikethrough, task lists, autolinks
})`

const HTML_SAFETY_CODE = `import { Markdown } from '@tempots/beatui/markdown'
import { prop } from '@tempots/dom'

// Default: HTML tags in Markdown source are escaped (safe)
Markdown({
  content: prop('Hello <script>alert("xss")</script> world'),
  // allowHtml defaults to false — the <script> tag is rendered as text
})

// Allow raw HTML embedded in Markdown (only for trusted content)
Markdown({
  content: prop('Hello <em>world</em>'),
  allowHtml: true,
})

// allowDangerousProtocol: false (default) — strips javascript: links
Markdown({
  content: prop('[click me](javascript:alert(1))'),
  allowDangerousProtocol: false,  // link is removed
})`

const CSS_INJECTION_CODE = `import { Markdown } from '@tempots/beatui/markdown'
import { prop } from '@tempots/dom'

// Option A: You import the CSS yourself (default mode)
// import '@tempots/beatui/markdown.css'
Markdown({
  content: prop('# Hello'),
  cssInjection: 'none',  // default — assumes you imported the CSS
})

// Option B: Component injects a <link> tag pointing to the stylesheet
// Useful for micro-frontends or lazy-loaded islands
Markdown({
  content: prop('# Hello'),
  cssInjection: 'link',  // injects <link rel="stylesheet"> automatically
})`

export default function MarkdownRendererPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-4xl mx-auto'),

      // Page header
      html.div(
        attr.class('space-y-3'),
        html.h1(attr.class('text-3xl font-bold'), 'Markdown Renderer'),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400 max-w-2xl'),
          'The BeatUI Markdown renderer converts Markdown text to styled HTML using micromark under the hood. It supports reactive content signals, GitHub Flavored Markdown extensions, and configurable HTML safety settings.'
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
            'Import ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'Markdown'
            ),
            ' from ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              '@tempots/beatui/markdown'
            ),
            '. The component takes a reactive ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'content'
            ),
            ' signal and re-renders only the inner HTML when the signal changes — no remounting.'
          ),
          Notice(
            { variant: 'info', title: 'CSS is separate' },
            'By default the component assumes you have already imported ',
            html.code(
              attr.class('font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'),
              "import '@tempots/beatui/markdown.css'"
            ),
            '. Alternatively, set ',
            html.code(
              attr.class('font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'),
              "cssInjection: 'link'"
            ),
            ' and the component will inject a stylesheet link tag automatically.'
          ),
          CodeBlock(INSTALL_CODE, 'typescript'),
          html.div(
            attr.class('flex flex-wrap gap-2 pt-1'),
            Badge({ variant: 'light', color: 'primary', size: 'sm' }, 'Markdown'),
            Badge({ variant: 'light', color: 'secondary', size: 'sm' }, 'micromark'),
            Badge({ variant: 'light', color: 'success', size: 'sm' }, 'GFM'),
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
            'Pass a ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'Value<string>'
            ),
            ' signal as ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'content'
            ),
            '. You can also pass a plain string for static content. When the signal updates, the rendered HTML is replaced in place without re-creating the surrounding DOM.'
          ),
          CodeBlock(BASIC_USAGE_CODE, 'typescript'),
          // Live preview
          (() => {
            const content = prop('# Hello\n\nSome **markdown** content.\n\nEdit the text below to see reactive updates:')
            return html.div(
              attr.class('space-y-3 pt-2'),
              html.div(
                attr.class('flex items-center gap-2'),
                Icon({ icon: 'lucide:eye', size: 'xs' }),
                html.span(attr.class('text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'), 'Live Preview')
              ),
              TextArea({
                value: content,
                onInput: (v) => content.set(v),
                class: 'font-mono text-sm',
              }),
              html.div(
                attr.class('rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900'),
                Markdown({ content, cssInjection: 'link' })
              )
            )
          })()
        )
      ),

      // Section 3: GitHub Flavored Markdown
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:github', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'GitHub Flavored Markdown')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Set ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'features: { gfm: true }'
            ),
            ' to activate the GFM extension, which adds support for tables, strikethrough, task list checkboxes, and automatic URL linking.'
          ),
          CodeBlock(GFM_CODE, 'typescript'),
          // GFM live preview
          html.div(
            attr.class('space-y-2 pt-2'),
            html.div(
              attr.class('flex items-center gap-2'),
              Icon({ icon: 'lucide:eye', size: 'xs' }),
              html.span(attr.class('text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'), 'Live Preview')
            ),
            html.div(
              attr.class('rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900'),
              Markdown({
                content: '# GFM Demo\n\n| Column A | Column B |\n|----------|----------|\n| Cell 1   | Cell 2   |\n\n~~Strikethrough~~ text\n\n- [x] Checked task\n- [ ] Unchecked task',
                features: { gfm: true },
                cssInjection: 'link',
              })
            )
          ),
          html.div(
            attr.class('grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1'),
            ...[
              { label: 'Tables', icon: 'lucide:table' },
              { label: 'Strikethrough', icon: 'lucide:strikethrough' },
              { label: 'Task lists', icon: 'lucide:check-square' },
              { label: 'Auto-links', icon: 'lucide:link' },
            ].map(({ label, icon }) =>
              html.div(
                attr.class('flex items-center gap-2 p-2 rounded border border-gray-200 dark:border-gray-700'),
                Icon({ icon, size: 'xs' }),
                html.span(attr.class('text-xs text-gray-700 dark:text-gray-300'), label)
              )
            )
          )
        )
      ),

      // Section 4: HTML Safety
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:shield', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'HTML Safety')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Raw HTML in Markdown source is escaped by default (',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'allowHtml: false'
            ),
            '). ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'javascript:'
            ),
            ' protocol links are stripped by default (',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'allowDangerousProtocol: false'
            ),
            '). Only enable these for fully trusted, sanitized content.'
          ),
          CodeBlock(HTML_SAFETY_CODE, 'typescript'),
          Notice(
            { variant: 'danger', title: 'Security warning' },
            'Setting ',
            html.code(
              attr.class('font-mono text-xs bg-red-100 dark:bg-red-900 px-1 rounded'),
              'allowHtml: true'
            ),
            ' or ',
            html.code(
              attr.class('font-mono text-xs bg-red-100 dark:bg-red-900 px-1 rounded'),
              'allowDangerousProtocol: true'
            ),
            ' with user-supplied content opens your application to XSS attacks. Only use these options when the Markdown source is generated by trusted server-side code or sanitized before rendering.'
          )
        )
      ),

      // Section 5: CSS Injection
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:paintbrush', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'CSS Injection')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'The ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'cssInjection'
            ),
            ' prop controls how the Markdown stylesheet is loaded. Use ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              "'none'"
            ),
            ' (default) when you import the CSS yourself via your bundler. Use ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              "'link'"
            ),
            ' for micro-frontend architectures, lazy-loaded route islands, or situations where bundler-level CSS imports are not available.'
          ),
          CodeBlock(CSS_INJECTION_CODE, 'typescript'),
          html.div(
            attr.class('grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1'),
            ...[
              {
                value: "'none'",
                desc: 'Default. You import the CSS via your bundler. No extra network request is made.',
              },
              {
                value: "'link'",
                desc: "Component injects a <link rel=\"stylesheet\"> into the document head automatically.",
              },
            ].map(({ value, desc }) =>
              html.div(
                attr.class('flex flex-col gap-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700'),
                html.code(
                  attr.class('font-mono text-xs text-primary-600 dark:text-primary-400 font-medium'),
                  value
                ),
                html.p(attr.class('text-xs text-gray-600 dark:text-gray-400'), desc)
              )
            )
          )
        )
      )
    ),
  })
}

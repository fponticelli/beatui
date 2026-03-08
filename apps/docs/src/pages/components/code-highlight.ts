import { html, attr, on, prop } from '@tempots/dom'
import { CodeHighlight } from '@tempots/beatui/codehighlight'
import { ComponentPage, Section, CodeBlock } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'CodeHighlight',
  category: 'Data Display',
  component: 'CodeHighlight',
  description:
    'Syntax-highlighted code block powered by Shiki. Ships as a separate entry point to keep the core bundle small.',
  icon: 'lucide:code',
  order: 8,
}

const sampleTS = `import { CodeHighlight } from '@tempots/beatui/codehighlight'

const view = CodeHighlight({
  code: 'const x = 42',
  language: 'typescript',
})`

const sampleCSS = `/* Card with elevation */
.card {
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  padding: 1rem;
}`

const sampleJSON = `{
  "name": "@tempots/beatui",
  "version": "1.0.0",
  "dependencies": {
    "shiki": "^3.0.0"
  }
}`

const sampleHTML = `<div class="bc-code-highlight">
  <pre><code class="language-html">
    <span>&lt;button class="bc-button"&gt;Click me&lt;/button&gt;</span>
  </code></pre>
</div>`

export default function CodeHighlightPage() {
  const reactiveCode = prop('const greeting = "Hello, world!"')

  return ComponentPage(meta, {
    playground: CodeHighlight({ code: sampleTS, language: 'typescript' }),
    sections: [
      Section(
        'Import',
        () =>
          CodeBlock(
            `import { CodeHighlight } from '@tempots/beatui/codehighlight'`,
            'typescript'
          ),
        'CodeHighlight is exported from a dedicated entry point to avoid bundling Shiki with the core library.'
      ),
      Section(
        'Languages',
        () =>
          html.div(
            attr.class('flex flex-col gap-4'),
            html.div(
              html.h4(attr.class('text-sm font-medium mb-2'), 'TypeScript'),
              CodeHighlight({ code: sampleTS, language: 'typescript' })
            ),
            html.div(
              html.h4(attr.class('text-sm font-medium mb-2'), 'CSS'),
              CodeHighlight({ code: sampleCSS, language: 'css' })
            ),
            html.div(
              html.h4(attr.class('text-sm font-medium mb-2'), 'JSON'),
              CodeHighlight({ code: sampleJSON, language: 'json' })
            ),
            html.div(
              html.h4(attr.class('text-sm font-medium mb-2'), 'HTML'),
              CodeHighlight({ code: sampleHTML, language: 'html' })
            )
          ),
        'Languages are loaded on demand. Any Shiki-supported language can be used. If a language fails to load, it falls back to plain text.'
      ),
      Section(
        'Reactive Code',
        () =>
          html.div(
            attr.class('flex flex-col gap-4'),
            html.textarea(
              attr.class(
                'w-full h-24 p-3 font-mono text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700'
              ),
              attr.value(reactiveCode),
              on.input((e: Event) =>
                reactiveCode.set((e.target as HTMLTextAreaElement).value)
              )
            ),
            CodeHighlight({ code: reactiveCode, language: 'typescript' })
          ),
        'Both `code` and `language` accept reactive values. The highlight updates automatically when either changes.'
      ),
      Section(
        'Dark Mode',
        () =>
          html.div(
            attr.class('flex flex-col gap-2'),
            html.p(
              attr.class('text-sm text-gray-600 dark:text-gray-400'),
              'CodeHighlight uses CSS variables (--shiki-light / --shiki-dark) so themes switch automatically with the .dark class on <html>. Toggle the theme in the header to see it in action.'
            ),
            CodeHighlight({
              code: `// Toggle the app theme to see colors change\nconst dark = window.matchMedia('(prefers-color-scheme: dark)')`,
              language: 'typescript',
            })
          ),
        'Dual themes are applied via CSS variables — no re-rendering needed when switching between light and dark mode.'
      ),
    ],
  })
}

import { html, attr } from '@tempots/dom'
import { ScrollablePanel, Stack, Card, Icon, Notice, Badge } from '@tempots/beatui'
import { CodeBlock } from '../../framework/code-block'

export const meta = {
  title: 'Monaco Editor',
  description:
    'VS Code-powered code editor with language support, JSON Schema validation, and theme integration.',
}

const INSTALL_CODE = `// Import the component
import { MonacoEditorInput } from '@tempots/beatui/monaco'

// Import the stylesheet (required)
import '@tempots/beatui/monaco.css'`

const BASIC_USAGE_CODE = `import { MonacoEditorInput } from '@tempots/beatui/monaco'
import { prop } from '@tempots/dom'

const code = prop('const hello = "world"')

MonacoEditorInput({
  value: code,
  onChange: v => code.set(v),
  language: 'typescript',
})`

const LANGUAGE_CODE = `import { MonacoEditorInput } from '@tempots/beatui/monaco'
import { prop } from '@tempots/dom'

// JSON
MonacoEditorInput({
  value: prop('{ "name": "BeatUI" }'),
  onChange: handleChange,
  language: 'json',
})

// CSS
MonacoEditorInput({
  value: prop('.bc-button { border-radius: 9999px; }'),
  onChange: handleChange,
  language: 'css',
})

// YAML
MonacoEditorInput({
  value: prop('name: BeatUI\\nversion: 1.0.0'),
  onChange: handleChange,
  language: 'yaml',
})

// Supported languages include: typescript, javascript, json, yaml,
// html, css, scss, less, markdown, sql, python, rust, go, and many more.`

const JSON_SCHEMA_CODE = `import { MonacoEditorInput } from '@tempots/beatui/monaco'
import { prop } from '@tempots/dom'

const configJson = prop('{}')

MonacoEditorInput({
  value: configJson,
  onChange: v => configJson.set(v),
  language: 'json',
  jsonSchemas: [
    {
      // URI that Monaco uses to associate this schema with files
      uri: 'https://example.com/schemas/config.json',
      // Glob patterns for files that should use this schema
      fileMatch: ['*'],
      schema: {
        type: 'object',
        properties: {
          port: {
            type: 'number',
            description: 'Port to listen on',
            default: 3000,
          },
          debug: {
            type: 'boolean',
            description: 'Enable debug mode',
          },
          logLevel: {
            type: 'string',
            enum: ['error', 'warn', 'info', 'debug'],
          },
        },
        required: ['port'],
      },
    },
  ],
})`

const REACTIVE_LANGUAGE_CODE = `import { MonacoEditorInput } from '@tempots/beatui/monaco'
import { prop } from '@tempots/dom'

type Language = 'typescript' | 'javascript' | 'json' | 'css'

const language = prop<Language>('typescript')
const code = prop('')

// Switcher
html.select(
  on.change(e => language.set((e.target as HTMLSelectElement).value as Language)),
  html.option(attr.value('typescript'), 'TypeScript'),
  html.option(attr.value('javascript'), 'JavaScript'),
  html.option(attr.value('json'), 'JSON'),
  html.option(attr.value('css'), 'CSS'),
)

// Editor reacts to language changes automatically
MonacoEditorInput({
  value: code,
  onChange: v => code.set(v),
  language,        // <-- reactive signal
})`

export default function MonacoEditorPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-4xl mx-auto'),

      // Page header
      html.div(
        attr.class('space-y-3'),
        html.h1(attr.class('text-3xl font-bold'), 'Monaco Editor'),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400 max-w-2xl'),
          'BeatUI integrates the Monaco editor — the same engine that powers VS Code — with reactive signals, JSON Schema validation, and automatic theme synchronization.'
        )
      ),

      // Section 1: Overview
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:code-2', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Overview')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'The ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'MonacoEditorInput'
            ),
            ' component is imported from ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              '@tempots/beatui/monaco'
            ),
            '. It wraps the Monaco editor with BeatUI\'s reactive prop system so that ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'value'
            ),
            ' and ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'language'
            ),
            ' can each be a static value or a live signal.'
          ),
          Notice(
            { variant: 'info', title: 'CSS required' },
            'You must import ',
            html.code(
              attr.class('font-mono text-xs bg-blue-100 dark:bg-blue-900 px-1 rounded'),
              "import '@tempots/beatui/monaco.css'"
            ),
            ' alongside the component import for correct editor layout and theming.'
          ),
          CodeBlock(INSTALL_CODE, 'typescript'),
          html.div(
            attr.class('flex flex-wrap gap-2 pt-1'),
            Badge({ variant: 'light', color: 'primary', size: 'sm' }, 'MonacoEditorInput'),
            Badge({ variant: 'light', color: 'secondary', size: 'sm' }, 'JSON Schema'),
            Badge({ variant: 'light', color: 'success', size: 'sm' }, 'Reactive language'),
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
            ', pass it as ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'value'
            ),
            ', and write changes back in ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'onChange'
            ),
            '. The editor auto-sizes to its container — wrap it in a sized element to control dimensions.'
          ),
          CodeBlock(BASIC_USAGE_CODE, 'typescript')
        )
      ),

      // Section 3: Language Support
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:languages', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Language Support')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Set the ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'language'
            ),
            ' prop to any Monaco-supported language identifier. Syntax highlighting, IntelliSense, error squiggles, and formatting all activate automatically.'
          ),
          CodeBlock(LANGUAGE_CODE, 'typescript'),
          html.div(
            attr.class('flex flex-wrap gap-2 pt-1'),
            ...[
              'typescript', 'javascript', 'json', 'yaml', 'html',
              'css', 'scss', 'markdown', 'sql', 'python', 'rust', 'go',
            ].map(lang =>
              Badge({ variant: 'light', color: 'secondary', size: 'sm' }, lang)
            )
          )
        )
      ),

      // Section 4: JSON Schema Validation
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:shield-check', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'JSON Schema Validation')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Pass a ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'jsonSchemas'
            ),
            ' array to enable real-time validation and autocompletion against one or more JSON Schemas. Each entry includes a ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'uri'
            ),
            ' for identity, optional ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'fileMatch'
            ),
            ' glob patterns, and the inline ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'schema'
            ),
            ' object.'
          ),
          CodeBlock(JSON_SCHEMA_CODE, 'typescript'),
          Notice(
            { variant: 'success', title: 'IntelliSense included' },
            'JSON Schema validation also drives hover documentation, property autocompletion, and enum value suggestions — no extra configuration required.'
          )
        )
      ),

      // Section 5: Reactive Language Switching
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.div(
            attr.class('flex items-center gap-2'),
            Icon({ icon: 'lucide:zap', size: 'sm' }),
            html.h2(attr.class('text-xl font-semibold'), 'Reactive Language Switching')
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Because ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'language'
            ),
            ' accepts a ',
            html.code(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded'),
              'Value<string>'
            ),
            ' signal, you can switch the editor language at runtime without remounting the editor. The content is preserved and the new language grammar is applied immediately.'
          ),
          CodeBlock(REACTIVE_LANGUAGE_CODE, 'typescript')
        )
      )
    ),
  })
}

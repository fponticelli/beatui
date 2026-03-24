import { html, attr, prop, on, MapSignal } from '@tempots/dom'
import { ScrollablePanel, Stack, Button, Badge } from '@tempots/beatui'
import {
  beatuiLibrary,
  createParser,
} from '@tempots/beatui/openui'

export const meta = {
  title: 'OpenUI Playground',
  description: 'Interactive playground for OpenUI Lang.',
}

const EXAMPLES: Record<string, string> = {
  Dashboard: `root = Stack([stat1, stat2, progress])
stat1 = StatCard("Revenue", "$12,400", "up")
stat2 = StatCard("Users", "1,892", "flat")
progress = ProgressBar(75, "md")`,

  'Card Layout': `root = Stack([card1, card2])
card1 = Card("Getting Started", "Install BeatUI and build your first component in minutes.")
card2 = Card("Documentation", "Explore the full API reference and component catalog.")`,

  Simple: `root = "Hello from OpenUI Lang!"`,
}

const DEFAULT_EXAMPLE = 'Simple'

export default function OpenUIPlaygroundPage() {
  const code = prop(EXAMPLES[DEFAULT_EXAMPLE])
  const activeExample = prop(DEFAULT_EXAMPLE)
  const parsedOutput = prop('')

  // Parse and show AST as text for debugging
  function updatePreview(text: string) {
    try {
      const parse = createParser(beatuiLibrary)
      const result = parse(text)
      const lines: string[] = []
      lines.push(`Statements: ${result.meta.statementCount}`)
      lines.push(`Errors: ${result.meta.errors.length}`)
      lines.push(`Root: ${result.root ? result.root.type + (result.root.type === 'component' ? ` (${result.root.name})` : result.root.type === 'string' ? ` "${result.root.value}"` : '') : 'null'}`)
      if (result.meta.errors.length > 0) {
        lines.push(`\nErrors:`)
        for (const e of result.meta.errors) {
          lines.push(`  Line ${e.line}: ${e.message} [${e.code}]`)
        }
      }
      lines.push(`\nStatements:`)
      for (const [name, stmt] of result.statements) {
        lines.push(`  ${name} = ${JSON.stringify(stmt.value).substring(0, 100)}`)
      }
      parsedOutput.set(lines.join('\n'))
    } catch (e) {
      parsedOutput.set(`Parse error: ${e}`)
    }
  }

  // Parse initial value
  updatePreview(EXAMPLES[DEFAULT_EXAMPLE])

  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-6xl mx-auto'),

      html.div(
        attr.class('flex items-center gap-3'),
        html.h1(attr.class('text-2xl font-bold'), 'OpenUI Playground'),
        Badge({ variant: 'light', color: 'primary' }, 'Experimental'),
      ),
      html.p(
        attr.class('text-gray-600 dark:text-gray-400'),
        `${beatuiLibrary.components.size} components registered. Parser + library working.`,
      ),

      // Example buttons
      html.div(
        attr.class('flex flex-wrap gap-2'),
        ...Object.keys(EXAMPLES).map((name) =>
          Button(
            {
              variant: activeExample.map((a) =>
                a === name ? 'filled' : 'outline'
              ),
              size: 'sm',
              onClick: () => {
                code.set(EXAMPLES[name])
                activeExample.set(name)
                updatePreview(EXAMPLES[name])
              },
            },
            name
          )
        ),
      ),

      // Split view
      html.div(
        attr.class('grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[400px]'),

        // Left: code editor
        html.div(
          attr.class('flex flex-col gap-2'),
          html.label(
            attr.class('text-sm font-medium text-gray-700 dark:text-gray-300'),
            'OpenUI Lang'
          ),
          html.textarea(
            attr.class(
              'flex-1 min-h-[400px] p-4 font-mono text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500'
            ),
            attr.spellcheck('false'),
            code,
            on.input((e) => {
              const val = (e.target as HTMLTextAreaElement).value
              code.set(val)
              updatePreview(val)
            }),
          ),
        ),

        // Right: parsed output (text for now)
        html.div(
          attr.class('flex flex-col gap-2'),
          html.label(
            attr.class('text-sm font-medium text-gray-700 dark:text-gray-300'),
            'Parsed AST'
          ),
          html.pre(
            attr.class(
              'flex-1 min-h-[400px] p-4 font-mono text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-auto whitespace-pre-wrap'
            ),
            parsedOutput,
          ),
        ),
      ),
    ),
  })
}

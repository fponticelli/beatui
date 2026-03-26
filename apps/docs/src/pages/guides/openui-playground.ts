import { html, attr, prop, on, ForEach } from '@tempots/dom'
import type { ActionEvent } from '@tempots/beatui/openui'
import type { ButtonVariant } from '@tempots/beatui'
import { ScrollablePanel, Stack, Button, Badge } from '@tempots/beatui'
import {
  beatuiLibrary,
  createParser,
  OpenUIRenderer,
} from '@tempots/beatui/openui'

export const meta = {
  title: 'OpenUI Playground',
  description: 'Interactive playground for OpenUI Lang.',
}

const EXAMPLES: Record<string, string> = {
  Dashboard: `root = Stack([header, stats, divider, progress, actions])
header = Card({title: "Monthly Overview", content: "Key metrics for March 2026"})
stats = Group([stat1, stat2, stat3])
stat1 = StatCard({title: "Revenue", value: "$48,200", trend: "+12%", trendDirection: "up"})
stat2 = StatCard({title: "Active Users", value: "3,891", trend: "+5%", trendDirection: "up"})
stat3 = StatCard({title: "Churn Rate", value: "2.4%", trend: "-0.3%", trendDirection: "down"})
divider = Divider()
progress = ProgressBar({value: 72, size: "md", showLabel: true})
actions = Group([btn1, btn2])
btn1 = Button({label: "Export Report", variant: "filled", color: "primary"})
btn2 = Button({label: "View Details", variant: "outline"})`,

  'Tabbed UI': `root = Tabs({items: [{key: "overview", label: "Overview", content: "Project status and key metrics at a glance."}, {key: "team", label: "Team", content: "5 engineers, 2 designers, 1 PM — all fully allocated."}, {key: "timeline", label: "Timeline", content: "On track for Q2 delivery. Next milestone: April 15."}]})`,

  FAQ: `root = Accordion({items: [{key: "q1", header: "What is OpenUI Lang?", body: "A compact DSL designed for LLMs to generate user interfaces. Named props make it flexible and readable."}, {key: "q2", header: "How does it work?", body: "You provide a system prompt describing available components, the LLM generates OpenUI Lang, and the renderer turns it into live UI.", defaultOpen: true}, {key: "q3", header: "Can I add custom components?", body: "Yes — use defineComponent() to register your own, then extend beatuiLibrary with them."}]})`,

  'Contact Form': `root = Stack([heading, nameInput, emailInput, bio, divider, switches, submitBtn])
heading = Label({text: "Contact Form"})
nameInput = TextInput({placeholder: "Your full name"})
emailInput = EmailInput({placeholder: "you@example.com"})
bio = TextArea({placeholder: "Tell us about your project"})
divider = Divider()
switches = Group([newsletter, terms])
newsletter = Switch({label: "Subscribe to newsletter"})
terms = CheckboxInput({label: "I agree to the terms"})
submitBtn = Button({label: "Send Message", variant: "filled", color: "primary"})`,

  'User Profile': `root = Stack([header, divider, info, divider2, badges])
header = Group([avatar, nameSection])
avatar = Avatar({name: "Alice Johnson", size: "lg"})
nameSection = Stack([name, role])
name = Label({text: "Alice Johnson"})
role = Badge({label: "Senior Engineer", variant: "light", color: "primary"})
divider = Divider()
info = Stack([email, rating])
email = Card({title: "Contact", content: "alice.johnson@example.com"})
rating = Group([ratingLabel, stars])
ratingLabel = Label({text: "Peer Rating"})
stars = RatingInput({value: 4})
divider2 = Divider()
badges = Group([b1, b2, b3, b4])
b1 = Badge({label: "TypeScript", variant: "filled", color: "primary"})
b2 = Badge({label: "React", variant: "light", color: "secondary"})
b3 = Badge({label: "Tempo", variant: "outline", color: "success"})
b4 = Badge({label: "OpenUI", variant: "filled", color: "info"})`,

  'Wizard Steps': `root = Stack([stepper, divider, content, nav])
stepper = Stepper({steps: [{label: "Account", description: "Create your account"}, {label: "Profile", description: "Set up your profile"}, {label: "Review", description: "Confirm details"}], activeStep: 1})
divider = Divider()
content = Card({title: "Set Up Your Profile", content: "Choose a display name and avatar for your account."})
nav = Group([backBtn, nextBtn])
backBtn = Button({label: "Back", variant: "outline"})
nextBtn = Button({label: "Continue", variant: "filled", color: "primary"})`,

  Interactive: `root = Stack([heading, card, actions])
heading = Label({text: "Action Demo"})
card = Card({content: "Click a button below to dispatch an action event."})
actions = Group([likeBtn, shareBtn, deleteBtn])
likeBtn = Button({label: "Like", variant: "filled", color: "success", actionType: "like", actionParams: {postId: 42}})
shareBtn = Button({label: "Share", variant: "outline", color: "primary", actionType: "share", actionParams: {url: "/post/42"}})
deleteBtn = Button({label: "Delete", variant: "outline", color: "danger", actionType: "delete", actionParams: {postId: 42}})`,

  Breadcrumbs: `root = Stack([nav, card, pagination])
nav = Breadcrumbs({items: [{label: "Home", href: "/"}, {label: "Products", href: "/products"}, {label: "Electronics", href: "/products/electronics"}, {label: "Laptops", current: true}]})
card = Card({title: "MacBook Pro 16-inch", content: "The most powerful MacBook ever. M4 Max chip, 48GB unified memory, 1TB SSD."})
pagination = Pagination({current: 5, total: 12})`,

  Simple: `root = "Hello from OpenUI Lang!"`,
}

const DEFAULT_EXAMPLE = 'Dashboard'

export default function OpenUIPlaygroundPage() {
  const code = prop(EXAMPLES[DEFAULT_EXAMPLE])
  const activeExample = prop(DEFAULT_EXAMPLE)
  const parsedOutput = prop('')
  const actionLog = prop<ActionEvent[]>([])

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
              variant: activeExample.map((a): ButtonVariant =>
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

        // Right: live preview + AST
        html.div(
          attr.class('flex flex-col gap-2'),
          html.label(
            attr.class('text-sm font-medium text-gray-700 dark:text-gray-300'),
            'Live Preview'
          ),
          html.div(
            attr.class(
              'flex-1 min-h-[200px] p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 overflow-auto'
            ),
            OpenUIRenderer({
              library: beatuiLibrary,
              response: code,
              debug: true,
              onAction: (event) => {
                actionLog.update((prev) => [...prev, event])
              },
            }),
          ),
          html.label(
            attr.class('text-sm font-medium text-gray-500 dark:text-gray-500 mt-2'),
            'Parsed AST'
          ),
          html.pre(
            attr.class(
              'max-h-[150px] p-3 font-mono text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 overflow-auto whitespace-pre-wrap'
            ),
            parsedOutput,
          ),
          // Action log
          html.label(
            attr.class('text-sm font-medium text-gray-500 dark:text-gray-500 mt-2'),
            'Action Log',
          ),
          html.div(
            attr.class(
              'max-h-[120px] p-3 font-mono text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 overflow-auto'
            ),
            ForEach(actionLog, (event) =>
              html.div(
                attr.class('py-1 border-b border-gray-200 dark:border-gray-700 last:border-0'),
                html.span(attr.class('text-blue-600 dark:text-blue-400 font-semibold'), event.map((e): string => e.kind)),
                ' ',
                html.span(attr.class('text-green-600 dark:text-green-400'), event.map((e): string => e.type)),
                ' ',
                html.span(event.map((e): string => e.humanFriendlyMessage)),
                ' ',
                html.span(
                  attr.class('text-gray-400'),
                  event.map((e): string => e.kind === 'button' ? JSON.stringify(e.params) : ''),
                ),
              )
            ),
            html.div(
              attr.class('text-gray-400 italic'),
              actionLog.map((log): string => log.length === 0 ? 'No actions yet. Try the "Interactive" example.' : ''),
            ),
          ),
        ),
      ),
    ),
  })
}

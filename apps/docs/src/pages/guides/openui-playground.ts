import { html, attr, prop, on, MapSignal } from '@tempots/dom'
import { ScrollablePanel, Stack, Button, Card, Badge } from '@tempots/beatui'
import {
  beatuiLibrary,
  OpenUIRenderer,
} from '@tempots/beatui/openui'

export const meta = {
  title: 'OpenUI Playground',
  description:
    'Interactive playground for OpenUI Lang — edit markup and see live BeatUI output.',
}

const EXAMPLES: Record<string, string> = {
  Dashboard: `root = Stack([stat1, stat2, progress])
stat1 = StatCard("Revenue", "$12,400", "up")
stat2 = StatCard("Users", "1,892", "flat")
progress = ProgressBar(75, "md")`,

  'Card Layout': `root = Stack([card1, card2])
card1 = Card("Getting Started", "Install BeatUI and build your first component in minutes.")
card2 = Card("Documentation", "Explore the full API reference and component catalog.")`,

  Form: `root = Stack([heading, nameInput, emailInput, bio, submitBtn])
heading = Label("Contact Form")
nameInput = TextInput("", "Your name")
emailInput = EmailInput("", "you@example.com")
bio = TextArea("", "Tell us about yourself")
submitBtn = Button("Submit", "filled", "md")`,

  Navigation: `root = Stack([nav, content])
nav = Breadcrumbs(["Home", "Components", "OpenUI Playground"])
content = Card("OpenUI Lang", "A compact DSL for LLM-generated user interfaces.")`,

  Badges: `root = Stack([row1, row2])
row1 = Group([b1, b2, b3, b4])
b1 = Badge("New", "filled", "primary")
b2 = Badge("Beta", "light", "secondary")
b3 = Badge("Stable", "outline", "success")
b4 = Badge("Deprecated", "filled", "danger")
row2 = Group([icon1, label1])
icon1 = Icon("lucide:sparkles")
label1 = Label("Mix and match components freely")`,
}

const DEFAULT_EXAMPLE = 'Dashboard'

export default function OpenUIPlaygroundPage() {
  const code = prop(EXAMPLES[DEFAULT_EXAMPLE])
  const activeExample = prop(DEFAULT_EXAMPLE)
  const showPrompt = prop(false)

  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-6 max-w-6xl mx-auto'),

      // Header
      html.div(
        attr.class('flex items-center gap-3'),
        html.h1(attr.class('text-2xl font-bold'), 'OpenUI Playground'),
        Badge({ variant: 'light', color: 'primary' }, 'Experimental'),
      ),
      html.p(
        attr.class('text-gray-600 dark:text-gray-400'),
        'Edit OpenUI Lang markup on the left, see live BeatUI components on the right.',
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
              },
            },
            name
          )
        ),
        Button(
          {
            variant: 'subtle',
            size: 'sm',
            onClick: () => showPrompt.update((v) => !v),
          },
          showPrompt.map((v) => (v ? 'Hide System Prompt' : 'Show System Prompt'))
        ),
      ),

      // System prompt (collapsible)
      MapSignal(showPrompt, (show) =>
        show
          ? html.details(
              attr.class(
                'bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-xs font-mono max-h-80 overflow-auto'
              ),
              html.summary(
                attr.class('cursor-pointer font-semibold mb-2'),
                'LLM System Prompt (what beatuiLibrary.prompt() generates)'
              ),
              html.pre(beatuiLibrary.prompt({ examples: true }))
            )
          : undefined
      ),

      // Split view: editor + preview
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
            attr.value(code),
            on.input((e) => {
              code.set((e.target as HTMLTextAreaElement).value)
            }),
          ),
        ),

        // Right: live preview
        html.div(
          attr.class('flex flex-col gap-2'),
          html.label(
            attr.class('text-sm font-medium text-gray-700 dark:text-gray-300'),
            'Live Preview'
          ),
          html.div(
            attr.class(
              'flex-1 min-h-[400px] p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 overflow-auto'
            ),
            OpenUIRenderer({
              library: beatuiLibrary,
              response: code,
              debug: true,
            }),
          ),
        ),
      ),

      // Footer info
      html.p(
        attr.class('text-sm text-gray-500 dark:text-gray-500'),
        `${beatuiLibrary.components.size} components registered in beatuiLibrary. `,
        'Extend with beatuiLibrary.extend({ components: [...] }).',
      ),
    ),
  })
}

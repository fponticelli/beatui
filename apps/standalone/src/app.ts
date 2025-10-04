import {
  BeatUI,
  Button,
  Card,
  Notice,
  Stack,
  StandaloneAppearanceSelector,
  Switch,
  TabItem,
  Tabs,
  TextInput,
} from '@tempots/beatui'
import { attr, computedOf, html, prop } from '@tempots/dom'

type DemoTabKey = 'overview' | 'layout' | 'forms'

export const App = () => {
  const clickCount = prop(0)
  const notificationsEnabled = prop(true)
  const displayName = prop('Taylor Doe')
  const activeTab = prop<DemoTabKey>('overview')

  const greetingMessage = computedOf(
    displayName,
    notificationsEnabled
  )((name, enabled) => {
    const safeName = name.trim() === '' ? 'friend' : name.trim()
    return `Hello ${safeName}! Notifications are ${
      enabled ? 'enabled' : 'disabled'
    }.`
  })

  const tabItems: TabItem<DemoTabKey>[] = [
    {
      key: 'overview',
      label: 'Overview',
      content: () =>
        Stack(
          attr.class('demo-tab bc-stack--gap-1'),
          html.p(
            'BeatUI ships layered CSS, tokens, and accessible components that work without Tailwind.'
          ),
          html.ul(
            attr.class('demo-list'),
            html.li('Design tokens exposed as CSS custom properties'),
            html.li('Composable primitives like Stack, Card, Tabs, and Switch'),
            html.li('Signal-driven reactivity powered by @tempots/dom')
          )
        ),
    },
    {
      key: 'layout',
      label: 'Layout',
      content: () =>
        Stack(
          attr.class('demo-tab bc-stack--gap-1'),
          html.p(
            'Use structural primitives to arrange content. This page only relies on Stack plus a few custom classes.'
          ),
          html.p(
            'Spacing comes from BeatUI tokens such as var(--spacing-lg), so the theme stays consistent.'
          )
        ),
    },
    {
      key: 'forms',
      label: 'Forms',
      content: () =>
        Stack(
          attr.class('demo-tab bc-stack--gap-1'),
          html.p(
            'Form inputs share consistent containers, focus states, and density. Compose them with plain labels and layout helpers.'
          ),
          html.p('This entire demo uses zero Tailwind classes.')
        ),
    },
  ]

  const nameInputId = 'display-name'

  return BeatUI(
    {},
    html.main(
      attr.class('demo-app'),
      Stack(
        attr.class('bc-stack--gap-4'),
        html.section(
          attr.class('demo-hero'),
          Stack(
            attr.class('bc-stack--gap-2'),
            html.span(attr.class('demo-eyebrow'), 'Standalone Example'),
            html.h1(attr.class('demo-title'), 'BeatUI without Tailwind CSS'),
            html.p(
              attr.class('demo-lead'),
              'The components below rely solely on BeatUI styles and a small stylesheet in this app.'
            ),
            html.div(
              attr.class('demo-theme-toggle'),
              html.span(attr.class('demo-label-inline'), 'Theme'),
              StandaloneAppearanceSelector()
            )
          )
        ),
        Card(
          {},
          attr.class('demo-card'),
          Stack(
            attr.class('bc-stack--gap-2'),
            html.h2(attr.class('demo-section-title'), 'Buttons'),
            html.p(
              attr.class('demo-text'),
              'BeatUI buttons pick up tokens for color, spacing, and motion without extra configuration.'
            ),
            html.div(
              attr.class('demo-button-row'),
              Button(
                {
                  variant: 'filled',
                  color: 'primary',
                  onClick: () => clickCount.set(clickCount.value + 1),
                },
                'Primary action'
              ),
              Button({ variant: 'outline', color: 'secondary' }, 'Secondary'),
              Button({ variant: 'text', color: 'info' }, 'Ghost'),
              Button({ variant: 'light', color: 'success' }, 'Success')
            ),
            html.p(
              attr.class('demo-caption'),
              clickCount.map(count =>
                count === 0
                  ? 'Try the primary button to update the counter.'
                  : `You clicked ${count} time${count === 1 ? '' : 's'}.`
              )
            )
          )
        ),
        Card(
          {},
          attr.class('demo-card'),
          Stack(
            attr.class('bc-stack--gap-2'),
            html.h2(attr.class('demo-section-title'), 'Tabs'),
            html.p(
              attr.class('demo-text'),
              'Tabs manage focus, keyboard navigation, and animations out of the box.'
            ),
            Tabs({
              items: tabItems,
              value: activeTab,
              onChange: activeTab.set,
              ariaLabel: 'Demo content tabs',
            })
          )
        ),
        Card(
          {},
          attr.class('demo-card'),
          Stack(
            attr.class('bc-stack--gap-2'),
            html.h2(attr.class('demo-section-title'), 'Forms'),
            html.p(
              attr.class('demo-text'),
              'Inputs share focus states and containers. Combine them with plain labels for accessible forms.'
            ),
            Stack(
              attr.class('demo-field bc-stack--gap-1'),
              html.label(
                attr.for(nameInputId),
                attr.class('demo-label'),
                'Display name'
              ),
              TextInput({
                id: nameInputId,
                value: displayName,
                placeholder: 'Enter your name',
                onInput: value => displayName.set(value),
              })
            ),
            Stack(
              attr.class('demo-field bc-stack--gap-1'),
              html.span(attr.class('demo-label'), 'Notifications'),
              Switch({
                value: notificationsEnabled,
                onChange: notificationsEnabled.set,
                offLabel: 'Off',
                onLabel: 'On',
              })
            ),
            Notice(
              { variant: 'info', tone: 'subtle' },
              html.span(greetingMessage)
            )
          )
        )
      )
    )
  )
}

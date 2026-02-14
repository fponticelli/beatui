import { html, attr, prop, Fragment, Empty } from '@tempots/dom'
import {
  Tabs,
  TabItem,
  TabsDirection,
  TabsVariant,
  ControlSize,
  ButtonVariant,
  Icon,
} from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { ControlsHeader } from '../views/controls-header'
import { ControlSwitch } from '../views/control-helpers'
import { SectionBlock } from '../views/section'

type DemoTab = 'overview' | 'details' | 'settings'

const demoTabs: TabItem<DemoTab>[] = [
  {
    key: 'overview',
    label: 'Overview',
    content: () =>
      html.div(
        attr.class('p-4'),
        html.h3(attr.class('font-semibold mb-2'), 'Overview'),
        html.p('General introduction to the topic.')
      ),
  },
  {
    key: 'details',
    label: 'Details',
    content: () =>
      html.div(
        attr.class('p-4'),
        html.h3(attr.class('font-semibold mb-2'), 'Details'),
        html.p('Detailed information about features.')
      ),
  },
  {
    key: 'settings',
    label: 'Settings',
    content: () =>
      html.div(
        attr.class('p-4'),
        html.h3(attr.class('font-semibold mb-2'), 'Settings'),
        html.p('Configure preferences here.')
      ),
  },
]

export default function TabsPage() {
  const disabled = prop(false)
  const showContent = prop(true)

  const activeTab = prop<DemoTab>('overview')

  return WidgetPage({
    id: 'tabs',
    title: 'Tabs',
    description: 'Tab navigation with content panels.',
    controls: ControlsHeader(
      ControlSwitch('Disabled', disabled),
      ControlSwitch('Show Content', showContent)
    ),
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

      SectionBlock(
        'Underline Tabs',
        (() => {
          const tab = prop<DemoTab>('overview')
          return Tabs({
            items: demoTabs,
            value: tab,
            onChange: tab.set,
            variant: 'underline' as TabsVariant,
            showContent: prop(false),
          })
        })()
      ),

      SectionBlock(
        'Pill Tabs',
        (() => {
          const tab = prop<DemoTab>('overview')
          return Tabs({
            items: demoTabs,
            value: tab,
            onChange: tab.set,
            variant: 'pill' as TabsVariant,
            showContent: prop(false),
          })
        })()
      ),

      SectionBlock(
        'Icon Tabs',
        (() => {
          const iconTabs: TabItem<string>[] = [
            {
              key: 'table',
              label: Fragment(
                Icon({ icon: 'lucide:table', size: 'xs' }),
                ' Table'
              ),
              content: () => Empty,
            },
            {
              key: 'board',
              label: Fragment(
                Icon({ icon: 'lucide:kanban', size: 'xs' }),
                ' Board'
              ),
              content: () => Empty,
            },
            {
              key: 'calendar',
              label: Fragment(
                Icon({ icon: 'lucide:calendar', size: 'xs' }),
                ' Calendar'
              ),
              content: () => Empty,
            },
            {
              key: 'gallery',
              label: Fragment(
                Icon({ icon: 'lucide:layout-grid', size: 'xs' }),
                ' Gallery'
              ),
              content: () => Empty,
            },
          ]
          const tab = prop('table')
          return Tabs({
            items: iconTabs,
            value: tab,
            onChange: tab.set,
            variant: 'outline',
            showContent: prop(false),
            size: 'sm',
          })
        })()
      ),

      SectionBlock(
        'Basic Tabs',
        html.div(
          attr.class('border border-gray-300 rounded overflow-hidden'),
          Tabs({
            items: demoTabs,
            value: activeTab,
            onChange: activeTab.set,
            disabled,
            showContent,
            ariaLabel: 'Demo tabs',
          })
        )
      ),

      SectionBlock(
        'Sizes',
        html.div(
          attr.class('space-y-4'),
          ...(['xs', 'sm', 'md', 'lg', 'xl'] as ControlSize[]).map(sz => {
            const tab = prop<DemoTab>('overview')
            return html.div(
              attr.class('space-y-1'),
              html.span(attr.class('text-sm font-medium'), sz.toUpperCase()),
              html.div(
                attr.class('border border-gray-300 rounded overflow-hidden'),
                Tabs({
                  items: demoTabs,
                  value: tab,
                  onChange: tab.set,
                  size: sz,
                  showContent: prop(false),
                })
              )
            )
          })
        )
      ),

      SectionBlock(
        'Variants',
        html.div(
          attr.class('space-y-4'),
          ...(
            ['filled', 'light', 'outline', 'default', 'text'] as ButtonVariant[]
          ).map(v => {
            const tab = prop<DemoTab>('overview')
            return html.div(
              attr.class('space-y-1'),
              html.span(attr.class('text-sm font-medium capitalize'), v),
              html.div(
                attr.class('border border-gray-300 rounded overflow-hidden'),
                Tabs({
                  items: demoTabs,
                  value: tab,
                  onChange: tab.set,
                  variant: v,
                  showContent: prop(false),
                })
              )
            )
          })
        )
      ),

      SectionBlock(
        'Vertical',
        html.div(
          attr.class('border border-gray-300 rounded overflow-hidden h-64'),
          (() => {
            const tab = prop<DemoTab>('overview')
            return Tabs({
              items: demoTabs,
              value: tab,
              onChange: tab.set,
              orientation: prop<TabsDirection>('vertical'),
            })
          })()
        )
      )
    ),
  })
}

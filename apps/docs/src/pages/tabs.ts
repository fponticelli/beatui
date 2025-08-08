import {
  ControlSize,
  ScrollablePanel,
  Tabs,
  TabItem,
  Stack,
  Label,
  SegmentedControl,
  Switch,
  Button,
  TextInput,
} from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { DisabledSelector } from '../elements/disabled-selector'
import { ControlsHeader } from '../elements/controls-header'
import { ControlSizeSelector } from '../elements/control-size-selector'

const allSizes: ControlSize[] = ['xs', 'sm', 'md', 'lg', 'xl']

export const TabsPage = () => {
  const disabled = prop(false)
  const size = prop<ControlSize>('md')
  const orientation = prop<'horizontal' | 'vertical'>('horizontal')
  const showContent = prop(true)
  const activeTab = prop('overview')
  const dynamicTabCount = prop(3)

  // Basic tabs example
  const basicTabs: TabItem[] = [
    {
      key: 'overview',
      label: 'Overview',
      content: html.div(
        attr.class('bu-p-4'),
        html.h3(attr.class('bu-text-lg bu-font-semibold bu-mb-2'), 'Overview'),
        html.p('This is the overview tab content. It provides a general introduction to the topic.')
      )
    },
    {
      key: 'details',
      label: 'Details',
      content: html.div(
        attr.class('bu-p-4'),
        html.h3(attr.class('bu-text-lg bu-font-semibold bu-mb-2'), 'Details'),
        html.p('Here you can find detailed information about the specific features and functionality.'),
        html.ul(
          attr.class('bu-list-disc bu-list-inside bu-mt-2'),
          html.li('Feature 1: Advanced functionality'),
          html.li('Feature 2: Enhanced performance'),
          html.li('Feature 3: Better user experience')
        )
      )
    },
    {
      key: 'settings',
      label: 'Settings',
      content: html.div(
        attr.class('bu-p-4'),
        html.h3(attr.class('bu-text-lg bu-font-semibold bu-mb-2'), 'Settings'),
        html.p('Configure your preferences and options here.'),
        html.div(
          attr.class('bu-mt-4 bu-space-y-2'),
          html.label(
            attr.class('bu-flex bu-items-center bu-gap-2'),
            html.input(attr.type('checkbox')),
            'Enable notifications'
          ),
          html.label(
            attr.class('bu-flex bu-items-center bu-gap-2'),
            html.input(attr.type('checkbox')),
            'Auto-save changes'
          )
        )
      )
    },
    {
      key: 'disabled',
      label: 'Disabled Tab',
      content: html.div(attr.class('bu-p-4'), 'This content should not be accessible.'),
      disabled: prop(true)
    }
  ]

  // Dynamic tabs example
  const createDynamicTabs = (count: number): TabItem[] => {
    return Array.from({ length: count }, (_, i) => ({
      key: `tab-${i + 1}`,
      label: `Tab ${i + 1}`,
      content: html.div(
        attr.class('bu-p-4'),
        html.h3(attr.class('bu-text-lg bu-font-semibold bu-mb-2'), `Tab ${i + 1} Content`),
        html.p(`This is the content for tab ${i + 1}. Each tab can contain different content.`),
        Button(
          { onClick: () => console.log(`Button clicked in tab ${i + 1}`) },
          `Action ${i + 1}`
        )
      )
    }))
  }

  const dynamicTabs = dynamicTabCount.map(count => createDynamicTabs(count))
  const dynamicActiveTab = prop('tab-1')

  return ScrollablePanel({
    header: ControlsHeader(
      Stack(
        Label('Size'),
        ControlSizeSelector({ size, onChange: size.set })
      ),
      Stack(
        Label('Orientation'),
        SegmentedControl({
          size: 'sm',
          options: {
            horizontal: 'Horizontal',
            vertical: 'Vertical',
          },
          value: orientation,
          onChange: orientation.set,
        })
      ),
      Stack(DisabledSelector({ disabled })),
      Switch({ value: showContent, onChange: showContent.set, label: 'Show Content' })
    ),
    body: Stack(
      attr.class('bu-gap-8 bu-p-4'),
      
      // Basic Example
      html.section(
        html.h2(attr.class('bu-text-xl bu-font-bold bu-mb-4'), 'Basic Tabs'),
        html.p(attr.class('bu-text-gray-600 bu-mb-4'), 'A simple tabs component with different content panels.'),
        html.div(
          attr.class('bu-border bu-rounded-lg bu-p-4'),
          Tabs({
            items: basicTabs,
            value: activeTab,
            onChange: activeTab.set,
            size,
            disabled,
            orientation,
            showContent,
            ariaLabel: 'Main navigation tabs'
          })
        )
      ),

      // Size Variations
      html.section(
        html.h2(attr.class('bu-text-xl bu-font-bold bu-mb-4'), 'Size Variations'),
        html.p(attr.class('bu-text-gray-600 bu-mb-4'), 'Tabs component supports different sizes from xs to xl.'),
        html.div(
          attr.class('bu-space-y-6'),
          ...allSizes.map(currentSize => {
            const sizeActiveTab = prop('overview')
            return html.div(
              html.h3(attr.class('bu-text-lg bu-font-semibold bu-mb-2'), `Size: ${currentSize}`),
              html.div(
                attr.class('bu-border bu-rounded-lg bu-p-4'),
                Tabs({
                  items: basicTabs.slice(0, 3), // Only show first 3 tabs for size demo
                  value: sizeActiveTab,
                  onChange: sizeActiveTab.set,
                  size: currentSize,
                  showContent: prop(false) // Hide content for size comparison
                })
              )
            )
          })
        )
      ),

      // Vertical Orientation
      html.section(
        html.h2(attr.class('bu-text-xl bu-font-bold bu-mb-4'), 'Vertical Orientation'),
        html.p(attr.class('bu-text-gray-600 bu-mb-4'), 'Tabs can be displayed vertically for sidebar-style navigation.'),
        html.div(
          attr.class('bu-border bu-rounded-lg bu-p-4 bu-h-96'),
          (() => {
            const verticalActiveTab = prop('overview')
            return Tabs({
              items: basicTabs.slice(0, 3),
              value: verticalActiveTab,
              onChange: verticalActiveTab.set,
              orientation: prop('vertical'),
              size: prop('md')
            })
          })()
        )
      ),

      // Dynamic Tabs
      html.section(
        html.h2(attr.class('bu-text-xl bu-font-bold bu-mb-4'), 'Dynamic Tabs'),
        html.p(attr.class('bu-text-gray-600 bu-mb-4'), 'Tabs can be dynamically added or removed.'),
        html.div(
          attr.class('bu-mb-4 bu-flex bu-items-center bu-gap-4'),
          Label('Number of tabs:'),
          html.input(
            attr.type('range'),
            attr.min('1'),
            attr.max('6'),
            attr.value(dynamicTabCount.map(String)),
            attr.class('bu-w-32'),
            attr.oninput((e: Event) => {
              const target = e.target as HTMLInputElement
              const newCount = parseInt(target.value)
              dynamicTabCount.set(newCount)
              // Reset active tab to first tab when count changes
              dynamicActiveTab.set('tab-1')
            })
          ),
          html.span(dynamicTabCount.map(count => `${count} tabs`))
        ),
        html.div(
          attr.class('bu-border bu-rounded-lg bu-p-4'),
          Tabs({
            items: dynamicTabs,
            value: dynamicActiveTab,
            onChange: dynamicActiveTab.set,
            size: prop('md')
          })
        )
      ),

      // Accessibility Features
      html.section(
        html.h2(attr.class('bu-text-xl bu-font-bold bu-mb-4'), 'Accessibility Features'),
        html.div(
          attr.class('bu-space-y-4'),
          html.div(
            html.h3(attr.class('bu-text-lg bu-font-semibold'), 'Keyboard Navigation'),
            html.ul(
              attr.class('bu-list-disc bu-list-inside bu-mt-2 bu-space-y-1'),
              html.li('Arrow keys: Navigate between tabs'),
              html.li('Home/End: Jump to first/last tab'),
              html.li('Enter/Space: Activate focused tab'),
              html.li('Tab: Move focus to tab content')
            )
          ),
          html.div(
            html.h3(attr.class('bu-text-lg bu-font-semibold'), 'ARIA Support'),
            html.ul(
              attr.class('bu-list-disc bu-list-inside bu-mt-2 bu-space-y-1'),
              html.li('Proper role attributes (tablist, tab, tabpanel)'),
              html.li('aria-selected for active tab state'),
              html.li('aria-controls linking tabs to panels'),
              html.li('aria-labelledby linking panels to tabs'),
              html.li('aria-disabled for disabled tabs')
            )
          )
        )
      ),

      // Code Example
      html.section(
        html.h2(attr.class('bu-text-xl bu-font-bold bu-mb-4'), 'Usage Example'),
        html.pre(
          attr.class('bu-bg-gray-100 bu-p-4 bu-rounded-lg bu-overflow-x-auto bu-text-sm'),
          html.code(`import { Tabs, TabItem, prop } from '@tempots/beatui'

const activeTab = prop('tab1')

const items: TabItem[] = [
  {
    key: 'tab1',
    label: 'First Tab',
    content: html.div('Content for first tab')
  },
  {
    key: 'tab2',
    label: 'Second Tab',
    content: html.div('Content for second tab'),
    disabled: prop(false)
  }
]

Tabs({
  items,
  value: activeTab,
  onChange: activeTab.set,
  size: 'md',
  orientation: 'horizontal',
  ariaLabel: 'Main navigation'
})`)
        )
      )
    ),
  })
}

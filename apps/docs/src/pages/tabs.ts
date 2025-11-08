import {
  ControlSize,
  ScrollablePanel,
  Tabs,
  TabItem,
  Stack,
  Label,
  SegmentedInput,
  Switch,
  TabsDirection,
  ButtonVariant,
  InputWrapper,
} from '@tempots/beatui'
import { html, attr, prop, OnDispose } from '@tempots/dom'
import { DisabledSelector } from '../elements/disabled-selector'
import { ControlsHeader } from '../elements/controls-header'
import { ControlSizeSelector } from '../elements/control-size-selector'

const allVariants: ButtonVariant[] = [
  'filled',
  'light',
  'outline',
  'default',
  'text',
]

const allSizes: ControlSize[] = ['xs', 'sm', 'md', 'lg', 'xl']

export default function TabsPage() {
  const disabled = prop(false)
  const size = prop<ControlSize>('md')
  const orientation = prop<'horizontal' | 'vertical'>('horizontal')
  const showContent = prop(true)
  type DemoTabKey = 'overview' | 'details' | 'settings' | 'disabled'

  const activeTab = prop<DemoTabKey>('overview')

  // Basic tabs example
  const basicTabs: TabItem<DemoTabKey>[] = [
    {
      key: 'overview',
      label: 'Overview',
      content: () =>
        html.div(
          attr.class('p-4'),
          html.h3(attr.class('text-lg font-semibold mb-2'), 'Overview'),
          html.p(
            'This is the overview tab content. It provides a general introduction to the topic.'
          )
        ),
    },
    {
      key: 'details',
      label: 'Details',
      content: () =>
        html.div(
          attr.class('p-4'),
          html.h3(attr.class('text-lg font-semibold mb-2'), 'Details'),
          html.p(
            'Here you can find detailed information about the specific features and functionality.'
          ),
          html.ul(
            attr.class('list-disc list-inside mt-2'),
            html.li('Feature 1: Advanced functionality'),
            html.li('Feature 2: Enhanced performance'),
            html.li('Feature 3: Better user experience')
          )
        ),
    },
    {
      key: 'settings',
      label: 'Settings',
      content: () =>
        html.div(
          attr.class('p-4'),
          html.h3(attr.class('text-lg font-semibold mb-2'), 'Settings'),
          html.p('Configure your preferences and options here.'),
          html.div(
            attr.class('mt-4 space-y-2'),
            html.label(
              attr.class('flex items-center gap-2'),
              html.input(attr.type('checkbox')),
              'Enable notifications'
            ),
            html.label(
              attr.class('flex items-center gap-2'),
              html.input(attr.type('checkbox')),
              'Auto-save changes'
            )
          )
        ),
    },
    {
      key: 'disabled',
      label: 'Disabled Tab',
      content: () =>
        html.div(attr.class('p-4'), 'This content should not be accessible.'),
      disabled: true,
    },
  ]

  return ScrollablePanel({
    header: ControlsHeader(
      Stack(Label('Size'), ControlSizeSelector({ size, onChange: size.set })),
      Stack(
        Label('Orientation'),
        SegmentedInput({
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
      InputWrapper({
        label: 'Show Content',
        content: Switch({
          value: showContent,
          onChange: showContent.set,
        }),
      })
    ),
    body: Stack(
      attr.class('gap-8 overflow-hidden'),

      // Basic Example
      html.section(
        html.h2(attr.class('text-xl font-bold mb-4'), 'Basic Tabs'),
        html.p(
          attr.class('text-gray-600-600 mb-4'),
          'A simple tabs component with different content panels.'
        ),
        html.div(
          attr.class('border rounded-lg overflow-hidden'),
          Tabs({
            items: basicTabs,
            value: activeTab,
            onChange: activeTab.set,
            size,
            disabled,
            orientation,
            showContent,
            ariaLabel: 'Main navigation tabs',
          })
        )
      ),

      // Size Variations
      html.section(
        html.h2(attr.class('text-xl font-bold mb-4'), 'Size Variations'),
        html.p(
          attr.class('text-gray-600-600 mb-4'),
          'Tabs component supports different sizes from xs to xl.'
        ),
        html.div(
          attr.class('space-y-6'),
          ...allSizes.map(currentSize => {
            const sizeActiveTab = prop<DemoTabKey>('overview')
            return html.div(
              OnDispose(sizeActiveTab),
              html.h3(
                attr.class('text-lg font-semibold mb-2'),
                `Size: ${currentSize}`
              ),
              html.div(
                attr.class('border rounded-lg overflow-hidden'),
                Tabs({
                  items: basicTabs.slice(0, 3), // Only show first 3 tabs for size demo
                  value: sizeActiveTab,
                  onChange: sizeActiveTab.set,
                  size: currentSize,
                  showContent: prop(false), // Hide content for size comparison
                })
              )
            )
          })
        )
      ),

      // Variants
      html.section(
        html.h2(attr.class('text-xl font-bold mb-4'), 'Variants'),
        html.p(
          attr.class('text-gray-600-600 mb-4'),
          'Tabs can be rendered with different visual variants.'
        ),
        html.div(
          attr.class('space-y-6'),
          ...allVariants.map(currentVariant => {
            const variantActiveTab = prop<DemoTabKey>('overview')
            return html.div(
              OnDispose(variantActiveTab.dispose),
              html.h3(
                attr.class('text-lg font-semibold mb-2'),
                `Variant: ${currentVariant}`
              ),
              html.div(
                attr.class('border rounded-lg overflow-hidden'),
                Tabs({
                  items: basicTabs.slice(0, 3),
                  value: variantActiveTab,
                  onChange: variantActiveTab.set,
                  variant: currentVariant,
                  showContent: prop(false),
                })
              )
            )
          })
        )
      ),

      // Vertical Orientation
      html.section(
        html.h2(attr.class('text-xl font-bold mb-4'), 'Vertical Orientation'),
        html.p(
          attr.class('text-gray-600-600 mb-4'),
          'Tabs can be displayed vertically for sidebar-style navigation.'
        ),
        html.div(
          attr.class('border rounded-lg overflow-hidden h-96'),
          (() => {
            const verticalActiveTab = prop<DemoTabKey>('overview')
            return Tabs({
              items: basicTabs.slice(0, 3),
              value: verticalActiveTab,
              onChange: verticalActiveTab.set,
              orientation: prop('vertical' as TabsDirection),
              size: prop('md' as ControlSize),
            })
          })()
        )
      ),

      // Accessibility Features
      html.section(
        html.h2(attr.class('text-xl font-bold mb-4'), 'Accessibility Features'),
        html.div(
          attr.class('space-y-4'),
          html.div(
            html.h3(attr.class('text-lg font-semibold'), 'Keyboard Navigation'),
            html.ul(
              attr.class('list-disc list-inside mt-2 space-y-1'),
              html.li('Arrow keys: Navigate between tabs'),
              html.li('Home/End: Jump to first/last tab'),
              html.li('Enter/Space: Activate focused tab'),
              html.li('Tab: Move focus to tab content')
            )
          ),
          html.div(
            html.h3(attr.class('text-lg font-semibold'), 'ARIA Support'),
            html.ul(
              attr.class('list-disc list-inside mt-2 space-y-1'),
              html.li('Proper role attributes (tablist, tab, tabpanel)'),
              html.li('aria-selected for active tab state'),
              html.li('aria-controls linking tabs to panels'),
              html.li('aria-labelledby linking panels to tabs'),
              html.li('aria-disabled for disabled tabs')
            )
          )
        )
      )
    ),
  })
}

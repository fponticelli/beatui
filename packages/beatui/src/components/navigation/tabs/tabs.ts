import {
  TNode,
  Value,
  attr,
  html,
  on,
  prop,
  computedOf,
  Fragment,
  aria,
  dataAttr,
  When,
  Ensure,
  MapSignal,
  OnDispose,
} from '@tempots/dom'
import { ControlSize, ButtonVariant } from '../../theme'
import { ThemeColorName } from '@/tokens'
import {
  backgroundValue,
  ExtendedColor,
  hoverBackgroundValue,
} from '../../theme/style-utils'

import { getColorVar, type ColorShade } from '@/tokens/colors'

import { sessionId } from '../../../utils/session-id'

export interface TabItem<T extends string> {
  /** Unique identifier for the tab */
  key: T
  /** Tab label content */
  label: TNode
  /** Tab content to display when active */
  content: () => TNode
  /** Whether the tab is disabled */
  disabled?: Value<boolean>
  /** ARIA label for accessibility */
  ariaLabel?: Value<string>
}

export type TabsDirection = 'horizontal' | 'vertical'

export interface TabsOptions<T extends string> {
  /** Array of tab items */
  items: TabItem<T>[]
  /** Currently active tab key */
  value: Value<T>
  /** Callback when tab changes */
  onChange?: (key: T) => void
  /** Size of the tabs */
  size?: Value<ControlSize>
  /** Visual variant */
  variant?: Value<ButtonVariant>
  /** Color used by certain variants (e.g., filled) */
  color?: Value<ThemeColorName | 'black' | 'white'>
  /** Whether tabs are disabled */
  disabled?: Value<boolean>
  /** Orientation of the tabs */
  orientation?: Value<TabsDirection>
  /** Whether to show tab content */
  showContent?: Value<boolean>
  /** ARIA label for the tab list */
  ariaLabel?: Value<string>
}

function generateTabsClasses(
  size: ControlSize,
  orientation: 'horizontal' | 'vertical',
  disabled: boolean,
  variant?: ButtonVariant
): string {
  const classes = ['bc-tabs', `bc-tabs--${size}`, `bc-tabs--${orientation}`]

  if (disabled) {
    classes.push('bc-tabs--disabled')
  }
  if (variant != null && variant !== 'default') {
    classes.push(`bc-tabs--variant-${variant}`)
  }

  return classes.join(' ')
}

function generateTabsStyles(
  variant: ButtonVariant,
  color: ExtendedColor
): string {
  if (variant !== 'filled') return ''
  const styles = new Map<string, string>()
  const baseLight = backgroundValue(color, 'solid', 'light')
  const baseDark = backgroundValue(color, 'solid', 'dark')
  styles.set('--tabs-filled-inactive-bg', baseLight.backgroundColor)
  // For light mode inactive tabs, always use white text
  styles.set('--tabs-filled-inactive-text', 'var(--color-white)')
  const hoverLight = hoverBackgroundValue(color, 'solid', 'light')
  styles.set('--tabs-filled-inactive-bg-hover', hoverLight.backgroundColor)
  const hoverDark = hoverBackgroundValue(color, 'solid', 'dark')
  styles.set('--tabs-filled-inactive-bg-dark-hover', hoverDark.backgroundColor)

  styles.set('--tabs-filled-inactive-bg-dark', baseDark.backgroundColor)
  styles.set('--tabs-filled-inactive-text-dark', baseDark.textColor)

  // Active tab should be white in light mode and base-900 in dark mode
  styles.set('--tabs-filled-active-bg', 'var(--color-white)')
  // Light mode active tab text: neutral gray/base-800
  styles.set('--tabs-filled-active-text', 'var(--color-base-800)')
  styles.set('--tabs-filled-active-bg-dark', 'var(--color-base-900)')
  const activeTextDark =
    color === 'white' || color === 'black' || color === 'transparent'
      ? 'var(--color-white)'
      : getColorVar(color as ThemeColorName, 400 as ColorShade)
  styles.set('--tabs-filled-active-text-dark', activeTextDark)

  return Array.from(styles.entries())
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ')
}

function generateTabClasses(
  size: ControlSize,
  isActive: boolean,
  disabled: boolean
): string {
  const classes = ['bc-tab', `bc-tab--${size}`]

  if (isActive) {
    classes.push('bc-tab--active')
  }

  if (disabled) {
    classes.push('bc-tab--disabled')
  }

  return classes.join(' ')
}

/**
 * Find the next enabled tab in the given direction
 */
function findNextEnabledTab<T extends string>(
  currentIndex: number,
  items: TabItem<T>[],
  direction: 1 | -1
): number {
  const length = items.length
  let nextIndex = currentIndex + direction

  // Wrap around
  if (nextIndex >= length) {
    nextIndex = 0
  } else if (nextIndex < 0) {
    nextIndex = length - 1
  }

  // Find next enabled tab
  let attempts = 0
  while (attempts < length) {
    const item = items[nextIndex]
    const isDisabled = Value.get(item.disabled ?? false)

    if (!isDisabled) {
      return nextIndex
    }

    nextIndex += direction
    if (nextIndex >= length) {
      nextIndex = 0
    } else if (nextIndex < 0) {
      nextIndex = length - 1
    }

    attempts++
  }

  return currentIndex // Return current if no enabled tabs found
}

/**
 * Tabs component that provides tabbed navigation with content panels.
 * Follows WAI-ARIA tabs pattern with proper keyboard navigation and accessibility.
 *
 * @example
 * ```typescript
 * const activeTab = prop('tab1')
 *
 * Tabs({
 *   items: [
 *     { key: 'tab1', label: 'First Tab', content: html.div('Content 1') },
 *     { key: 'tab2', label: 'Second Tab', content: html.div('Content 2') },
 *   ],
 *   value: activeTab,
 *   onChange: activeTab.set
 * })
 * ```
 */
export function Tabs<T extends string>(options: TabsOptions<T>): TNode {
  const {
    items,
    value,
    onChange,
    size = 'md',
    variant = 'default',
    color = 'primary',
    disabled = false,
    orientation = 'horizontal',
    showContent = true,
    ariaLabel,
  } = options

  const tabListId = sessionId('tablist')
  const focusedTabIndex = prop(-1)
  const currentTab = computedOf(value)(key => {
    return items.find(item => item.key === key)
  })

  const handleKeyDown = (event: KeyboardEvent) => {
    const isDisabled = Value.get(disabled)
    if (isDisabled) return

    const currentIndex = focusedTabIndex.value
    const isHorizontal = Value.get(orientation) === 'horizontal'

    let nextIndex = currentIndex

    switch (event.key) {
      case isHorizontal ? 'ArrowRight' : 'ArrowDown':
        event.preventDefault()
        nextIndex = findNextEnabledTab(currentIndex, items, 1)
        break
      case isHorizontal ? 'ArrowLeft' : 'ArrowUp':
        event.preventDefault()
        nextIndex = findNextEnabledTab(currentIndex, items, -1)
        break
      case 'Home':
        event.preventDefault()
        nextIndex = findNextEnabledTab(-1, items, 1)
        break
      case 'End':
        event.preventDefault()
        nextIndex = findNextEnabledTab(items.length, items, -1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (currentIndex >= 0 && currentIndex < items.length) {
          const tab = items[currentIndex]
          const isTabDisabled = Value.get(tab.disabled ?? false)
          if (!isTabDisabled) {
            onChange?.(tab.key)
          }
        }
        break
    }

    if (
      nextIndex !== currentIndex &&
      nextIndex >= 0 &&
      nextIndex < items.length
    ) {
      focusedTabIndex.set(nextIndex)
      // Focus the tab element using a small delay to ensure DOM is updated
      setTimeout(() => {
        const tabElement = document.querySelector(
          `[data-tab-index="${nextIndex}"]`
        ) as HTMLElement
        if (tabElement) {
          tabElement.focus()
        }
      }, 0)
    }
  }

  return html.div(
    OnDispose(currentTab, focusedTabIndex),
    attr.class(
      computedOf(
        size,
        orientation,
        disabled,
        variant
      )((size, orientation, disabled, variant) =>
        generateTabsClasses(
          size ?? 'md',
          orientation ?? 'horizontal',
          disabled ?? false,
          variant ?? 'default'
        )
      )
    ),
    attr.style(
      computedOf(
        variant,
        color
      )((v, c) =>
        generateTabsStyles(v ?? 'default', (c ?? 'primary') as ExtendedColor)
      )
    ),

    // Tab list
    html.div(
      attr.class('bc-tabs__list'),
      attr.role('tablist'),
      attr.id(tabListId),
      aria.orientation(
        (orientation ?? 'horizontal') as 'horizontal' | 'vertical'
      ),
      ariaLabel ? aria.label(ariaLabel) : Fragment(),
      on.keydown(handleKeyDown),

      ...items.map((item, index) => {
        const isActive = computedOf(value)(activeKey => activeKey === item.key)
        const isTabDisabled = computedOf(
          disabled,
          item.disabled
        )((globalDisabled, itemDisabled) => globalDisabled || itemDisabled)

        const tabId = `${tabListId}-tab-${item.key}`
        const panelId = `${tabListId}-panel-${item.key}`

        return html.button(
          OnDispose(isActive, isTabDisabled),
          attr.type('button'),
          attr.class(
            computedOf(
              size,
              isActive,
              isTabDisabled
            )((size, active, disabled) =>
              generateTabClasses(
                size ?? 'md',
                active ?? false,
                disabled ?? false
              )
            )
          ),
          attr.id(tabId),
          attr.role('tab'),
          attr.tabindex(
            computedOf(
              isActive,
              focusedTabIndex
            )((active, focusedIndex): number => {
              // Active tab or focused tab should be focusable
              return active || focusedIndex === index ? 0 : -1
            })
          ),
          aria.selected(isActive as Value<boolean | 'undefined'>),
          aria.controls(panelId),
          aria.disabled(isTabDisabled),
          attr.disabled(isTabDisabled),
          dataAttr['tab-index'](String(index)),
          item.ariaLabel ? aria.label(item.ariaLabel) : Fragment(),

          on.click(event => {
            event.preventDefault()
            const isTabDisabled =
              Value.get(item.disabled ?? false) || Value.get(disabled)
            if (!isTabDisabled) {
              onChange?.(item.key)
              focusedTabIndex.set(index)
            }
          }),

          on.focus(() => {
            focusedTabIndex.set(index)
          }),

          item.label
        )
      })
    ),
    // Panel
    When(showContent ?? true, () =>
      Ensure(currentTab, tab => {
        const key = tab.$.key
        const tabId = key.map(k => `${tabListId}-tab-${k}`)
        const panelId = key.map(k => `${tabListId}-panel-${k}`)
        return html.div(
          OnDispose(key),
          attr.class('bc-tabs__panels'),
          html.div(
            attr.class('bc-tabs__panel'),
            attr.id(panelId),
            attr.role('tabpanel'),
            attr.tabindex(0),
            aria.labelledby(tabId),
            MapSignal(tab, t => t.content())
          )
        )
      })
    )
  )
}

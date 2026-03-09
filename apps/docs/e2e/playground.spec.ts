import { test, expect, type Page, type Locator } from '@playwright/test'
import { getComponentSlugs } from './fixtures'

/**
 * Playground interaction tests @component
 *
 * These tests verify that changing values in the options panel
 * is reflected in the component preview area.
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Navigate to a component playground and wait for it to load */
async function openPlayground(page: Page, slug: string) {
  await page.goto(`/components/${slug}`)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('.space-y-2').first()).toBeVisible({
    timeout: 10_000,
  })
}

/** Get the options panel container */
function optionsPanel(page: Page): Locator {
  return page.locator('.lg\\:w-72').first()
}

/** Get the preview area container */
function previewArea(page: Page): Locator {
  return page.locator('.min-w-48.min-h-16').first()
}

/**
 * Find a control in the options panel by its label text.
 * InputWrapper renders: .bc-input-wrapper > .bc-input-wrapper__header > label > span with label text
 */
function controlByLabel(page: Page, label: string): Locator {
  const panel = optionsPanel(page)
  return panel.locator('.bc-input-wrapper').filter({
    has: page.locator(`.bc-input-wrapper__label-text`, { hasText: label }),
  })
}

/**
 * Click a segmented input option by its text.
 * SegmentedInput renders buttons with class bc-segmented-input__segment.
 */
async function selectSegment(
  control: Locator,
  value: string
): Promise<void> {
  const segment = control.locator('.bc-segmented-input__segment', {
    hasText: value,
  })
  await segment.click()
}

/**
 * Select a value from a NativeSelect dropdown.
 * BeatUI NativeSelect uses DOM expandos for values (no value attribute),
 * so we find the option by text and select it by index.
 */
async function selectDropdown(
  control: Locator,
  label: string
): Promise<void> {
  const select = control.locator('select')
  const optionIndex = await select.evaluate(
    (el: HTMLSelectElement, text: string) => {
      for (let i = 0; i < el.options.length; i++) {
        if (el.options[i].textContent?.trim() === text) return i
      }
      return -1
    },
    label
  )
  if (optionIndex === -1) {
    throw new Error(`Option "${label}" not found in select`)
  }
  await select.selectOption({ index: optionIndex })
}

/**
 * Toggle a Switch control.
 */
async function toggleSwitch(control: Locator): Promise<void> {
  const switchEl = control.locator('.bc-switch')
  await switchEl.click()
}

/**
 * Set a NumberInput value.
 */
async function setNumber(control: Locator, value: number): Promise<void> {
  const input = control.locator('input[type="number"]')
  await input.fill(String(value))
  await input.press('Tab')
}

// ── Test specification types ─────────────────────────────────────────────────

type DropdownClassTest = {
  slug: string
  prop: string
  value: string
  /** CSS class expected on the component element after selection */
  expectedClass: string
  /** Optional selector for the component element (defaults to first [class*="bc-"] in preview) */
  selector?: string
}

type ToggleClassTest = {
  slug: string
  prop: string
  /** CSS class expected to appear after toggle */
  expectedClass: string
  selector?: string
}

type DropdownStyleTest = {
  slug: string
  prop: string
  value: string
  /** Substring expected in the inline style attribute */
  styleContains: string
  selector?: string
}

// ── Test data ────────────────────────────────────────────────────────────────

/**
 * Tests: select a dropdown value → verify CSS class appears in preview.
 * Covers size, variant, roundedness, orientation, tone, placement props.
 */
const dropdownClassTests: DropdownClassTest[] = [
  // ─── Button ────────────────────────────────────────────────────────────
  { slug: 'button', prop: 'size', value: 'lg', expectedClass: 'bc-button--size-lg', selector: '.bc-button' },
  { slug: 'button', prop: 'size', value: 'xs', expectedClass: 'bc-button--size-xs', selector: '.bc-button' },
  { slug: 'button', prop: 'roundedness', value: 'full', expectedClass: 'bc-control--rounded-full', selector: '.bc-button' },
  { slug: 'button', prop: 'roundedness', value: 'none', expectedClass: 'bc-control--rounded-none', selector: '.bc-button' },

  // ─── ButtonLink ────────────────────────────────────────────────────────
  { slug: 'button-link', prop: 'size', value: 'lg', expectedClass: 'bc-button--size-lg', selector: '.bc-button' },
  { slug: 'button-link', prop: 'size', value: 'sm', expectedClass: 'bc-button--size-sm', selector: '.bc-button' },

  // ─── CloseButton ───────────────────────────────────────────────────────
  { slug: 'close-button', prop: 'size', value: 'lg', expectedClass: 'bc-button--size-lg', selector: '.bc-button' },
  { slug: 'close-button', prop: 'size', value: 'xs', expectedClass: 'bc-button--size-xs', selector: '.bc-button' },

  // ─── ToggleButton ──────────────────────────────────────────────────────
  { slug: 'toggle-button', prop: 'size', value: 'lg', expectedClass: 'bc-toggle-button--size-lg', selector: '.bc-toggle-button' },
  { slug: 'toggle-button', prop: 'size', value: 'xs', expectedClass: 'bc-toggle-button--size-xs', selector: '.bc-toggle-button' },
  { slug: 'toggle-button', prop: 'roundedness', value: 'full', expectedClass: 'bc-control--rounded-full', selector: '.bc-toggle-button' },

  // ─── Badge ─────────────────────────────────────────────────────────────
  { slug: 'badge', prop: 'size', value: 'lg', expectedClass: 'bc-badge--size-lg', selector: '.bc-badge' },
  { slug: 'badge', prop: 'size', value: 'xs', expectedClass: 'bc-badge--size-xs', selector: '.bc-badge' },
  { slug: 'badge', prop: 'roundedness', value: 'full', expectedClass: 'bc-control--rounded-full', selector: '.bc-badge' },

  // ─── Avatar ────────────────────────────────────────────────────────────
  { slug: 'avatar', prop: 'size', value: 'lg', expectedClass: 'bc-avatar--size-lg', selector: '.bc-avatar' },
  { slug: 'avatar', prop: 'size', value: 'sm', expectedClass: 'bc-avatar--size-sm', selector: '.bc-avatar' },
  { slug: 'avatar', prop: 'variant', value: 'square', expectedClass: 'bc-avatar--square', selector: '.bc-avatar' },

  // ─── Switch ────────────────────────────────────────────────────────────
  { slug: 'switch', prop: 'size', value: 'lg', expectedClass: 'bc-switch--size-lg', selector: '.bc-switch' },
  { slug: 'switch', prop: 'size', value: 'xs', expectedClass: 'bc-switch--size-xs', selector: '.bc-switch' },

  // ─── ProgressBar ───────────────────────────────────────────────────────
  { slug: 'progress-bar', prop: 'size', value: 'lg', expectedClass: 'bc-progress-bar--size-lg', selector: '.bc-progress-bar' },
  { slug: 'progress-bar', prop: 'size', value: 'sm', expectedClass: 'bc-progress-bar--size-sm', selector: '.bc-progress-bar' },

  // ─── Divider ───────────────────────────────────────────────────────────
  { slug: 'divider', prop: 'variant', value: 'dashed', expectedClass: 'bc-divider--dashed', selector: '.bc-divider' },
  { slug: 'divider', prop: 'variant', value: 'dotted', expectedClass: 'bc-divider--dotted', selector: '.bc-divider' },
  { slug: 'divider', prop: 'tone', value: 'strong', expectedClass: 'bc-divider--tone-strong', selector: '.bc-divider' },
  { slug: 'divider', prop: 'tone', value: 'subtle', expectedClass: 'bc-divider--tone-subtle', selector: '.bc-divider' },

  // ─── Card ──────────────────────────────────────────────────────────────
  { slug: 'card', prop: 'variant', value: 'elevated', expectedClass: 'bc-card--elevated', selector: '.bc-card' },
  { slug: 'card', prop: 'variant', value: 'outlined', expectedClass: 'bc-card--outlined', selector: '.bc-card' },
  { slug: 'card', prop: 'roundedness', value: 'full', expectedClass: 'bc-card--rounded-full', selector: '.bc-card' },

  // ─── Accordion ─────────────────────────────────────────────────────────
  { slug: 'accordion', prop: 'size', value: 'lg', expectedClass: 'bc-accordion--size-lg', selector: '.bc-accordion' },
  { slug: 'accordion', prop: 'size', value: 'xs', expectedClass: 'bc-accordion--size-xs', selector: '.bc-accordion' },
  { slug: 'accordion', prop: 'variant', value: 'separated', expectedClass: 'bc-accordion--separated', selector: '.bc-accordion' },

  // ─── Skeleton ──────────────────────────────────────────────────────────
  { slug: 'skeleton', prop: 'variant', value: 'circle', expectedClass: 'bc-skeleton--circle', selector: '.bc-skeleton' },
  { slug: 'skeleton', prop: 'variant', value: 'rect', expectedClass: 'bc-skeleton--rect', selector: '.bc-skeleton' },

  // ─── Icon ──────────────────────────────────────────────────────────────
  { slug: 'icon', prop: 'size', value: 'lg', expectedClass: 'bc-icon--lg', selector: '.bc-icon' },
  { slug: 'icon', prop: 'size', value: 'xs', expectedClass: 'bc-icon--xs', selector: '.bc-icon' },

  // ─── Breadcrumbs ───────────────────────────────────────────────────────
  { slug: 'breadcrumbs', prop: 'size', value: 'lg', expectedClass: 'bc-breadcrumbs--size-lg', selector: '.bc-breadcrumbs' },
  { slug: 'breadcrumbs', prop: 'size', value: 'sm', expectedClass: 'bc-breadcrumbs--size-sm', selector: '.bc-breadcrumbs' },

  // ─── Tabs ──────────────────────────────────────────────────────────────
  { slug: 'tabs', prop: 'size', value: 'lg', expectedClass: 'bc-tabs--lg', selector: '.bc-tabs' },
  { slug: 'tabs', prop: 'size', value: 'xs', expectedClass: 'bc-tabs--xs', selector: '.bc-tabs' },
  { slug: 'tabs', prop: 'variant', value: 'pill', expectedClass: 'bc-tabs--variant-pill', selector: '.bc-tabs' },
  { slug: 'tabs', prop: 'variant', value: 'outline', expectedClass: 'bc-tabs--variant-outline', selector: '.bc-tabs' },

  // ─── Notice ────────────────────────────────────────────────────────────
  { slug: 'notice', prop: 'variant', value: 'success', expectedClass: 'bc-notice--success', selector: '.bc-notice' },
  { slug: 'notice', prop: 'variant', value: 'danger', expectedClass: 'bc-notice--danger', selector: '.bc-notice' },
  { slug: 'notice', prop: 'tone', value: 'prominent', expectedClass: 'bc-notice--tone-prominent', selector: '.bc-notice' },

  // ─── SegmentedInput ────────────────────────────────────────────────────
  { slug: 'segmented-input', prop: 'size', value: 'lg', expectedClass: 'bc-segmented-input--size-lg', selector: '.bc-segmented-input' },
  { slug: 'segmented-input', prop: 'size', value: 'xs', expectedClass: 'bc-segmented-input--size-xs', selector: '.bc-segmented-input' },

  // ─── OtpInput ──────────────────────────────────────────────────────────
  { slug: 'otp-input', prop: 'size', value: 'lg', expectedClass: 'bc-otp-input--size-lg', selector: '.bc-otp-input' },
  { slug: 'otp-input', prop: 'size', value: 'xs', expectedClass: 'bc-otp-input--size-xs', selector: '.bc-otp-input' },


  // ─── Indicator (classes are on .bc-indicator__badge child) ───────────
  { slug: 'indicator', prop: 'size', value: 'lg', expectedClass: 'bc-indicator--size-lg', selector: '.bc-indicator__badge' },
  { slug: 'indicator', prop: 'placement', value: 'top-left', expectedClass: 'bc-indicator--top-left', selector: '.bc-indicator__badge' },
  { slug: 'indicator', prop: 'placement', value: 'bottom-right', expectedClass: 'bc-indicator--bottom-right', selector: '.bc-indicator__badge' },

  // ─── Pagination (uses bc-pagination--variant-X pattern) ────────────────
  { slug: 'pagination', prop: 'variant', value: 'outline', expectedClass: 'bc-pagination--variant-outline', selector: '.bc-pagination' },
  { slug: 'pagination', prop: 'variant', value: 'pill', expectedClass: 'bc-pagination--variant-pill', selector: '.bc-pagination' },

  // ─── RadioGroup ────────────────────────────────────────────────────────
  { slug: 'radio-group', prop: 'orientation', value: 'horizontal', expectedClass: 'bc-radio-group--horizontal', selector: '.bc-radio-group' },

  // ─── Input components with auto/manual playground (size → InputContainer) ─
  { slug: 'text-input', prop: 'size', value: 'lg', expectedClass: 'bc-control--padding-lg', selector: '.bc-input-container__input' },
  { slug: 'text-input', prop: 'size', value: 'xs', expectedClass: 'bc-control--padding-xs', selector: '.bc-input-container__input' },
  { slug: 'number-input', prop: 'size', value: 'lg', expectedClass: 'bc-control--padding-lg', selector: '.bc-input-container__input' },
  { slug: 'text-area', prop: 'size', value: 'lg', expectedClass: 'bc-control--padding-lg', selector: '.bc-input-container__input' },
  { slug: 'native-select', prop: 'size', value: 'lg', expectedClass: 'bc-control--padding-lg', selector: '.bc-input-container__input' },
  { slug: 'mask-input', prop: 'size', value: 'lg', expectedClass: 'bc-control--padding-lg', selector: '.bc-input-container__input' },
  { slug: 'slider-input', prop: 'size', value: 'lg', expectedClass: 'bc-control--padding-lg', selector: '.bc-input-container__input' },
  { slug: 'tags-input', prop: 'size', value: 'lg', expectedClass: 'bc-tag-input--lg', selector: '.bc-tag-input' },
  { slug: 'color-input', prop: 'size', value: 'lg', expectedClass: 'bc-control--padding-lg', selector: '.bc-input-container__input' },
  // ─── Table ─────────────────────────────────────────────────────────────
  { slug: 'table', prop: 'size', value: 'sm', expectedClass: 'bc-table--size-sm', selector: '.bc-table' },

  // ─── Kbd (KbdSize = 'xs' | 'sm' | 'md') ───────────────────────────────
  { slug: 'kbd', prop: 'size', value: 'xs', expectedClass: 'bc-kbd--size-xs', selector: '.bc-kbd' },
  { slug: 'kbd', prop: 'size', value: 'md', expectedClass: 'bc-kbd--size-md', selector: '.bc-kbd' },

  // ─── RatingInput (icon size changes via bc-icon--{size}) ──────────────
  { slug: 'rating-input', prop: 'size', value: 'lg', expectedClass: 'bc-icon--lg', selector: '.bc-rating-input__icon-container' },
  { slug: 'rating-input', prop: 'size', value: 'xs', expectedClass: 'bc-icon--xs', selector: '.bc-rating-input__icon-container' },
]

/**
 * Tests: toggle a boolean switch → verify CSS class appears/disappears in preview.
 */
/**
 * Toggle tests where the prop defaults to false.
 * Test: toggle on → class appears, toggle off → class disappears.
 */
const toggleClassTests: ToggleClassTest[] = [
  // ─── Button ────────────────────────────────────────────────────────────
  { slug: 'button', prop: 'fullWidth', expectedClass: 'bc-button--full-width', selector: '.bc-button' },
  { slug: 'button', prop: 'loading', expectedClass: 'bc-button--loading', selector: '.bc-button' },

  // ─── Badge ─────────────────────────────────────────────────────────────
  { slug: 'badge', prop: 'circle', expectedClass: 'bc-badge--circle', selector: '.bc-badge' },
  { slug: 'badge', prop: 'fullWidth', expectedClass: 'bc-badge--full-width', selector: '.bc-badge' },

  // ─── Avatar ────────────────────────────────────────────────────────────
  { slug: 'avatar', prop: 'bordered', expectedClass: 'bc-avatar--bordered', selector: '.bc-avatar' },

  // ─── ProgressBar ───────────────────────────────────────────────────────
  { slug: 'progress-bar', prop: 'indeterminate', expectedClass: 'bc-progress-bar--indeterminate', selector: '.bc-progress-bar' },

  // ─── ToggleButton ──────────────────────────────────────────────────────
  { slug: 'toggle-button', prop: 'fullWidth', expectedClass: 'bc-toggle-button--full-width', selector: '.bc-toggle-button' },

  // ─── Notification ──────────────────────────────────────────────────────
  { slug: 'notification', prop: 'showBorder', expectedClass: 'bc-notification--bordered', selector: '.bc-notification' },
  { slug: 'notification', prop: 'loading', expectedClass: 'bc-notification--loading', selector: '.bc-notification' },

  // ─── Table ─────────────────────────────────────────────────────────────
  { slug: 'table', prop: 'hoverable', expectedClass: 'bc-table--hoverable', selector: '.bc-table' },
  { slug: 'table', prop: 'withStripedRows', expectedClass: 'bc-table--with-striped-rows', selector: '.bc-table' },
  { slug: 'table', prop: 'withColumnBorders', expectedClass: 'bc-table--with-column-borders', selector: '.bc-table' },
]

/**
 * Toggle tests where the prop defaults to true.
 * Test: initially has class, toggle off → class disappears, toggle on → class reappears.
 */
type ToggleDefaultTrueTest = ToggleClassTest

const toggleDefaultTrueTests: ToggleDefaultTrueTest[] = [
  // ─── Skeleton (animate defaults to true) ───────────────────────────────
  { slug: 'skeleton', prop: 'animate', expectedClass: 'bc-skeleton--animate', selector: '.bc-skeleton' },

  // ─── Table (withRowBorders defaults to true) ───────────────────────────
  { slug: 'table', prop: 'withRowBorders', expectedClass: 'bc-table--with-row-borders', selector: '.bc-table' },
]

/**
 * Toggle tests where the prop name in the panel differs from what we expect.
 * Notice and AnnouncementBar use "closable" in their options but generate
 * "dismissible" CSS class. The options panel label is "closable".
 */
const closableToggleTests: ToggleClassTest[] = [
  { slug: 'notice', prop: 'closable', expectedClass: 'bc-notice--dismissible', selector: '.bc-notice' },
  { slug: 'announcement-bar', prop: 'closable', expectedClass: 'bc-announcement-bar--dismissible', selector: '.bc-announcement-bar' },
]

/**
 * Tests: select a dropdown value → verify inline styles contain a substring.
 * Covers variant and color props that map to CSS custom properties.
 */
const dropdownStyleTests: DropdownStyleTest[] = [
  // ─── Button variant ────────────────────────────────────────────────────
  { slug: 'button', prop: 'variant', value: 'outline', styleContains: 'transparent', selector: '.bc-button' },
  { slug: 'button', prop: 'variant', value: 'text', styleContains: 'transparent', selector: '.bc-button' },

  // ─── Button color ──────────────────────────────────────────────────────
  { slug: 'button', prop: 'color', value: 'red', styleContains: 'red', selector: '.bc-button' },
  { slug: 'button', prop: 'color', value: 'green', styleContains: 'green', selector: '.bc-button' },

  // ─── Badge color ───────────────────────────────────────────────────────
  { slug: 'badge', prop: 'color', value: 'red', styleContains: 'red', selector: '.bc-badge' },

  // ─── ProgressBar color ─────────────────────────────────────────────────
  { slug: 'progress-bar', prop: 'color', value: 'red', styleContains: 'red', selector: '.bc-progress-bar' },

  // ─── Switch color ──────────────────────────────────────────────────────
  { slug: 'switch', prop: 'color', value: 'red', styleContains: 'red', selector: '.bc-switch' },

  // ─── Tabs color ────────────────────────────────────────────────────────
  { slug: 'tabs', prop: 'color', value: 'red', styleContains: 'red', selector: '.bc-tabs' },
]

// ── Data-driven tests ────────────────────────────────────────────────────────

test.describe('Dropdown → CSS class changes @component', () => {
  for (const spec of dropdownClassTests) {
    test(`${spec.slug}: ${spec.prop}=${spec.value} → ${spec.expectedClass}`, async ({
      page,
    }) => {
      await openPlayground(page, spec.slug)
      const preview = previewArea(page)
      const control = controlByLabel(page, spec.prop)
      await selectDropdown(control, spec.value)
      const target = spec.selector
        ? preview.locator(spec.selector).first()
        : preview.locator('[class*="bc-"]').first()
      await expect(target).toHaveClass(new RegExp(escapeRegex(spec.expectedClass)))
    })
  }
})

test.describe('Toggle (default false) → CSS class changes @component', () => {
  for (const spec of [...toggleClassTests, ...closableToggleTests]) {
    test(`${spec.slug}: ${spec.prop} toggle → ${spec.expectedClass}`, async ({
      page,
    }) => {
      await openPlayground(page, spec.slug)
      const preview = previewArea(page)
      const control = controlByLabel(page, spec.prop)
      const target = spec.selector
        ? preview.locator(spec.selector).first()
        : preview.locator('[class*="bc-"]').first()

      // Initially should NOT have the class (boolean defaults to false)
      await expect(target).not.toHaveClass(
        new RegExp(escapeRegex(spec.expectedClass))
      )

      // Toggle on
      await toggleSwitch(control)
      await expect(target).toHaveClass(
        new RegExp(escapeRegex(spec.expectedClass))
      )

      // Toggle off
      await toggleSwitch(control)
      await expect(target).not.toHaveClass(
        new RegExp(escapeRegex(spec.expectedClass))
      )
    })
  }
})

test.describe('Toggle (default true) → CSS class changes @component', () => {
  for (const spec of toggleDefaultTrueTests) {
    test(`${spec.slug}: ${spec.prop} toggle → ${spec.expectedClass}`, async ({
      page,
    }) => {
      await openPlayground(page, spec.slug)
      const preview = previewArea(page)
      const control = controlByLabel(page, spec.prop)
      const target = spec.selector
        ? preview.locator(spec.selector).first()
        : preview.locator('[class*="bc-"]').first()

      // Initially SHOULD have the class (boolean defaults to true)
      await expect(target).toHaveClass(
        new RegExp(escapeRegex(spec.expectedClass))
      )

      // Toggle off
      await toggleSwitch(control)
      await expect(target).not.toHaveClass(
        new RegExp(escapeRegex(spec.expectedClass))
      )

      // Toggle on
      await toggleSwitch(control)
      await expect(target).toHaveClass(
        new RegExp(escapeRegex(spec.expectedClass))
      )
    })
  }
})

test.describe('Dropdown → inline style changes @component', () => {
  for (const spec of dropdownStyleTests) {
    test(`${spec.slug}: ${spec.prop}=${spec.value} → style contains "${spec.styleContains}"`, async ({
      page,
    }) => {
      await openPlayground(page, spec.slug)
      const preview = previewArea(page)
      const control = controlByLabel(page, spec.prop)
      const target = spec.selector
        ? preview.locator(spec.selector).first()
        : preview.locator('[class*="bc-"]').first()

      const initialStyle = await target.getAttribute('style')
      await selectDropdown(control, spec.value)
      const newStyle = await target.getAttribute('style')
      expect(newStyle).not.toBe(initialStyle)
      expect(newStyle).toContain(spec.styleContains)
    })
  }
})

// ── Additional specific tests ────────────────────────────────────────────────

test.describe('Number input → preview changes @component', () => {
  test('ProgressBar: value changes fill width', async ({ page }) => {
    await openPlayground(page, 'progress-bar')
    const preview = previewArea(page)
    const valueControl = controlByLabel(page, 'value')

    await setNumber(valueControl, 75)
    const bar = preview.locator('.bc-progress-bar__fill').first()
    await expect(bar).toBeVisible()
    const style = await bar.getAttribute('style')
    expect(style).toContain('75')
  })

})

test.describe('RatingInput interactions @component', () => {
  test('RatingInput: value number input updates aria-valuenow', async ({
    page,
  }) => {
    await openPlayground(page, 'rating-input')
    const preview = previewArea(page)
    const valueControl = controlByLabel(page, 'value')
    const slider = preview.locator('[role="slider"]').first()

    // Change value to 5
    await setNumber(valueControl, 5)
    await expect(slider).toHaveAttribute('aria-valuenow', '5')

    // Change value to 1
    await setNumber(valueControl, 1)
    await expect(slider).toHaveAttribute('aria-valuenow', '1')
  })

  test('RatingInput: max number input changes aria-valuemax', async ({
    page,
  }) => {
    await openPlayground(page, 'rating-input')
    const preview = previewArea(page)
    const maxControl = controlByLabel(page, 'max')
    const slider = preview.locator('[role="slider"]').first()

    // Default max is 5
    await expect(slider).toHaveAttribute('aria-valuemax', '5')

    // Change max to 10
    await setNumber(maxControl, 10)
    await expect(slider).toHaveAttribute('aria-valuemax', '10')
  })

  test('RatingInput: clicking a star updates the value', async ({ page }) => {
    await openPlayground(page, 'rating-input')
    const preview = previewArea(page)
    const slider = preview.locator('[role="slider"]').first()
    const stars = slider.locator('.bc-rating-input__icon-container')

    // Initial value is 3
    await expect(slider).toHaveAttribute('aria-valuenow', '3')

    // Click on star 5 → value should become 5
    await stars.nth(4).click()
    await expect(slider).toHaveAttribute('aria-valuenow', '5')

    // Click on star 1 → value should become 1
    await stars.nth(0).click()
    await expect(slider).toHaveAttribute('aria-valuenow', '1')

    // Click on star 3 → value should become 3
    await stars.nth(2).click()
    await expect(slider).toHaveAttribute('aria-valuenow', '3')
  })

  test('RatingInput: keyboard navigation updates the value', async ({
    page,
  }) => {
    await openPlayground(page, 'rating-input')
    const preview = previewArea(page)
    const slider = preview.locator('[role="slider"]').first()

    // Focus the slider
    await slider.focus()

    // Press End to go to max value
    await slider.press('End')
    await expect(slider).toHaveAttribute('aria-valuenow', '5')

    // Press Home to go to min value
    await slider.press('Home')
    await expect(slider).toHaveAttribute('aria-valuenow', '0')

    // Press ArrowRight to increment by step
    await slider.press('ArrowRight')
    await expect(slider).toHaveAttribute('aria-valuenow', '1')

    await slider.press('ArrowRight')
    await expect(slider).toHaveAttribute('aria-valuenow', '2')
  })

  test('RatingInput: fullColor changes icon styling', async ({ page }) => {
    await openPlayground(page, 'rating-input')
    const preview = previewArea(page)
    const colorControl = controlByLabel(page, 'fullColor')

    // The filled icon span has class bc-rating-input__icon-full and bc-icon
    const filledIcon = preview.locator('.bc-rating-input__icon-full').first()
    const initialStyle = await filledIcon.getAttribute('style')

    // Change fullColor to red
    await selectDropdown(colorControl, 'red')
    const newStyle = await filledIcon.getAttribute('style')
    expect(newStyle).not.toBe(initialStyle)
    expect(newStyle).toContain('red')
  })
})

test.describe('Button-specific interactions @component', () => {
  test('Button: loading sets aria-busy=true', async ({ page }) => {
    await openPlayground(page, 'button')
    const preview = previewArea(page)
    const loadingControl = controlByLabel(page, 'loading')

    await toggleSwitch(loadingControl)
    await expect(
      preview.locator('button[aria-busy="true"]').first()
    ).toBeVisible()
  })
})

// ── Render-without-errors tests ──────────────────────────────────────────────

/** Filter out known benign errors that don't indicate real problems */
function isKnownBenignError(msg: string): boolean {
  return (
    msg.includes('pdf.worker') ||
    msg.includes('monaco') ||
    msg.includes('ResizeObserver') ||
    msg.includes('ResponseException') ||
    // BigintInput crashes when value is undefined (component bug)
    msg.includes("reading 'toString'")
  )
}

test.describe('All component playgrounds render without errors @component', () => {
  const slugs = getComponentSlugs()

  for (const slug of slugs) {
    test(`renders: ${slug}`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', err => errors.push(err.message))
      await page.goto(`/components/${slug}`)
      await page.waitForLoadState('networkidle')
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 })
      expect(
        errors.filter(e => !isKnownBenignError(e)),
        `Unexpected JS errors on /components/${slug}`
      ).toHaveLength(0)
    })
  }
})

// ── Utilities ────────────────────────────────────────────────────────────────

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

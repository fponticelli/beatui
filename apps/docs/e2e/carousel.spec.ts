import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Carousel component e2e tests @component
 *
 * Tests for carousel transitions (slide/fade), navigation, and indicator switching.
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

async function openCarousel(page: Page) {
  await page.goto('/components/carousel')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('.bc-carousel').first()).toBeVisible({
    timeout: 10_000,
  })
}

function optionsPanel(page: Page): Locator {
  return page.locator('.lg\\:w-72').first()
}

function previewArea(page: Page): Locator {
  return page.locator('.min-w-48.min-h-16').first()
}

function controlByLabel(page: Page, label: string): Locator {
  const panel = optionsPanel(page)
  return panel.locator('.bc-input-wrapper').filter({
    has: page.locator('.bc-input-wrapper__label-text', { hasText: label }),
  })
}

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

function playgroundCarousel(page: Page): Locator {
  return previewArea(page).locator('.bc-carousel').first()
}

// ── Tests ────────────────────────────────────────────────────────────────────

test.describe('Carousel @component', () => {
  test.beforeEach(async ({ page }) => {
    await openCarousel(page)
  })

  test.describe('slide transition', () => {
    test('should show slide content and have non-zero dimensions', async ({
      page,
    }) => {
      const carousel = playgroundCarousel(page)
      const activeSlide = carousel.locator('.bc-carousel__slide--active')
      await expect(activeSlide).toBeVisible()
      const box = await activeSlide.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.width).toBeGreaterThan(50)
      expect(box!.height).toBeGreaterThan(50)
    })

    test('should navigate forward and show next slide', async ({ page }) => {
      const carousel = playgroundCarousel(page)
      const nextBtn = carousel.locator('.bc-carousel__arrow--next')
      await nextBtn.click()

      const slides = carousel.locator('.bc-carousel__slide')
      await expect(slides.nth(1)).toHaveClass(/bc-carousel__slide--active/)
      await expect(slides.nth(0)).not.toHaveClass(/bc-carousel__slide--active/)
    })
  })

  test.describe('fade transition', () => {
    test('should show active slide with visible dimensions when starting in fade', async ({
      page,
    }) => {
      // Switch to fade
      const transitionControl = controlByLabel(page, 'transition')
      await selectDropdown(transitionControl, 'fade')

      const carousel = playgroundCarousel(page)
      await expect(carousel).toHaveClass(/bc-carousel--fade/)

      // Active slide should be visible with real dimensions
      const activeSlide = carousel.locator('.bc-carousel__slide--active')
      await expect(activeSlide).toBeVisible()
      const box = await activeSlide.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.width).toBeGreaterThan(50)
      expect(box!.height).toBeGreaterThan(50)
    })

    test('should hide non-active slides in fade mode', async ({ page }) => {
      const transitionControl = controlByLabel(page, 'transition')
      await selectDropdown(transitionControl, 'fade')

      const carousel = playgroundCarousel(page)
      const slides = carousel.locator('.bc-carousel__slide')
      const count = await slides.count()

      // Active slide should have opacity 1 and full width
      const activeSlide = slides.nth(0)
      await expect(activeSlide).toHaveClass(/bc-carousel__slide--active/)
      await expect(activeSlide).toHaveCSS('opacity', '1')
      await expect(activeSlide).toHaveCSS('min-width', /[1-9]/)

      // Inactive slides should have opacity 0 and be collapsed
      for (let i = 1; i < count; i++) {
        await expect(slides.nth(i)).not.toHaveClass(
          /bc-carousel__slide--active/
        )
        await expect(slides.nth(i)).toHaveCSS('opacity', '0')
      }
    })

    test('should navigate forward in fade mode and show next slide', async ({
      page,
    }) => {
      const transitionControl = controlByLabel(page, 'transition')
      await selectDropdown(transitionControl, 'fade')

      const carousel = playgroundCarousel(page)
      const nextBtn = carousel.locator('.bc-carousel__arrow--next')
      await nextBtn.click()

      // Wait for fade transition
      await page.waitForTimeout(500)

      const slides = carousel.locator('.bc-carousel__slide')
      await expect(slides.nth(1)).toHaveClass(/bc-carousel__slide--active/)
      await expect(slides.nth(0)).not.toHaveClass(/bc-carousel__slide--active/)

      // New active slide should be visible with real dimensions
      const activeSlide = carousel.locator('.bc-carousel__slide--active')
      await expect(activeSlide).toBeVisible()
      const box = await activeSlide.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.width).toBeGreaterThan(50)
      expect(box!.height).toBeGreaterThan(50)
    })

    test('should navigate backward in fade mode', async ({ page }) => {
      const transitionControl = controlByLabel(page, 'transition')
      await selectDropdown(transitionControl, 'fade')

      const carousel = playgroundCarousel(page)
      // Go forward first then backward
      await carousel.locator('.bc-carousel__arrow--next').click()
      await page.waitForTimeout(500)
      await carousel.locator('.bc-carousel__arrow--prev').click()
      await page.waitForTimeout(500)

      const slides = carousel.locator('.bc-carousel__slide')
      await expect(slides.nth(0)).toHaveClass(/bc-carousel__slide--active/)
      const activeSlide = carousel.locator('.bc-carousel__slide--active')
      await expect(activeSlide).toBeVisible()
    })
  })

  test.describe('switching between transitions', () => {
    test('should preserve visibility when switching from slide to fade', async ({
      page,
    }) => {
      const carousel = playgroundCarousel(page)

      // Start in slide mode, verify visible
      const slideBox = await carousel
        .locator('.bc-carousel__slide--active')
        .boundingBox()
      expect(slideBox).not.toBeNull()
      expect(slideBox!.height).toBeGreaterThan(50)

      // Switch to fade
      const transitionControl = controlByLabel(page, 'transition')
      await selectDropdown(transitionControl, 'fade')
      await page.waitForTimeout(300)

      // Should still be visible with real dimensions
      await expect(carousel).toHaveClass(/bc-carousel--fade/)
      const activeSlide = carousel.locator('.bc-carousel__slide--active')
      await expect(activeSlide).toBeVisible()
      const fadeBox = await activeSlide.boundingBox()
      expect(fadeBox).not.toBeNull()
      expect(fadeBox!.height).toBeGreaterThan(50)
    })

    test('should preserve visibility when switching from fade to slide', async ({
      page,
    }) => {
      const transitionControl = controlByLabel(page, 'transition')

      // Switch to fade first
      await selectDropdown(transitionControl, 'fade')
      await page.waitForTimeout(300)

      // Switch back to slide
      await selectDropdown(transitionControl, 'slide')
      await page.waitForTimeout(300)

      const carousel = playgroundCarousel(page)
      await expect(carousel).toHaveClass(/bc-carousel--slide/)
      const activeSlide = carousel.locator('.bc-carousel__slide--active')
      await expect(activeSlide).toBeVisible()
      const box = await activeSlide.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.height).toBeGreaterThan(50)
    })

    test('should navigate correctly after switching from slide to fade', async ({
      page,
    }) => {
      // Navigate forward in slide mode
      const carousel = playgroundCarousel(page)
      await carousel.locator('.bc-carousel__arrow--next').click()

      // Switch to fade
      const transitionControl = controlByLabel(page, 'transition')
      await selectDropdown(transitionControl, 'fade')
      await page.waitForTimeout(300)

      // Navigate forward in fade mode
      await carousel.locator('.bc-carousel__arrow--next').click()
      await page.waitForTimeout(500)

      const slides = carousel.locator('.bc-carousel__slide')
      await expect(slides.nth(2)).toHaveClass(/bc-carousel__slide--active/)
      const activeSlide = carousel.locator('.bc-carousel__slide--active')
      await expect(activeSlide).toBeVisible()
    })
  })

  test.describe('carousel dimensions', () => {
    test('slide and fade active slides should have matching width', async ({
      page,
    }) => {
      const carousel = playgroundCarousel(page)

      // Measure active slide width in slide mode
      const slideActive = carousel.locator('.bc-carousel__slide--active')
      const slideBox = await slideActive.boundingBox()
      expect(slideBox).not.toBeNull()
      const slideWidth = slideBox!.width

      // Switch to fade
      const transitionControl = controlByLabel(page, 'transition')
      await selectDropdown(transitionControl, 'fade')
      await page.waitForTimeout(300)

      // Measure active slide width in fade mode
      const fadeActive = carousel.locator('.bc-carousel__slide--active')
      const fadeBox = await fadeActive.boundingBox()
      expect(fadeBox).not.toBeNull()
      const fadeWidth = fadeBox!.width

      // Widths should match within 2px tolerance
      expect(Math.abs(fadeWidth - slideWidth)).toBeLessThan(2)
    })

    test('carousel container should have same width in both modes', async ({
      page,
    }) => {
      const carousel = playgroundCarousel(page)

      const slideBox = await carousel.boundingBox()
      expect(slideBox).not.toBeNull()

      const transitionControl = controlByLabel(page, 'transition')
      await selectDropdown(transitionControl, 'fade')
      await page.waitForTimeout(300)

      const fadeBox = await carousel.boundingBox()
      expect(fadeBox).not.toBeNull()

      expect(Math.abs(fadeBox!.width - slideBox!.width)).toBeLessThan(2)
    })
  })
})

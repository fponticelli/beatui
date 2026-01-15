import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Lightbox component documentation page
 */
export class LightboxPage extends BasePage {
  readonly openButtons: Locator
  readonly lightboxes: Locator
  readonly closeButtons: Locator
  readonly overlays: Locator
  readonly overlayEffectSelector: Locator
  readonly paddingSelector: Locator
  readonly dismissableSwitch: Locator
  readonly showCloseButtonSwitch: Locator
  readonly lightboxImages: Locator
  readonly lightboxVideos: Locator

  constructor(page: Page) {
    super(page, '/lightbox')
    this.openButtons = page.locator(
      'button:has-text("Open"), button:has-text("Lightbox")'
    )
    this.lightboxes = page.locator('.bc-lightbox')
    this.closeButtons = page.locator('.bc-lightbox .bc-lightbox__close, .bc-lightbox button:has-text("Close")')
    this.overlays = page.locator('.bc-lightbox-overlay, [data-lightbox-overlay]')
    this.overlayEffectSelector = page.locator('.bc-segmented-input').first()
    this.paddingSelector = page.locator('.bc-segmented-input').nth(1)
    this.dismissableSwitch = page.locator('.bc-switch').first()
    this.showCloseButtonSwitch = page.locator('.bc-switch').nth(1)
    this.lightboxImages = page.locator('.bc-lightbox img')
    this.lightboxVideos = page.locator('.bc-lightbox video')
  }

  async getOpenButtonCount(): Promise<number> {
    return this.openButtons.count()
  }

  async openImageLightbox(): Promise<void> {
    await this.page.locator('button:has-text("Open Image Lightbox")').click()
  }

  async openContentLightbox(): Promise<void> {
    await this.page.locator('button:has-text("Open Content Lightbox")').click()
  }

  async openVideoLightbox(): Promise<void> {
    await this.page.locator('button:has-text("Open Video Lightbox")').click()
  }

  async isLightboxVisible(): Promise<boolean> {
    const count = await this.lightboxes.count()
    if (count === 0) return false
    return this.lightboxes.first().isVisible()
  }

  async closeLightbox(): Promise<void> {
    if ((await this.closeButtons.count()) > 0) {
      await this.closeButtons.first().click()
    }
  }

  async closeByOverlayClick(): Promise<void> {
    if ((await this.overlays.count()) > 0) {
      await this.overlays.first().click({ position: { x: 10, y: 10 } })
    }
  }

  async closeByEscape(): Promise<void> {
    await this.page.keyboard.press('Escape')
  }

  async isImageVisible(): Promise<boolean> {
    const count = await this.lightboxImages.count()
    if (count === 0) return false
    return this.lightboxImages.first().isVisible()
  }

  async isVideoVisible(): Promise<boolean> {
    const count = await this.lightboxVideos.count()
    if (count === 0) return false
    return this.lightboxVideos.first().isVisible()
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('lightbox'),
    })
  }
}

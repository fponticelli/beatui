import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Notification component documentation page
 */
export class NotificationPage extends BasePage {
  readonly notifications: Locator
  readonly liveNotification: Locator
  readonly galleryNotifications: Locator
  readonly colorSelector: Locator
  readonly radiusSelector: Locator
  readonly showIconSwitch: Locator
  readonly iconInput: Locator
  readonly titleInput: Locator
  readonly messageInput: Locator
  readonly withBorderSwitch: Locator
  readonly closeButtonSwitch: Locator
  readonly titleVisibleSwitch: Locator
  readonly loadingSwitch: Locator
  readonly closeButtons: Locator

  constructor(page: Page) {
    super(page, '/notification')
    this.notifications = page.locator('.bc-notification')
    this.liveNotification = page.locator('section').filter({ hasText: 'Live Notification' }).locator('.bc-notification')
    this.galleryNotifications = page.locator('section').filter({ hasText: 'Gallery' }).locator('.bc-notification')
    this.colorSelector = page.locator('header .bc-segmented-control').first()
    this.radiusSelector = page.locator('header .bc-segmented-control').nth(1)
    this.showIconSwitch = page.locator('header .bc-switch').first()
    this.iconInput = page.locator('header input').first()
    this.titleInput = page.locator('header input').nth(1)
    this.messageInput = page.locator('header input').nth(2)
    this.withBorderSwitch = page.locator('header .bc-switch').nth(1)
    this.closeButtonSwitch = page.locator('header .bc-switch').nth(2)
    this.titleVisibleSwitch = page.locator('header .bc-switch').nth(3)
    this.loadingSwitch = page.locator('header .bc-switch').nth(4)
    this.closeButtons = page.locator('.bc-notification button')
  }

  async getAllNotifications(): Promise<Locator[]> {
    const count = await this.notifications.count()
    return Array.from({ length: count }, (_, i) => this.notifications.nth(i))
  }

  async getNotificationCount(): Promise<number> {
    return this.notifications.count()
  }

  async getGalleryNotificationCount(): Promise<number> {
    return this.galleryNotifications.count()
  }

  async toggleShowIcon(): Promise<void> {
    await this.showIconSwitch.click()
  }

  async toggleWithBorder(): Promise<void> {
    await this.withBorderSwitch.click()
  }

  async toggleCloseButton(): Promise<void> {
    await this.closeButtonSwitch.click()
  }

  async toggleTitleVisible(): Promise<void> {
    await this.titleVisibleSwitch.click()
  }

  async toggleLoading(): Promise<void> {
    await this.loadingSwitch.click()
  }

  async setIcon(iconName: string): Promise<void> {
    await this.iconInput.fill(iconName)
  }

  async setTitle(title: string): Promise<void> {
    await this.titleInput.fill(title)
  }

  async setMessage(message: string): Promise<void> {
    await this.messageInput.fill(message)
  }

  async clickCloseButton(index: number = 0): Promise<void> {
    await this.closeButtons.nth(index).click()
  }

  async getNotificationTitle(index: number): Promise<string | null> {
    const notification = this.notifications.nth(index)
    const title = notification.locator('.bc-notification__title')
    return title.textContent()
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('notification'),
    })
  }
}

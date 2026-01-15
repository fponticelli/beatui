import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the NotificationService component documentation page
 */
export class NotificationServicePage extends BasePage {
  readonly showButton: Locator
  readonly showAsyncButton: Locator
  readonly showPersistentButton: Locator
  readonly clearAllButton: Locator
  readonly notifications: Locator
  readonly notificationCloseButtons: Locator
  readonly titleInput: Locator
  readonly messageInput: Locator
  readonly colorSelector: Locator
  readonly dismissAfterInput: Locator
  readonly animationSelector: Locator
  readonly loaderSwitch: Locator
  readonly borderSwitch: Locator
  readonly closeButtonSwitch: Locator
  readonly activeNotificationsCount: Locator

  constructor(page: Page) {
    super(page, '/notification-service')
    this.showButton = page.locator('button:has-text("Show")').first()
    this.showAsyncButton = page.locator('button:has-text("Show async notification")')
    this.showPersistentButton = page.locator('button:has-text("Show persistent notification")')
    this.clearAllButton = page.locator('button:has-text("Clear all")')
    this.notifications = page.locator('.bc-notification')
    this.notificationCloseButtons = page.locator('.bc-notification .bc-notification__close, .bc-notification button:has-text("Close")')
    this.titleInput = page.locator('input[type="text"]').first()
    this.messageInput = page.locator('input[type="text"]').nth(1)
    this.colorSelector = page.locator('.bc-color-selector, [data-color-selector]')
    this.dismissAfterInput = page.locator('input[type="number"]')
    this.animationSelector = page.locator('select')
    this.loaderSwitch = page.locator('.bc-switch').first()
    this.borderSwitch = page.locator('.bc-switch').nth(1)
    this.closeButtonSwitch = page.locator('.bc-switch').nth(2)
    this.activeNotificationsCount = page.locator('p.text-sm')
  }

  async showNotification(): Promise<void> {
    await this.showButton.click()
  }

  async showAsyncNotification(): Promise<void> {
    await this.showAsyncButton.click()
  }

  async showPersistentNotification(): Promise<void> {
    await this.showPersistentButton.click()
  }

  async clearAllNotifications(): Promise<void> {
    await this.clearAllButton.click()
  }

  async getNotificationCount(): Promise<number> {
    return this.notifications.count()
  }

  async isNotificationVisible(): Promise<boolean> {
    const count = await this.notifications.count()
    if (count === 0) return false
    return this.notifications.first().isVisible()
  }

  async closeFirstNotification(): Promise<void> {
    if ((await this.notificationCloseButtons.count()) > 0) {
      await this.notificationCloseButtons.first().click()
    }
  }

  async setTitle(title: string): Promise<void> {
    await this.titleInput.fill(title)
  }

  async setMessage(message: string): Promise<void> {
    await this.messageInput.fill(message)
  }

  async setDismissAfter(seconds: number): Promise<void> {
    await this.dismissAfterInput.fill(String(seconds))
  }

  async waitForNotificationDismiss(timeout = 5000): Promise<void> {
    await this.notifications.first().waitFor({ state: 'hidden', timeout })
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('notification-service'),
    })
  }
}

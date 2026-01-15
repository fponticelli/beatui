import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Authentication page
 */
export class AuthenticationPage extends BasePage {
  readonly authContainer: Locator
  readonly demoMessage: Locator
  readonly outcomeSelector: Locator
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly signInButton: Locator
  readonly signUpButton: Locator
  readonly forgotPasswordLink: Locator
  readonly socialButtons: Locator
  readonly googleButton: Locator
  readonly githubButton: Locator
  readonly openModalButton: Locator
  readonly authModal: Locator

  constructor(page: Page) {
    super(page, '/authentication')
    this.authContainer = page.locator('.bc-auth-container, [data-auth-container]')
    this.demoMessage = page.locator('.bg-green-100, [class*="bg-green"]')
    this.outcomeSelector = page.locator('.bc-segmented-input, [role="radiogroup"]')
    this.emailInput = page.locator('input[type="email"], input[name="email"]')
    this.passwordInput = page.locator('input[type="password"], input[name="password"]')
    this.signInButton = page.locator('button[type="submit"]:has-text("Sign In"), button:has-text("Sign In")')
    this.signUpButton = page.locator('button:has-text("Sign Up"), a:has-text("Sign Up")')
    this.forgotPasswordLink = page.locator('a:has-text("Forgot"), button:has-text("Forgot")')
    this.socialButtons = page.locator('.bc-social-button, button[class*="social"]')
    this.googleButton = page.locator('button:has-text("Google")')
    this.githubButton = page.locator('button:has-text("GitHub")')
    this.openModalButton = page.locator('button:has-text("Open Authentication Modal")')
    this.authModal = page.locator('[role="dialog"], .bc-modal')
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.first().fill(email)
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.first().fill(password)
  }

  async submitSignIn(): Promise<void> {
    await this.signInButton.first().click()
  }

  async clickSignUp(): Promise<void> {
    await this.signUpButton.first().click()
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.first().click()
  }

  async getSocialButtonCount(): Promise<number> {
    return this.socialButtons.count()
  }

  async openAuthModal(): Promise<void> {
    await this.openModalButton.click()
  }

  async isModalVisible(): Promise<boolean> {
    const count = await this.authModal.count()
    if (count === 0) return false
    return this.authModal.first().isVisible()
  }

  async selectOutcome(outcome: 'invalid_credentials' | 'success'): Promise<void> {
    const button = this.page.locator(`button:has-text("${outcome === 'invalid_credentials' ? 'Invalid Credentials' : 'Success'}")`)
    await button.click()
  }

  async isDemoMessageVisible(): Promise<boolean> {
    const count = await this.demoMessage.count()
    if (count === 0) return false
    return this.demoMessage.first().isVisible()
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('authentication'),
    })
  }
}

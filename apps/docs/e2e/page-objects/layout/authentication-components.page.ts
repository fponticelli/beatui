import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Authentication Components page
 */
export class AuthenticationComponentsPage extends BasePage {
  readonly authContainer: Locator
  readonly demoMessage: Locator
  readonly modeSelector: Locator
  readonly socialLoginSwitch: Locator
  readonly rememberMeSwitch: Locator
  readonly passwordStrengthSwitch: Locator
  readonly signInForm: Locator
  readonly signUpForm: Locator
  readonly resetPasswordForm: Locator
  readonly socialLoginButtons: Locator
  readonly providerSelector: Locator
  readonly passwordInput: Locator
  readonly passwordStrengthIndicator: Locator
  readonly allProviderButtons: Locator

  constructor(page: Page) {
    super(page, '/authentication-components')
    this.authContainer = page.locator('.bc-auth-container, [data-auth-container]')
    this.demoMessage = page.locator('.bg-cyan-200, [class*="bg-cyan"]')
    this.modeSelector = page.locator('.bc-segmented-input, [role="radiogroup"]').first()
    this.socialLoginSwitch = page.locator('label:has-text("Social Login") .bc-switch')
    this.rememberMeSwitch = page.locator('label:has-text("Remember Me") .bc-switch')
    this.passwordStrengthSwitch = page.locator('label:has-text("Password Strength") .bc-switch')
    this.signInForm = page.locator('h4:has-text("SignInForm")').locator('..').locator('form, .bc-form')
    this.signUpForm = page.locator('h4:has-text("SignUpForm")').locator('..').locator('form, .bc-form')
    this.resetPasswordForm = page.locator('h4:has-text("ResetPasswordForm")').locator('..').locator('form, .bc-form')
    this.socialLoginButtons = page.locator('.bc-social-button, button[class*="social"]')
    this.providerSelector = page.locator('label:has-text("Provider")').locator('..').locator('select, .bc-segmented-input')
    this.passwordInput = page.locator('input[type="password"]')
    this.passwordStrengthIndicator = page.locator('.bc-password-strength, [data-password-strength]')
    this.allProviderButtons = page.locator('h4:has-text("All Providers")').locator('..').locator('button')
  }

  async isDemoMessageVisible(): Promise<boolean> {
    const count = await this.demoMessage.count()
    if (count === 0) return false
    return this.demoMessage.first().isVisible()
  }

  async getSocialButtonCount(): Promise<number> {
    return this.socialLoginButtons.count()
  }

  async getAllProviderButtonCount(): Promise<number> {
    return this.allProviderButtons.count()
  }

  async getPasswordInputCount(): Promise<number> {
    return this.passwordInput.count()
  }

  async fillTestPassword(password: string): Promise<void> {
    await this.passwordInput.last().fill(password)
  }

  async isPasswordStrengthVisible(): Promise<boolean> {
    const count = await this.passwordStrengthIndicator.count()
    if (count === 0) return false
    return this.passwordStrengthIndicator.first().isVisible()
  }

  async clickProviderButton(providerName: string): Promise<void> {
    const button = this.page.locator(`button:has-text("${providerName}")`)
    await button.first().click()
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('authentication-components'),
    })
  }
}

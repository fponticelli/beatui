import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Switch component documentation page
 */
export class SwitchPage extends BasePage {
  readonly switches: Locator
  readonly table: Locator
  readonly headerSwitch: Locator
  readonly labelInput: Locator
  readonly onLabelInput: Locator
  readonly offLabelInput: Locator

  constructor(page: Page) {
    super(page, '/switch')
    this.switches = page.locator('.bc-switch')
    this.table = page.locator('table')
    this.headerSwitch = page.locator('header .bc-switch').first()
    this.labelInput = page.locator('header input').first()
    this.onLabelInput = page.locator('header input').nth(1)
    this.offLabelInput = page.locator('header input').nth(2)
  }

  async getAllSwitches(): Promise<Locator[]> {
    const count = await this.switches.count()
    return Array.from({ length: count }, (_, i) => this.switches.nth(i))
  }

  async getSwitchCount(): Promise<number> {
    return this.switches.count()
  }

  async toggleHeaderSwitch(): Promise<void> {
    await this.headerSwitch.click()
  }

  async clickSwitch(index: number): Promise<void> {
    await this.switches.nth(index).click()
  }

  async isSwitchChecked(index: number): Promise<boolean> {
    const switchElement = this.switches.nth(index)
    const checkbox = switchElement.locator('input[type="checkbox"]')
    return checkbox.isChecked()
  }

  async setLabel(label: string): Promise<void> {
    await this.labelInput.fill(label)
  }

  async setOnLabel(label: string): Promise<void> {
    await this.onLabelInput.fill(label)
  }

  async setOffLabel(label: string): Promise<void> {
    await this.offLabelInput.fill(label)
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('switch'),
    })
  }
}

import type { Page, Locator } from '@playwright/test'
import { BasePage } from '../base.page'
import { getExclusionsForComponent } from '../../fixtures/a11y-exclusions'

/**
 * Page object for the Sidebar component documentation page
 */
export class SidebarPage extends BasePage {
  readonly sidebars: Locator
  readonly sidebarLinks: Locator
  readonly sidebarGroups: Locator
  readonly collapsibleGroups: Locator
  readonly activeLinks: Locator
  readonly linkActions: Locator

  constructor(page: Page) {
    super(page, '/sidebar')
    this.sidebars = page.locator('.bc-sidebar, [data-sidebar]')
    this.sidebarLinks = page.locator('.bc-sidebar-link, [data-sidebar-link]')
    this.sidebarGroups = page.locator('.bc-sidebar-group, [data-sidebar-group]')
    this.collapsibleGroups = page.locator('.bc-collapsible-sidebar-group, [data-collapsible-group]')
    this.activeLinks = page.locator('.bc-sidebar-link[data-active="true"], .bc-sidebar-link.active')
    this.linkActions = page.locator('.bc-sidebar-link-action, [data-sidebar-action]')
  }

  async getSidebarCount(): Promise<number> {
    return this.sidebars.count()
  }

  async getSidebarLinkCount(): Promise<number> {
    return this.sidebarLinks.count()
  }

  async clickSidebarLink(index: number): Promise<void> {
    await this.sidebarLinks.nth(index).click()
  }

  async getActiveLinkCount(): Promise<number> {
    return this.activeLinks.count()
  }

  async isGroupExpanded(index: number): Promise<boolean> {
    const group = this.collapsibleGroups.nth(index)
    if (await group.count() === 0) return false
    const expanded = await group.getAttribute('data-expanded')
    return expanded === 'true'
  }

  async toggleCollapsibleGroup(index: number): Promise<void> {
    const group = this.collapsibleGroups.nth(index)
    if (await group.count() > 0) {
      const header = group.locator('.bc-collapsible-header, [data-collapsible-header]')
      await header.click()
    }
  }

  async getCollapsibleGroupCount(): Promise<number> {
    return this.collapsibleGroups.count()
  }

  async checkComponentAccessibility() {
    return this.checkAccessibility({
      exclude: getExclusionsForComponent('sidebar'),
    })
  }
}

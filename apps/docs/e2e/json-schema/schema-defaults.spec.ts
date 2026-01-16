import { test, expect } from '@playwright/test'
import { JSONSchemaFormPage } from '../page-objects/json-schema/json-schema-form.page'
import { JSONStructureFormPage } from '../page-objects/json-schema/json-structure-form.page'

/**
 * E2E tests for the applySchemaDefaults feature
 *
 * These tests verify that form values are automatically populated
 * from schema `default` properties (with `examples[0]` as fallback).
 */
test.describe('Schema Defaults Feature @smoke', () => {
  test.describe('JSON Schema Form', () => {
    let formPage: JSONSchemaFormPage

    test.beforeEach(async ({ page }) => {
      formPage = new JSONSchemaFormPage(page)
      await formPage.navigateTo()
      await formPage.waitForReady()
    })

    test('should auto-populate form with schema defaults', async () => {
      // Select the schema-defaults-demo sample
      await formPage.selectSample('schema-defaults-demo')

      // Wait for form to update
      await formPage.page.waitForTimeout(500)

      // Get the form data from the preview
      const data = (await formPage.getDataPreviewAsJson()) as Record<
        string,
        unknown
      >

      // Verify defaults are applied
      expect(data).toBeTruthy()

      // String with default
      expect(data.username).toBe('guest_user')

      // String with examples fallback
      expect(data.nickname).toBe('CoolUser123')

      // Boolean with default
      expect(data.subscribeNewsletter).toBe(true)

      // Enum with default
      expect(data.theme).toBe('system')

      // Number with default
      expect(data.age).toBe(25)

      // Nested object defaults
      const settings = data.settings as Record<string, unknown>
      expect(settings).toBeTruthy()
      expect(settings.language).toBe('en')
      expect(settings.timezone).toBe('UTC')

      // Deeply nested defaults
      const notifications = settings.notifications as Record<string, unknown>
      expect(notifications).toBeTruthy()
      expect(notifications.email).toBe(true)
      expect(notifications.push).toBe(false)
      expect(notifications.frequency).toBe('daily')

      // Arrays should NOT be auto-populated
      expect(data.tags).toBeUndefined()

      // Fields without default or examples should be undefined
      expect(data.bio).toBeUndefined()
    })

    test('should reset data when clicking Reset', async () => {
      // Select the schema-defaults-demo sample
      await formPage.selectSample('schema-defaults-demo')
      await formPage.page.waitForTimeout(500)

      // Get initial data with defaults applied
      const initialData = (await formPage.getDataPreviewAsJson()) as Record<
        string,
        unknown
      >
      expect(initialData.username).toBe('guest_user')

      // Click reset - this clears the data
      await formPage.clickReset()
      await formPage.page.waitForTimeout(500)

      // After reset, data should be empty (form will re-apply defaults on re-mount)
      const resetData = (await formPage.getDataPreviewAsJson()) as Record<
        string,
        unknown
      >
      // Reset clears to empty object in the docs page implementation
      expect(resetData).toEqual({})
    })
  })

  test.describe('JSON Structure Form', () => {
    let formPage: JSONStructureFormPage

    test.beforeEach(async ({ page }) => {
      formPage = new JSONStructureFormPage(page)
      await formPage.navigateTo()
      await formPage.waitForReady()
    })

    test('should auto-populate form with schema defaults', async () => {
      // Select the defaults-demo sample
      await formPage.selectSample('defaults-demo')

      // Wait for form to update
      await formPage.page.waitForTimeout(500)

      // Get the form data from the preview
      const data = (await formPage.getDataPreviewAsJson()) as Record<
        string,
        unknown
      >

      // Verify defaults are applied
      expect(data).toBeTruthy()

      // String with default
      expect(data.username).toBe('guest_user')

      // String with examples fallback
      expect(data.nickname).toBe('CoolUser123')

      // Boolean with default
      expect(data.subscribeNewsletter).toBe(true)

      // Enum with default
      expect(data.theme).toBe('system')

      // Number with default
      expect(data.age).toBe(25)

      // Nested object defaults
      const settings = data.settings as Record<string, unknown>
      expect(settings).toBeTruthy()
      expect(settings.language).toBe('en')
      expect(settings.timezone).toBe('UTC')

      // Deeply nested defaults
      const notifications = settings.notifications as Record<string, unknown>
      expect(notifications).toBeTruthy()
      expect(notifications.email).toBe(true)
      expect(notifications.push).toBe(false)

      // Arrays should NOT be auto-populated
      expect(data.tags).toBeUndefined()

      // Fields without default or examples should be undefined
      expect(data.bio).toBeUndefined()
    })

    test('should reset data when clicking Reset', async () => {
      // Select the defaults-demo sample
      await formPage.selectSample('defaults-demo')
      await formPage.page.waitForTimeout(500)

      // Get initial data with defaults applied
      const initialData = (await formPage.getDataPreviewAsJson()) as Record<
        string,
        unknown
      >
      expect(initialData.username).toBe('guest_user')

      // Click reset - this clears the data
      await formPage.clickReset()
      await formPage.page.waitForTimeout(500)

      // After reset, data should be empty (form will re-apply defaults on re-mount)
      const resetData = (await formPage.getDataPreviewAsJson()) as Record<
        string,
        unknown
      >
      // Reset clears to empty object in the docs page implementation
      expect(resetData).toEqual({})
    })
  })
})

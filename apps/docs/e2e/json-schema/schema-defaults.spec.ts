import { test, expect } from '@playwright/test'
import { JSONSchemaFormPage } from '../page-objects/json-schema/json-schema-form.page'
import { JSONStructureFormPage } from '../page-objects/json-schema/json-structure-form.page'

/**
 * E2E tests for the applySchemaDefaults feature
 *
 * These tests verify that form values are automatically populated
 * from schema `default` properties for required fields.
 * The implementation only populates required properties with defaults;
 * non-required properties are left empty for the user to fill in.
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

      // Wait for form to initialize with defaults (AJV compilation + render)
      await formPage.page.waitForFunction(
        () => {
          const pres = document.querySelectorAll('pre')
          const pre = pres[pres.length - 1]
          if (!pre?.textContent) return false
          try {
            const data = JSON.parse(pre.textContent)
            return data.username !== undefined
          } catch {
            return false
          }
        },
        { timeout: 10000 }
      )

      // Get the form data from the preview
      const data = (await formPage.getDataPreviewAsJson()) as Record<
        string,
        unknown
      >

      // Verify defaults are applied for required properties
      expect(data).toBeTruthy()

      // String with default (required property)
      expect(data.username).toBe('guest_user')

      // Non-required properties are not auto-populated by extractSchemaDefaults
      // (it only generates defaults for required properties)
      // Arrays should NOT be auto-populated
      expect(data.tags).toBeUndefined()

      // Fields without default or examples should be undefined
      expect(data.bio).toBeUndefined()
    })

    test('should reset data when clicking Reset', async () => {
      // Select the schema-defaults-demo sample
      await formPage.selectSample('schema-defaults-demo')

      // Wait for defaults to be applied
      await formPage.page.waitForFunction(
        () => {
          const pres = document.querySelectorAll('pre')
          const pre = pres[pres.length - 1]
          if (!pre?.textContent) return false
          try {
            const data = JSON.parse(pre.textContent)
            return data.username !== undefined
          } catch {
            return false
          }
        },
        { timeout: 10000 }
      )

      // Get initial data with defaults applied
      const initialData = (await formPage.getDataPreviewAsJson()) as Record<
        string,
        unknown
      >
      expect(initialData.username).toBe('guest_user')

      // Click reset - this clears the data
      await formPage.clickReset()

      // Wait for data to be cleared
      await formPage.page.waitForFunction(
        () => {
          const pres = document.querySelectorAll('pre')
          const pre = pres[pres.length - 1]
          if (!pre?.textContent) return false
          try {
            const data = JSON.parse(pre.textContent)
            return data.username === undefined
          } catch {
            return false
          }
        },
        { timeout: 5000 }
      )

      // After reset, data should be empty
      const resetData = (await formPage.getDataPreviewAsJson()) as Record<
        string,
        unknown
      >
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

      // Wait for form to initialize with defaults
      await formPage.page.waitForFunction(
        () => {
          const pres = document.querySelectorAll('pre')
          const pre = pres[pres.length - 1]
          if (!pre?.textContent) return false
          try {
            const data = JSON.parse(pre.textContent)
            return data.username !== undefined
          } catch {
            return false
          }
        },
        { timeout: 10000 }
      )

      // Get the form data from the preview
      const data = (await formPage.getDataPreviewAsJson()) as Record<
        string,
        unknown
      >

      // Verify defaults are applied for required properties
      expect(data).toBeTruthy()

      // String with default (required property)
      expect(data.username).toBe('guest_user')

      // Non-required properties are not auto-populated
      // Arrays should NOT be auto-populated
      expect(data.tags).toBeUndefined()

      // Fields without default or examples should be undefined
      expect(data.bio).toBeUndefined()
    })

    test('should reset data when clicking Reset', async () => {
      // Select the defaults-demo sample
      await formPage.selectSample('defaults-demo')

      // Wait for defaults to be applied
      await formPage.page.waitForFunction(
        () => {
          const pres = document.querySelectorAll('pre')
          const pre = pres[pres.length - 1]
          if (!pre?.textContent) return false
          try {
            const data = JSON.parse(pre.textContent)
            return data.username !== undefined
          } catch {
            return false
          }
        },
        { timeout: 10000 }
      )

      // Get initial data with defaults applied
      const initialData = (await formPage.getDataPreviewAsJson()) as Record<
        string,
        unknown
      >
      expect(initialData.username).toBe('guest_user')

      // Click reset - this clears the data
      await formPage.clickReset()

      // Wait for data to be cleared
      await formPage.page.waitForFunction(
        () => {
          const pres = document.querySelectorAll('pre')
          const pre = pres[pres.length - 1]
          if (!pre?.textContent) return false
          try {
            const data = JSON.parse(pre.textContent)
            return data.username === undefined
          } catch {
            return false
          }
        },
        { timeout: 5000 }
      )

      // After reset, data should be empty
      const resetData = (await formPage.getDataPreviewAsJson()) as Record<
        string,
        unknown
      >
      expect(resetData).toEqual({})
    })
  })
})

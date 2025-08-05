// SignUpForm Options Test
// Test the new conditional rendering options for SignUpForm

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { signal } from '@tempots/dom'
import { SignUpForm } from '@/components/auth/signup-form'
import { renderToContainer, cleanup } from '@/test-utils'

describe('SignUpForm Options', () => {
  beforeEach(() => {
    cleanup()
  })

  afterEach(() => {
    cleanup()
  })

  describe('showNameField option', () => {
    it('should show name field by default', () => {
      const container = renderToContainer(() =>
        SignUpForm({
          onSubmit: async () => {},
        })
      )

      const nameInput = container.querySelector('input[type="text"]')
      expect(nameInput).toBeTruthy()
    })

    it('should hide name field when showNameField is false', () => {
      const container = renderToContainer(() =>
        SignUpForm({
          onSubmit: async () => {},
          showNameField: false,
        })
      )

      const nameInput = container.querySelector('input[type="text"]')
      expect(nameInput).toBeFalsy()
    })

    it('should show name field when showNameField is true', () => {
      const container = renderToContainer(() =>
        SignUpForm({
          onSubmit: async () => {},
          showNameField: true,
        })
      )

      const nameInput = container.querySelector('input[type="text"]')
      expect(nameInput).toBeTruthy()
    })

    it('should reactively show/hide name field', () => {
      const showName = signal(true)
      const container = renderToContainer(() =>
        SignUpForm({
          onSubmit: async () => {},
          showNameField: showName,
        })
      )

      // Initially shown
      expect(container.querySelector('input[type="text"]')).toBeTruthy()

      // Hide it
      showName.set(false)
      expect(container.querySelector('input[type="text"]')).toBeFalsy()

      // Show it again
      showName.set(true)
      expect(container.querySelector('input[type="text"]')).toBeTruthy()
    })
  })

  describe('showConfirmPassword option', () => {
    it('should show confirm password field by default', () => {
      const container = renderToContainer(() =>
        SignUpForm({
          onSubmit: async () => {},
        })
      )

      const passwordInputs = container.querySelectorAll('input[type="password"]')
      expect(passwordInputs.length).toBe(2) // password and confirm password
    })

    it('should hide confirm password field when showConfirmPassword is false', () => {
      const container = renderToContainer(() =>
        SignUpForm({
          onSubmit: async () => {},
          showConfirmPassword: false,
        })
      )

      const passwordInputs = container.querySelectorAll('input[type="password"]')
      expect(passwordInputs.length).toBe(1) // only password field
    })

    it('should show confirm password field when showConfirmPassword is true', () => {
      const container = renderToContainer(() =>
        SignUpForm({
          onSubmit: async () => {},
          showConfirmPassword: true,
        })
      )

      const passwordInputs = container.querySelectorAll('input[type="password"]')
      expect(passwordInputs.length).toBe(2) // password and confirm password
    })
  })

  describe('showAcceptTermsAndConditions option', () => {
    it('should show terms checkbox by default', () => {
      const container = renderToContainer(() =>
        SignUpForm({
          onSubmit: async () => {},
        })
      )

      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toBeTruthy()
    })

    it('should hide terms checkbox when showAcceptTermsAndConditions is false', () => {
      const container = renderToContainer(() =>
        SignUpForm({
          onSubmit: async () => {},
          showAcceptTermsAndConditions: false,
        })
      )

      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toBeFalsy()
    })

    it('should show terms checkbox when showAcceptTermsAndConditions is true', () => {
      const container = renderToContainer(() =>
        SignUpForm({
          onSubmit: async () => {},
          showAcceptTermsAndConditions: true,
        })
      )

      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toBeTruthy()
    })
  })

  describe('termsAndConditions option', () => {
    it('should use custom terms content when provided', () => {
      const customTerms = 'Custom terms and conditions text'
      const container = renderToContainer(() =>
        SignUpForm({
          onSubmit: async () => {},
          termsAndConditions: customTerms,
        })
      )

      const termsText = container.querySelector('.bc-auth-form__terms span')
      expect(termsText?.textContent).toBe(customTerms)
    })

    it('should use default terms text when termsAndConditions is not provided', () => {
      const container = renderToContainer(() =>
        SignUpForm({
          onSubmit: async () => {},
        })
      )

      const termsText = container.querySelector('.bc-auth-form__terms span')
      expect(termsText?.textContent).toBeTruthy()
      expect(termsText?.textContent).not.toBe('')
    })
  })

  describe('showAlreadyHaveAccountLink option', () => {
    it('should show account link by default', () => {
      const container = renderToContainer(() =>
        SignUpForm({
          onSubmit: async () => {},
          onModeChange: () => {},
        })
      )

      const footer = container.querySelector('.bc-auth-form__footer')
      expect(footer).toBeTruthy()
      
      const link = footer?.querySelector('.bc-auth-form__link')
      expect(link).toBeTruthy()
    })

    it('should hide account link when showAlreadyHaveAccountLink is false', () => {
      const container = renderToContainer(() =>
        SignUpForm({
          onSubmit: async () => {},
          onModeChange: () => {},
          showAlreadyHaveAccountLink: false,
        })
      )

      const footer = container.querySelector('.bc-auth-form__footer')
      expect(footer).toBeFalsy()
    })

    it('should show account link when showAlreadyHaveAccountLink is true', () => {
      const container = renderToContainer(() =>
        SignUpForm({
          onSubmit: async () => {},
          onModeChange: () => {},
          showAlreadyHaveAccountLink: true,
        })
      )

      const footer = container.querySelector('.bc-auth-form__footer')
      expect(footer).toBeTruthy()
      
      const link = footer?.querySelector('.bc-auth-form__link')
      expect(link).toBeTruthy()
    })
  })

  describe('form submission with optional fields', () => {
    it('should submit successfully when confirm password is disabled', async () => {
      let submittedData: any = null
      const container = renderToContainer(() =>
        SignUpForm({
          onSubmit: async (data) => {
            submittedData = data
          },
          showConfirmPassword: false,
          showAcceptTermsAndConditions: false,
        })
      )

      // Fill in required fields
      const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement
      const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement
      
      emailInput.value = 'test@example.com'
      emailInput.dispatchEvent(new Event('input', { bubbles: true }))
      
      passwordInput.value = 'password123'
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }))

      // Submit form
      const form = container.querySelector('form')
      form?.dispatchEvent(new Event('submit', { bubbles: true }))

      // Wait for async validation
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(submittedData).toBeTruthy()
      expect(submittedData.email).toBe('test@example.com')
      expect(submittedData.password).toBe('password123')
    })

    it('should submit successfully when terms acceptance is disabled', async () => {
      let submittedData: any = null
      const container = renderToContainer(() =>
        SignUpForm({
          onSubmit: async (data) => {
            submittedData = data
          },
          showAcceptTermsAndConditions: false,
        })
      )

      // Fill in required fields
      const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement
      const passwordInputs = container.querySelectorAll('input[type="password"]') as NodeListOf<HTMLInputElement>
      
      emailInput.value = 'test@example.com'
      emailInput.dispatchEvent(new Event('input', { bubbles: true }))
      
      passwordInputs[0].value = 'password123'
      passwordInputs[0].dispatchEvent(new Event('input', { bubbles: true }))
      
      passwordInputs[1].value = 'password123'
      passwordInputs[1].dispatchEvent(new Event('input', { bubbles: true }))

      // Submit form
      const form = container.querySelector('form')
      form?.dispatchEvent(new Event('submit', { bubbles: true }))

      // Wait for async validation
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(submittedData).toBeTruthy()
      expect(submittedData.email).toBe('test@example.com')
      expect(submittedData.password).toBe('password123')
    })
  })
})

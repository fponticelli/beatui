import { describe, it, expect } from 'vitest'
import { generateLinkClasses } from './link'

// Test the class generation function directly since the full component
// requires complex DOM setup with Location provider
describe('Link', () => {
  describe('generateLinkClasses', () => {
    it('should generate default variant classes', () => {
      const classes = generateLinkClasses('default')
      expect(classes).toBe('bc-link bc-link--default')
    })

    it('should generate plain variant classes', () => {
      const classes = generateLinkClasses('plain')
      expect(classes).toBe('bc-link bc-link--plain')
    })

    it('should generate hover variant classes', () => {
      const classes = generateLinkClasses('hover')
      expect(classes).toBe('bc-link bc-link--hover')
    })
  })
})

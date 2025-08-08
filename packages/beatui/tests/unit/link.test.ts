import { describe, it, expect, beforeEach } from 'vitest'
import { generateLinkClasses } from '../../src/components/navigation/link/link'
import { isUrlMatch } from '../../src/components/navigation/link/navigation-link'

// Test the class generation function directly since the full component
// requires complex DOM setup with Location provider
describe('Link', () => {
  describe('generateLinkClasses', () => {
    it('should generate default variant classes', () => {
      const classes = generateLinkClasses('default', 'primary', false)
      expect(classes).toBe('bc-link bu-text-primary bc-link--default')
    })

    it('should generate plain variant classes', () => {
      const classes = generateLinkClasses('plain', 'secondary', false)
      expect(classes).toBe('bc-link bu-text-secondary bc-link--plain')
    })

    it('should generate hover variant classes', () => {
      const classes = generateLinkClasses('hover', 'error', false)
      expect(classes).toBe('bc-link bu-text-error bc-link--hover')
    })

    it('should generate disabled classes', () => {
      const classes = generateLinkClasses('default', 'primary', true)
      expect(classes).toBe('bc-link bu-text-primary bc-link--disabled')
    })
  })

  describe('isUrlMatch', () => {
    beforeEach(() => {
      // Mock window.location.origin for URL parsing tests
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'https://example.com',
        },
        writable: true,
      })
    })

    describe('exact match mode', () => {
      it('should match exact pathname', () => {
        const location = { pathname: '/docs', search: {}, hash: '' }
        expect(isUrlMatch(location, '/docs', 'exact')).toBe(true)
      })

      it('should not match different pathname', () => {
        const location = { pathname: '/docs', search: {}, hash: '' }
        expect(isUrlMatch(location, '/blog', 'exact')).toBe(false)
      })

      it('should match pathname with search params', () => {
        const location = { pathname: '/docs', search: { page: '1' }, hash: '' }
        expect(isUrlMatch(location, '/docs?page=1', 'exact')).toBe(true)
      })

      it('should match pathname with hash', () => {
        const location = { pathname: '/docs', search: {}, hash: '#section1' }
        expect(isUrlMatch(location, '/docs#section1', 'exact')).toBe(true)
      })

      it('should match pathname with search params and hash', () => {
        const location = {
          pathname: '/docs',
          search: { page: '1', sort: 'name' },
          hash: '#section1',
        }
        expect(
          isUrlMatch(location, '/docs?page=1&sort=name#section1', 'exact')
        ).toBe(true)
      })

      it('should handle empty search object', () => {
        const location = { pathname: '/docs', search: {}, hash: '' }
        expect(isUrlMatch(location, '/docs', 'exact')).toBe(true)
      })

      it('should handle undefined hash', () => {
        const location = { pathname: '/docs', search: {} }
        expect(isUrlMatch(location, '/docs', 'exact')).toBe(true)
      })

      it('should not match when search params differ', () => {
        const location = { pathname: '/docs', search: { page: '1' }, hash: '' }
        expect(isUrlMatch(location, '/docs?page=2', 'exact')).toBe(false)
      })
    })

    describe('prefix match mode', () => {
      it('should match exact pathname', () => {
        const location = { pathname: '/docs', search: {}, hash: '' }
        expect(isUrlMatch(location, '/docs', 'prefix')).toBe(true)
      })

      it('should match pathname prefix', () => {
        const location = {
          pathname: '/docs/getting-started',
          search: {},
          hash: '',
        }
        expect(isUrlMatch(location, '/docs', 'prefix')).toBe(true)
      })

      it('should match pathname with search params prefix', () => {
        const location = {
          pathname: '/docs/api',
          search: { version: 'v1' },
          hash: '',
        }
        expect(isUrlMatch(location, '/docs', 'prefix')).toBe(true)
      })

      it('should match full URL prefix including search', () => {
        const location = {
          pathname: '/docs',
          search: { page: '1', sort: 'name' },
          hash: '',
        }
        expect(isUrlMatch(location, '/docs?page=1', 'prefix')).toBe(true)
      })

      it('should not match when pathname does not start with target', () => {
        const location = { pathname: '/blog/post', search: {}, hash: '' }
        expect(isUrlMatch(location, '/docs', 'prefix')).toBe(false)
      })

      it('should handle root path prefix', () => {
        const location = { pathname: '/docs/guide', search: {}, hash: '' }
        expect(isUrlMatch(location, '/', 'prefix')).toBe(true)
      })
    })

    describe('params match mode', () => {
      it('should match same pathname and search params', () => {
        const location = {
          pathname: '/docs',
          search: { page: '1', sort: 'name' },
          hash: '#section1',
        }
        expect(isUrlMatch(location, '/docs?page=1&sort=name', 'params')).toBe(
          true
        )
      })

      it('should match regardless of hash', () => {
        const location = {
          pathname: '/docs',
          search: { page: '1' },
          hash: '#different',
        }
        expect(isUrlMatch(location, '/docs?page=1#original', 'params')).toBe(
          true
        )
      })

      it('should match when search params are in different order', () => {
        const location = {
          pathname: '/docs',
          search: { page: '1', sort: 'name' },
          hash: '',
        }
        expect(isUrlMatch(location, '/docs?sort=name&page=1', 'params')).toBe(
          true
        )
      })

      it('should not match when pathname differs', () => {
        const location = { pathname: '/docs', search: { page: '1' }, hash: '' }
        expect(isUrlMatch(location, '/blog?page=1', 'params')).toBe(false)
      })

      it('should not match when search params differ', () => {
        const location = { pathname: '/docs', search: { page: '1' }, hash: '' }
        expect(isUrlMatch(location, '/docs?page=2', 'params')).toBe(false)
      })

      it('should handle empty search params', () => {
        const location = { pathname: '/docs', search: {}, hash: '' }
        expect(isUrlMatch(location, '/docs', 'params')).toBe(true)
      })

      it('should fall back to pathname comparison on URL parsing error', () => {
        const location = { pathname: '/docs', search: {}, hash: '' }
        // Invalid URL that would cause parsing error
        expect(isUrlMatch(location, 'invalid://url', 'params')).toBe(false)
        expect(isUrlMatch(location, '/docs', 'params')).toBe(true)
      })
    })

    describe('invalid match mode', () => {
      it('should return false for unknown match mode', () => {
        const location = { pathname: '/docs', search: {}, hash: '' }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(isUrlMatch(location, '/docs', 'unknown' as any)).toBe(false)
      })
    })

    describe('edge cases', () => {
      it('should handle complex search params with special characters', () => {
        const location = {
          pathname: '/search',
          search: { q: 'hello world', filter: 'type:doc' },
          hash: '',
        }
        // The location.search object contains unencoded values, but the target URL contains encoded values
        // URLSearchParams will handle the encoding/decoding automatically
        expect(
          isUrlMatch(
            location,
            '/search?q=hello%20world&filter=type%3Adoc',
            'params'
          )
        ).toBe(true)
      })

      it('should handle empty strings', () => {
        const location = { pathname: '', search: {}, hash: '' }
        expect(isUrlMatch(location, '', 'exact')).toBe(true)
      })

      it('should handle root path', () => {
        const location = { pathname: '/', search: {}, hash: '' }
        expect(isUrlMatch(location, '/', 'exact')).toBe(true)
      })
    })
  })
})

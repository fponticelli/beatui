import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, html, attr } from '@tempots/dom'

describe('Mixed Direction Content', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  describe('Direction Override Utilities', () => {
    it('should apply bu-dir-ltr class correctly', () => {
      render(
        html.div(attr.class('bu-dir-ltr'), 'This should be LTR'),
        container
      )

      const element = container.querySelector('.bu-dir-ltr')
      expect(element).toBeTruthy()
      expect(element?.textContent).toBe('This should be LTR')
    })

    it('should apply bu-dir-rtl class correctly', () => {
      render(
        html.div(attr.class('bu-dir-rtl'), 'هذا يجب أن يكون RTL'),
        container
      )

      const element = container.querySelector('.bu-dir-rtl')
      expect(element).toBeTruthy()
      expect(element?.textContent).toBe('هذا يجب أن يكون RTL')
    })
  })

  describe('Bidirectional Text Utilities', () => {
    it('should apply bu-bidi-isolate class correctly', () => {
      render(
        html.div(attr.class('bu-bidi-isolate'), 'Mixed content'),
        container
      )

      const element = container.querySelector('.bu-bidi-isolate')
      expect(element).toBeTruthy()
    })

    it('should apply bu-bidi-isolate-override class correctly', () => {
      render(
        html.div(attr.class('bu-bidi-isolate-override'), 'Override content'),
        container
      )

      const element = container.querySelector('.bu-bidi-isolate-override')
      expect(element).toBeTruthy()
    })

    it('should apply bu-bidi-plaintext class correctly', () => {
      render(
        html.div(attr.class('bu-bidi-plaintext'), 'Plain text content'),
        container
      )

      const element = container.querySelector('.bu-bidi-plaintext')
      expect(element).toBeTruthy()
    })
  })

  describe('Direction Isolation Utilities', () => {
    it('should apply bu-isolate-ltr class correctly', () => {
      render(
        html.div(attr.class('bu-isolate-ltr'), 'Isolated LTR content'),
        container
      )

      const element = container.querySelector('.bu-isolate-ltr')
      expect(element).toBeTruthy()
    })

    it('should apply bu-isolate-rtl class correctly', () => {
      render(
        html.div(attr.class('bu-isolate-rtl'), 'محتوى RTL معزول'),
        container
      )

      const element = container.querySelector('.bu-isolate-rtl')
      expect(element).toBeTruthy()
    })
  })

  describe('Logical Property Utilities', () => {
    it('should apply margin inline start utility', () => {
      render(html.div(attr.class('bu-ms-4'), 'Margin inline start'), container)

      const element = container.querySelector('.bu-ms-4')
      expect(element).toBeTruthy()
    })

    it('should apply margin inline end utility', () => {
      render(html.div(attr.class('bu-me-4'), 'Margin inline end'), container)

      const element = container.querySelector('.bu-me-4')
      expect(element).toBeTruthy()
    })

    it('should apply padding inline start utility', () => {
      render(html.div(attr.class('bu-ps-4'), 'Padding inline start'), container)

      const element = container.querySelector('.bu-ps-4')
      expect(element).toBeTruthy()
    })

    it('should apply padding inline end utility', () => {
      render(html.div(attr.class('bu-pe-4'), 'Padding inline end'), container)

      const element = container.querySelector('.bu-pe-4')
      expect(element).toBeTruthy()
    })
  })

  describe('Text Alignment Utilities', () => {
    it('should apply text start alignment', () => {
      render(
        html.div(attr.class('bu-text-start'), 'Text aligned to start'),
        container
      )

      const element = container.querySelector('.bu-text-start')
      expect(element).toBeTruthy()
    })

    it('should apply text end alignment', () => {
      render(
        html.div(attr.class('bu-text-end'), 'Text aligned to end'),
        container
      )

      const element = container.querySelector('.bu-text-end')
      expect(element).toBeTruthy()
    })

    it('should apply text align start utility', () => {
      render(
        html.div(attr.class('bu-text-align-start'), 'Text align start'),
        container
      )

      const element = container.querySelector('.bu-text-align-start')
      expect(element).toBeTruthy()
    })

    it('should apply text align end utility', () => {
      render(
        html.div(attr.class('bu-text-align-end'), 'Text align end'),
        container
      )

      const element = container.querySelector('.bu-text-align-end')
      expect(element).toBeTruthy()
    })
  })

  describe('Special Content Utilities', () => {
    it('should apply numbers LTR utility', () => {
      render(html.div(attr.class('bu-numbers-ltr'), '12345'), container)

      const element = container.querySelector('.bu-numbers-ltr')
      expect(element).toBeTruthy()
      expect(element?.textContent).toBe('12345')
    })

    it('should apply URL LTR utility', () => {
      render(
        html.div(attr.class('bu-url-ltr'), 'https://example.com'),
        container
      )

      const element = container.querySelector('.bu-url-ltr')
      expect(element).toBeTruthy()
      expect(element?.textContent).toBe('https://example.com')
    })

    it('should apply code LTR utility', () => {
      render(html.div(attr.class('bu-code-ltr'), 'const x = 42;'), container)

      const element = container.querySelector('.bu-code-ltr')
      expect(element).toBeTruthy()
      expect(element?.textContent).toBe('const x = 42;')
    })
  })

  describe('Mixed Content Containers', () => {
    it('should apply mixed content utility', () => {
      render(
        html.div(
          attr.class('bu-mixed-content'),
          'English text with عربي mixed in'
        ),
        container
      )

      const element = container.querySelector('.bu-mixed-content')
      expect(element).toBeTruthy()
    })

    it('should apply mixed content isolate utility', () => {
      render(
        html.div(
          attr.class('bu-mixed-content-isolate'),
          'Mixed content with isolation'
        ),
        container
      )

      const element = container.querySelector('.bu-mixed-content-isolate')
      expect(element).toBeTruthy()
    })
  })

  describe('Context Utilities', () => {
    it('should apply LTR context utility', () => {
      render(
        html.div(attr.class('bu-context-ltr'), html.span('Child content')),
        container
      )

      const element = container.querySelector('.bu-context-ltr')
      expect(element).toBeTruthy()
      expect(element?.querySelector('span')).toBeTruthy()
    })

    it('should apply RTL context utility', () => {
      render(
        html.div(attr.class('bu-context-rtl'), html.span('محتوى فرعي')),
        container
      )

      const element = container.querySelector('.bu-context-rtl')
      expect(element).toBeTruthy()
      expect(element?.querySelector('span')).toBeTruthy()
    })
  })
})

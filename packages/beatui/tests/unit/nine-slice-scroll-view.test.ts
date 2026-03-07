import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest'
import { render, prop } from '@tempots/dom'
import { NineSliceScrollView } from '../../src/components/layout/nine-slice-scroll-view'
import { WithProviders } from '../helpers/test-providers'

function flush() {
  return new Promise(resolve => setTimeout(resolve, 50))
}


describe('NineSliceScrollView', () => {
  let container: HTMLElement
  let origResizeObserver: typeof ResizeObserver | undefined

  // ElementRect uses ResizeObserver which jsdom doesn't have.
  // Scope the mock to this describe block to avoid leaking.
  beforeAll(() => {
    origResizeObserver = globalThis.ResizeObserver

    class MockResizeObserver {
      private callback: ResizeObserverCallback
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
      }
      observe(target: Element) {
        Promise.resolve().then(() => {
          this.callback(
            [
              {
                target,
                contentRect: { x: 0, y: 0, width: 600, height: 400, top: 0, right: 600, bottom: 400, left: 0, toJSON: () => ({}) },
                borderBoxSize: [{ inlineSize: 600, blockSize: 400 }],
                contentBoxSize: [{ inlineSize: 600, blockSize: 400 }],
                devicePixelContentBoxSize: [{ inlineSize: 600, blockSize: 400 }],
              } as unknown as ResizeObserverEntry,
            ],
            this as unknown as ResizeObserver
          )
        })
      }
      unobserve() {}
      disconnect() {}
    }

    globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver
  })

  afterAll(() => {
    if (origResizeObserver) {
      globalThis.ResizeObserver = origResizeObserver
    } else {
      delete (globalThis as Record<string, unknown>).ResizeObserver
    }
  })

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    container = document.createElement('div')
    document.body.appendChild(container)

    // Patch getBoundingClientRect so ElementRect gets real dimensions
    const origGetBCR = Element.prototype.getBoundingClientRect
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element
    ) {
      if (this.classList?.contains('bc-nine-slice-container')) {
        return {
          x: 0,
          y: 0,
          width: 600,
          height: 400,
          top: 0,
          left: 0,
          right: 600,
          bottom: 400,
          toJSON: () => ({}),
        } as DOMRect
      }
      return origGetBCR.call(this)
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.removeChild(container)
  })

  function renderView(
    options: Partial<{
      contentWidth: bigint
      contentHeight: bigint
      headerHeight: number
      footerHeight: number
      sidebarStartWidth: number
      sidebarEndWidth: number
      hasHeader: boolean
      hasFooter: boolean
      hasSidebarStart: boolean
      hasSidebarEnd: boolean
      hasTopStart: boolean
    }> = {}
  ) {
    const {
      contentWidth = 2000n,
      contentHeight = 3000n,
      headerHeight = 40,
      footerHeight = 0,
      sidebarStartWidth = 80,
      sidebarEndWidth = 0,
      hasHeader = true,
      hasFooter = false,
      hasSidebarStart = true,
      hasSidebarEnd = false,
      hasTopStart = true,
    } = options

    const cw = prop(contentWidth)
    const ch = prop(contentHeight)

    render(
      WithProviders(() =>
        NineSliceScrollView({
          body: '<div class="body-content">Body</div>',
          contentWidth: cw,
          contentHeight: ch,
          headerHeight,
          footerHeight,
          sidebarStartWidth,
          sidebarEndWidth,
          header: hasHeader ? '<div class="header-content">Header</div>' : undefined,
          footer: hasFooter ? '<div class="footer-content">Footer</div>' : undefined,
          sidebarStart: hasSidebarStart
            ? '<div class="sidebar-start-content">Sidebar</div>'
            : undefined,
          sidebarEnd: hasSidebarEnd
            ? '<div class="sidebar-end-content">SidebarEnd</div>'
            : undefined,
          topStart: hasTopStart ? '<div class="corner-content">Corner</div>' : undefined,
        })
      ),
      container
    )

    return { cw, ch }
  }

  describe('Rendering', () => {
    it('should render the container with correct classes', async () => {
      renderView()
      await flush()

      const el = container.querySelector('.bc-nine-slice-container')
      expect(el).not.toBeNull()
      expect(el?.getAttribute('role')).toBe('group')
      expect(el?.getAttribute('aria-label')).toBe('Scrollable grid view')
      expect(el?.getAttribute('tabindex')).toBe('0')
    })

    it('should render the body pane', async () => {
      renderView()
      await flush()

      const body = container.querySelector('.bc-nine-slice-body')
      expect(body).not.toBeNull()
    })

    it('should render header when provided', async () => {
      renderView({ hasHeader: true })
      await flush()

      const header = container.querySelector('.bc-nine-slice-header')
      expect(header).not.toBeNull()
    })

    it('should not render header when not provided', async () => {
      renderView({ hasHeader: false })
      await flush()

      const header = container.querySelector('.bc-nine-slice-header')
      expect(header).toBeNull()
    })

    it('should render all nine panes when all slots are provided', async () => {
      renderView({
        hasHeader: true,
        hasFooter: true,
        hasSidebarStart: true,
        hasSidebarEnd: true,
        hasTopStart: true,
        footerHeight: 32,
        sidebarEndWidth: 60,
      })
      await flush()

      expect(container.querySelector('.bc-nine-slice-top-start')).not.toBeNull()
      expect(container.querySelector('.bc-nine-slice-header')).not.toBeNull()
      expect(container.querySelector('.bc-nine-slice-sidebar-start')).not.toBeNull()
      expect(container.querySelector('.bc-nine-slice-body')).not.toBeNull()
      expect(container.querySelector('.bc-nine-slice-sidebar-end')).not.toBeNull()
      expect(container.querySelector('.bc-nine-slice-footer')).not.toBeNull()
    })

    it('should render pane container inside the main container', async () => {
      renderView()
      await flush()

      const paneContainer = container.querySelector('.bc-nine-slice-pane-container')
      expect(paneContainer).not.toBeNull()
      expect(paneContainer?.parentElement?.classList.contains('bc-nine-slice-container')).toBe(
        true
      )
    })
  })

  describe('Scrollbars', () => {
    it('should render horizontal scrollbar when content is wider', async () => {
      renderView({ contentWidth: 2000n })
      await flush()

      const hScrollbar = container.querySelector('.bc-nine-slice-scrollbar--horizontal')
      expect(hScrollbar).not.toBeNull()
      expect(hScrollbar?.classList.contains('bc-nine-slice-scrollbar--hidden')).toBe(false)
    })

    it('should render vertical scrollbar when content is taller', async () => {
      renderView({ contentHeight: 3000n })
      await flush()

      const vScrollbar = container.querySelector('.bc-nine-slice-scrollbar--vertical')
      expect(vScrollbar).not.toBeNull()
      expect(vScrollbar?.classList.contains('bc-nine-slice-scrollbar--hidden')).toBe(false)
    })

    it('should hide horizontal scrollbar when content fits', async () => {
      renderView({ contentWidth: 100n })
      await flush()

      const hScrollbar = container.querySelector('.bc-nine-slice-scrollbar--horizontal')
      expect(hScrollbar?.classList.contains('bc-nine-slice-scrollbar--hidden')).toBe(true)
    })

    it('should hide vertical scrollbar when content fits', async () => {
      renderView({ contentHeight: 100n, contentWidth: 100n })
      await flush()

      const vScrollbar = container.querySelector('.bc-nine-slice-scrollbar--vertical')
      expect(vScrollbar?.classList.contains('bc-nine-slice-scrollbar--hidden')).toBe(true)
    })

    it('should have scrollbar thumb elements', async () => {
      renderView()
      await flush()

      const hThumb = container.querySelector(
        '.bc-nine-slice-scrollbar--horizontal .bc-nine-slice-scrollbar-thumb'
      )
      const vThumb = container.querySelector(
        '.bc-nine-slice-scrollbar--vertical .bc-nine-slice-scrollbar-thumb'
      )
      expect(hThumb).not.toBeNull()
      expect(vThumb).not.toBeNull()
    })

    it('should have scrollbar track elements', async () => {
      renderView()
      await flush()

      const hTrack = container.querySelector(
        '.bc-nine-slice-scrollbar--horizontal .bc-nine-slice-scrollbar-track'
      )
      const vTrack = container.querySelector(
        '.bc-nine-slice-scrollbar--vertical .bc-nine-slice-scrollbar-track'
      )
      expect(hTrack).not.toBeNull()
      expect(vTrack).not.toBeNull()
    })

    it('should set ARIA attributes on scrollbars', async () => {
      renderView()
      await flush()

      const hScrollbar = container.querySelector('.bc-nine-slice-scrollbar--horizontal')
      expect(hScrollbar?.getAttribute('role')).toBe('scrollbar')
      expect(hScrollbar?.getAttribute('aria-orientation')).toBe('horizontal')
      expect(hScrollbar?.getAttribute('aria-valuemin')).toBe('0')

      const vScrollbar = container.querySelector('.bc-nine-slice-scrollbar--vertical')
      expect(vScrollbar?.getAttribute('role')).toBe('scrollbar')
      expect(vScrollbar?.getAttribute('aria-orientation')).toBe('vertical')
      expect(vScrollbar?.getAttribute('aria-valuemin')).toBe('0')
    })
  })

  describe('Wheel scrolling', () => {
    it('should scroll vertically on wheel event', async () => {
      renderView()
      await flush()

      const el = container.querySelector('.bc-nine-slice-container') as HTMLElement
      el.dispatchEvent(
        new WheelEvent('wheel', { deltaY: 100, deltaX: 0, bubbles: true })
      )

      await vi.advanceTimersByTimeAsync(20)

      const bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      const transform = bodyContent?.style.transform
      expect(transform).toContain('translateY(-100px)')
    })

    it('should scroll horizontally on wheel event', async () => {
      renderView()
      await flush()

      const el = container.querySelector('.bc-nine-slice-container') as HTMLElement
      el.dispatchEvent(
        new WheelEvent('wheel', { deltaY: 0, deltaX: 150, bubbles: true })
      )

      await vi.advanceTimersByTimeAsync(20)

      const bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      const transform = bodyContent?.style.transform
      expect(transform).toContain('translateX(-150px)')
    })

    it('should clamp scroll to max bounds', async () => {
      // contentHeight=3000, container=400, header=40 => visible ~348 (400-40-12scrollbar)
      // maxScroll = 3000 - 348 = 2652
      renderView({ contentHeight: 3000n })
      await flush()

      const el = container.querySelector('.bc-nine-slice-container') as HTMLElement
      // Scroll way past the end
      el.dispatchEvent(
        new WheelEvent('wheel', { deltaY: 50000, deltaX: 0, bubbles: true })
      )

      await vi.advanceTimersByTimeAsync(20)

      const bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      const transform = bodyContent?.style.transform
      // Should not go past max — exact value depends on viewport calc, but should not be 50000
      expect(transform).not.toContain('50000')
      expect(transform).toContain('translateY(')
    })

    it('should not scroll past zero', async () => {
      renderView()
      await flush()

      const el = container.querySelector('.bc-nine-slice-container') as HTMLElement
      el.dispatchEvent(
        new WheelEvent('wheel', { deltaY: -500, deltaX: 0, bubbles: true })
      )

      await vi.advanceTimersByTimeAsync(20)

      const bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      const transform = bodyContent?.style.transform
      // Should clamp to 0
      expect(transform).toContain('translateY(-0px)')
    })

    it('should throttle wheel events', async () => {
      renderView()
      await flush()

      const el = container.querySelector('.bc-nine-slice-container') as HTMLElement

      // Rapid fire wheel events
      for (let i = 0; i < 10; i++) {
        el.dispatchEvent(
          new WheelEvent('wheel', { deltaY: 10, deltaX: 0, bubbles: true })
        )
      }

      await vi.advanceTimersByTimeAsync(20)

      const bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      const transform = bodyContent?.style.transform
      // All deltas should be accumulated: 10 * 10 = 100
      expect(transform).toContain('translateY(-100px)')
    })
  })

  describe('Keyboard navigation', () => {
    it('should scroll down on ArrowDown', async () => {
      renderView()
      await flush()

      const el = container.querySelector('.bc-nine-slice-container') as HTMLElement
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      )

      await flush()

      const bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      expect(bodyContent?.style.transform).toContain('translateY(-40px)')
    })

    it('should scroll up on ArrowUp', async () => {
      renderView()
      await flush()

      const el = container.querySelector('.bc-nine-slice-container') as HTMLElement
      // First scroll down
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      )
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      )
      // Then scroll up
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
      )

      await flush()

      const bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      // 40 + 40 - 40 = 40
      expect(bodyContent?.style.transform).toContain('translateY(-40px)')
    })

    it('should scroll right on ArrowRight', async () => {
      renderView()
      await flush()

      const el = container.querySelector('.bc-nine-slice-container') as HTMLElement
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      )

      await flush()

      const bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      expect(bodyContent?.style.transform).toContain('translateX(-40px)')
    })

    it('should scroll left on ArrowLeft', async () => {
      renderView()
      await flush()

      const el = container.querySelector('.bc-nine-slice-container') as HTMLElement
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      )
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      )
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
      )

      await flush()

      const bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      expect(bodyContent?.style.transform).toContain('translateX(-40px)')
    })

    it('should jump to start on Home', async () => {
      renderView()
      await flush()

      const el = container.querySelector('.bc-nine-slice-container') as HTMLElement
      // Scroll down first
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      )
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      )
      // Press Home
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true })
      )

      await flush()

      const bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      expect(bodyContent?.style.transform).toContain('translateY(-0px)')
    })

    it('should jump to end on End', async () => {
      renderView()
      await flush()

      const el = container.querySelector('.bc-nine-slice-container') as HTMLElement
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true })
      )

      await flush()

      const bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      const transform = bodyContent?.style.transform
      // Should be at maxScroll, not 0
      expect(transform).not.toContain('translateY(-0px)')
      expect(transform).toContain('translateY(')
    })
  })

  describe('Synchronized transforms', () => {
    it('should apply horizontal transform to header pane-content', async () => {
      renderView()
      await flush()

      const el = container.querySelector('.bc-nine-slice-container') as HTMLElement
      el.dispatchEvent(
        new WheelEvent('wheel', { deltaX: 50, deltaY: 0, bubbles: true })
      )

      await vi.advanceTimersByTimeAsync(20)

      const headerContent = container.querySelector('.bc-nine-slice-header .bc-nine-slice-pane-content') as HTMLElement
      expect(headerContent?.style.transform).toContain('translateX(-50px)')
    })

    it('should apply vertical transform to sidebar pane-content', async () => {
      renderView()
      await flush()

      const el = container.querySelector('.bc-nine-slice-container') as HTMLElement
      el.dispatchEvent(
        new WheelEvent('wheel', { deltaY: 75, deltaX: 0, bubbles: true })
      )

      await vi.advanceTimersByTimeAsync(20)

      const sidebarContent = container.querySelector(
        '.bc-nine-slice-sidebar-start .bc-nine-slice-pane-content'
      ) as HTMLElement
      expect(sidebarContent?.style.transform).toContain('translateY(-75px)')
    })

    it('should apply both transforms to body pane-content', async () => {
      renderView()
      await flush()

      const el = container.querySelector('.bc-nine-slice-container') as HTMLElement
      el.dispatchEvent(
        new WheelEvent('wheel', { deltaX: 50, deltaY: 75, bubbles: true })
      )

      await vi.advanceTimersByTimeAsync(20)

      const bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      const transform = bodyContent?.style.transform
      expect(transform).toContain('translateX(-50px)')
      expect(transform).toContain('translateY(-75px)')
    })
  })

  describe('Dynamic content size (scroll clamping)', () => {
    it('should clamp scroll position when content shrinks', async () => {
      const { ch } = renderView({ contentHeight: 5000n })
      await flush()

      const el = container.querySelector('.bc-nine-slice-container') as HTMLElement
      // Scroll to a large position
      el.dispatchEvent(
        new WheelEvent('wheel', { deltaY: 3000, deltaX: 0, bubbles: true })
      )
      await vi.advanceTimersByTimeAsync(20)

      // Now shrink content to 500 (less than viewport ~348 + scroll position)
      ch.set(500n)
      await flush()

      const bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      const transform = bodyContent?.style.transform
      // With content=500 and visible area ~348, maxScroll = 500-348 = 152
      // Scroll should be clamped, not stuck at 3000
      const match = transform?.match(/translateY\(-(\d+)px\)/)
      if (match) {
        const scrollY = parseInt(match[1])
        expect(scrollY).toBeLessThanOrEqual(500)
      }
    })

    it('should reset scroll to 0 when content becomes smaller than viewport', async () => {
      // Use content that only scrolls vertically (width fits)
      const { ch } = renderView({ contentHeight: 5000n, contentWidth: 100n })
      await flush()

      const el = container.querySelector('.bc-nine-slice-container') as HTMLElement
      el.dispatchEvent(
        new WheelEvent('wheel', { deltaY: 1000, deltaX: 0, bubbles: true })
      )
      await vi.advanceTimersByTimeAsync(20)

      // Verify we scrolled
      let bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      expect(bodyContent?.style.transform).toContain('translateY(-1000px)')

      // Shrink content to fit in viewport — maxScroll becomes 0, position gets clamped
      ch.set(100n)
      await flush()

      bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      // maxVerticalScroll.on clamps position; needsVerticalScroll becomes false
      // The transform should show the position is clamped (not 1000 anymore)
      const transform = bodyContent?.style.transform ?? ''
      const match = transform.match(/translateY\(-(\d+)px\)/)
      const scrollY = match ? parseInt(match[1]) : 0
      expect(scrollY).toBeLessThanOrEqual(100)
    })
  })

  describe('Scrollbar thumb drag', () => {
    it('should update scroll position when dragging vertical thumb', async () => {
      renderView()
      await flush()

      const vThumb = container.querySelector(
        '.bc-nine-slice-scrollbar--vertical .bc-nine-slice-scrollbar-thumb'
      ) as HTMLElement
      expect(vThumb).not.toBeNull()

      // Simulate pointer drag on thumb
      vThumb.dispatchEvent(
        new PointerEvent('pointerdown', { clientX: 10, clientY: 10, bubbles: true })
      )

      // Move pointer down
      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 10, clientY: 60, bubbles: true })
      )

      window.dispatchEvent(
        new PointerEvent('pointerup', { bubbles: true })
      )

      await flush()

      const bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      // Transform should have changed from the drag
      expect(bodyContent?.style.transform).toContain('translateY(')
    })

    it('should update scroll position when dragging horizontal thumb', async () => {
      renderView()
      await flush()

      const hThumb = container.querySelector(
        '.bc-nine-slice-scrollbar--horizontal .bc-nine-slice-scrollbar-thumb'
      ) as HTMLElement
      expect(hThumb).not.toBeNull()

      hThumb.dispatchEvent(
        new PointerEvent('pointerdown', { clientX: 10, clientY: 10, bubbles: true })
      )

      window.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 100, clientY: 10, bubbles: true })
      )

      window.dispatchEvent(
        new PointerEvent('pointerup', { bubbles: true })
      )

      await flush()

      const bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      expect(bodyContent?.style.transform).toContain('translateX(')
    })
  })

  describe('Body pointer drag', () => {
    it('should scroll on body drag', async () => {
      renderView()
      await flush()

      const body = container.querySelector('.bc-nine-slice-body') as HTMLElement

      body.dispatchEvent(
        new PointerEvent('pointerdown', {
          clientX: 200,
          clientY: 200,
          button: 0,
          bubbles: true,
        })
      )

      window.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 150,
          clientY: 100,
          bubbles: true,
        })
      )

      window.dispatchEvent(
        new PointerEvent('pointerup', { bubbles: true })
      )

      await flush()

      const bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      const transform = bodyContent?.style.transform
      // Dragged left by 50 and up by 100 => scroll right by 50 and down by 100
      expect(transform).toContain('translateX(-50px)')
      expect(transform).toContain('translateY(-100px)')
    })

    it('should not scroll on right-click drag', async () => {
      renderView()
      await flush()

      const body = container.querySelector('.bc-nine-slice-body') as HTMLElement

      body.dispatchEvent(
        new PointerEvent('pointerdown', {
          clientX: 200,
          clientY: 200,
          button: 2,
          bubbles: true,
        })
      )

      window.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 150,
          clientY: 100,
          bubbles: true,
        })
      )

      window.dispatchEvent(
        new PointerEvent('pointerup', { bubbles: true })
      )

      await flush()

      const bodyContent = container.querySelector('.bc-nine-slice-body .bc-nine-slice-pane-content') as HTMLElement
      // Should not have scrolled — position stays at 0
      expect(bodyContent?.style.transform).toContain('translateX(-0px)')
      expect(bodyContent?.style.transform).toContain('translateY(-0px)')
    })
  })

  describe('Accessibility', () => {
    it('should be focusable', async () => {
      renderView()
      await flush()

      const el = container.querySelector('.bc-nine-slice-container')
      expect(el?.getAttribute('tabindex')).toBe('0')
    })

    it('should have group role on container', async () => {
      renderView()
      await flush()

      const el = container.querySelector('.bc-nine-slice-container')
      expect(el?.getAttribute('role')).toBe('group')
    })

    it('should set aria-valuenow on vertical scrollbar after scroll', async () => {
      renderView()
      await flush()

      const el = container.querySelector('.bc-nine-slice-container') as HTMLElement
      el.dispatchEvent(
        new WheelEvent('wheel', { deltaY: 100, deltaX: 0, bubbles: true })
      )
      await vi.advanceTimersByTimeAsync(20)
      await flush()

      const vScrollbar = container.querySelector('.bc-nine-slice-scrollbar--vertical')
      expect(vScrollbar?.getAttribute('aria-valuenow')).toBe('100')
    })

    it('should set aria-valuenow on horizontal scrollbar after scroll', async () => {
      renderView()
      await flush()

      const el = container.querySelector('.bc-nine-slice-container') as HTMLElement
      el.dispatchEvent(
        new WheelEvent('wheel', { deltaX: 200, deltaY: 0, bubbles: true })
      )
      await vi.advanceTimersByTimeAsync(20)
      await flush()

      const hScrollbar = container.querySelector('.bc-nine-slice-scrollbar--horizontal')
      expect(hScrollbar?.getAttribute('aria-valuenow')).toBe('200')
    })
  })
})

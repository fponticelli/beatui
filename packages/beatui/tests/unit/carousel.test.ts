import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, html, prop } from '@tempots/dom'
import {
  Carousel,
  createCarousel,
} from '../../src/components/media/carousel'
import type { CarouselOptions } from '../../src/components/media/carousel'
import { WithProviders } from '../helpers/test-providers'

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

function slide(label: string) {
  return html.div(label)
}

function renderCarousel(options: CarouselOptions, count = 3) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const slides = Array.from({ length: count }, (_, i) => slide(`Slide ${i + 1}`))
  const [node, ctrl] = createCarousel(options, ...slides)
  render(WithProviders(() => node), container)
  return { container, ctrl }
}

describe('Carousel', () => {
  describe('rendering', () => {
    it('should render with correct ARIA attributes', () => {
      const { container } = renderCarousel({})
      const root = container.querySelector('[role="region"]')!
      expect(root).not.toBeNull()
      expect(root.getAttribute('aria-roledescription')).toBe('carousel')
      expect(root.getAttribute('aria-label')).toBe('Carousel')
    })

    it('should render custom ariaLabel', () => {
      const { container } = renderCarousel({ ariaLabel: 'My Gallery' })
      const root = container.querySelector('[role="region"]')!
      expect(root.getAttribute('aria-label')).toBe('My Gallery')
    })

    it('should render slides with correct ARIA', () => {
      const { container } = renderCarousel({})
      const slides = container.querySelectorAll('[role="tabpanel"]')
      expect(slides).toHaveLength(3)
      expect(slides[0].getAttribute('aria-roledescription')).toBe('slide')
      expect(slides[0].getAttribute('aria-label')).toBe('Slide 1 of 3')
      expect(slides[2].getAttribute('aria-label')).toBe('Slide 3 of 3')
    })

    it('should render slide content', () => {
      const { container } = renderCarousel({})
      const slides = container.querySelectorAll('[role="tabpanel"]')
      expect(slides[0].textContent).toBe('Slide 1')
      expect(slides[1].textContent).toBe('Slide 2')
      expect(slides[2].textContent).toBe('Slide 3')
    })

    it('should set active class on current slide', () => {
      const { container } = renderCarousel({})
      const slides = container.querySelectorAll('.bc-carousel__slide')
      expect(slides[0].classList.contains('bc-carousel__slide--active')).toBe(true)
      expect(slides[1].classList.contains('bc-carousel__slide--active')).toBe(false)
    })

    it('should render with slide transition class by default', () => {
      const { container } = renderCarousel({})
      const root = container.querySelector('.bc-carousel')!
      expect(root.classList.contains('bc-carousel--slide')).toBe(true)
    })

    it('should render with fade transition class', () => {
      const { container } = renderCarousel({ transition: 'fade' })
      const root = container.querySelector('.bc-carousel')!
      expect(root.classList.contains('bc-carousel--fade')).toBe(true)
    })

    it('should render nothing for empty children', () => {
      const container = document.createElement('div')
      document.body.appendChild(container)
      const [node, ctrl] = createCarousel({})
      render(WithProviders(() => node), container)
      expect(container.querySelector('.bc-carousel')).toBeNull()
      expect(ctrl.totalSlides).toBe(0)
    })
  })

  describe('Carousel wrapper', () => {
    it('should return a TNode (not a tuple)', () => {
      const container = document.createElement('div')
      document.body.appendChild(container)
      const node = Carousel({}, slide('A'), slide('B'))
      render(WithProviders(() => node), container)
      expect(container.querySelector('.bc-carousel')).not.toBeNull()
    })
  })

  describe('navigation arrows', () => {
    it('should render prev and next arrows by default', () => {
      const { container } = renderCarousel({})
      expect(container.querySelector('.bc-carousel__arrow--prev')).not.toBeNull()
      expect(container.querySelector('.bc-carousel__arrow--next')).not.toBeNull()
    })

    it('should hide arrows when showArrows is false', () => {
      const { container } = renderCarousel({ showArrows: false })
      expect(container.querySelector('.bc-carousel__arrow--prev')).toBeNull()
      expect(container.querySelector('.bc-carousel__arrow--next')).toBeNull()
    })

    it('should have accessible labels on arrows', () => {
      const { container } = renderCarousel({})
      const prev = container.querySelector('.bc-carousel__arrow--prev')!
      const next = container.querySelector('.bc-carousel__arrow--next')!
      expect(prev.getAttribute('aria-label')).toBe('Previous slide')
      expect(next.getAttribute('aria-label')).toBe('Next slide')
    })

    it('should disable prev arrow at start (non-loop)', () => {
      const { container } = renderCarousel({ loop: false })
      const prev = container.querySelector('.bc-carousel__arrow--prev')!
      expect((prev as HTMLButtonElement).disabled).toBe(true)
      expect(prev.classList.contains('bc-carousel__arrow--disabled')).toBe(true)
    })

    it('should not disable arrows when loop is enabled', () => {
      const { container } = renderCarousel({ loop: true })
      const prev = container.querySelector('.bc-carousel__arrow--prev')! as HTMLButtonElement
      const next = container.querySelector('.bc-carousel__arrow--next')! as HTMLButtonElement
      expect(prev.disabled).toBe(false)
      expect(next.disabled).toBe(false)
    })
  })

  describe('controller', () => {
    it('should expose totalSlides', () => {
      const { ctrl } = renderCarousel({}, 5)
      expect(ctrl.totalSlides).toBe(5)
    })

    it('should expose currentIndex signal starting at 0', () => {
      const { ctrl } = renderCarousel({})
      expect(ctrl.currentIndex.value).toBe(0)
    })

    it('should expose currentIndex starting at given value', () => {
      const { ctrl } = renderCarousel({ currentIndex: 2 })
      expect(ctrl.currentIndex.value).toBe(2)
    })

    it('should navigate with next()', () => {
      const { ctrl } = renderCarousel({})
      ctrl.next()
      expect(ctrl.currentIndex.value).toBe(1)
    })

    it('should navigate with prev()', () => {
      const { ctrl } = renderCarousel({ currentIndex: 2 })
      ctrl.prev()
      expect(ctrl.currentIndex.value).toBe(1)
    })

    it('should navigate with goTo()', () => {
      const { ctrl } = renderCarousel({}, 5)
      ctrl.goTo(3)
      expect(ctrl.currentIndex.value).toBe(3)
    })

    it('should clamp goTo to valid range', () => {
      const { ctrl } = renderCarousel({}, 3)
      ctrl.goTo(10)
      expect(ctrl.currentIndex.value).toBe(2)
    })

    it('should not go below 0 without loop', () => {
      const { ctrl } = renderCarousel({ loop: false })
      ctrl.prev()
      expect(ctrl.currentIndex.value).toBe(0)
    })

    it('should not go beyond max without loop', () => {
      const { ctrl } = renderCarousel({ loop: false }, 3)
      ctrl.next()
      ctrl.next()
      ctrl.next() // at index 2, should not go further
      expect(ctrl.currentIndex.value).toBe(2)
    })

    it('should loop forward', () => {
      const { ctrl } = renderCarousel({ loop: true }, 3)
      ctrl.goTo(2)
      ctrl.next()
      expect(ctrl.currentIndex.value).toBe(0)
    })

    it('should loop backward', () => {
      const { ctrl } = renderCarousel({ loop: true }, 3)
      ctrl.prev()
      expect(ctrl.currentIndex.value).toBe(2)
    })

    it('should update active slide class on navigation', async () => {
      const { container, ctrl } = renderCarousel({})
      ctrl.next()
      await flush()
      const slides = container.querySelectorAll('.bc-carousel__slide')
      expect(slides[0].classList.contains('bc-carousel__slide--active')).toBe(false)
      expect(slides[1].classList.contains('bc-carousel__slide--active')).toBe(true)
    })

    it('should update disabled arrow state on navigation', async () => {
      const { container, ctrl } = renderCarousel({ loop: false }, 3)
      const prev = container.querySelector('.bc-carousel__arrow--prev')! as HTMLButtonElement
      const next = container.querySelector('.bc-carousel__arrow--next')! as HTMLButtonElement
      expect(prev.disabled).toBe(true)
      expect(next.disabled).toBe(false)

      ctrl.goTo(2)
      await flush()
      expect(prev.disabled).toBe(false)
      expect(next.disabled).toBe(true)
    })
  })

  describe('indicators', () => {
    it('should show dots by default', () => {
      const { container } = renderCarousel({})
      const dots = container.querySelectorAll('.bc-carousel__dot')
      expect(dots).toHaveLength(3)
    })

    it('should show dot navigation with ARIA', () => {
      const { container } = renderCarousel({})
      const tablist = container.querySelector('[role="tablist"]')
      expect(tablist).not.toBeNull()
      expect(tablist!.getAttribute('aria-label')).toBe('Slide navigation')

      const dots = container.querySelectorAll('.bc-carousel__dot')
      expect(dots[0].getAttribute('aria-label')).toBe('Go to slide 1')
      expect(dots[2].getAttribute('aria-label')).toBe('Go to slide 3')
    })

    it('should mark active dot', () => {
      const { container } = renderCarousel({})
      const dots = container.querySelectorAll('.bc-carousel__dot')
      expect(dots[0].classList.contains('bc-carousel__dot--active')).toBe(true)
      expect(dots[1].classList.contains('bc-carousel__dot--active')).toBe(false)
    })

    it('should update active dot on navigation', async () => {
      const { container, ctrl } = renderCarousel({})
      ctrl.next()
      await flush()
      const dots = container.querySelectorAll('.bc-carousel__dot')
      expect(dots[0].classList.contains('bc-carousel__dot--active')).toBe(false)
      expect(dots[1].classList.contains('bc-carousel__dot--active')).toBe(true)
    })

    it('should navigate when clicking a dot', () => {
      const { container, ctrl } = renderCarousel({})
      const dots = container.querySelectorAll('.bc-carousel__dot')
      ;(dots[2] as HTMLButtonElement).click()
      expect(ctrl.currentIndex.value).toBe(2)
    })

    it('should show progress indicator', () => {
      const { container } = renderCarousel({ indicator: 'progress' })
      expect(container.querySelector('.bc-carousel__progress')).not.toBeNull()
      expect(container.querySelector('.bc-carousel__dots')).toBeNull()
    })

    it('should show fraction indicator', () => {
      const { container } = renderCarousel({ indicator: 'fraction' })
      const fraction = container.querySelector('.bc-carousel__fraction')
      expect(fraction).not.toBeNull()
      expect(fraction!.textContent).toBe('1 / 3')
    })

    it('should update fraction on navigation', async () => {
      const { container, ctrl } = renderCarousel({ indicator: 'fraction' })
      ctrl.next()
      await flush()
      const fraction = container.querySelector('.bc-carousel__fraction')!
      expect(fraction.textContent).toBe('2 / 3')
    })

    it('should show no indicator when set to none', () => {
      const { container } = renderCarousel({ indicator: 'none' })
      expect(container.querySelector('.bc-carousel__dots')).toBeNull()
      expect(container.querySelector('.bc-carousel__progress')).toBeNull()
      expect(container.querySelector('.bc-carousel__fraction')).toBeNull()
    })
  })

  describe('callbacks', () => {
    it('should call onSlideChange on navigation', () => {
      const onSlideChange = vi.fn()
      const { ctrl } = renderCarousel({ onSlideChange })
      ctrl.next()
      expect(onSlideChange).toHaveBeenCalledWith(1)
      ctrl.next()
      expect(onSlideChange).toHaveBeenCalledWith(2)
    })

    it('should not call onSlideChange if index unchanged', () => {
      const onSlideChange = vi.fn()
      const { ctrl } = renderCarousel({ onSlideChange, loop: false })
      ctrl.prev() // already at 0, should not move
      expect(onSlideChange).not.toHaveBeenCalled()
    })

    it('should call onAutoPlayToggle on play/pause', () => {
      const onAutoPlayToggle = vi.fn()
      const { ctrl } = renderCarousel({ onAutoPlayToggle })
      ctrl.play()
      expect(onAutoPlayToggle).toHaveBeenCalledWith(true)
      ctrl.pause()
      expect(onAutoPlayToggle).toHaveBeenCalledWith(false)
    })
  })

  describe('auto-play', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should expose isPlaying signal', () => {
      const { ctrl } = renderCarousel({})
      expect(ctrl.isPlaying.value).toBe(false)
      ctrl.play()
      expect(ctrl.isPlaying.value).toBe(true)
      ctrl.pause()
      expect(ctrl.isPlaying.value).toBe(false)
    })

    it('should auto-advance when playing', async () => {
      const { ctrl } = renderCarousel({ interval: 1000 })
      ctrl.play()
      expect(ctrl.currentIndex.value).toBe(0)
      await vi.advanceTimersByTimeAsync(1000)
      expect(ctrl.currentIndex.value).toBe(1)
      await vi.advanceTimersByTimeAsync(1000)
      expect(ctrl.currentIndex.value).toBe(2)
      ctrl.pause()
    })

    it('should stop advancing when paused', async () => {
      const { ctrl } = renderCarousel({ interval: 1000 })
      ctrl.play()
      await vi.advanceTimersByTimeAsync(1000)
      expect(ctrl.currentIndex.value).toBe(1)
      ctrl.pause()
      await vi.advanceTimersByTimeAsync(3000)
      expect(ctrl.currentIndex.value).toBe(1)
    })

    it('should start auto-playing when autoPlay option is true', async () => {
      const { ctrl } = renderCarousel({ autoPlay: true, interval: 1000 })
      expect(ctrl.isPlaying.value).toBe(true)
      await vi.advanceTimersByTimeAsync(1000)
      expect(ctrl.currentIndex.value).toBe(1)
      ctrl.pause()
    })
  })

  describe('keyboard navigation', () => {
    it('should navigate with ArrowRight', () => {
      const { container, ctrl } = renderCarousel({})
      const root = container.querySelector('.bc-carousel')!
      root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      expect(ctrl.currentIndex.value).toBe(1)
    })

    it('should navigate with ArrowLeft', () => {
      const { container, ctrl } = renderCarousel({ currentIndex: 1 })
      const root = container.querySelector('.bc-carousel')!
      root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
      expect(ctrl.currentIndex.value).toBe(0)
    })

    it('should not navigate when keyboard is disabled', () => {
      const { container, ctrl } = renderCarousel({ keyboard: false })
      const root = container.querySelector('.bc-carousel')!
      root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
      expect(ctrl.currentIndex.value).toBe(0)
    })
  })

  describe('slidesPerView', () => {
    it('should set slide min-width based on slidesPerView', () => {
      const { container } = renderCarousel({ slidesPerView: 3 }, 5)
      const s = container.querySelector('.bc-carousel__slide') as HTMLElement
      expect(s.style.minWidth).toContain('33.3333')
    })

    it('should limit max index with slidesPerView', () => {
      const { ctrl } = renderCarousel({ slidesPerView: 2 }, 5)
      ctrl.goTo(10)
      expect(ctrl.currentIndex.value).toBe(3)
    })
  })

  describe('gap', () => {
    it('should set gap style on track', () => {
      const { container } = renderCarousel({ gap: '16px' })
      const track = container.querySelector('.bc-carousel__track') as HTMLElement
      expect(track.style.gap).toBe('16px')
    })

    it('should compute slide min-width with gap', () => {
      const { container } = renderCarousel({ gap: '10px', slidesPerView: 2 })
      const s = container.querySelector('.bc-carousel__slide') as HTMLElement
      expect(s.style.minWidth).toContain('calc')
      expect(s.style.minWidth).toContain('10px')
    })
  })

  describe('peek', () => {
    it('should set padding on viewport', () => {
      const { container } = renderCarousel({ peekAmount: '40px' })
      const viewport = container.querySelector('.bc-carousel__viewport') as HTMLElement
      expect(viewport.style.paddingLeft).toBe('40px')
      expect(viewport.style.paddingRight).toBe('40px')
    })
  })

  describe('transition reactivity', () => {
    it('should update class when transition changes', async () => {
      const transition = prop<'slide' | 'fade'>('slide')
      const { container } = renderCarousel({ transition })
      const root = container.querySelector('.bc-carousel')!
      expect(root.classList.contains('bc-carousel--slide')).toBe(true)

      transition.set('fade')
      await flush()
      expect(root.classList.contains('bc-carousel--fade')).toBe(true)
      expect(root.classList.contains('bc-carousel--slide')).toBe(false)
    })
  })

  describe('indicator reactivity', () => {
    it('should switch indicator type reactively', async () => {
      const indicator = prop<'dots' | 'progress' | 'fraction' | 'none'>('dots')
      const { container } = renderCarousel({ indicator })
      expect(container.querySelector('.bc-carousel__dots')).not.toBeNull()

      indicator.set('progress')
      await flush()
      expect(container.querySelector('.bc-carousel__dots')).toBeNull()
      expect(container.querySelector('.bc-carousel__progress')).not.toBeNull()

      indicator.set('fraction')
      await flush()
      expect(container.querySelector('.bc-carousel__progress')).toBeNull()
      expect(container.querySelector('.bc-carousel__fraction')).not.toBeNull()

      indicator.set('none')
      await flush()
      expect(container.querySelector('.bc-carousel__fraction')).toBeNull()
    })
  })
})

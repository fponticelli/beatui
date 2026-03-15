import {
  aria,
  attr,
  Fragment,
  html,
  on,
  OnDispose,
  prop,
  style,
  svg,
  svgAttr,
  TNode,
  Value,
  When,
  WithElement,
} from '@tempots/dom'

/** Transition effect for slide changes. */
export type CarouselTransition = 'slide' | 'fade'

/** Configuration options for the {@link Carousel} component. */
export type CarouselOptions = {
  /** Index of the currently active slide. */
  currentIndex?: Value<number>
  /** Enable auto-play rotation. */
  autoPlay?: Value<boolean>
  /** Auto-play interval in milliseconds. Defaults to 3000. */
  interval?: Value<number>
  /** Whether to loop infinitely. */
  loop?: Value<boolean>
  /** Number of slides visible at once. Defaults to 1. */
  slidesPerView?: Value<number>
  /** Transition effect. Defaults to 'slide'. */
  transition?: Value<CarouselTransition>
  /** Transition duration in milliseconds. Defaults to 300. */
  transitionDuration?: Value<number>
  /** Show navigation arrows. Defaults to true. */
  showArrows?: Value<boolean>
  /** Show dot indicators. Defaults to true. */
  showDots?: Value<boolean>
  /** Pause auto-play on hover. Defaults to true. */
  pauseOnHover?: Value<boolean>
  /** Enable keyboard navigation. Defaults to true. */
  keyboard?: Value<boolean>
  /** Accessible label for the carousel. */
  ariaLabel?: Value<string>
  /** Called when the active slide changes. */
  onSlideChange?: (index: number) => void
  /** Called when auto-play state toggles. */
  onAutoPlayToggle?: (playing: boolean) => void
}

/**
 * A fully-featured carousel component for cycling through slide content.
 *
 * Supports auto-play, touch/swipe, keyboard navigation, multiple transition
 * effects, and accessible ARIA attributes.
 *
 * @param options - Carousel configuration
 * @param children - Slide content elements (each child is one slide)
 * @returns A carousel container with navigation controls
 *
 * @example
 * ```typescript
 * Carousel(
 *   { autoPlay: true, loop: true },
 *   html.div('Slide 1'),
 *   html.div('Slide 2'),
 *   html.div('Slide 3')
 * )
 * ```
 */
export function Carousel(options: CarouselOptions, ...children: TNode[]) {
  const totalSlides = children.length
  if (totalSlides === 0) return Fragment()

  const currentIndex = prop(Value.get(options.currentIndex ?? 0))
  const autoPlay = Value.toSignal(options.autoPlay ?? false)
  const interval = Value.toSignal(options.interval ?? 3000)
  const loop = Value.toSignal(options.loop ?? false)
  const slidesPerView = Value.toSignal(options.slidesPerView ?? 1)
  const transition = Value.toSignal(options.transition ?? 'slide')
  const transitionDuration = Value.toSignal(options.transitionDuration ?? 300)
  const showArrows = Value.toSignal(options.showArrows ?? true)
  const showDots = Value.toSignal(options.showDots ?? true)
  const pauseOnHover = Value.toSignal(options.pauseOnHover ?? true)
  const keyboard = Value.toSignal(options.keyboard ?? true)

  const isHovered = prop(false)
  const isAutoPlaying = prop(Value.get(autoPlay))

  // Sync external autoPlay signal
  autoPlay.on(v => isAutoPlaying.set(v))

  const maxIndex = prop(Math.max(0, totalSlides - Value.get(slidesPerView)))
  slidesPerView.on(spv => {
    maxIndex.set(Math.max(0, totalSlides - spv))
  })

  function clampIndex(idx: number): number {
    const max = maxIndex.value
    if (max === 0) return 0
    if (Value.get(loop)) {
      return ((idx % totalSlides) + totalSlides) % totalSlides
    }
    return Math.max(0, Math.min(idx, max))
  }

  function goTo(idx: number) {
    const clamped = clampIndex(idx)
    if (clamped !== currentIndex.value) {
      currentIndex.set(clamped)
      options.onSlideChange?.(clamped)
    }
  }

  function next() {
    const idx = currentIndex.value + 1
    if (Value.get(loop)) {
      goTo(idx)
    } else if (idx <= maxIndex.value) {
      goTo(idx)
    }
  }

  function prev() {
    const idx = currentIndex.value - 1
    if (Value.get(loop)) {
      goTo(idx)
    } else if (idx >= 0) {
      goTo(idx)
    }
  }

  // Auto-play timer
  let autoPlayTimer: ReturnType<typeof setInterval> | null = null

  function startAutoPlay() {
    stopAutoPlay()
    autoPlayTimer = setInterval(() => {
      if (isHovered.value && Value.get(pauseOnHover)) return
      next()
    }, Value.get(interval))
  }

  function stopAutoPlay() {
    if (autoPlayTimer != null) {
      clearInterval(autoPlayTimer)
      autoPlayTimer = null
    }
  }

  // React to autoPlay / interval changes
  isAutoPlaying.on(playing => {
    if (playing) startAutoPlay()
    else stopAutoPlay()
  })

  interval.on(() => {
    if (isAutoPlaying.value) startAutoPlay()
  })

  // Touch/swipe state
  let touchStartX = 0
  let touchStartY = 0
  let touchDiffX = 0
  const SWIPE_THRESHOLD = 50

  // Translate offset for slide transition
  const translateX = prop('0%')

  currentIndex.on(idx => {
    const spv = Value.get(slidesPerView)
    const pct = -(idx * (100 / spv))
    translateX.set(`${pct}%`)
  })

  // Kick off initial translate
  {
    const spv = Value.get(slidesPerView)
    const pct = -(Value.get(currentIndex) * (100 / spv))
    translateX.set(`${pct}%`)
  }

  // Start autoplay if enabled
  if (Value.get(isAutoPlaying)) {
    startAutoPlay()
  }

  // Chevron icons
  function ChevronLeft() {
    return svg.svg(
      svgAttr.viewBox('0 0 24 24'),
      svgAttr.fill('none'),
      svgAttr.stroke('currentColor'),
      svgAttr['stroke-width'](2),
      svgAttr['stroke-linecap']('round'),
      svgAttr['stroke-linejoin']('round'),
      svg.path(svgAttr.d('M15 18l-6-6 6-6'))
    )
  }

  function ChevronRight() {
    return svg.svg(
      svgAttr.viewBox('0 0 24 24'),
      svgAttr.fill('none'),
      svgAttr.stroke('currentColor'),
      svgAttr['stroke-width'](2),
      svgAttr['stroke-linecap']('round'),
      svgAttr['stroke-linejoin']('round'),
      svg.path(svgAttr.d('M9 18l6-6-6-6'))
    )
  }

  // Build slide items
  const slides = children.map((child, i) =>
    html.div(
      attr.class('bc-carousel__slide'),
      attr.role('tabpanel'),
      aria.roledescription('slide'),
      aria.label(`Slide ${i + 1} of ${totalSlides}`),
      style.minWidth(slidesPerView.map(spv => `${100 / spv}%`)),
      style.flexShrink('0'),
      child
    )
  )

  // Dot indicators
  const dots = Array.from({ length: totalSlides }, (_, i) =>
    html.button(
      attr.class(
        currentIndex.map(cur =>
          `bc-carousel__dot${cur === i ? ' bc-carousel__dot--active' : ''}`
        )
      ),
      attr.type('button'),
      aria.label(`Go to slide ${i + 1}`),
      on.click(() => goTo(i)),
    )
  )

  return html.div(
    attr.class(
      transition.map(t => `bc-carousel bc-carousel--${t}`)
    ),
    attr.role('region'),
    aria.roledescription('carousel'),
    aria.label(options.ariaLabel ?? 'Carousel'),
    attr.tabindex(0),
    // Keyboard navigation
    WithElement(el => {
      const handleKeydown = (e: KeyboardEvent) => {
        if (!Value.get(keyboard)) return
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          prev()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          next()
        }
      }
      el.addEventListener('keydown', handleKeydown)
      return OnDispose(() => {
        el.removeEventListener('keydown', handleKeydown)
        stopAutoPlay()
      })
    }),
    on.mouseenter(() => isHovered.set(true)),
    on.mouseleave(() => isHovered.set(false)),
    // Touch events
    on.touchstart((e: TouchEvent) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
      touchDiffX = 0
    }),
    on.touchmove((e: TouchEvent) => {
      touchDiffX = e.touches[0].clientX - touchStartX
      const diffY = Math.abs(e.touches[0].clientY - touchStartY)
      // Only prevent default for horizontal swipes
      if (Math.abs(touchDiffX) > diffY) {
        e.preventDefault()
      }
    }),
    on.touchend(() => {
      if (Math.abs(touchDiffX) >= SWIPE_THRESHOLD) {
        if (touchDiffX > 0) prev()
        else next()
      }
    }),

    // Viewport
    html.div(
      attr.class('bc-carousel__viewport'),
      html.div(
        attr.class('bc-carousel__track'),
        style.transform(translateX.map(tx => `translateX(${tx})`)),
        style.transitionDuration(
          transitionDuration.map(d => `${d}ms`)
        ),
        ...slides
      )
    ),

    // Prev arrow
    When(
      showArrows,
      () =>
        html.button(
          attr.class('bc-carousel__arrow bc-carousel__arrow--prev'),
          attr.type('button'),
          aria.label('Previous slide'),
          on.click(() => prev()),
          ChevronLeft()
        )
    ),

    // Next arrow
    When(
      showArrows,
      () =>
        html.button(
          attr.class('bc-carousel__arrow bc-carousel__arrow--next'),
          attr.type('button'),
          aria.label('Next slide'),
          on.click(() => next()),
          ChevronRight()
        )
    ),

    // Dot indicators
    When(
      showDots,
      () =>
        html.div(
          attr.class('bc-carousel__dots'),
          attr.role('tablist'),
          aria.label('Slide navigation'),
          ...dots
        )
    )
  )
}

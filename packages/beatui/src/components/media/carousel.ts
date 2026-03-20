import {
  aria,
  attr,
  computedOf,
  Empty,
  html,
  on,
  OnDispose,
  prop,
  Signal,
  style,
  TNode,
  Use,
  Value,
  When,
  WithElement,
} from '@tempots/dom'
import { Icon } from '../data/icon'
import type { IconSize } from '../theme'
import { BeatUII18n } from '../../beatui-i18n'

/** Transition effect for slide changes. */
export type CarouselTransition = 'slide' | 'fade'

/** Indicator style for showing slide position. */
export type CarouselIndicator = 'dots' | 'progress' | 'fraction' | 'none'

/** Slide alignment when slidesPerView shows more slots than remaining slides. */
export type CarouselAlignment = 'start' | 'center' | 'end'

/** Controller for programmatic carousel control, returned by {@link createCarousel}. */
export interface CarouselController {
  /** Navigate to a specific slide index. */
  goTo: (index: number) => void
  /** Navigate to the next slide. */
  next: () => void
  /** Navigate to the previous slide. */
  prev: () => void
  /** Start auto-play. */
  play: () => void
  /** Stop auto-play. */
  pause: () => void
  /** Reactive signal indicating whether auto-play is active. */
  isPlaying: Signal<boolean>
  /** Reactive signal of the current slide index. */
  currentIndex: Signal<number>
  /** Total number of slides. */
  totalSlides: number
}

/** Configuration options for the {@link Carousel} and {@link createCarousel} components. */
export type CarouselOptions = {
  /** Index of the currently active slide. @default 0 */
  currentIndex?: Value<number>
  /** Enable auto-play rotation. @default false */
  autoPlay?: Value<boolean>
  /** Auto-play interval in milliseconds. @default 3000 */
  interval?: Value<number>
  /** Whether to loop infinitely. @default false */
  loop?: Value<boolean>
  /** Number of slides visible at once. @default 1 */
  slidesPerView?: Value<number>
  /** Transition effect. @default 'slide' */
  transition?: Value<CarouselTransition>
  /** Transition duration in milliseconds. @default 300 */
  transitionDuration?: Value<number>
  /** Show navigation arrows. @default true */
  showArrows?: Value<boolean>
  /** Pause auto-play on hover. @default true */
  pauseOnHover?: Value<boolean>
  /** Enable keyboard navigation. @default true */
  keyboard?: Value<boolean>
  /** Accessible label for the carousel. @default 'Carousel' */
  ariaLabel?: Value<string>
  /** Gap between slides (CSS units, e.g. '16px', '1rem'). @default '0px' */
  gap?: Value<string>
  /** Amount of next/prev slide to peek (CSS units, e.g. '40px', '10%'). @default '0px' */
  peekAmount?: Value<string>
  /** Slide alignment. @default 'start' */
  align?: Value<CarouselAlignment>
  /** CSS timing function for transitions. @default 'cubic-bezier(0.2, 0, 0, 1)' */
  easing?: Value<string>
  /** Indicator type. @default 'dots' */
  indicator?: Value<CarouselIndicator>
  /** Pixel threshold for mouse drag navigation. @default 50 */
  dragThreshold?: Value<number>
  /** Iconify icon name for the previous arrow. @default 'lucide:chevron-left' */
  prevIcon?: Value<string>
  /** Iconify icon name for the next arrow. @default 'lucide:chevron-right' */
  nextIcon?: Value<string>
  /** Size of the arrow icons. @default 'md' */
  arrowIconSize?: Value<IconSize>
  /** Called when the active slide changes. */
  onSlideChange?: (index: number) => void
  /** Called when auto-play state toggles. */
  onAutoPlayToggle?: (playing: boolean) => void
}

/**
 * Creates a carousel with an imperative controller for programmatic control.
 *
 * @param options - Carousel configuration
 * @param children - Slide content elements (each child is one slide)
 * @returns A tuple of [TNode, CarouselController]
 *
 * @example
 * ```typescript
 * const [carousel, ctrl] = createCarousel(
 *   { autoPlay: true, loop: true },
 *   html.div('Slide 1'),
 *   html.div('Slide 2'),
 *   html.div('Slide 3')
 * )
 * // Later: ctrl.goTo(2), ctrl.play(), ctrl.pause()
 * ```
 */
export function createCarousel(
  options: CarouselOptions,
  ...children: TNode[]
): [TNode, CarouselController] {
  const totalSlides = children.length
  if (totalSlides === 0) {
    const controller: CarouselController = {
      goTo: () => {},
      next: () => {},
      prev: () => {},
      play: () => {},
      pause: () => {},
      isPlaying: prop(false),
      currentIndex: prop(0),
      totalSlides: 0,
    }
    return [Empty, controller]
  }

  const currentIndex = prop(Value.get(options.currentIndex ?? 0))
  const autoPlay = Value.toSignal(options.autoPlay ?? false)
  const interval = Value.toSignal(options.interval ?? 3000)
  const loop = Value.toSignal(options.loop ?? false)
  const slidesPerView = Value.toSignal(options.slidesPerView ?? 1)
  const transition = Value.toSignal(options.transition ?? 'slide')
  const transitionDuration = Value.toSignal(options.transitionDuration ?? 300)
  const showArrows = Value.toSignal(options.showArrows ?? true)
  const pauseOnHover = Value.toSignal(options.pauseOnHover ?? true)
  const keyboard = Value.toSignal(options.keyboard ?? true)
  const gap = Value.toSignal(options.gap ?? '0px')
  const peekAmount = Value.toSignal(options.peekAmount ?? '0px')
  const align = Value.toSignal(options.align ?? 'start')
  const easing = Value.toSignal(options.easing ?? 'cubic-bezier(0.2, 0, 0, 1)')
  const dragThreshold = Value.toSignal(options.dragThreshold ?? 50)

  const indicator = Value.toSignal(
    options.indicator ?? ('dots' as CarouselIndicator)
  )

  const isHovered = prop(false)
  const isAutoPlaying = prop(Value.get(autoPlay))

  // Sync external autoPlay signal
  autoPlay.on(v => isAutoPlaying.set(v))

  const maxIndex = prop(Math.max(0, totalSlides - Value.get(slidesPerView)))
  slidesPerView.on(spv => {
    maxIndex.set(Math.max(0, totalSlides - spv))
  })

  // Disabled arrow states
  const prevDisabled = computedOf(
    currentIndex,
    loop
  )((idx, l) => !l && idx === 0)
  const nextDisabled = computedOf(
    currentIndex,
    loop,
    maxIndex
  )((idx, l, max) => !l && idx >= max)

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

  function play() {
    isAutoPlaying.set(true)
    options.onAutoPlayToggle?.(true)
  }

  function pause() {
    isAutoPlaying.set(false)
    options.onAutoPlayToggle?.(false)
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

  // Drag state
  let isDragging = false
  let dragStartX = 0
  let dragDiffX = 0
  let didDrag = false

  // Translate offset for slide transition (disabled in fade mode)
  const translateX = prop('0%')

  function computeTranslate(idx: number): string {
    if (Value.get(transition) === 'fade') return '0%'
    const spv = Value.get(slidesPerView)
    const g = Value.get(gap)
    const pct = -(idx * (100 / spv))
    if (g === '0px' || g === '0') {
      return `${pct}%`
    }
    return `calc(${pct}% - ${idx} * ${g})`
  }

  currentIndex.on(idx => {
    translateX.set(computeTranslate(idx))
  })

  // Reset translate when switching to/from fade
  transition.on(() => {
    translateX.set(computeTranslate(currentIndex.value))
  })

  // Kick off initial translate
  translateX.set(computeTranslate(Value.get(currentIndex)))

  // Arrow icons
  const prevIconName = options.prevIcon ?? 'lucide:chevron-left'
  const nextIconName = options.nextIcon ?? 'lucide:chevron-right'
  const arrowIconSize = options.arrowIconSize ?? 'md'

  // Compute slide minWidth accounting for gap
  const slideMinWidthBase = computedOf(
    slidesPerView,
    gap
  )((spv, g) => {
    if (g === '0px' || g === '0') {
      return `${100 / spv}%`
    }
    return `calc((100% - ${spv - 1} * ${g}) / ${spv})`
  })

  // In fade mode: the first slide always stays in flow (position: relative)
  // to maintain the track's intrinsic width and height. All other slides are
  // position: absolute, stacked on top. Only the active slide has opacity: 1.
  // In slide mode: all slides use normal flex layout with translateX.
  const isFade = transition.map(t => t === 'fade')

  // Alignment mapping
  const justifyContent = align.map((a): string => {
    switch (a) {
      case 'center':
        return 'center'
      case 'end':
        return 'flex-end'
      default:
        return 'flex-start'
    }
  })

  const controller: CarouselController = {
    goTo,
    next,
    prev,
    play,
    pause,
    isPlaying: isAutoPlaying,
    currentIndex,
    totalSlides,
  }

  const node = Use(BeatUII18n, t => {
    const slides = children.map((child, i) => {
      const slideOpacity = computedOf(
        isFade,
        currentIndex
      )((fade, cur): string => {
        if (!fade) return ''
        return cur === i ? '1' : '0'
      })

      // First slide stays in flow to provide dimensions; others are absolute
      const slidePosition = isFade.map((f): string =>
        f ? (i === 0 ? 'relative' : 'absolute') : ''
      )
      const slideInset = isFade.map((f): string => (f && i !== 0 ? '0' : ''))

      return html.div(
        attr.class('bc-carousel__slide'),
        attr.class(
          currentIndex.map((cur): string =>
            cur === i ? 'bc-carousel__slide--active' : ''
          )
        ),
        attr.role('tabpanel'),
        aria.roledescription('slide'),
        aria.label(
          t.$.carousel.$.slideOfTotal.map(fn => fn(i + 1, totalSlides))
        ),
        style.minWidth(slideMinWidthBase),
        style.flexShrink('0'),
        style.opacity(slideOpacity),
        style.position(slidePosition),
        style.inset(slideInset),
        child
      )
    })

    // Dot indicators
    const dots = Array.from({ length: totalSlides }, (_, i) =>
      html.button(
        attr.class(
          currentIndex.map(
            cur =>
              `bc-carousel__dot${cur === i ? ' bc-carousel__dot--active' : ''}`
          )
        ),
        attr.type('button'),
        aria.label(t.$.carousel.$.goToSlide.map(fn => fn(i + 1))),
        on.click(() => goTo(i))
      )
    )

    return html.div(
      attr.class(transition.map(t => `bc-carousel bc-carousel--${t}`)),
      attr.role('region'),
      aria.roledescription('carousel'),
      aria.label(
        options.ariaLabel != null ? options.ariaLabel : t.$.carousel.$.label
      ),
      attr.tabindex(0),
      // Set peek CSS variable for arrow positioning
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

        // Drag handling (mouse) — listeners on window for drag beyond carousel bounds
        const handleMouseMove = (e: MouseEvent) => {
          if (!isDragging) return
          dragDiffX = e.clientX - dragStartX
        }
        const handleMouseUp = () => {
          if (!isDragging) return
          isDragging = false
          el.classList.remove('bc-carousel--dragging')
          if (Math.abs(dragDiffX) >= Value.get(dragThreshold)) {
            didDrag = true
            if (dragDiffX > 0) prev()
            else next()
          } else if (Math.abs(dragDiffX) > 5) {
            didDrag = true
          }
          // Reset didDrag after a tick to block click events from the drag
          if (didDrag) {
            requestAnimationFrame(() => {
              didDrag = false
            })
          }
        }
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)

        return OnDispose(() => {
          el.removeEventListener('keydown', handleKeydown)
          window.removeEventListener('mousemove', handleMouseMove)
          window.removeEventListener('mouseup', handleMouseUp)
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

      // Viewport — capture width before fade switch to prevent collapse
      html.div(
        attr.class('bc-carousel__viewport'),
        style.paddingLeft(peekAmount),
        style.paddingRight(peekAmount),
        WithElement(viewportEl => {
          transition.on(t => {
            if (t === 'fade') {
              // Lock the viewport width to prevent collapse when slides become absolute
              viewportEl.style.minWidth = `${viewportEl.offsetWidth}px`
            } else {
              viewportEl.style.minWidth = ''
            }
          })
          return OnDispose(() => {})
        }),
        // Mouse drag start
        on.mousedown((e: MouseEvent) => {
          isDragging = true
          dragStartX = e.clientX
          dragDiffX = 0
          didDrag = false
          e.preventDefault()
        }),
        // Block clicks that result from drag
        on.click((e: MouseEvent) => {
          if (didDrag) {
            e.preventDefault()
            e.stopPropagation()
          }
        }),
        html.div(
          attr.class('bc-carousel__track'),
          style.position(isFade.map((f): string => (f ? 'relative' : ''))),
          style.transform(translateX.map(tx => `translateX(${tx})`)),
          style.transitionDuration(transitionDuration.map(d => `${d}ms`)),
          style.transitionTimingFunction(easing),
          style.gap(gap),
          style.justifyContent(justifyContent),
          ...slides
        )
      ),

      // Prev arrow
      When(showArrows, () =>
        html.button(
          attr.class('bc-carousel__arrow bc-carousel__arrow--prev'),
          attr.class(
            prevDisabled.map((d): string =>
              d ? 'bc-carousel__arrow--disabled' : ''
            )
          ),
          attr.type('button'),
          attr.disabled(prevDisabled),
          aria.label(t.$.carousel.$.previousSlide),
          on.click(() => prev()),
          Icon({
            icon: prevIconName,
            size: arrowIconSize,
            accessibility: 'decorative',
          })
        )
      ),

      // Next arrow
      When(showArrows, () =>
        html.button(
          attr.class('bc-carousel__arrow bc-carousel__arrow--next'),
          attr.class(
            nextDisabled.map((d): string =>
              d ? 'bc-carousel__arrow--disabled' : ''
            )
          ),
          attr.type('button'),
          attr.disabled(nextDisabled),
          aria.label(t.$.carousel.$.nextSlide),
          on.click(() => next()),
          Icon({
            icon: nextIconName,
            size: arrowIconSize,
            accessibility: 'decorative',
          })
        )
      ),

      // Indicators
      When(
        indicator.map(i => i === 'dots'),
        () =>
          html.div(
            attr.class('bc-carousel__dots'),
            attr.role('tablist'),
            aria.label(t.$.carousel.$.slideNavigation),
            ...dots
          )
      ),

      When(
        indicator.map(i => i === 'progress'),
        () =>
          html.div(
            attr.class('bc-carousel__progress'),
            attr.role('progressbar'),
            aria.valuemin(0),
            aria.valuemax(100),
            aria.valuenow(
              currentIndex.map(idx =>
                Math.round(((idx + 1) / totalSlides) * 100)
              )
            ),
            html.div(
              attr.class('bc-carousel__progress-fill'),
              style.width(
                currentIndex.map(idx => `${((idx + 1) / totalSlides) * 100}%`)
              )
            )
          )
      ),

      When(
        indicator.map(i => i === 'fraction'),
        () =>
          html.div(
            attr.class('bc-carousel__fraction'),
            aria.live('polite'),
            currentIndex.map(idx => `${idx + 1} / ${totalSlides}`)
          )
      )
    )
  })

  return [node, controller]
}

/**
 * A fully-featured carousel component for cycling through slide content.
 *
 * Supports auto-play, touch/swipe, mouse drag, keyboard navigation, multiple
 * transition effects, and accessible ARIA attributes.
 *
 * For programmatic control, use {@link createCarousel} instead which returns
 * a controller alongside the component.
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
export function Carousel(
  options: CarouselOptions,
  ...children: TNode[]
): TNode {
  return createCarousel(options, ...children)[0]
}

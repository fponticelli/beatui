import { Carousel, createCarousel } from '@tempots/beatui'
import type { CarouselOptions } from '@tempots/beatui'
import { html, attr, on, style, Value, prop } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Carousel',
  category: 'Media',
  component: 'Carousel',
  description:
    'A fully-featured carousel for cycling through slide content with auto-play, drag, swipe, and keyboard navigation.',
  icon: 'lucide:gallery-horizontal',
  order: 10,
}

function SampleSlide(label: string, color: string) {
  return html.div(
    attr.class(
      'flex items-center justify-center text-xl font-semibold text-white rounded-lg select-none'
    ),
    style.backgroundColor(color),
    style.height('200px'),
    label
  )
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

export default function CarouselPage() {
  return ComponentPage(meta, {
    playground: manualPlayground(
      'Carousel',
      (signals: CarouselOptions) => {
        const [carousel, ctrl] = createCarousel(
          signals,
          SampleSlide('Slide 1', COLORS[0]),
          SampleSlide('Slide 2', COLORS[1]),
          SampleSlide('Slide 3', COLORS[2]),
          SampleSlide('Slide 4', COLORS[3]),
          SampleSlide('Slide 5', COLORS[4])
        )

        const btnClass =
          'px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'

        return html.div(
          attr.class('w-full max-w-lg space-y-3'),
          carousel,
          html.div(
            attr.class('flex flex-wrap gap-2'),
            html.button(
              attr.class(btnClass),
              on.click(() => {
                if (Value.get(ctrl.isPlaying)) ctrl.pause()
                else ctrl.play()
              }),
              ctrl.isPlaying.map((v): string => (v ? 'Pause' : 'Play'))
            ),
            html.button(
              attr.class(btnClass),
              on.click(() => ctrl.prev()),
              'Prev'
            ),
            html.button(
              attr.class(btnClass),
              on.click(() => ctrl.next()),
              'Next'
            )
          )
        )
      },
      { defaults: { loop: true } }
    ),
    sections: [
      Section(
        'Basic Usage',
        () =>
          html.div(
            attr.class('max-w-lg'),
            Carousel(
              { ariaLabel: 'Basic carousel' },
              SampleSlide('First', COLORS[0]),
              SampleSlide('Second', COLORS[1]),
              SampleSlide('Third', COLORS[2])
            )
          ),
        'A simple carousel with default navigation arrows and dot indicators. Supports mouse drag and touch swipe.'
      ),
      Section(
        'Auto-Play',
        () =>
          html.div(
            attr.class('max-w-lg'),
            Carousel(
              {
                autoPlay: true,
                interval: 2000,
                loop: true,
                pauseOnHover: true,
                ariaLabel: 'Auto-play carousel',
              },
              SampleSlide('Slide A', COLORS[4]),
              SampleSlide('Slide B', COLORS[3]),
              SampleSlide('Slide C', COLORS[2]),
              SampleSlide('Slide D', COLORS[1])
            )
          ),
        'Auto-play rotates slides at a configurable interval. Pauses on hover by default.'
      ),
      Section(
        'Gap & Peek',
        () =>
          html.div(
            attr.class('max-w-2xl'),
            Carousel(
              {
                slidesPerView: 2,
                gap: '16px',
                peekAmount: '40px',
                loop: true,
                ariaLabel: 'Gap and peek carousel',
              },
              ...COLORS.map((c, i) => SampleSlide(`Card ${i + 1}`, c))
            )
          ),
        'Use gap for spacing between slides and peekAmount to show partial next/prev slides at the edges.'
      ),
      Section(
        'Multiple Slides Per View',
        () =>
          html.div(
            attr.class('max-w-2xl'),
            Carousel(
              {
                slidesPerView: 3,
                gap: '12px',
                indicator: 'none',
                ariaLabel: 'Multi-slide carousel',
              },
              ...COLORS.map((c, i) => SampleSlide(`${i + 1}`, c))
            )
          ),
        'Show multiple slides simultaneously by setting slidesPerView. Useful for card-based layouts.'
      ),
      Section(
        'Indicator Types',
        () =>
          html.div(
            attr.class('max-w-lg space-y-6'),
            html.div(
              html.p(
                attr.class('text-sm text-gray-500 dark:text-gray-400 mb-2'),
                'Progress bar:'
              ),
              Carousel(
                {
                  indicator: 'progress',
                  ariaLabel: 'Progress indicator carousel',
                },
                SampleSlide('Slide 1', COLORS[0]),
                SampleSlide('Slide 2', COLORS[1]),
                SampleSlide('Slide 3', COLORS[2])
              )
            ),
            html.div(
              html.p(
                attr.class('text-sm text-gray-500 dark:text-gray-400 mb-2'),
                'Fraction:'
              ),
              Carousel(
                {
                  indicator: 'fraction',
                  ariaLabel: 'Fraction indicator carousel',
                },
                SampleSlide('Slide 1', COLORS[3]),
                SampleSlide('Slide 2', COLORS[4]),
                SampleSlide('Slide 3', COLORS[0])
              )
            )
          ),
        'Choose between dots (default), progress bar, fraction text, or none.'
      ),
      Section(
        'Controller API',
        () => {
          const [carousel, ctrl] = createCarousel(
            {
              showArrows: false,
              indicator: 'fraction',
              ariaLabel: 'Controller demo carousel',
            },
            SampleSlide('Slide 1', COLORS[0]),
            SampleSlide('Slide 2', COLORS[1]),
            SampleSlide('Slide 3', COLORS[2]),
            SampleSlide('Slide 4', COLORS[3])
          )

          const btnClass =
            'px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'

          return html.div(
            attr.class('max-w-lg space-y-3'),
            carousel,
            html.div(
              attr.class('flex gap-2'),
              html.button(
                attr.class(btnClass),
                on.click(() => ctrl.prev()),
                'Prev'
              ),
              html.button(
                attr.class(btnClass),
                on.click(() => ctrl.next()),
                'Next'
              ),
              html.button(
                attr.class(btnClass),
                on.click(() => ctrl.goTo(0)),
                'Go to first'
              ),
              html.button(
                attr.class(btnClass),
                on.click(() => ctrl.goTo(ctrl.totalSlides - 1)),
                'Go to last'
              )
            )
          )
        },
        'Use createCarousel() to get a controller for programmatic navigation with goTo(), next(), prev(), play(), and pause().'
      ),
      Section(
        'Slide Change Callback',
        () => {
          const log = prop<string[]>([])
          const addLog = (idx: number) =>
            log.set([`Moved to slide ${idx + 1}`, ...log.value.slice(0, 4)])

          return html.div(
            attr.class('max-w-lg space-y-3'),
            Carousel(
              {
                onSlideChange: addLog,
                ariaLabel: 'Callback demo carousel',
              },
              SampleSlide('Slide 1', COLORS[0]),
              SampleSlide('Slide 2', COLORS[1]),
              SampleSlide('Slide 3', COLORS[2])
            ),
            html.div(
              attr.class(
                'bg-gray-900 rounded-lg p-3 font-mono text-xs text-green-400 min-h-[60px]'
              ),
              log.map(entries =>
                entries.length === 0
                  ? 'Navigate to see events...'
                  : entries.join('\n')
              )
            )
          )
        },
        'The onSlideChange callback fires whenever the active slide changes, providing the new index.'
      ),
    ],
  })
}

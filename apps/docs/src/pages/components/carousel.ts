import { Carousel } from '@tempots/beatui'
import { html, attr, on, prop, style } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Carousel',
  category: 'Media',
  component: 'Carousel',
  description:
    'A fully-featured carousel for cycling through slide content with auto-play, swipe support, and keyboard navigation.',
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
      () => {
        const autoPlay = prop(false)
        const loop = prop(true)

        return html.div(
          attr.class('w-full max-w-lg space-y-3'),
          Carousel(
            {
              autoPlay,
              loop,
              interval: 2500,
              showArrows: true,
              showDots: true,
              ariaLabel: 'Demo carousel',
            },
            SampleSlide('Slide 1', COLORS[0]),
            SampleSlide('Slide 2', COLORS[1]),
            SampleSlide('Slide 3', COLORS[2]),
            SampleSlide('Slide 4', COLORS[3]),
            SampleSlide('Slide 5', COLORS[4])
          ),
          html.div(
            attr.class('flex gap-2'),
            html.button(
              attr.class(
                'px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              ),
              on.click(() => autoPlay.set(!autoPlay.value)),
              autoPlay.map((v): string => (v ? 'Stop Auto-Play' : 'Start Auto-Play'))
            ),
            html.button(
              attr.class(
                'px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              ),
              on.click(() => loop.set(!loop.value)),
              loop.map((v): string => (v ? 'Disable Loop' : 'Enable Loop'))
            )
          )
        )
      },
      { defaults: {} }
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
        'A simple carousel with default navigation arrows and dot indicators.'
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
        'Multiple Slides Per View',
        () =>
          html.div(
            attr.class('max-w-2xl'),
            Carousel(
              {
                slidesPerView: 3,
                showDots: false,
                ariaLabel: 'Multi-slide carousel',
              },
              ...COLORS.map((c, i) => SampleSlide(`${i + 1}`, c))
            )
          ),
        'Show multiple slides simultaneously by setting slidesPerView. Useful for card-based layouts.'
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

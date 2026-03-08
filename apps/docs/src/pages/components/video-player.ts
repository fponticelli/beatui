import { BaseVideoPlayer } from '@tempots/beatui'
import { html, attr, on, prop, style, MapSignal } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'BaseVideoPlayer',
  category: 'Media',
  component: 'BaseVideoPlayer',
  description:
    'A unified video player supporting HTML5 video files, HLS streams, and YouTube URLs. Provides a consistent API across providers with reactive controls and playback callbacks.',
  icon: 'lucide:play-circle',
  order: 9,
}

// A short public-domain video from archive.org
const SAMPLE_VIDEO_URL = 'https://www.w3schools.com/html/mov_bbb.mp4'
const SAMPLE_YOUTUBE_URL = 'https://www.youtube.com/watch?v=LXb3EKWsInQ'

export default function VideoPlayerPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('BaseVideoPlayer', signals => {
      const url = prop<string | null>(SAMPLE_VIDEO_URL)
      const playing = prop(false)

      return html.div(
        attr.class('w-full max-w-lg space-y-3'),
        html.div(
          attr.class('rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-black'),
          BaseVideoPlayer({
            url,
            playing,
            controls: signals.controls,
            muted: signals.muted,
            loop: signals.loop,
            width: '100%',
            height: '240',
          })
        ),
        html.div(
          attr.class('flex gap-2'),
          html.button(
            attr.class('px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'),
            on.click(() => url.set(SAMPLE_VIDEO_URL)),
            'MP4 file'
          ),
          html.button(
            attr.class('px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'),
            on.click(() => url.set(SAMPLE_YOUTUBE_URL)),
            'YouTube'
          )
        )
      )
    }),
    sections: [
      Section(
        'HTML5 Video File',
        () => {
          const playing = prop(false)
          return html.div(
            attr.class('space-y-2'),
            html.div(
              attr.class('rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-black'),
              BaseVideoPlayer({
                url: SAMPLE_VIDEO_URL,
                playing,
                controls: true,
                width: '100%',
                height: '240',
              })
            ),
            html.p(
              attr.class('text-xs text-gray-400'),
              'Native HTML5 video with browser-native controls enabled.'
            )
          )
        },
        'Pass any direct video file URL. Supports MP4, WebM, Ogg, and HLS (.m3u8) streams.'
      ),
      Section(
        'YouTube Embed',
        () =>
          html.div(
            attr.class('space-y-2'),
            html.div(
              attr.class('rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700'),
              style.width('100%'),
              style.height('240px'),
              BaseVideoPlayer({
                url: SAMPLE_YOUTUBE_URL,
                controls: true,
                width: '100%',
                height: '240',
              })
            ),
            html.p(
              attr.class('text-xs text-gray-400'),
              'YouTube URLs are automatically detected and embedded via the YouTube IFrame API.'
            )
          ),
        'Pass a youtube.com or youtu.be URL and the player will automatically use the YouTube IFrame API without any additional dependencies.'
      ),
      Section(
        'Reactive Controls',
        () => {
          const playing = prop(false)
          const muted = prop(true)
          const loop = prop(false)
          const duration = prop(0)
          const played = prop(0)

          return html.div(
            attr.class('space-y-3 max-w-sm'),
            html.div(
              attr.class('rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-black'),
              BaseVideoPlayer({
                url: SAMPLE_VIDEO_URL,
                playing,
                muted,
                loop,
                width: '100%',
                height: '180',
                onDuration: (d) => duration.set(d),
                onProgress: (p) => played.set(p.playedSeconds),
              })
            ),
            html.div(
              attr.class('grid grid-cols-3 gap-2 text-sm'),
              html.button(
                attr.class('px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'),
                on.click(() => playing.set(!playing.value)),
                playing.map((p): string => p ? 'Pause' : 'Play')
              ),
              html.button(
                attr.class('px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'),
                on.click(() => muted.set(!muted.value)),
                muted.map((m): string => m ? 'Unmute' : 'Mute')
              ),
              html.button(
                attr.class('px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'),
                on.click(() => loop.set(!loop.value)),
                loop.map((l): string => l ? 'No loop' : 'Loop')
              )
            ),
            html.div(
              attr.class('text-xs text-gray-400 font-mono'),
              played.map(s => `Time: ${s.toFixed(1)}s / `),
              duration.map(d => `${d.toFixed(1)}s`)
            )
          )
        },
        'All playback properties are reactive signals. Control playing, muted, loop, volume, and playback rate programmatically.'
      ),
      Section(
        'Callbacks',
        () =>
          html.div(
            attr.class('space-y-3 max-w-sm'),
            (() => {
              const events = prop<string[]>([])
              const addEvent = (msg: string) => {
                events.set([msg, ...events.value.slice(0, 4)])
              }
              return html.div(
                html.div(
                  attr.class('rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-black'),
                  BaseVideoPlayer({
                    url: SAMPLE_VIDEO_URL,
                    controls: true,
                    muted: true,
                    width: '100%',
                    height: '160',
                    onPlay: () => addEvent('onPlay'),
                    onPause: () => addEvent('onPause'),
                    onEnded: () => addEvent('onEnded'),
                    onBuffer: () => addEvent('onBuffer'),
                    onBufferEnd: () => addEvent('onBufferEnd'),
                    onReady: () => addEvent('onReady'),
                  })
                ),
                html.div(
                  attr.class('bg-gray-900 rounded-lg p-3 font-mono text-xs text-green-400 min-h-[80px]'),
                  MapSignal(events, list =>
                    list.length === 0
                      ? html.span(attr.class('text-gray-600'), 'Interact with the player to see events...')
                      : html.div(
                          attr.class('space-y-0.5'),
                          ...list.map(e => html.div(e))
                        )
                  )
                )
              )
            })()
          ),
        'Lifecycle callbacks fire for play, pause, buffer, ready, and ended events across all provider types.'
      ),
    ],
  })
}

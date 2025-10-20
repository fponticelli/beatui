import { ScrollablePanel, Stack, BaseVideoPlayer } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'

export default function VideoPlayerPage() {
  return ScrollablePanel({
    body: Stack(
      attr.class('items-start gap-1 p-4'),

      html.h2(attr.class('text-2xl font-semibold'), 'Video Player'),
      html.p(
        'Base video player with file, YouTube and HLS support (lazy-loaded).'
      ),

      // Base (File)
      html.h3(
        attr.class('text-xl font-semibold pt-4'),
        'BaseVideoPlayer — File'
      ),
      BaseVideoPlayer({
        url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        controls: true,
        playing: false,
        volume: 0.8,
      }),

      // Base (YouTube)
      html.h3(
        attr.class('text-xl font-semibold pt-4'),
        'BaseVideoPlayer — YouTube'
      ),
      BaseVideoPlayer({
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        playing: false,
        controls: true,
      }),

      // Base (HLS)
      html.h3(
        attr.class('text-xl font-semibold pt-4'),
        'BaseVideoPlayer — HLS (.m3u8)'
      ),
      BaseVideoPlayer({
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        controls: true,
        playing: false,
      })
    ),
  })
}

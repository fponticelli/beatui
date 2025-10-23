import {
  Button,
  Lightbox,
  Stack,
  Label,
  SegmentedInput,
  Switch,
  OverlayEffect,
  ScrollablePanel,
  Group,
  InputWrapper,
} from '@tempots/beatui'
import { html, attr, prop, style } from '@tempots/dom'
import { ControlsHeader } from '../elements/controls-header'

type PaddingSize = 0 | 16 | 32 | 64 | 128

export default function LightboxPage() {
  const dismissable = prop(true)
  const showCloseButton = prop(true)
  const overlayEffect = prop<OverlayEffect>('opaque')
  const padding = prop<number>(32)

  return ScrollablePanel({
    header: ControlsHeader(
      Stack(
        Label('Overlay Effect'),
        SegmentedInput({
          size: 'sm',
          options: {
            opaque: 'Opaque',
            transparent: 'Transparent',
            none: 'None',
          },
          value: overlayEffect,
          onChange: overlayEffect.set,
        })
      ),
      Stack(
        Label('Padding'),
        SegmentedInput({
          size: 'sm',
          options: {
            0: '0',
            16: '16',
            32: '32',
            64: '64',
            128: '128',
          },
          // SegmentedInput works with string keys; coerce via String and Number
          value: padding.map(v => v as PaddingSize),
          onChange: v => padding.set(v),
        })
      ),
      InputWrapper({
        label: 'Dismissable',
        content: Switch({
          value: dismissable,
          onChange: dismissable.set,
        }),
      }),
      InputWrapper({
        label: 'Show Close Button',
        content: Switch({
          value: showCloseButton,
          onChange: showCloseButton.set,
        }),
      })
    ),
    body: Stack(
      attr.class('items-start gap-1 p-4'),

      // Basic image example
      html.h3(attr.class('text-xl font-semibold pt-4'), 'Image Lightbox'),
      html.p(
        'Opens a large image capped by the viewport; overflow is clipped (no scaling).'
      ),
      Lightbox(
        { dismissable, showCloseButton, overlayEffect, padding },
        (open, _close) =>
          Button(
            {
              variant: 'filled',
              onClick: () =>
                open(
                  html.img(
                    attr.alt('Large image demo'),
                    // Intentionally large image to demonstrate scaling
                    attr.src('https://picsum.photos/2000/1400'),
                    attr.class('block w-auto max-w-full max-height-full')
                  )
                ),
            },
            'Open Image Lightbox'
          )
      ),

      // Arbitrary content example
      html.h3(
        attr.class('text-xl font-semibold pt-4'),
        'Arbitrary Content Lightbox'
      ),
      html.p('Any TNode content can be displayed, not just images.'),
      Lightbox(
        { dismissable, showCloseButton, overlayEffect, padding },
        (open, close) =>
          Button(
            {
              variant: 'outline',
              onClick: () =>
                open(
                  html.div(
                    attr.class(
                      'bg-white dark:bg-gray-800 rounded shadow-lg p-4'
                    ),
                    html.h2(
                      attr.class('text-xl font-semibold mb-2'),
                      'Product Card'
                    ),
                    html.div(
                      attr.class('flex gap-4 items-stretch'),
                      html.img(
                        attr.alt('Placeholder'),
                        attr.src('https://picsum.photos/800/600'),
                        attr.class('rounded'),
                        style.maxWidth('none')
                      ),
                      html.div(
                        attr.class(
                          'h-full max-w-[480px] flex flex-col gap-2 justify-between'
                        ),
                        html.div(
                          html.p(
                            'This is a larger-than-viewport card with rich content. The Lightbox caps its max size to the viewport and clips overflow (no scaling).'
                          ),
                          html.ul(
                            html.li('• Feature A'),
                            html.li('• Feature B'),
                            html.li('• Feature C')
                          )
                        ),
                        Group(
                          attr.class('justify-end mt-2'),
                          Button({ variant: 'filled', onClick: close }, 'Close')
                        )
                      )
                    )
                  )
                ),
            },
            'Open Content Lightbox'
          )
      ),

      // Video example
      html.h3(attr.class('text-xl font-semibold pt-4'), 'Video Lightbox'),
      html.p('Supports videos as well (capped to viewport; overflow clipped).'),
      Lightbox(
        { dismissable, showCloseButton, overlayEffect, padding },
        (open, _close) =>
          Button(
            {
              variant: 'filled',
              color: 'primary',
              onClick: () =>
                open(
                  html.video(
                    attr.controls('true'),
                    attr.autoplay(false),
                    attr.loop('false'),
                    attr.class('rounded bg-black'),
                    style.maxWidth('none'),
                    html.source(
                      attr.src(
                        'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm'
                      ),
                      attr.type('video/webm')
                    ),
                    html.source(
                      attr.src(
                        'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
                      ),
                      attr.type('video/mp4')
                    ),
                    html.p(
                      'Your browser does not support HTML5 video. Here is a ',
                      html.a(
                        attr.href(
                          'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm'
                        ),
                        'link to the video'
                      ),
                      '.'
                    )
                  )
                ),
            },
            'Open Video Lightbox'
          )
      )
    ),
  })
}

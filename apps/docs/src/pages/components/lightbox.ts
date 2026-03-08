import { Lightbox, Button, Icon } from '@tempots/beatui'
import { html, attr, Value } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Lightbox',
  category: 'Overlays',
  component: 'Lightbox',
  description:
    'A full-screen overlay for displaying images or arbitrary content centered over a dark backdrop with dismiss support.',
  icon: 'lucide:maximize',
  order: 8,
}

export default function LightboxPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Lightbox', signals =>
      Lightbox(
        {
          dismissable: signals.dismissable as Value<boolean>,
          showCloseButton: signals.showCloseButton as Value<boolean>,
          overlayEffect: signals.overlayEffect as Value<'none' | 'transparent' | 'opaque'>,
          padding: signals.padding as Value<number>,
        },
        (open, _close) =>
          Button(
            {
              variant: 'outline',
              onClick: () =>
                open(
                  html.div(
                    attr.class(
                      'bg-white dark:bg-gray-900 rounded-xl p-8 max-w-lg w-full mx-auto shadow-2xl'
                    ),
                    html.div(
                      attr.class('flex items-center gap-3 mb-4'),
                      Icon({ icon: 'lucide:image', size: 'lg', color: 'primary' }),
                      html.h2(attr.class('text-xl font-bold'), 'Lightbox Preview')
                    ),
                    html.p(
                      attr.class('text-gray-500 mb-4'),
                      'Any content can be displayed in a lightbox overlay. Click outside or press Escape to close.'
                    ),
                    html.div(
                      attr.class('w-full h-48 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-semibold'),
                      'Image Placeholder'
                    )
                  )
                ),
            },
            'Open Lightbox'
          )
      )
    ),
    sections: [
      Section(
        'Custom Padding',
        () =>
          Lightbox(
            { padding: 64 },
            (open, _close) =>
              Button(
                {
                  variant: 'light',
                  onClick: () =>
                    open(
                      html.div(
                        attr.class(
                          'bg-white dark:bg-gray-900 rounded-xl p-6 text-center'
                        ),
                        html.p('Content with 64px padding from viewport edges.')
                      )
                    ),
                },
                'Open with Custom Padding'
              )
          ),
        'Control the padding around the content with the padding option.'
      ),
      Section(
        'Non-dismissable',
        () =>
          Lightbox(
            { dismissable: false, showCloseButton: false },
            (open, close) =>
              Button(
                {
                  variant: 'filled',
                  color: 'warning',
                  onClick: () =>
                    open(
                      html.div(
                        attr.class(
                          'bg-white dark:bg-gray-900 rounded-xl p-8 text-center max-w-sm'
                        ),
                        html.h3(attr.class('font-bold mb-3'), 'Confirm Action'),
                        html.p(
                          attr.class('text-sm text-gray-500 mb-4'),
                          'This lightbox cannot be dismissed by clicking outside.'
                        ),
                        Button({ variant: 'filled', color: 'primary', onClick: close }, 'Acknowledge')
                      )
                    ),
                },
                'Non-dismissable Lightbox'
              )
          ),
        'Set dismissable to false and showCloseButton to false to prevent closing except by explicit action.'
      ),
    ],
  })
}

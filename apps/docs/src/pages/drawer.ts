import {
  Button,
  Drawer,
  Stack,
  Label,
  SegmentedInput,
  TextInput,
  Icon,
  Switch,
  Group,
  OverlayEffect,
  ScrollablePanel,
  InputWrapper,
} from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ControlsHeader } from '../elements/controls-header'

type DrawerSize = 'sm' | 'md' | 'lg' | 'xl'
type DrawerSide =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'inline-start'
  | 'inline-end'
  | 'inline-start'
  | 'inline-end'

export default function DrawerPage() {
  const size = prop<DrawerSize>('md')
  const dismissable = prop(true)
  const showCloseButton = prop(true)
  const title = prop('Drawer Title')
  const overlayEffect = prop<OverlayEffect>('opaque')
  const side = prop<DrawerSide>('right')

  return ScrollablePanel({
    header: ControlsHeader(
      // Size Control
      Stack(
        Label('Size'),
        SegmentedInput({
          value: size,
          options: {
            sm: 'Small',
            md: 'Medium',
            lg: 'Large',
            xl: 'Extra Large',
          },
          onChange: size.set,
        })
      ),
      // Side Control
      Stack(
        Label('Side'),
        SegmentedInput({
          value: side,
          options: {
            top: 'Top',
            right: 'Right',
            bottom: 'Bottom',
            left: 'Left',
            'inline-start': 'Inline Start',
            'inline-end': 'Inline End',
          },
          onChange: side.set,
        })
      ),
      // Overlay Effect Control
      Stack(
        Label('Overlay Effect'),
        SegmentedInput({
          value: overlayEffect,
          options: {
            transparent: 'Transparent',
            opaque: 'Opaque',
            none: 'None',
          },
          onChange: overlayEffect.set,
        })
      ),
      // Title Input
      Stack(
        Label('Title'),
        TextInput({ value: title, placeholder: 'Enter drawer title' })
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

      // Basic Drawer Example
      html.h3(attr.class('text-xl font-semibold pt-4'), 'Basic Drawer'),
      html.p(
        'A slide-out panel that can be anchored to any side of the viewport or element.'
      ),
      Drawer((open, _close) =>
        Button(
          {
            variant: 'filled',
            onClick: () =>
              open({
                size,
                side,
                dismissable,
                showCloseButton,
                overlayEffect,
                onClose: () => console.log('Drawer closed'),
                header: html.h2(title.get()),
                body: html.div(
                  html.p('This is the drawer body content.'),
                  html.p(
                    'Drawers are perfect for navigation menus, settings panels, or any content that should slide in from the side.'
                  ),
                  html.ul(
                    html.li('Responsive design'),
                    html.li('Customizable positioning'),
                    html.li('Multiple sizes available'),
                    html.li('Keyboard and click-outside dismissal')
                  )
                ),
              }),
          },
          'Open Basic Drawer'
        )
      ),

      // Semantic Anchoring Example
      html.h3(
        attr.class('text-xl font-semibold pt-4'),
        'Semantic Anchoring (RTL/LTR Support)'
      ),
      html.p('Drawers with semantic anchoring that adapt to text direction:'),

      Group(
        attr.class('gap-2'),
        Drawer((open, _close) =>
          Button(
            {
              variant: 'outline',
              onClick: () =>
                open({
                  size: 'md',
                  side: 'inline-start',
                  dismissable: true,
                  showCloseButton: true,
                  overlayEffect: 'opaque',
                  header: 'Inline Start Drawer',
                  body: html.div(
                    html.p('This drawer opens from the inline-start side.'),
                    html.p('In LTR languages: opens from the left'),
                    html.p('In RTL languages: opens from the right'),
                    html.p(
                      'Perfect for navigation menus that should always appear on the "start" side of the interface.'
                    )
                  ),
                }),
            },
            'Open Inline Start'
          )
        ),
        Drawer((open, _close) =>
          Button(
            {
              variant: 'outline',
              onClick: () =>
                open({
                  size: 'md',
                  side: 'inline-end',
                  dismissable: true,
                  showCloseButton: true,
                  overlayEffect: 'opaque',
                  header: 'Inline End Drawer',
                  body: html.div(
                    html.p('This drawer opens from the inline-end side.'),
                    html.p('In LTR languages: opens from the right'),
                    html.p('In RTL languages: opens from the left'),
                    html.p(
                      'Perfect for secondary content, settings, or actions that should appear on the "end" side.'
                    )
                  ),
                }),
            },
            'Open Inline End'
          )
        )
      ),

      // Navigation Drawer Example
      html.h3(attr.class('text-xl font-semibold pt-4'), 'Navigation Drawer'),
      html.p(
        'A common use case for drawers is navigation menus, especially on mobile devices.'
      ),
      Drawer((open, _close) =>
        Button(
          {
            variant: 'outline',
            onClick: () =>
              open({
                size: 'md',
                side: 'left',
                dismissable: true,
                showCloseButton: false,
                overlayEffect: 'opaque',
                header: Group(
                  attr.class('flex items-center gap-2'),
                  Icon({ icon: 'lucide:menu', size: 'sm' }),
                  html.span('Navigation')
                ),
                body: html.nav(
                  attr.class('flex flex-col gap-2'),
                  html.a(
                    attr.class('p-2 rounded hover:bg-gray-200'),
                    attr.href('#'),
                    'Home'
                  ),
                  html.a(
                    attr.class('p-2 rounded hover:bg-gray-200'),
                    attr.href('#'),
                    'About'
                  ),
                  html.a(
                    attr.class('p-2 rounded hover:bg-gray-200'),
                    attr.href('#'),
                    'Services'
                  ),
                  html.a(
                    attr.class('p-2 rounded hover:bg-gray-200'),
                    attr.href('#'),
                    'Contact'
                  )
                ),
              }),
          },
          Icon({ icon: 'lucide:menu', size: 'sm' }),
          'Open Navigation'
        )
      ),

      // Settings Drawer Example
      html.h3(attr.class('text-xl font-semibold pt-4'), 'Settings Drawer'),
      html.p(
        'Drawers work well for settings panels and configuration options.'
      ),
      Drawer((open, _close) =>
        Button(
          {
            variant: 'outline',
            onClick: () =>
              open({
                size: 'lg',
                side: 'right',
                dismissable: true,
                showCloseButton: true,
                overlayEffect: 'opaque',
                header: Group(
                  attr.class('flex items-center gap-2'),
                  Icon({ icon: 'lucide:settings', size: 'sm' }),
                  html.span('Settings')
                ),
                body: Stack(
                  attr.class('gap-4'),
                  Group(
                    attr.class('flex flex-col gap-2'),
                    Label('Theme'),
                    SegmentedInput({
                      value: prop<'light' | 'dark' | 'auto'>('light'),
                      options: {
                        light: 'Light',
                        dark: 'Dark',
                        auto: 'Auto',
                      },
                    })
                  ),
                  Group(
                    attr.class('flex flex-col gap-2'),
                    InputWrapper({
                      label: 'Enable notifications',
                      content: Switch({
                        value: prop(true),
                        onChange: () => {},
                      }),
                    }),
                    InputWrapper({
                      label: 'Auto-save changes',
                      content: Switch({
                        value: prop(false),
                        onChange: () => {},
                      }),
                    }),
                    InputWrapper({
                      label: 'Show tooltips',
                      content: Switch({
                        value: prop(true),
                        onChange: () => {},
                      }),
                    })
                  )
                ),
                footer: Group(
                  attr.class('justify-end gap-2'),
                  Button({ variant: 'outline' }, 'Cancel'),
                  Button(
                    { variant: 'filled', color: 'primary' },
                    'Save Settings'
                  )
                ),
              }),
          },
          Icon({ icon: 'lucide:settings', size: 'sm' }),
          'Open Settings'
        )
      ),

      // Top/Bottom Drawer Example
      html.h3(attr.class('text-xl font-semibold pt-4'), 'Top/Bottom Drawers'),
      html.p(
        'Drawers can also slide in from the top or bottom, useful for notifications or quick actions.'
      ),
      Group(
        attr.class('gap-2'),
        Drawer((open, _close) =>
          Button(
            {
              variant: 'outline',
              onClick: () =>
                open({
                  size: 'sm',
                  side: 'top',
                  dismissable: true,
                  showCloseButton: true,
                  overlayEffect: 'transparent',
                  header: Group(
                    attr.class('flex items-center gap-2'),
                    Icon({ icon: 'lucide:bell', size: 'sm' }),
                    html.span('Notifications')
                  ),
                  body: html.div(
                    html.p('You have 3 new notifications'),
                    html.div(
                      attr.class('mt-2 space-y-1'),
                      html.div(
                        attr.class('p-2 bg-gray-100 rounded'),
                        'New message from John'
                      ),
                      html.div(
                        attr.class('p-2 bg-gray-100 rounded'),
                        'System update available'
                      ),
                      html.div(
                        attr.class('p-2 bg-gray-100 rounded'),
                        'Meeting reminder'
                      )
                    )
                  ),
                }),
            },
            'Top Drawer'
          )
        ),
        Drawer((open, _close) =>
          Button(
            {
              variant: 'outline',
              onClick: () =>
                open({
                  size: 'md',
                  side: 'bottom',
                  dismissable: true,
                  showCloseButton: true,
                  overlayEffect: 'opaque',
                  header: Group(
                    attr.class('flex items-center gap-2'),
                    Icon({ icon: 'lucide:share', size: 'sm' }),
                    html.span('Share Options')
                  ),
                  body: Group(
                    attr.class('gap-2 flex-wrap'),
                    Button(
                      { variant: 'outline', size: 'sm' },
                      Icon({ icon: 'lucide:twitter', size: 'sm' }),
                      'Twitter'
                    ),
                    Button(
                      { variant: 'outline', size: 'sm' },
                      Icon({ icon: 'lucide:facebook', size: 'sm' }),
                      'Facebook'
                    ),
                    Button(
                      { variant: 'outline', size: 'sm' },
                      Icon({ icon: 'lucide:linkedin', size: 'sm' }),
                      'LinkedIn'
                    ),
                    Button(
                      { variant: 'outline', size: 'sm' },
                      Icon({ icon: 'lucide:mail', size: 'sm' }),
                      'Email'
                    )
                  ),
                }),
            },
            'Bottom Drawer'
          )
        )
      )
    ),
  })
}

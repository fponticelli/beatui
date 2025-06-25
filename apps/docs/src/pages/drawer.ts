import {
  Button,
  Drawer,
  Stack,
  Label,
  SegmentedControl,
  TextInput,
  Icon,
  Switch,
  Group,
  OverlayEffect,
} from '@tempots/beatui'
import { html, attr, prop } from '@tempots/dom'
import { ControlsHeader } from '../elements/controls-header'

type DrawerSize = 'sm' | 'md' | 'lg' | 'xl'
type DrawerSide = 'top' | 'right' | 'bottom' | 'left'

export const DrawerPage = () => {
  const size = prop<DrawerSize>('md')
  const dismissable = prop(true)
  const showCloseButton = prop(true)
  const title = prop('Drawer Title')
  const overlayEffect = prop<OverlayEffect>('opaque')
  const side = prop<DrawerSide>('right')

  return Stack(
    attr.class('bu-h-full bu-overflow-hidden'),
    ControlsHeader(
      Group(
        attr.class('bu-gap-4 bu-flex-wrap'),

        // Size Control
        Group(
          attr.class('bu-flex-col bu-gap-1'),
          Label('Size'),
          SegmentedControl({
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
        Group(
          attr.class('bu-flex-col bu-gap-1'),
          Label('Side'),
          SegmentedControl({
            value: side,
            options: {
              top: 'Top',
              right: 'Right',
              bottom: 'Bottom',
              left: 'Left',
            },
            onChange: side.set,
          })
        ),

        // Overlay Effect Control
        Group(
          attr.class('bu-flex-col bu-gap-1'),
          Label('Overlay Effect'),
          SegmentedControl({
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
        Group(
          attr.class('bu-flex-col bu-gap-1'),
          Label('Title'),
          TextInput({ value: title, placeholder: 'Enter drawer title' })
        ),

        // Switches
        Group(
          attr.class('bu-flex-col bu-gap-2'),
          Stack(
            Label('Dismissable'),
            Switch({ value: dismissable, onChange: dismissable.set })
          ),
          Stack(
            Label('Show Close Button'),
            Switch({ value: showCloseButton, onChange: showCloseButton.set })
          )
        )
      )
    ),

    Stack(
      attr.class('bu-items-start bu-gap-1 bu-p-4 bu-h-full bu-overflow-auto'),

      // Basic Drawer Example
      html.h3(
        attr.class('bu-text-xl bu-font-semibold bu-pt-4'),
        'Basic Drawer'
      ),
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

      // Navigation Drawer Example
      html.h3(
        attr.class('bu-text-xl bu-font-semibold bu-pt-4'),
        'Navigation Drawer'
      ),
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
                header: html.div(
                  attr.class('bu-flex bu-items-center bu-gap-2'),
                  Icon({ icon: 'lucide:menu', size: 'sm' }),
                  html.span('Navigation')
                ),
                body: html.nav(
                  attr.class('bu-flex bu-flex-col bu-gap-2'),
                  html.a(
                    attr.class('bu-p-2 bu-rounded bu-hover:bg-base-200'),
                    attr.href('#'),
                    'Home'
                  ),
                  html.a(
                    attr.class('bu-p-2 bu-rounded bu-hover:bg-base-200'),
                    attr.href('#'),
                    'About'
                  ),
                  html.a(
                    attr.class('bu-p-2 bu-rounded bu-hover:bg-base-200'),
                    attr.href('#'),
                    'Services'
                  ),
                  html.a(
                    attr.class('bu-p-2 bu-rounded bu-hover:bg-base-200'),
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
      html.h3(
        attr.class('bu-text-xl bu-font-semibold bu-pt-4'),
        'Settings Drawer'
      ),
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
                header: html.div(
                  attr.class('bu-flex bu-items-center bu-gap-2'),
                  Icon({ icon: 'lucide:settings', size: 'sm' }),
                  html.span('Settings')
                ),
                body: Stack(
                  attr.class('bu-gap-4'),
                  Group(
                    attr.class('bu-flex-col bu-gap-2'),
                    Label('Theme'),
                    SegmentedControl({
                      value: prop<'light' | 'dark' | 'auto'>('light'),
                      options: {
                        light: 'Light',
                        dark: 'Dark',
                        auto: 'Auto',
                      },
                    })
                  ),
                  Group(
                    attr.class('bu-flex-col bu-gap-2'),
                    Stack(
                      Label('Enable notifications'),
                      Switch({ value: prop(true), onChange: () => {} })
                    ),
                    Stack(
                      Label('Auto-save changes'),
                      Switch({ value: prop(false), onChange: () => {} })
                    ),
                    Stack(
                      Label('Show tooltips'),
                      Switch({ value: prop(true), onChange: () => {} })
                    )
                  )
                ),
                footer: Group(
                  attr.class('bu-justify-end bu-gap-2'),
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
      html.h3(
        attr.class('bu-text-xl bu-font-semibold bu-pt-4'),
        'Top/Bottom Drawers'
      ),
      html.p(
        'Drawers can also slide in from the top or bottom, useful for notifications or quick actions.'
      ),
      Group(
        attr.class('bu-gap-2'),
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
                  header: html.div(
                    attr.class('bu-flex bu-items-center bu-gap-2'),
                    Icon({ icon: 'lucide:bell', size: 'sm' }),
                    html.span('Notifications')
                  ),
                  body: html.div(
                    html.p('You have 3 new notifications'),
                    html.div(
                      attr.class('bu-mt-2 bu-space-y-1'),
                      html.div(
                        attr.class('bu-p-2 bu-bg-base-100 bu-rounded'),
                        'New message from John'
                      ),
                      html.div(
                        attr.class('bu-p-2 bu-bg-base-100 bu-rounded'),
                        'System update available'
                      ),
                      html.div(
                        attr.class('bu-p-2 bu-bg-base-100 bu-rounded'),
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
                  header: html.div(
                    attr.class('bu-flex bu-items-center bu-gap-2'),
                    Icon({ icon: 'lucide:share', size: 'sm' }),
                    html.span('Share Options')
                  ),
                  body: Group(
                    attr.class('bu-gap-2 bu-flex-wrap'),
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
    )
  )
}

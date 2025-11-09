import {
  Button,
  Flyout,
  Stack,
  Label,
  Group,
  Icon,
  NativeSelect,
  Option,
  FlyoutTrigger,
  NumberInput,
  Switch,
  SelectOption,
  InputWrapper,
} from '@tempots/beatui'
import { html, attr, prop, computedOf, on, Fragment } from '@tempots/dom'
import { ControlsHeader } from '../elements/controls-header'
import { Placement } from '@tempots/ui'

export default function FlyoutPage() {
  const placement = prop<Placement>('top')
  const showOn = prop<FlyoutTrigger>('hover-focus')
  const showDelay = prop(250)
  const hideDelay = prop(500)
  const closable = prop(true)
  const showAnimations = prop(true)
  const animationClass = showAnimations.map((show): string =>
    show ? 'bc-flyout' : 'bc-flyout bc-flyout-no-animation'
  )

  return Stack(
    attr.class('h-full overflow-auto'),
    ControlsHeader(
      Stack(
        Label('Placement'),
        NativeSelect({
          options: [
            Option.value('top', 'Top'),
            Option.value('top-start', 'Top Start'),
            Option.value('top-end', 'Top End'),
            Option.value('right', 'Right'),
            Option.value('right-start', 'Right Start'),
            Option.value('right-end', 'Right End'),
            Option.value('bottom', 'Bottom'),
            Option.value('bottom-start', 'Bottom Start'),
            Option.value('bottom-end', 'Bottom End'),
            Option.value('left', 'Left'),
            Option.value('left-start', 'Left Start'),
            Option.value('left-end', 'Left End'),
          ] as SelectOption<Placement>[],
          value: placement,
          onChange: placement.set,
        })
      ),
      Stack(
        Label('Show On'),
        NativeSelect({
          options: [
            Option.value('hover', 'Hover'),
            Option.value('focus', 'Focus'),
            Option.value('hover-focus', 'Hover & Focus'),
            Option.value('click', 'Click'),
            Option.value('never', 'Never'),
          ] as SelectOption<FlyoutTrigger>[],
          value: showOn,
          onChange: showOn.set,
        })
      ),
      Stack(
        Label('Show Delay'),
        NumberInput({
          value: showDelay,
          onChange: showDelay.set,
        })
      ),
      Stack(
        Label('Hide Delay'),
        NumberInput({
          value: hideDelay,
          onChange: hideDelay.set,
        })
      ),
      InputWrapper({
        label: 'Closable',
        content: Switch({
          value: closable,
          onChange: closable.set,
        }),
      }),
      InputWrapper({
        label: 'Animations',
        content: Switch({
          value: showAnimations,
          onChange: showAnimations.set,
        }),
      })
    ),

    // Main content area
    Group(
      attr.class('items-start justify-center gap-8 p-8 flex-1'),

      // Basic flyout example
      html.div(
        attr.class('text-center space-y-4'),
        html.h3(attr.class('text-lg font-semibold'), 'Basic Flyout'),
        Button(
          { variant: 'filled', color: 'primary' },
          'Hover or focus me',
          Flyout({
            content: () =>
              Fragment(
                attr.class(animationClass),
                html.div(
                  attr.class('p-4 max-w-48'),
                  html.h4(attr.class('font-semibold mb-2'), 'Flyout Content'),
                  html.p(
                    'This is a basic flyout with rich content and smooth animations!'
                  )
                )
              ),
            placement,
            showOn,
            showDelay,
            hideDelay,
            closable,
          })
        )
      ),

      // Custom trigger example
      html.div(
        attr.class('text-center space-y-4'),
        html.h3(attr.class('text-lg font-semibold'), 'Custom Trigger'),
        Button(
          { variant: 'outline', color: 'secondary' },
          'Double-click me!',
          Flyout({
            content: () =>
              Fragment(
                attr.class(animationClass),
                html.div(
                  attr.class('p-4'),
                  html.div(
                    attr.class('font-semibold text-center'),
                    '🎉 Custom Trigger!'
                  ),
                  html.p(
                    attr.class('mt-2'),
                    'This flyout uses a custom trigger that responds to double-click.'
                  )
                )
              ),
            showOn: (show, hide) => [
              on.dblclick(() => show()),
              on.mouseleave(() => hide()),
            ],
          })
        )
      ),

      // Multiple flyouts example
      html.div(
        attr.class('text-center space-y-4'),
        html.h3(attr.class('text-lg font-semibold'), 'Multiple Flyouts'),
        Group(
          attr.class('gap-4'),
          Button(
            { variant: 'outline' },
            Icon({ icon: 'mdi:content-save', size: 'sm' }),
            'Save',
            Flyout({
              content: () =>
                Fragment(
                  attr.class(animationClass),
                  html.div(
                    attr.class('p-3'),
                    html.div(attr.class('font-semibold'), 'Save Document'),
                    html.p(
                      attr.class('text-sm mt-1'),
                      'Save your current work to prevent data loss.'
                    )
                  )
                ),
              placement: 'top',
              showOn: 'hover',
            })
          ),
          Button(
            { variant: 'outline' },
            Icon({ icon: 'mdi:pencil', size: 'sm' }),
            'Edit',
            Flyout({
              content: () =>
                Fragment(
                  attr.class(animationClass),
                  html.div(
                    attr.class('p-3'),
                    html.div(attr.class('font-semibold'), 'Edit Item'),
                    html.p(
                      attr.class('text-sm mt-1'),
                      'Modify the selected item properties.'
                    )
                  )
                ),
              placement: 'top',
              showOn: 'hover',
            })
          ),
          Button(
            { variant: 'outline', color: 'danger' },
            Icon({ icon: 'mdi:delete', size: 'sm' }),
            'Delete',
            Flyout({
              content: () =>
                Fragment(
                  attr.class(animationClass),
                  html.div(
                    attr.class('p-3'),
                    html.div(
                      attr.class('font-semibold text-red-600'),
                      '⚠️ Delete Item'
                    ),
                    html.p(
                      attr.class('text-sm mt-1'),
                      'Permanently remove the selected item. This action cannot be undone.'
                    )
                  )
                ),
              placement: 'top',
              showOn: 'hover',
            })
          )
        )
      ),

      // Placement grid example
      html.div(
        attr.class('text-center space-y-4'),
        html.h3(attr.class('text-lg font-semibold'), 'Different Placements'),
        html.div(
          attr.class('grid grid-cols-3 gap-4 w-64'),
          html.div(), // empty
          Button(
            { variant: 'light', size: 'sm' },
            'Top',
            Flyout({
              content: () =>
                Fragment(
                  attr.class(animationClass),
                  html.div(attr.class('p-2'), 'Flyout on top')
                ),
              placement: 'top',
              showOn: 'hover',
            })
          ),
          html.div(), // empty
          Button(
            { variant: 'light', size: 'sm' },
            'Left',
            Flyout({
              content: () =>
                Fragment(
                  attr.class(animationClass),
                  html.div(attr.class('p-2'), 'Flyout on left')
                ),
              placement: 'left',
              showOn: 'hover',
            })
          ),
          html.div(
            attr.class(
              'flex items-center justify-center text-sm text-gray-500'
            ),
            'Center'
          ),
          Button(
            { variant: 'light', size: 'sm' },
            'Right',
            Flyout({
              content: () =>
                Fragment(
                  attr.class(animationClass),
                  html.div(attr.class('p-2'), 'Flyout on right')
                ),
              placement: 'right',
              showOn: 'hover',
            })
          ),
          html.div(), // empty
          Button(
            { variant: 'light', size: 'sm' },
            'Bottom',
            Flyout({
              content: () =>
                Fragment(
                  attr.class(animationClass),
                  html.div(attr.class('p-2'), 'Flyout on bottom')
                ),
              placement: 'bottom',
              showOn: 'hover',
            })
          ),
          html.div() // empty
        )
      ),

      // Rich content example
      html.div(
        attr.class('text-center space-y-4'),
        html.h3(attr.class('text-lg font-semibold'), 'Rich Content'),
        Button(
          { variant: 'filled', color: 'primary' },
          'Rich Flyout',
          Flyout({
            content: () =>
              Fragment(
                attr.class(animationClass),
                html.div(
                  attr.class('p-4 w-64'),
                  html.div(
                    attr.class('flex items-center gap-2 mb-3'),
                    Icon({
                      icon: 'mdi:information',
                      size: 'sm',
                      color: 'primary',
                    }),
                    html.h4(attr.class('font-semibold'), 'Rich Flyout Content')
                  ),
                  html.p(
                    attr.class('mb-3'),
                    'This flyout contains rich HTML content with multiple elements, icons, and interactive components.'
                  ),
                  html.div(
                    attr.class('flex gap-2'),
                    Button({ variant: 'filled', size: 'xs' }, 'Action'),
                    Button({ variant: 'outline', size: 'xs' }, 'Cancel')
                  ),
                  html.div(
                    attr.class('text-xs text-gray-600 mt-3 pt-3 border-t'),
                    computedOf(
                      showDelay,
                      hideDelay,
                      closable
                    )(
                      (showDelay, hideDelay, closable) =>
                        `Show: ${showDelay}ms, Hide: ${hideDelay}ms, Closable: ${closable ? 'Yes' : 'No'}`
                    )
                  )
                )
              ),
            placement: 'top',
            showOn: 'click',
            closable,
          })
        )
      )
    )
  )
}

import {
  Button,
  Flyout,
  Stack,
  Label,
  Group,
  Icon,
  NativeSelect,
  SelectOption,
  FlyoutTrigger,
  NumberInput,
  Switch,
} from '@tempots/beatui'
import { html, attr, prop, computedOf, on, Fragment } from '@tempots/dom'
import { ControlsHeader } from '../elements/controls-header'
import { Placement } from '@tempots/ui'

export const FlyoutPage = () => {
  const placement = prop<Placement>('top')
  const showOn = prop<FlyoutTrigger>('hover-focus')
  const showDelay = prop(250)
  const hideDelay = prop(500)
  const closable = prop(true)
  const showAnimations = prop(true)
  const animationClass = showAnimations.map((show): string =>
    show ? 'bc-flyout' : ''
  )

  return Stack(
    attr.class('bu-h-full bu-overflow-auto'),
    ControlsHeader(
      Group(
        attr.class('bu-gap-4 bu-flex-wrap'),
        Stack(
          attr.class('bu-gap-0'),
          Label('Placement'),
          NativeSelect({
            options: [
              SelectOption.value('top', 'Top'),
              SelectOption.value('top-start', 'Top Start'),
              SelectOption.value('top-end', 'Top End'),
              SelectOption.value('right', 'Right'),
              SelectOption.value('right-start', 'Right Start'),
              SelectOption.value('right-end', 'Right End'),
              SelectOption.value('bottom', 'Bottom'),
              SelectOption.value('bottom-start', 'Bottom Start'),
              SelectOption.value('bottom-end', 'Bottom End'),
              SelectOption.value('left', 'Left'),
              SelectOption.value('left-start', 'Left Start'),
              SelectOption.value('left-end', 'Left End'),
            ] as SelectOption<Placement>[],
            value: placement,
            onChange: placement.set,
          })
        ),
        Stack(
          attr.class('bu-gap-0'),
          Label('Show On'),
          NativeSelect({
            options: [
              SelectOption.value('hover', 'Hover'),
              SelectOption.value('focus', 'Focus'),
              SelectOption.value('hover-focus', 'Hover & Focus'),
              SelectOption.value('click', 'Click'),
              SelectOption.value('never', 'Never'),
            ] as SelectOption<FlyoutTrigger>[],
            value: showOn,
            onChange: showOn.set,
          })
        ),
        Stack(
          attr.class('bu-gap-0'),
          Label('Show Delay'),
          NumberInput({
            value: showDelay,
            onChange: showDelay.set,
          })
        ),
        Stack(
          attr.class('bu-gap-0'),
          Label('Hide Delay'),
          NumberInput({
            value: hideDelay,
            onChange: hideDelay.set,
          })
        ),
        Stack(
          attr.class('bu-gap-0'),
          Label('Closable'),
          Switch({
            value: closable,
            onChange: closable.set,
          })
        ),
        Stack(
          attr.class('bu-gap-0'),
          Label('Animations'),
          Switch({
            value: showAnimations,
            onChange: showAnimations.set,
          })
        )
      )
    ),

    // Main content area
    Group(
      attr.class('bu-items-start bu-justify-center bu-gap-8 bu-p-8 bu-flex-1'),

      // Basic flyout example
      html.div(
        attr.class('bu-text-center bu-space-y-4'),
        html.h3(attr.class('bu-text-lg bu-font-semibold'), 'Basic Flyout'),
        Button(
          { variant: 'filled', color: 'primary' },
          'Hover or focus me',
          Flyout({
            content: Fragment(
              attr.class(animationClass),
              html.div(
                attr.class('bu-p-4 bu-max-w-xs'),
                html.h4(
                  attr.class('bu-font-semibold bu-mb-2'),
                  'Flyout Content'
                ),
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
        attr.class('bu-text-center bu-space-y-4'),
        html.h3(attr.class('bu-text-lg bu-font-semibold'), 'Custom Trigger'),
        Button(
          { variant: 'outline', color: 'secondary' },
          'Double-click me!',
          Flyout({
            content: Fragment(
              attr.class(animationClass),
              html.div(
                attr.class('bu-p-4'),
                html.div(
                  attr.class('bu-font-semibold bu-text-center'),
                  '🎉 Custom Trigger!'
                ),
                html.p(
                  attr.class('bu-mt-2'),
                  'This flyout uses a custom trigger that responds to double-click.'
                )
              )
            ),
            showOn: {
              render: (show, hide) => [
                on.dblclick(() => show()),
                on.mouseleave(() => hide()),
              ],
            },
          })
        )
      ),

      // Multiple flyouts example
      html.div(
        attr.class('bu-text-center bu-space-y-4'),
        html.h3(attr.class('bu-text-lg bu-font-semibold'), 'Multiple Flyouts'),
        Group(
          attr.class('bu-gap-4'),
          Button(
            { variant: 'outline' },
            Icon({ icon: 'mdi:content-save', size: 'sm' }),
            'Save',
            Flyout({
              content: Fragment(
                attr.class(animationClass),
                html.div(
                  attr.class('bu-p-3'),
                  html.div(attr.class('bu-font-semibold'), 'Save Document'),
                  html.p(
                    attr.class('bu-text-sm bu-mt-1'),
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
              content: Fragment(
                attr.class(animationClass),
                html.div(
                  attr.class('bu-p-3'),
                  html.div(attr.class('bu-font-semibold'), 'Edit Item'),
                  html.p(
                    attr.class('bu-text-sm bu-mt-1'),
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
              content: Fragment(
                attr.class(animationClass),
                html.div(
                  attr.class('bu-p-3'),
                  html.div(
                    attr.class('bu-font-semibold bu-text-red-600'),
                    '⚠️ Delete Item'
                  ),
                  html.p(
                    attr.class('bu-text-sm bu-mt-1'),
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
        attr.class('bu-text-center bu-space-y-4'),
        html.h3(
          attr.class('bu-text-lg bu-font-semibold'),
          'Different Placements'
        ),
        html.div(
          attr.class('bu-grid bu-grid-cols-3 bu-gap-4 bu-w-64'),
          html.div(), // empty
          Button(
            { variant: 'light', size: 'sm' },
            'Top',
            Flyout({
              content: Fragment(
                attr.class(animationClass),
                html.div(attr.class('bu-p-2'), 'Flyout on top')
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
              content: Fragment(
                attr.class(animationClass),
                html.div(attr.class('bu-p-2'), 'Flyout on left')
              ),
              placement: 'left',
              showOn: 'hover',
            })
          ),
          html.div(
            attr.class(
              'bu-flex bu-items-center bu-justify-center bu-text-sm bu-text-gray-500'
            ),
            'Center'
          ),
          Button(
            { variant: 'light', size: 'sm' },
            'Right',
            Flyout({
              content: Fragment(
                attr.class(animationClass),
                html.div(attr.class('bu-p-2'), 'Flyout on right')
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
              content: Fragment(
                attr.class(animationClass),
                html.div(attr.class('bu-p-2'), 'Flyout on bottom')
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
        attr.class('bu-text-center bu-space-y-4'),
        html.h3(attr.class('bu-text-lg bu-font-semibold'), 'Rich Content'),
        Button(
          { variant: 'filled', color: 'accent' },
          'Rich Flyout',
          Flyout({
            content: Fragment(
              attr.class(animationClass),
              html.div(
                attr.class('bu-p-4 bu-max-w-sm'),
                html.div(
                  attr.class('bu-flex bu-items-center bu-gap-2 bu-mb-3'),
                  Icon({
                    icon: 'mdi:information',
                    size: 'sm',
                    color: 'primary',
                  }),
                  html.h4(attr.class('bu-font-semibold'), 'Rich Flyout Content')
                ),
                html.p(
                  attr.class('bu-mb-3'),
                  'This flyout contains rich HTML content with multiple elements, icons, and interactive components.'
                ),
                html.div(
                  attr.class('bu-flex bu-gap-2'),
                  Button({ variant: 'filled', size: 'xs' }, 'Action'),
                  Button({ variant: 'outline', size: 'xs' }, 'Cancel')
                ),
                html.div(
                  attr.class(
                    'bu-text-xs bu-text-gray-500 bu-mt-3 bu-pt-3 bu-border-t'
                  ),
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

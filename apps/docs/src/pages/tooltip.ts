import {
  Button,
  Tooltip,
  Stack,
  Label,
  Group,
  Icon,
  NativeSelect,
  Option,
  SelectOption,
  TooltipTrigger,
  NumberInput,
} from '@tempots/beatui'
import { html, attr, prop, computedOf } from '@tempots/dom'
import { ControlsHeader } from '../elements/controls-header'
import { Placement } from '@tempots/ui'

export default function TooltipPage() {
  const placement = prop<Placement>('top')
  const showOn = prop<TooltipTrigger>('hover-focus')
  const showDelay = prop(250)
  const hideDelay = prop(500)

  return Stack(
    attr.class('bu-h-full bu-overflow-auto'),
    ControlsHeader(
      Stack(
        Label('Placement'),
        NativeSelect({
          options: [
            Option.value('top', 'Top'),
            Option.value('top-start', 'Top Start'),
            Option.value('top-end', 'Top Right'),
            Option.value('right', 'Right'),
            Option.value('right-start', 'Right Start'),
            Option.value('right-end', 'Right End'),
            Option.value('bottom', 'Bottom'),
            Option.value('bottom-start', 'Bottom Start'),
            Option.value('bottom-end', 'Bottom Right'),
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
          ] as SelectOption<TooltipTrigger>[],
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
      )
    ),

    // Main content area
    Group(
      attr.class('bu-items-start bu-justify-center bu-gap-8 bu-p-8 bu-flex-1'),

      // Basic tooltip example
      html.div(
        attr.class('bu-text-center bu-space-y-4'),
        html.h3(attr.class('bu-text-lg bu-font-semibold'), 'Basic Tooltip'),
        Button(
          { variant: 'filled', color: 'primary' },
          'Hover or focus me',
          Tooltip({
            content: 'This is a basic tooltip with some helpful information!',
            placement,
            showOn,
            showDelay,
            hideDelay,
          })
        )
      ),

      // Multiple tooltips example
      html.div(
        attr.class('bu-text-center bu-space-y-4'),
        html.h3(attr.class('bu-text-lg bu-font-semibold'), 'Multiple Tooltips'),
        Group(
          attr.class('bu-gap-4'),
          Button(
            { variant: 'outline' },
            'Save',
            Icon({ icon: 'mdi:content-save', size: 'sm' }),
            Tooltip({
              content: 'Save your current work',
              placement: 'top',
              showOn,
            })
          ),
          Button(
            { variant: 'outline' },
            'Edit',
            Icon({ icon: 'mdi:pencil', size: 'sm' }),
            Tooltip({
              content: 'Edit the selected item',
              placement: 'top',
              showOn,
            })
          ),
          Button(
            { variant: 'outline', color: 'danger' },
            'Delete',
            Icon({ icon: 'mdi:delete', size: 'sm' }),
            Tooltip({
              content: 'Permanently delete the selected item',
              placement: 'top',
              showOn,
            })
          )
        )
      ),

      // Different placements example
      html.div(
        attr.class('bu-text-center bu-space-y-4'),
        html.h3(
          attr.class('bu-text-lg bu-font-semibold'),
          'Different Placements'
        ),
        html.div(
          attr.class('bu-grid bu-grid-cols-3 bu-gap-4 bu-w-64'),
          Button(
            { variant: 'light', size: 'sm' },
            'Top',
            Tooltip({
              content: 'Tooltip on top',
              placement: 'top',
              showOn,
            })
          ),
          Button(
            { variant: 'light', size: 'sm' },
            'Left',
            Tooltip({
              content: 'Tooltip on left',
              placement: 'left',
              showOn,
            })
          ),
          Button(
            { variant: 'light', size: 'sm' },
            'Right',
            Tooltip({
              content: 'Tooltip on right',
              placement: 'right',
              showOn,
            })
          ),
          Button(
            { variant: 'light', size: 'sm' },
            'Bottom',
            Tooltip({
              content: 'Tooltip on bottom',
              placement: 'bottom',
              showOn,
            })
          )
        )
      ),

      // Custom content example
      html.div(
        attr.class('bu-text-center bu-space-y-4'),
        html.h3(attr.class('bu-text-lg bu-font-semibold'), 'Custom Content'),
        Button(
          { variant: 'filled', color: 'secondary' },
          'Rich Tooltip',
          Tooltip({
            content: html.div(
              attr.class('bu-space-y-2 bu-p-2'),
              html.div(attr.class('bu-font-semibold'), 'Rich Tooltip'),
              html.div(
                'This tooltip contains custom HTML content with multiple elements.'
              ),
              html.div(
                attr.class('bu-text-xs bu-opacity-75'),
                computedOf(
                  showDelay,
                  hideDelay
                )(
                  (showDelay, hideDelay) =>
                    `Show delay: ${showDelay}ms, Hide delay: ${hideDelay}ms`
                )
              )
            ),
            placement: 'top',
            showOn,
          })
        )
      )
    )
  )
}

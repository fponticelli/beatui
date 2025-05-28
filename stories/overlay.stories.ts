import type { Meta, StoryObj } from '@storybook/html'
import { renderTempoComponent } from './common'
import { aria, attr, html } from '@tempots/dom'
import {
  OverlayBody,
  OverlayElement,
  OverlayOptions,
} from '../src/components/overlay'
import { Button, Icon } from '../src/'

const renderOverlay = ({ mode, effect }: OverlayOptions) => {
  return html.div(
    html.div(attr.class('text-sm'), mode, ' / ', effect),
    html.div(
      attr.class('relative flex items-center justify-center size-32 border'),
      OverlayElement(
        {
          mode,
          effect,
        },
        open =>
          Button(
            {
              onClick: () =>
                open(close =>
                  Button(
                    {
                      onClick: close,
                      color: 'neutral',
                      variant: 'outline',
                      roundedness: 'full',
                      size: 'medium',
                    },
                    aria.label('Close'),
                    attr.class('absolute top-1 right-1 shadow'),
                    Icon({
                      icon: 'icon-[line-md--close]',
                      size: 'medium',
                    })
                  )
                ),
            },
            'Open'
          )
      )
    )
  )
}

const renderOverlayBody = ({ mode, effect }: OverlayOptions) => {
  return OverlayBody(
    {
      mode,
      effect,
    },
    open =>
      Button(
        {
          onClick: () =>
            open(close =>
              Button(
                {
                  size: 'small',
                  onClick: close,
                  color: 'neutral',
                  variant: 'outline',
                  roundedness: 'full',
                },
                aria.label('Close'),
                attr.class('absolute top-1 right-1 shadow'),
                Icon({
                  icon: 'icon-[line-md--close]',
                  size: 'medium',
                })
              )
            ),
          size: 'small',
        },
        'Open: ' + mode + ' / ' + effect
      )
  )
}

const renderOverlays = () => {
  return html.div(
    attr.class('flex flex-col gap-4'),
    html.div(
      attr.class('flex gap-4'),
      renderOverlay({ mode: 'capturing', effect: 'visible' }),
      renderOverlay({ mode: 'capturing', effect: 'transparent' }),
      renderOverlay({ mode: 'non-capturing', effect: 'visible' }),
      renderOverlay({ mode: 'non-capturing', effect: 'transparent' })
    ),
    html.div(
      attr.class('flex gap-4'),
      renderOverlayBody({ mode: 'capturing', effect: 'visible' }),
      renderOverlayBody({ mode: 'capturing', effect: 'transparent' }),
      renderOverlayBody({ mode: 'non-capturing', effect: 'visible' }),
      renderOverlayBody({ mode: 'non-capturing', effect: 'transparent' })
    )
  )
}

// Define the meta for the component
const meta = {
  title: 'Components/Overlay',
  tags: ['autodocs'],
  render: renderTempoComponent(renderOverlays),
  argTypes: {},
  args: {},
} satisfies Meta<OverlayOptions>

export default meta
type Story = StoryObj<OverlayOptions>

// Define the stories
export const Standard: Story = {
  args: {},
}

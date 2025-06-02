import type { Meta, StoryObj } from '@storybook/html'
import { renderTempoComponent } from './common'
import { aria, html, style } from '@tempots/dom'
import {
  OverlayBody,
  OverlayElement,
  OverlayOptions,
} from '../src/components/overlay'
import { Button, Icon } from '../src/'

const renderOverlay = ({ mode, effect }: OverlayOptions) => {
  return html.div(
    html.div(
      style.textAlign('center'),
      style.fontSize('0.75rem'),
      mode,
      ' / ',
      effect
    ),
    html.div(
      style.overflow('hidden'),
      style.borderRadius('0.5rem'),
      style.position('relative'),
      style.display('flex'),
      style.alignItems('center'),
      style.justifyContent('center'),
      style.height('12rem'),
      style.width('12rem'),
      style.border('1px solid #ccc'),
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
                      variant: 'light',
                      roundedness: 'full',
                      size: 'md',
                    },
                    aria.label('Close'),
                    style.position('absolute'),
                    style.top('0.25rem'),
                    style.right('0.25rem'),
                    style.boxShadow(
                      '0 0 0.25rem 0.125rem rgba(0, 0, 0, 0.075)'
                    ),
                    Icon({
                      icon: 'line-md:close',
                      size: 'md',
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
                  size: 'sm',
                  onClick: close,
                  color: 'neutral',
                  variant: 'light',
                  roundedness: 'full',
                },
                aria.label('Close'),
                style.position('absolute'),
                style.top('0.25rem'),
                style.right('0.25rem'),
                style.boxShadow('0 0 0.25rem 0.125rem rgba(0, 0, 0, 0.075)'),
                Icon({
                  icon: 'line-md:close',
                  size: 'md',
                })
              )
            ),
          size: 'sm',
        },
        'Open: ' + mode + ' / ' + effect
      )
  )
}

const renderOverlays = () => {
  return html.div(
    style.display('flex'),
    style.flexDirection('column'),
    style.gap('1rem'),
    html.div(
      style.display('flex'),
      style.gap('1rem'),
      renderOverlay({ mode: 'capturing', effect: 'visible' }),
      renderOverlay({ mode: 'capturing', effect: 'transparent' }),
      renderOverlay({ mode: 'non-capturing', effect: 'visible' }),
      renderOverlay({ mode: 'non-capturing', effect: 'transparent' })
    ),
    html.div(
      style.display('flex'),
      style.gap('1rem'),
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

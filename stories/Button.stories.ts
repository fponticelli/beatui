import type { Meta, StoryObj } from '@storybook/html'
import { fn } from '@storybook/test'

import { Button, ButtonOptions } from '../src/components/button'
import { renderTempoComponent } from './common'

// Create a wrapper function to render the Button with Theme
const renderButton = (args: ButtonOptions & { text: string }) => {
  const { text, ...buttonOptions } = args

  return Button(buttonOptions, text)
}

// Define the Meta for our Button stories
const meta = {
  title: 'Components/Button',
  tags: ['autodocs'],
  render: renderTempoComponent(renderButton),
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['button', 'submit', 'reset'],
    },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },
    text: { control: 'text' },
  },
  args: {
    onClick: fn(),
    text: 'Button Text',
    type: 'button',
  },
} satisfies Meta<ButtonOptions & { text: string }>

export default meta
type Story = StoryObj<ButtonOptions & { text: string }>

// Default Button Story
export const Default: Story = {
  args: {
    text: 'Click me!',
  },
}

// Disabled Button Story
export const Disabled: Story = {
  args: {
    text: 'Click me!',
    disabled: true,
  },
}

// Submit Button Story
export const Submit: Story = {
  args: {
    text: 'Submit Button',
    type: 'submit',
  },
}

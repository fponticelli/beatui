import type { Meta, StoryObj } from '@storybook/html'
import { fn } from '@storybook/test'

import { Button, ButtonOptions } from '../src/components/button'
import { renderTempoComponent } from './common'

// Create a wrapper function to render the Button with Theme
const renderButton = (args: ButtonOptions & { text: string }) => {
  const { text, ...buttonOptions } = args

  return Button(buttonOptions, text)
}

// Define the meta for the component
const meta = {
  title: 'Components/Button',
  tags: ['autodocs'],
  render: renderTempoComponent(renderButton),
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'text'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
  args: {
    text: 'Button',
    variant: 'primary',
    size: 'medium',
    disabled: false,
    onClick: fn(),
  },
} satisfies Meta<ButtonOptions & { text: string }>

export default meta
type Story = StoryObj<ButtonOptions & { text: string }>

// Define the stories
export const Primary: Story = {
  args: {
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
}

export const Text: Story = {
  args: {
    variant: 'text',
  },
}

export const Small: Story = {
  args: {
    size: 'small',
  },
}

export const Medium: Story = {
  args: {
    size: 'medium',
  },
}

export const Large: Story = {
  args: {
    size: 'large',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

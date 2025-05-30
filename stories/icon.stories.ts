import type { Meta, StoryObj } from '@storybook/html'

import { Icon, IconOptions } from '../src/'
import { renderTempoComponent } from './common'

// Create a wrapper function to render the Icon with Theme
const renderIcon = (args: IconOptions) => {
  return Icon(args)
}

// Define the meta for the component
const meta = {
  title: 'Components/Icon',
  tags: ['autodocs'],
  render: renderTempoComponent(renderIcon),
  argTypes: {
    icon: {
      control: 'text',
      description: 'Icon name from Iconify',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    color: {
      control: 'text',
      description: 'Tailwind color class or custom color',
    },
    title: {
      control: 'text',
      description: 'Accessibility title for the icon',
    },
  },
  args: {
    icon: 'line-md:home',
    size: 'md',
  },
} satisfies Meta<IconOptions>

export default meta
type Story = StoryObj<IconOptions>

// Define the stories
export const Default: Story = {
  args: {
    icon: 'line-md:home',
  },
}

export const Small: Story = {
  args: {
    icon: 'line-md:home',
    size: 'sm',
  },
}

export const Medium: Story = {
  args: {
    icon: 'line-md:home',
    size: 'md',
  },
}

export const Large: Story = {
  args: {
    icon: 'line-md:home',
    size: 'lg',
  },
}

export const ColoredIcon: Story = {
  args: {
    icon: 'line-md:heart',
    color: 'red',
  },
}

export const WithTitle: Story = {
  args: {
    icon: 'line-md:alert',
    title: 'Warning',
  },
}

// Different icon examples
export const UserIcon: Story = {
  args: {
    icon: 'line-md:account',
  },
}

export const SettingsIcon: Story = {
  args: {
    icon: 'line-md:cog',
  },
}

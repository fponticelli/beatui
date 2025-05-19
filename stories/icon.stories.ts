import type { Meta, StoryObj } from '@storybook/html'

import { Icon, IconOptions } from '../src/components/Icon'
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
      options: ['small', 'medium', 'large', 'custom'],
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
    icon: 'icon-[mdi-light--home]',
    size: 'medium',
  },
} satisfies Meta<IconOptions>

export default meta
type Story = StoryObj<IconOptions>

// Define the stories
export const Default: Story = {
  args: {
    icon: 'icon-[mdi-light--home]',
  },
}

export const Small: Story = {
  args: {
    icon: 'icon-[mdi-light--home]',
    size: 'small',
  },
}

export const Medium: Story = {
  args: {
    icon: 'icon-[mdi-light--home]',
    size: 'medium',
  },
}

export const Large: Story = {
  args: {
    icon: 'icon-[mdi-light--home]',
    size: 'large',
  },
}

export const ColoredIcon: Story = {
  args: {
    icon: 'icon-[mdi-light--heart]',
    color: 'text-red-500',
  },
}

export const WithTitle: Story = {
  args: {
    icon: 'icon-[mdi-light--alert]',
    title: 'Warning',
  },
}

// Different icon examples
export const UserIcon: Story = {
  args: {
    icon: 'icon-[mdi-light--account]',
  },
}

export const SettingsIcon: Story = {
  args: {
    icon: 'icon-[mdi-light--cog]',
  },
}

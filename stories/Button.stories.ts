import type { Meta, StoryObj } from '@storybook/html'
import { fn } from '@storybook/test'

import { Button, ButtonOptions } from '../src/components/button'
import { renderTempoComponent } from './common'
import { attr, html } from '@tempots/dom'
import { allColors, ThemedColor } from '../src/components/theme/colors'
import { ButtonVariant } from '../src/components/theme/types'

const colors: ThemedColor[] = ['primary', 'secondary', 'neutral', ...allColors]

const variants: ButtonVariant[] = [
  'filled',
  'light',
  'outline',
  'default',
  'text',
]

// Create a wrapper function to render the Button with Theme
const renderButton = (args: ButtonOptions & { text: string }) => {
  const { text, ...buttonOptions } = args

  return html.table(
    colors.map(color =>
      html.tr(
        variants.map(variant =>
          html.td(
            attr.class('p-1'),
            Button({ ...buttonOptions, color, variant }, text)
          )
        )
      )
    )
  )
}

// Define the meta for the component
const meta = {
  title: 'Components/Button',
  tags: ['autodocs'],
  render: renderTempoComponent(renderButton),
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },
    roundedness: {
      control: { type: 'select' },
      options: ['none', 'small', 'medium', 'large', 'full'],
    },
  },
  args: {
    text: 'Button',
    size: 'medium',
    disabled: false,
    onClick: fn(),
  },
} satisfies Meta<ButtonOptions & { text: string }>

export default meta
type Story = StoryObj<ButtonOptions & { text: string }>

// Define the stories
export const Standard: Story = {
  args: { size: 'medium' },
}

export const RoundedNone: Story = {
  args: {
    roundedness: 'none',
  },
}

export const RoundedSmall: Story = {
  args: {
    roundedness: 'small',
  },
}

export const RoundedMedium: Story = {
  args: {
    roundedness: 'medium',
  },
}

export const RoundedLarge: Story = {
  args: {
    roundedness: 'large',
  },
}

export const RoundedFull: Story = {
  args: {
    roundedness: 'full',
  },
}

export const Small: Story = {
  args: {
    size: 'small',
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

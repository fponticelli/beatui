import type { Meta, StoryObj } from '@storybook/html'
import { fn } from '@storybook/test'

import { Button, ButtonOptions, ButtonVariant, Icon } from '../src/'
import { themeColorNames } from '../src/tokens'
import { renderTempoComponent } from './common'
import { attr, html, TNode } from '@tempots/dom'

const variants: ButtonVariant[] = [
  'filled',
  'light',
  'outline',
  'default',
  'text',
]

// Create a wrapper function to render the Button with Theme
const renderButton = (
  args: ButtonOptions & {
    text: string
    before: string | undefined
    after: string | undefined
  }
) => {
  const { before, after, ...buttonOptions } = args

  return html.table(
    themeColorNames.map(color =>
      html.tr(
        variants.map(variant => {
          const content: TNode[] = []
          if (before) {
            content.push(Icon({ icon: before, size: buttonOptions.size }))
          }
          content.push(color)
          if (after) {
            content.push(Icon({ icon: after, size: buttonOptions.size }))
          }
          return html.td(
            attr.class('bu-text-center bc-control--padding-sm'),
            Button(
              {
                ...buttonOptions,
                color,
                variant,
              },
              ...content
            )
          )
        })
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
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },
    roundedness: {
      control: { type: 'select' },
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'full'],
    },
    before: {
      control: { type: 'select' },
      options: [
        undefined,
        'line-md:home',
        'line-md:account',
        'line-md:cog',
        'line-md:heart',
        'line-md:alert',
      ],
    },
    after: {
      control: { type: 'select' },
      options: [
        undefined,
        'line-md:home',
        'line-md:account',
        'line-md:cog',
        'line-md:heart',
        'line-md:alert',
      ],
    },
  },
  args: {
    text: 'Button',
    size: 'md',
    disabled: false,
    onClick: fn(),
  },
} satisfies Meta<
  ButtonOptions & {
    text: string
    before: string | undefined
    after: string | undefined
  }
>

export default meta
type Story = StoryObj<
  ButtonOptions & {
    text: string
    before: string | undefined
    after: string | undefined
  }
>

// Define the stories
export const Standard: Story = {
  args: { size: 'md' },
}

export const RoundedNone: Story = {
  args: {
    roundedness: 'none',
  },
}

export const RoundedSmall: Story = {
  args: {
    roundedness: 'sm',
  },
}

export const RoundedMedium: Story = {
  args: {
    roundedness: 'md',
  },
}

export const RoundedLarge: Story = {
  args: {
    roundedness: 'lg',
  },
}

export const RoundedFull: Story = {
  args: {
    roundedness: 'full',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

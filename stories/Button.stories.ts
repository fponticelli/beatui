import type { Meta, StoryObj } from '@storybook/html'
import { fn } from '@storybook/test'

import {
  allColors,
  Button,
  ButtonOptions,
  ButtonVariant,
  Icon,
  ThemedColor,
} from '../src/'
import { renderTempoComponent } from './common'
import { attr, html, TNode } from '@tempots/dom'

const colors: ThemedColor[] = ['primary', 'secondary', 'neutral', ...allColors]

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
  const { text, before, after, ...buttonOptions } = args

  return html.table(
    colors.map(color =>
      html.tr(
        variants.map(variant => {
          const content: TNode[] = []
          if (before) {
            content.push(Icon({ icon: before, size: buttonOptions.size }))
          }
          content.push(text)
          if (after) {
            content.push(Icon({ icon: after, size: buttonOptions.size }))
          }
          return html.td(
            attr.class('p-1'),
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
      options: ['small', 'medium', 'large'],
    },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },
    roundedness: {
      control: { type: 'select' },
      options: ['none', 'small', 'medium', 'large', 'full'],
    },
    before: {
      control: { type: 'select' },
      options: [
        undefined,
        'icon-[line-md--home]',
        'icon-[line-md--account]',
        'icon-[line-md--cog]',
        'icon-[line-md--heart]',
        'icon-[line-md--alert]',
      ],
    },
    after: {
      control: { type: 'select' },
      options: [
        undefined,
        'icon-[line-md--home]',
        'icon-[line-md--account]',
        'icon-[line-md--cog]',
        'icon-[line-md--heart]',
        'icon-[line-md--alert]',
      ],
    },
  },
  args: {
    text: 'Button',
    size: 'medium',
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

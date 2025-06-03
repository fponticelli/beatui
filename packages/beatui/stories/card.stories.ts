import type { Meta, StoryObj } from '@storybook/html-vite'

import { Card } from '../src/'
import { renderTempoComponent } from './common'
import { attr, html, prop } from '@tempots/dom'
import { CardVariant, ControlSize } from '../src/components/theme'
import { RadiusName } from '../src/tokens/radius'

// Define the Card options interface for Storybook
interface CardStoryOptions {
  variant: CardVariant
  size: ControlSize
  roundedness: RadiusName
  content: string
}

// Create a wrapper function to render the Card with Theme
const renderCard = (args: CardStoryOptions) => {
  const { variant, size, roundedness, content } = args

  return html.div(
    attr.class('bu-flex bu-flex-col bu-gap-lg bu-p-lg'),
    html.h3('Card Examples'),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-md'),
      html.span('Interactive Example:'),
      Card(
        {
          variant: prop(variant),
          size: prop(size),
          roundedness: prop(roundedness),
        },
        html.div(
          attr.class('bu-flex bu-flex-col bu-gap-sm'),
          html.h4('Card Title'),
          html.p(content),
          html.div(
            attr.class('bu-flex bu-gap-sm bu-mt-md'),
            html.button(
              attr.class(
                'bu-px-md bu-py-sm bu-bg-primary bu-text-white bu-rounded'
              ),
              'Action'
            ),
            html.button(
              attr.class(
                'bu-px-md bu-py-sm bu-border bu-border-gray-300 bu-rounded'
              ),
              'Cancel'
            )
          )
        )
      )
    ),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-sm'),
      html.span('Variant Examples:'),
      html.div(
        attr.class('bu-grid bu-grid-cols-2 bu-gap-md'),
        Card(
          { variant: prop('default') },
          html.div(
            attr.class('bu-p-sm'),
            html.h5('Default Card'),
            html.p('Standard card with default styling.')
          )
        ),
        Card(
          { variant: prop('elevated') },
          html.div(
            attr.class('bu-p-sm'),
            html.h5('Elevated Card'),
            html.p('Card with enhanced shadow for prominence.')
          )
        ),
        Card(
          { variant: prop('flat') },
          html.div(
            attr.class('bu-p-sm'),
            html.h5('Flat Card'),
            html.p('Minimal card without shadow.')
          )
        ),
        Card(
          { variant: prop('outlined') },
          html.div(
            attr.class('bu-p-sm'),
            html.h5('Outlined Card'),
            html.p('Card with prominent border.')
          )
        )
      )
    ),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-sm'),
      html.span('Size Examples:'),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-md'),
        Card({ size: prop('xs') }, html.div('Extra Small Padding')),
        Card({ size: prop('sm') }, html.div('Small Padding')),
        Card({ size: prop('md') }, html.div('Medium Padding (Default)')),
        Card({ size: prop('lg') }, html.div('Large Padding')),
        Card({ size: prop('xl') }, html.div('Extra Large Padding'))
      )
    ),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-sm'),
      html.span('Roundedness Examples:'),
      html.div(
        attr.class('bu-grid bu-grid-cols-3 bu-gap-md'),
        Card(
          { roundedness: prop('none') },
          html.div(attr.class('bu-p-sm'), 'No Radius')
        ),
        Card(
          { roundedness: prop('sm') },
          html.div(attr.class('bu-p-sm'), 'Small Radius')
        ),
        Card(
          { roundedness: prop('md') },
          html.div(attr.class('bu-p-sm'), 'Medium Radius')
        ),
        Card(
          { roundedness: prop('lg') },
          html.div(attr.class('bu-p-sm'), 'Large Radius (Default)')
        ),
        Card(
          { roundedness: prop('xl') },
          html.div(attr.class('bu-p-sm'), 'Extra Large Radius')
        ),
        Card(
          { roundedness: prop('full') },
          html.div(attr.class('bu-p-sm'), 'Full Radius')
        )
      )
    )
  )
}

// Define the meta for the component
const meta = {
  title: 'Components/Layout/Card',
  tags: ['autodocs'],
  render: renderTempoComponent(renderCard),
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'flat', 'outlined'],
      description: 'The visual variant of the card',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'The padding size of the card',
    },
    roundedness: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
      description: 'The border radius of the card',
    },
    content: {
      control: 'text',
      description: 'The content text for the card',
    },
  },
  args: {
    variant: 'default',
    size: 'md',
    roundedness: 'lg',
    content:
      'This is a sample card with some content to demonstrate the card component styling and layout.',
  },
} satisfies Meta<CardStoryOptions>

export default meta
type Story = StoryObj<CardStoryOptions>

// Define the stories
export const Default: Story = {
  args: {
    variant: 'default',
    size: 'md',
    roundedness: 'lg',
    content: 'Default card with standard styling.',
  },
}

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    size: 'md',
    roundedness: 'lg',
    content: 'Elevated card with enhanced shadow.',
  },
}

export const Flat: Story = {
  args: {
    variant: 'flat',
    size: 'md',
    roundedness: 'lg',
    content: 'Flat card without shadow.',
  },
}

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    size: 'md',
    roundedness: 'lg',
    content: 'Outlined card with prominent border.',
  },
}

export const SmallPadding: Story = {
  args: {
    variant: 'default',
    size: 'sm',
    roundedness: 'lg',
    content: 'Card with small padding.',
  },
}

export const LargePadding: Story = {
  args: {
    variant: 'default',
    size: 'lg',
    roundedness: 'lg',
    content: 'Card with large padding.',
  },
}

export const FullRadius: Story = {
  args: {
    variant: 'default',
    size: 'md',
    roundedness: 'full',
    content: 'Card with full border radius.',
  },
}

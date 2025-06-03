import type { Meta, StoryObj } from '@storybook/html-vite'

import { Sink } from '../src/'
import { renderTempoComponent } from './common'
import { attr, html, prop } from '@tempots/dom'
import { SinkVariant, ControlSize } from '../src/components/theme'
import { RadiusName } from '../src/tokens/radius'

// Define the Sink options interface for Storybook
interface SinkStoryOptions {
  variant: SinkVariant
  size: ControlSize
  roundedness: RadiusName
  content: string
}

// Create a wrapper function to render the Sink with Theme
const renderSink = (args: SinkStoryOptions) => {
  const { variant, size, roundedness, content } = args

  return html.div(
    attr.class('bu-flex bu-flex-col bu-gap-lg bu-p-lg'),
    html.h3('Sink Examples'),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-md'),
      html.span('Interactive Example:'),
      Sink(
        {
          variant: prop(variant),
          size: prop(size),
          roundedness: prop(roundedness),
        },
        html.div(
          attr.class('bu-flex bu-flex-col bu-gap-sm'),
          html.h4('Sink Container'),
          html.p(content),
          html.div(
            attr.class('bu-flex bu-gap-sm bu-mt-md'),
            html.input(
              attr.class(
                'bu-px-sm bu-py-xs bu-border bu-border-gray-300 bu-rounded'
              ),
              attr.placeholder('Enter text...')
            ),
            html.button(
              attr.class(
                'bu-px-md bu-py-xs bu-bg-primary bu-text-white bu-rounded'
              ),
              'Submit'
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
        Sink(
          { variant: prop('default') },
          html.div(
            attr.class('bu-p-sm'),
            html.h5('Default Sink'),
            html.p('Standard inset container with default depth.')
          )
        ),
        Sink(
          { variant: prop('deep') },
          html.div(
            attr.class('bu-p-sm'),
            html.h5('Deep Sink'),
            html.p('Container with deeper inset shadow.')
          )
        ),
        Sink(
          { variant: prop('shallow') },
          html.div(
            attr.class('bu-p-sm'),
            html.h5('Shallow Sink'),
            html.p('Container with subtle inset effect.')
          )
        ),
        Sink(
          { variant: prop('flat') },
          html.div(
            attr.class('bu-p-sm'),
            html.h5('Flat Sink'),
            html.p('Container without inset shadow.')
          )
        )
      )
    ),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-sm'),
      html.span('Size Examples:'),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-md'),
        Sink({ size: prop('xs') }, html.div('Extra Small Padding')),
        Sink({ size: prop('sm') }, html.div('Small Padding')),
        Sink({ size: prop('md') }, html.div('Medium Padding (Default)')),
        Sink({ size: prop('lg') }, html.div('Large Padding')),
        Sink({ size: prop('xl') }, html.div('Extra Large Padding'))
      )
    ),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-sm'),
      html.span('Roundedness Examples:'),
      html.div(
        attr.class('bu-grid bu-grid-cols-3 bu-gap-md'),
        Sink(
          { roundedness: prop('none') },
          html.div(attr.class('bu-p-sm'), 'No Radius')
        ),
        Sink(
          { roundedness: prop('sm') },
          html.div(attr.class('bu-p-sm'), 'Small Radius')
        ),
        Sink(
          { roundedness: prop('md') },
          html.div(attr.class('bu-p-sm'), 'Medium Radius')
        ),
        Sink(
          { roundedness: prop('lg') },
          html.div(attr.class('bu-p-sm'), 'Large Radius (Default)')
        ),
        Sink(
          { roundedness: prop('xl') },
          html.div(attr.class('bu-p-sm'), 'Extra Large Radius')
        ),
        Sink(
          { roundedness: prop('full') },
          html.div(attr.class('bu-p-sm'), 'Full Radius')
        )
      )
    ),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-sm'),
      html.span('Use Cases:'),
      html.div(
        attr.class('bu-grid bu-grid-cols-1 bu-gap-md'),
        Sink(
          { variant: prop('default'), size: prop('md') },
          html.div(
            attr.class('bu-flex bu-flex-col bu-gap-sm'),
            html.h5('Form Container'),
            html.div(
              attr.class('bu-flex bu-flex-col bu-gap-sm'),
              html.label('Name:'),
              html.input(
                attr.class(
                  'bu-px-sm bu-py-xs bu-border bu-border-gray-300 bu-rounded'
                ),
                attr.placeholder('Enter your name')
              ),
              html.label('Email:'),
              html.input(
                attr.class(
                  'bu-px-sm bu-py-xs bu-border bu-border-gray-300 bu-rounded'
                ),
                attr.placeholder('Enter your email'),
                attr.type('email')
              )
            )
          )
        ),
        Sink(
          { variant: prop('deep'), size: prop('lg') },
          html.div(
            attr.class('bu-text-center'),
            html.h5('Content Well'),
            html.p(
              'Perfect for displaying content that should appear recessed or embedded in the page.'
            ),
            html.div(
              attr.class('bu-bg-white bu-p-md bu-rounded bu-mt-md'),
              html.p('Nested content can be placed inside for layered effects.')
            )
          )
        )
      )
    )
  )
}

// Define the meta for the component
const meta = {
  title: 'Components/Layout/Sink',
  tags: ['autodocs'],
  render: renderTempoComponent(renderSink),
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'deep', 'shallow', 'flat'],
      description: 'The visual variant of the sink',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'The padding size of the sink',
    },
    roundedness: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
      description: 'The border radius of the sink',
    },
    content: {
      control: 'text',
      description: 'The content text for the sink',
    },
  },
  args: {
    variant: 'default',
    size: 'md',
    roundedness: 'lg',
    content:
      'This is a sample sink container with inset styling to create a recessed appearance.',
  },
} satisfies Meta<SinkStoryOptions>

export default meta
type Story = StoryObj<SinkStoryOptions>

// Define the stories
export const Default: Story = {
  args: {
    variant: 'default',
    size: 'md',
    roundedness: 'lg',
    content: 'Default sink with standard inset styling.',
  },
}

export const Deep: Story = {
  args: {
    variant: 'deep',
    size: 'md',
    roundedness: 'lg',
    content: 'Deep sink with enhanced inset shadow.',
  },
}

export const Shallow: Story = {
  args: {
    variant: 'shallow',
    size: 'md',
    roundedness: 'lg',
    content: 'Shallow sink with subtle inset effect.',
  },
}

export const Flat: Story = {
  args: {
    variant: 'flat',
    size: 'md',
    roundedness: 'lg',
    content: 'Flat sink without inset shadow.',
  },
}

export const SmallPadding: Story = {
  args: {
    variant: 'default',
    size: 'sm',
    roundedness: 'lg',
    content: 'Sink with small padding.',
  },
}

export const LargePadding: Story = {
  args: {
    variant: 'default',
    size: 'lg',
    roundedness: 'lg',
    content: 'Sink with large padding.',
  },
}

export const FullRadius: Story = {
  args: {
    variant: 'default',
    size: 'md',
    roundedness: 'full',
    content: 'Sink with full border radius.',
  },
}

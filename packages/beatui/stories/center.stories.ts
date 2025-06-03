import type { Meta, StoryObj } from '@storybook/html-vite'

import { Center, CenterH } from '../src/'
import { renderTempoComponent } from './common'
import { attr, html, prop } from '@tempots/dom'
import { CenterGap } from '../src/components/theme'

// Define the Center options interface for Storybook
interface CenterStoryOptions {
  gap: CenterGap
  content: string
}

// Create a wrapper function to render the Center with Theme
const renderCenter = (args: CenterStoryOptions) => {
  const { gap, content } = args

  return html.div(
    attr.class('bu-flex bu-flex-col bu-gap-lg'),
    html.h3('Center Examples'),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-md'),
      html.span('Interactive Example:'),
      html.div(
        attr.class('bu-border bu-border-dashed bu-border-gray-300 bu-h-64'),
        Center(
          { gap: prop(gap) },
          html.div(
            attr.class('bu-bg-blue-100 bu-p-md bu-rounded'),
            html.h4('Centered Content')
          ),
          html.p(content),
          html.button(
            attr.class(
              'bu-px-md bu-py-sm bu-bg-primary bu-text-white bu-rounded'
            ),
            'Action Button'
          )
        )
      )
    ),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-sm'),
      html.span('Gap Examples:'),
      html.div(
        attr.class('bu-grid bu-grid-cols-2 bu-gap-md'),
        html.div(
          attr.class('bu-border bu-border-dashed bu-border-gray-300 bu-h-32'),
          Center(
            { gap: prop('none') },
            html.div(attr.class('bu-bg-red-100 bu-p-sm bu-rounded'), 'Item 1'),
            html.div(
              attr.class('bu-bg-green-100 bu-p-sm bu-rounded'),
              'Item 2'
            ),
            html.div(attr.class('bu-bg-blue-100 bu-p-sm bu-rounded'), 'Item 3')
          )
        ),
        html.div(
          attr.class('bu-border bu-border-dashed bu-border-gray-300 bu-h-32'),
          Center(
            { gap: prop('xs') },
            html.div(attr.class('bu-bg-red-100 bu-p-sm bu-rounded'), 'Item 1'),
            html.div(
              attr.class('bu-bg-green-100 bu-p-sm bu-rounded'),
              'Item 2'
            ),
            html.div(attr.class('bu-bg-blue-100 bu-p-sm bu-rounded'), 'Item 3')
          )
        ),
        html.div(
          attr.class('bu-border bu-border-dashed bu-border-gray-300 bu-h-32'),
          Center(
            { gap: prop('sm') },
            html.div(attr.class('bu-bg-red-100 bu-p-sm bu-rounded'), 'Item 1'),
            html.div(
              attr.class('bu-bg-green-100 bu-p-sm bu-rounded'),
              'Item 2'
            ),
            html.div(attr.class('bu-bg-blue-100 bu-p-sm bu-rounded'), 'Item 3')
          )
        ),
        html.div(
          attr.class('bu-border bu-border-dashed bu-border-gray-300 bu-h-32'),
          Center(
            { gap: prop('md') },
            html.div(attr.class('bu-bg-red-100 bu-p-sm bu-rounded'), 'Item 1'),
            html.div(
              attr.class('bu-bg-green-100 bu-p-sm bu-rounded'),
              'Item 2'
            ),
            html.div(attr.class('bu-bg-blue-100 bu-p-sm bu-rounded'), 'Item 3')
          )
        ),
        html.div(
          attr.class('bu-border bu-border-dashed bu-border-gray-300 bu-h-32'),
          Center(
            { gap: prop('lg') },
            html.div(attr.class('bu-bg-red-100 bu-p-sm bu-rounded'), 'Item 1'),
            html.div(
              attr.class('bu-bg-green-100 bu-p-sm bu-rounded'),
              'Item 2'
            ),
            html.div(attr.class('bu-bg-blue-100 bu-p-sm bu-rounded'), 'Item 3')
          )
        ),
        html.div(
          attr.class('bu-border bu-border-dashed bu-border-gray-300 bu-h-32'),
          Center(
            { gap: prop('xl') },
            html.div(attr.class('bu-bg-red-100 bu-p-sm bu-rounded'), 'Item 1'),
            html.div(
              attr.class('bu-bg-green-100 bu-p-sm bu-rounded'),
              'Item 2'
            ),
            html.div(attr.class('bu-bg-blue-100 bu-p-sm bu-rounded'), 'Item 3')
          )
        )
      )
    ),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-sm'),
      html.span('CenterH (Horizontal Only) Example:'),
      html.div(
        attr.class('bu-border bu-border-dashed bu-border-gray-300 bu-p-md'),
        CenterH(
          html.div(
            attr.class('bu-bg-purple-100 bu-p-md bu-rounded'),
            html.h4('Horizontally Centered'),
            html.p(
              'This content is only centered horizontally, not vertically.'
            )
          )
        )
      )
    ),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-sm'),
      html.span('Use Cases:'),
      html.div(
        attr.class('bu-grid bu-grid-cols-1 bu-gap-md'),
        html.div(
          attr.class('bu-border bu-border-dashed bu-border-gray-300 bu-h-48'),
          Center(
            { gap: prop('md') },
            html.div(
              attr.class('bu-text-center'),
              html.h4('Loading State'),
              html.div(
                attr.class(
                  'bu-w-8 bu-h-8 bu-bg-blue-500 bu-rounded-full bu-animate-pulse'
                )
              ),
              html.p('Please wait...')
            )
          )
        ),
        html.div(
          attr.class('bu-border bu-border-dashed bu-border-gray-300 bu-h-48'),
          Center(
            { gap: prop('lg') },
            html.div(
              attr.class('bu-text-center'),
              html.h4('Empty State'),
              html.div(attr.class('bu-text-6xl'), '📭'),
              html.p('No items found'),
              html.button(
                attr.class(
                  'bu-px-md bu-py-sm bu-bg-primary bu-text-white bu-rounded'
                ),
                'Add Item'
              )
            )
          )
        )
      )
    )
  )
}

// Define the meta for the component
const meta = {
  title: 'Components/Layout/Center',
  tags: ['autodocs'],
  render: renderTempoComponent(renderCenter),
  argTypes: {
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'The gap between centered items',
    },
    content: {
      control: 'text',
      description: 'The content text for demonstration',
    },
  },
  args: {
    gap: 'lg',
    content:
      'This content is perfectly centered both horizontally and vertically.',
  },
} satisfies Meta<CenterStoryOptions>

export default meta
type Story = StoryObj<CenterStoryOptions>

// Define the stories
export const Default: Story = {
  args: {
    gap: 'lg',
    content: 'Default center with large gap.',
  },
}

export const NoGap: Story = {
  args: {
    gap: 'none',
    content: 'Center with no gap between items.',
  },
}

export const SmallGap: Story = {
  args: {
    gap: 'sm',
    content: 'Center with small gap between items.',
  },
}

export const LargeGap: Story = {
  args: {
    gap: 'xl',
    content: 'Center with extra large gap between items.',
  },
}

export const LoadingState: Story = {
  args: {
    gap: 'md',
    content: 'Perfect for loading states and spinners.',
  },
}

export const EmptyState: Story = {
  args: {
    gap: 'lg',
    content: 'Great for empty states with call-to-action buttons.',
  },
}

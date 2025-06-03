import type { Meta, StoryObj } from '@storybook/html-vite'

import { Tag } from '../src/'
import { renderTempoComponent } from './common'
import { attr, html, prop } from '@tempots/dom'
import { ThemeColorName } from '../src/tokens'

// Define the Tag options interface for Storybook
interface TagStoryOptions {
  value: string
  disabled: boolean
  closable: boolean
  color: ThemeColorName
}

// Create a wrapper function to render the Tag with Theme
const renderTag = (args: TagStoryOptions) => {
  const { value, disabled, closable, color } = args
  const tagValue = prop(value)

  return html.div(
    attr.class('bu-flex bu-flex-col bu-gap-lg'),
    html.h3('Tag Examples'),
    html.div(
      attr.class('bu-flex bu-flex-row bu-gap-md bu-items-center'),
      html.span('Interactive Example:'),
      Tag({
        value: tagValue,
        disabled: disabled ? prop(true) : undefined,
        color: prop(color),
        onClose: closable
          ? (value: string) => {
              console.log('Closing tag:', value)
              tagValue.set('')
            }
          : undefined,
      })
    ),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-sm'),
      html.span('Color Variants:'),
      html.div(
        attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center bu-flex-wrap'),
        Tag({
          value: prop('Base'),
          color: prop('base'),
          onClose: (value: string) => console.log('Base tag closed:', value),
        }),
        Tag({
          value: prop('Primary'),
          color: prop('primary'),
          onClose: (value: string) => console.log('Primary tag closed:', value),
        }),
        Tag({
          value: prop('Secondary'),
          color: prop('secondary'),
          onClose: (value: string) => console.log('Secondary tag closed:', value),
        }),
        Tag({
          value: prop('Success'),
          color: prop('success'),
          onClose: (value: string) => console.log('Success tag closed:', value),
        }),
        Tag({
          value: prop('Warning'),
          color: prop('warning'),
          onClose: (value: string) => console.log('Warning tag closed:', value),
        }),
        Tag({
          value: prop('Error'),
          color: prop('error'),
          onClose: (value: string) => console.log('Error tag closed:', value),
        }),
        Tag({
          value: prop('Info'),
          color: prop('info'),
          onClose: (value: string) => console.log('Info tag closed:', value),
        })
      )
    ),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-sm'),
      html.span('Tag States:'),
      html.div(
        attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
        html.span('Default:'),
        Tag({
          value: prop('Default Tag'),
          color: prop('base'),
          onClose: (value: string) => console.log('Default tag closed:', value),
        })
      ),
      html.div(
        attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
        html.span('Disabled:'),
        Tag({
          value: prop('Disabled Tag'),
          color: prop('primary'),
          disabled: prop(true),
          onClose: (value: string) => console.log('Disabled tag closed:', value),
        })
      ),
      html.div(
        attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
        html.span('Without Close:'),
        Tag({
          value: prop('Read-only Tag'),
          color: prop('info'),
        })
      )
    ),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-sm'),
      html.span('Use Cases:'),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center bu-flex-wrap'),
          html.span('Technologies:'),
          Tag({ value: prop('JavaScript'), color: prop('primary') }),
          Tag({ value: prop('TypeScript'), color: prop('info') }),
          Tag({ value: prop('React'), color: prop('success') }),
          Tag({ value: prop('Vue'), color: prop('success') }),
          Tag({ value: prop('Angular'), color: prop('error') }),
          Tag({ value: prop('Svelte'), color: prop('warning') })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center bu-flex-wrap'),
          html.span('Status:'),
          Tag({ value: prop('Active'), color: prop('success') }),
          Tag({ value: prop('Pending'), color: prop('warning') }),
          Tag({ value: prop('Failed'), color: prop('error') }),
          Tag({ value: prop('Draft'), color: prop('secondary') })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center bu-flex-wrap'),
          html.span('Categories:'),
          Tag({
            value: prop('Frontend'),
            color: prop('primary'),
            onClose: (value: string) => console.log('Category removed:', value)
          }),
          Tag({
            value: prop('Backend'),
            color: prop('info'),
            onClose: (value: string) => console.log('Category removed:', value)
          }),
          Tag({
            value: prop('DevOps'),
            color: prop('warning'),
            onClose: (value: string) => console.log('Category removed:', value)
          })
        )
      )
    )
  )
}

// Define the meta for the component
const meta = {
  title: 'Components/Data/Tag',
  tags: ['autodocs'],
  render: renderTempoComponent(renderTag),
  argTypes: {
    value: {
      control: 'text',
      description: 'The text content of the tag',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the tag is disabled',
    },
    closable: {
      control: 'boolean',
      description: 'Whether the tag can be closed/removed',
    },
    color: {
      control: 'select',
      options: ['base', 'primary', 'secondary', 'success', 'warning', 'error', 'info'],
      description: 'The color variant of the tag',
    },
  },
  args: {
    value: 'Sample Tag',
    disabled: false,
    closable: true,
    color: 'base',
  },
} satisfies Meta<TagStoryOptions>

export default meta
type Story = StoryObj<TagStoryOptions>

// Define the stories
export const Default: Story = {
  args: {
    value: 'Default Tag',
    disabled: false,
    closable: true,
    color: 'base',
  },
}

export const Primary: Story = {
  args: {
    value: 'Primary Tag',
    disabled: false,
    closable: true,
    color: 'primary',
  },
}

export const Success: Story = {
  args: {
    value: 'Success Tag',
    disabled: false,
    closable: true,
    color: 'success',
  },
}

export const Warning: Story = {
  args: {
    value: 'Warning Tag',
    disabled: false,
    closable: true,
    color: 'warning',
  },
}

export const Error: Story = {
  args: {
    value: 'Error Tag',
    disabled: false,
    closable: true,
    color: 'error',
  },
}

export const Disabled: Story = {
  args: {
    value: 'Disabled Tag',
    disabled: true,
    closable: true,
    color: 'primary',
  },
}

export const ReadOnly: Story = {
  args: {
    value: 'Read-only Tag',
    disabled: false,
    closable: false,
    color: 'info',
  },
}

export const LongText: Story = {
  args: {
    value: 'This is a very long tag with lots of text content',
    disabled: false,
    closable: true,
    color: 'secondary',
  },
}

import type { Meta, StoryObj } from '@storybook/html-vite'

import { EditableText, EditableTextOptions } from '../src/'
import { renderTempoComponent } from './common'
import { attr, html, prop } from '@tempots/dom'

// Define the EditableText options interface for Storybook
interface EditableTextStoryOptions {
  value: string
  placeholder: string
  startEditing: boolean
}

const LocalEditableText = (
  options: Omit<EditableTextOptions, 'onChange' | 'value'> & { value: string }
) => {
  const value = prop(options.value)
  return EditableText({
    ...options,
    value,
    onChange: (newValue: string) => {
      console.log('Value changed:', newValue)
      value.set(newValue)
    },
  })
}

// Create a wrapper function to render the EditableText with Theme
const renderEditableText = (args: EditableTextStoryOptions) => {
  const { placeholder, startEditing } = args
  const placeholderValue = prop(placeholder)

  return html.div(
    attr.class('bu-flex bu-flex-col bu-gap-lg'),
    html.h3('Editable Text Examples'),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-md'),
      html.div(
        attr.class('bu-flex bu-flex-row bu-gap-md bu-items-center'),
        html.span('Interactive Example:'),
        LocalEditableText({
          value: 'Sample Text',
          placeholder: placeholderValue,
          startEditing: startEditing ? prop(true) : undefined,
        })
      ),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('Different States:'),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('With Value:'),
          LocalEditableText({
            value: 'Sample Text',
            placeholder: 'Enter text here',
          })
        )
      ),
      html.div(
        attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
        html.span('Empty (Placeholder):'),
        LocalEditableText({
          value: '',
          placeholder: 'Click to edit',
        })
      ),
      html.div(
        attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
        html.span('Long Text:'),
        LocalEditableText({
          value:
            'This is a longer piece of text that demonstrates how the component handles more content',
          placeholder: 'Enter description',
        })
      ),
      html.div(
        attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
        html.span('Start Editing:'),
        LocalEditableText({
          value: 'Edit me immediately',
          placeholder: 'Type here',
          startEditing: prop(true),
        })
      ),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('Form Example:'),
        html.div(
          attr.class(
            'bu-flex bu-flex-col bu-gap-sm bu-p-md bu-border bu-rounded'
          ),
          html.div(
            attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
            html.span('Name:'),
            LocalEditableText({
              value: 'John Doe',
              placeholder: 'Enter your name',
            })
          ),
          html.div(
            attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
            html.span('Title:'),
            LocalEditableText({
              value: 'Software Engineer',
              placeholder: 'Enter your title',
            })
          ),
          html.div(
            attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
            html.span('Bio:'),
            LocalEditableText({
              value: '',
              placeholder: 'Tell us about yourself',
            })
          )
        )
      ),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('Usage Instructions:'),
        html.ul(
          attr.class('bu-text-sm bu-text-gray-600'),
          html.li('• Click on any text to start editing'),
          html.li('• Press Enter to save changes'),
          html.li('• Press Escape to cancel editing'),
          html.li('• Click outside the input to save changes')
        )
      )
    )
  )
}

// Define the meta for the component
const meta = {
  title: 'Components/Form/EditableText',
  tags: ['autodocs'],
  render: renderTempoComponent(renderEditableText),
  argTypes: {
    value: {
      control: 'text',
      description: 'The current text value',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when value is empty',
    },
    startEditing: {
      control: 'boolean',
      description: 'Whether to start in editing mode',
    },
  },
  args: {
    value: 'Click to edit this text',
    placeholder: 'Enter text here',
    startEditing: false,
  },
} satisfies Meta<EditableTextStoryOptions>

export default meta
type Story = StoryObj<EditableTextStoryOptions>

// Define the stories
export const Default: Story = {
  args: {
    value: 'Click to edit this text',
    placeholder: 'Enter text here',
    startEditing: false,
  },
}

export const Empty: Story = {
  args: {
    value: '',
    placeholder: 'Click to add text',
    startEditing: false,
  },
}

export const StartEditing: Story = {
  args: {
    value: 'This text starts in edit mode',
    placeholder: 'Type here',
    startEditing: true,
  },
}

export const LongText: Story = {
  args: {
    value:
      'This is a much longer piece of text that demonstrates how the editable text component handles content that spans multiple words and shows the text wrapping behavior',
    placeholder: 'Enter a long description',
    startEditing: false,
  },
}

export const ShortPlaceholder: Story = {
  args: {
    value: '',
    placeholder: 'Name',
    startEditing: false,
  },
}

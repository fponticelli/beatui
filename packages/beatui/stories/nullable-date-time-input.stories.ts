import type { Meta, StoryObj } from '@storybook/html-vite'

import { NullableDateTimeInput } from '../src/'
import { renderTempoComponent } from './common'
import { attr, html, prop } from '@tempots/dom'

// Define the NullableDateTimeInput options interface for Storybook
interface NullableDateTimeInputStoryOptions {
  value: string | null
  disabled: boolean
  hasError: boolean
  placeholder: string
}

// Create a wrapper function to render the NullableDateTimeInput with Theme
const renderNullableDateTimeInput = (
  args: NullableDateTimeInputStoryOptions
) => {
  const { value, disabled, hasError, placeholder } = args
  const dateValue = prop(value ? new Date(value) : null)

  return html.div(
    attr.class('bu-flex bu-flex-col bu-gap-lg'),
    html.h3('Nullable DateTime Input Examples'),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-md'),
      html.div(
        attr.class('bu-flex bu-flex-row bu-gap-md bu-items-center'),
        html.span('Interactive Example:'),
        NullableDateTimeInput({
          value: dateValue,
          disabled: disabled ? prop(true) : undefined,
          hasError: hasError ? prop(true) : undefined,
          placeholder: placeholder ? prop(placeholder) : undefined,
          onChange: (newValue: Date | null) => {
            console.log('Value changed:', newValue)
            dateValue.set(newValue)
          },
          onBlur: (value: Date | null) => console.log('Blur:', value),
        })
      ),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('DateTime Input States:'),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('With Value:'),
          NullableDateTimeInput({
            value: prop(new Date('2024-01-15T14:30:00')),
            placeholder: 'Select date and time',
            onChange: (value: Date | null) =>
              console.log('With value changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Empty (Null):'),
          NullableDateTimeInput({
            value: prop(null),
            placeholder: 'No date selected',
            onChange: (value: Date | null) =>
              console.log('Empty changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Disabled:'),
          NullableDateTimeInput({
            value: prop(new Date('2024-12-25T09:00:00')),
            disabled: prop(true),
            placeholder: 'Disabled input',
            onChange: (value: Date | null) =>
              console.log('Disabled changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('With Error:'),
          NullableDateTimeInput({
            value: prop(null),
            hasError: prop(true),
            placeholder: 'Required field',
            onChange: (value: Date | null) =>
              console.log('Error changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Current Time:'),
          NullableDateTimeInput({
            value: prop(new Date()),
            placeholder: 'Current date and time',
            onChange: (value: Date | null) =>
              console.log('Current time changed:', value),
          })
        )
      ),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('Common Use Cases:'),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Meeting Start:'),
          NullableDateTimeInput({
            value: prop(new Date('2024-02-01T10:00:00')),
            placeholder: 'Meeting start time',
            onChange: (value: Date | null) =>
              console.log('Meeting start changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Deadline:'),
          NullableDateTimeInput({
            value: prop(new Date('2024-03-15T23:59:00')),
            placeholder: 'Project deadline',
            onChange: (value: Date | null) =>
              console.log('Deadline changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Optional Reminder:'),
          NullableDateTimeInput({
            value: prop(null),
            placeholder: 'Set reminder (optional)',
            onChange: (value: Date | null) =>
              console.log('Reminder changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Event End:'),
          NullableDateTimeInput({
            value: prop(new Date('2024-06-30T18:00:00')),
            placeholder: 'Event end time',
            onChange: (value: Date | null) =>
              console.log('Event end changed:', value),
          })
        )
      ),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('Form Example:'),
        html.form(
          attr.class(
            'bu-flex bu-flex-col bu-gap-sm bu-p-md bu-border bu-rounded'
          ),
          html.div(
            attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
            html.span('Start Date:'),
            NullableDateTimeInput({
              value: prop(new Date('2024-01-01T09:00:00')),
              placeholder: 'Project start',
              onChange: (value: Date | null) =>
                console.log('Start date changed:', value),
            })
          ),
          html.div(
            attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
            html.span('End Date:'),
            NullableDateTimeInput({
              value: prop(new Date('2024-12-31T17:00:00')),
              placeholder: 'Project end',
              onChange: (value: Date | null) =>
                console.log('End date changed:', value),
            })
          ),
          html.div(
            attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
            html.span('Review Date:'),
            NullableDateTimeInput({
              value: prop(null),
              placeholder: 'Optional review',
              onChange: (value: Date | null) =>
                console.log('Review date changed:', value),
            })
          )
        )
      ),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('Notes:'),
        html.ul(
          attr.class('bu-text-sm bu-text-gray-600'),
          html.li('• Supports null values for optional date/time fields'),
          html.li('• Uses native datetime-local input for better UX'),
          html.li('• Automatically formats dates for display'),
          html.li('• Handles timezone considerations')
        )
      )
    )
  )
}

// Define the meta for the component
const meta = {
  title: 'Components/Form/NullableDateTimeInput',
  tags: ['autodocs'],
  render: renderTempoComponent(renderNullableDateTimeInput),
  argTypes: {
    value: {
      control: 'text',
      description: 'The current date-time value (ISO string or null)',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    hasError: {
      control: 'boolean',
      description: 'Whether the input has an error state',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
  },
  args: {
    value: '2024-01-15T14:30',
    disabled: false,
    hasError: false,
    placeholder: 'Select date and time',
  },
} satisfies Meta<NullableDateTimeInputStoryOptions>

export default meta
type Story = StoryObj<NullableDateTimeInputStoryOptions>

// Define the stories
export const Default: Story = {
  args: {
    value: '2024-01-15T14:30',
    disabled: false,
    hasError: false,
    placeholder: 'Select date and time',
  },
}

export const Empty: Story = {
  args: {
    value: null,
    disabled: false,
    hasError: false,
    placeholder: 'No date selected',
  },
}

export const Disabled: Story = {
  args: {
    value: '2024-12-25T09:00',
    disabled: true,
    hasError: false,
    placeholder: 'Disabled input',
  },
}

export const WithError: Story = {
  args: {
    value: null,
    disabled: false,
    hasError: true,
    placeholder: 'Required field',
  },
}

export const CurrentTime: Story = {
  args: {
    value: new Date().toISOString().slice(0, 16),
    disabled: false,
    hasError: false,
    placeholder: 'Current date and time',
  },
}

export const FutureDate: Story = {
  args: {
    value: '2025-06-15T16:45',
    disabled: false,
    hasError: false,
    placeholder: 'Future appointment',
  },
}

import type { Meta, StoryObj } from '@storybook/html-vite'

import { CheckboxInput } from '../src/'
import { renderTempoComponent } from './common'
import { attr, html, prop } from '@tempots/dom'

// Define the CheckboxInput options interface for Storybook
interface CheckboxInputStoryOptions {
  checked: boolean
  disabled: boolean
  placeholder: string
  hasError: boolean
}

// Create a wrapper function to render the CheckboxInput with Theme
const renderCheckboxInput = (args: CheckboxInputStoryOptions) => {
  const { checked, disabled, placeholder, hasError } = args
  const checkedValue = prop(checked)

  return html.div(
    attr.class('bu-flex bu-flex-col bu-gap-lg'),
    html.h3('Checkbox Input Examples'),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-md'),
      html.div(
        attr.class('bu-flex bu-flex-row bu-gap-md bu-items-center'),
        html.span('Single Checkbox:'),
        CheckboxInput({
          value: checkedValue,
          disabled: disabled ? prop(true) : undefined,
          placeholder: placeholder ? prop(placeholder) : undefined,
          hasError: hasError ? prop(true) : undefined,
          onChange: (newValue: boolean) => {
            console.log('Checkbox changed:', newValue)
            checkedValue.set(newValue)
          },
        })
      ),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('Checkbox States:'),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Unchecked:'),
          CheckboxInput({
            value: prop(false),
            placeholder: prop('I agree to the terms'),
            onChange: (value: boolean) => console.log('Unchecked changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Checked:'),
          CheckboxInput({
            value: prop(true),
            placeholder: prop('I agree to the terms'),
            onChange: (value: boolean) => console.log('Checked changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Disabled Unchecked:'),
          CheckboxInput({
            value: prop(false),
            disabled: prop(true),
            placeholder: prop('Disabled option'),
            onChange: (value: boolean) => console.log('Disabled unchecked changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Disabled Checked:'),
          CheckboxInput({
            value: prop(true),
            disabled: prop(true),
            placeholder: prop('Disabled checked option'),
            onChange: (value: boolean) => console.log('Disabled checked changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('With Error:'),
          CheckboxInput({
            value: prop(false),
            hasError: prop(true),
            placeholder: prop('Required checkbox'),
            onChange: (value: boolean) => console.log('Error checkbox changed:', value),
          })
        )
      ),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('Form Example:'),
        html.form(
          attr.class('bu-flex bu-flex-col bu-gap-sm'),
          CheckboxInput({
            value: prop(false),
            placeholder: prop('I agree to the Terms of Service'),
            onChange: (value: boolean) => console.log('Terms agreed:', value),
          }),
          CheckboxInput({
            value: prop(false),
            placeholder: prop('I want to receive marketing emails'),
            onChange: (value: boolean) => console.log('Marketing emails:', value),
          }),
          CheckboxInput({
            value: prop(true),
            placeholder: prop('Remember my preferences'),
            onChange: (value: boolean) => console.log('Remember preferences:', value),
          })
        )
      )
    )
  )
}

// Define the meta for the component
const meta = {
  title: 'Components/Form/CheckboxInput',
  tags: ['autodocs'],
  render: renderTempoComponent(renderCheckboxInput),
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
    placeholder: {
      control: 'text',
      description: 'The label text for the checkbox',
    },
    hasError: {
      control: 'boolean',
      description: 'Whether the checkbox has an error state',
    },
  },
  args: {
    checked: false,
    disabled: false,
    placeholder: 'I agree to the terms',
    hasError: false,
  },
} satisfies Meta<CheckboxInputStoryOptions>

export default meta
type Story = StoryObj<CheckboxInputStoryOptions>

// Define the stories
export const Default: Story = {
  args: {
    checked: false,
    disabled: false,
    placeholder: 'I agree to the terms',
    hasError: false,
  },
}

export const Checked: Story = {
  args: {
    checked: true,
    disabled: false,
    placeholder: 'I agree to the terms',
    hasError: false,
  },
}

export const Disabled: Story = {
  args: {
    checked: false,
    disabled: true,
    placeholder: 'Disabled checkbox',
    hasError: false,
  },
}

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
    placeholder: 'Disabled checked checkbox',
    hasError: false,
  },
}

export const WithError: Story = {
  args: {
    checked: false,
    disabled: false,
    placeholder: 'Required checkbox',
    hasError: true,
  },
}

export const WithoutLabel: Story = {
  args: {
    checked: false,
    disabled: false,
    placeholder: '',
    hasError: false,
  },
}

import type { Meta, StoryObj } from '@storybook/html-vite'

import { NumberInput } from '../src/'
import { renderTempoComponent } from './common'
import { attr, html, prop } from '@tempots/dom'

// Define the NumberInput options interface for Storybook
interface NumberInputStoryOptions {
  value: number
  disabled: boolean
  hasError: boolean
  placeholder: string
  step: number
  min: number
  max: number
}

// Create a wrapper function to render the NumberInput with Theme
const renderNumberInput = (args: NumberInputStoryOptions) => {
  const { value, disabled, hasError, placeholder, step, min, max } = args
  const numberValue = prop(value)

  return html.div(
    attr.class('bu-flex bu-flex-col bu-gap-lg'),
    html.h3('Number Input Examples'),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-md'),
      html.div(
        attr.class('bu-flex bu-flex-row bu-gap-md bu-items-center'),
        html.span('Interactive Example:'),
        NumberInput({
          value: numberValue,
          disabled: disabled ? prop(true) : undefined,
          hasError: hasError ? prop(true) : undefined,
          placeholder: placeholder ? prop(placeholder) : undefined,
          step: step ? prop(step) : undefined,
          min: min !== undefined ? prop(min) : undefined,
          max: max !== undefined ? prop(max) : undefined,
          onChange: (newValue: number) => {
            console.log('Value changed:', newValue)
            numberValue.set(newValue)
          },
          onInput: (newValue: number) =>
            console.log('Input changed:', newValue),
        })
      ),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('Number Input States:'),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Default:'),
          NumberInput({
            value: prop(42),
            placeholder: 'Enter a number',
            onChange: (value: number) => console.log('Default changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Disabled:'),
          NumberInput({
            value: prop(100),
            disabled: prop(true),
            placeholder: 'Disabled input',
            onChange: (value: number) =>
              console.log('Disabled changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('With Error:'),
          NumberInput({
            value: prop(-5),
            hasError: prop(true),
            placeholder: 'Invalid number',
            onChange: (value: number) => console.log('Error changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Empty:'),
          NumberInput({
            value: prop(0),
            placeholder: 'Enter amount',
            onChange: (value: number) => console.log('Empty changed:', value),
          })
        )
      ),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('With Constraints:'),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Percentage (0-100):'),
          NumberInput({
            value: prop(75),
            min: prop(0),
            max: prop(100),
            step: prop(1),
            placeholder: 'Percentage',
            onChange: (value: number) =>
              console.log('Percentage changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Price (0.01 step):'),
          NumberInput({
            value: prop(19.99),
            min: prop(0),
            step: prop(0.01),
            placeholder: 'Price',
            onChange: (value: number) => console.log('Price changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Rating (1-5):'),
          NumberInput({
            value: prop(4),
            min: prop(1),
            max: prop(5),
            step: prop(1),
            placeholder: 'Rating',
            onChange: (value: number) => console.log('Rating changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Temperature (-50 to 50):'),
          NumberInput({
            value: prop(22),
            min: prop(-50),
            max: prop(50),
            step: prop(0.5),
            placeholder: 'Temperature',
            onChange: (value: number) =>
              console.log('Temperature changed:', value),
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
            html.span('Quantity:'),
            NumberInput({
              value: prop(1),
              min: prop(1),
              max: prop(99),
              step: prop(1),
              placeholder: 'Qty',
              onChange: (value: number) =>
                console.log('Quantity changed:', value),
            })
          ),
          html.div(
            attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
            html.span('Price:'),
            NumberInput({
              value: prop(29.99),
              min: prop(0),
              step: prop(0.01),
              placeholder: '0.00',
              onChange: (value: number) => console.log('Price changed:', value),
            })
          ),
          html.div(
            attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
            html.span('Discount %:'),
            NumberInput({
              value: prop(10),
              min: prop(0),
              max: prop(100),
              step: prop(5),
              placeholder: 'Discount',
              onChange: (value: number) =>
                console.log('Discount changed:', value),
            })
          )
        )
      )
    )
  )
}

// Define the meta for the component
const meta = {
  title: 'Components/Form/NumberInput',
  tags: ['autodocs'],
  render: renderTempoComponent(renderNumberInput),
  argTypes: {
    value: {
      control: 'number',
      description: 'The current number value',
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
    step: {
      control: 'number',
      description: 'The step increment for the input',
    },
    min: {
      control: 'number',
      description: 'Minimum allowed value',
    },
    max: {
      control: 'number',
      description: 'Maximum allowed value',
    },
  },
  args: {
    value: 42,
    disabled: false,
    hasError: false,
    placeholder: 'Enter a number',
    step: 1,
    min: undefined,
    max: undefined,
  },
} satisfies Meta<NumberInputStoryOptions>

export default meta
type Story = StoryObj<NumberInputStoryOptions>

// Define the stories
export const Default: Story = {
  args: {
    value: 42,
    disabled: false,
    hasError: false,
    placeholder: 'Enter a number',
    step: 1,
    min: undefined,
    max: undefined,
  },
}

export const Disabled: Story = {
  args: {
    value: 100,
    disabled: true,
    hasError: false,
    placeholder: 'Disabled input',
    step: 1,
    min: undefined,
    max: undefined,
  },
}

export const WithError: Story = {
  args: {
    value: -5,
    disabled: false,
    hasError: true,
    placeholder: 'Invalid number',
    step: 1,
    min: 0,
    max: undefined,
  },
}

export const Percentage: Story = {
  args: {
    value: 75,
    disabled: false,
    hasError: false,
    placeholder: 'Percentage',
    step: 1,
    min: 0,
    max: 100,
  },
}

export const Price: Story = {
  args: {
    value: 19.99,
    disabled: false,
    hasError: false,
    placeholder: 'Price',
    step: 0.01,
    min: 0,
    max: undefined,
  },
}

export const Rating: Story = {
  args: {
    value: 4,
    disabled: false,
    hasError: false,
    placeholder: 'Rating',
    step: 1,
    min: 1,
    max: 5,
  },
}

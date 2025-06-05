import type { Meta, StoryObj } from '@storybook/html'
import { attr, html, prop } from '@tempots/dom'
import { Toggle, ToggleOptions } from '../src/components/form/input/toggle'
import { renderTempoComponent } from './common'

type ToggleStoryOptions = {
  checked: boolean
  disabled: boolean
  label?: string
  offLabel?: string
  onLabel?: string
}

function renderToggle({
  checked,
  disabled,
  label,
  offLabel,
  onLabel,
}: ToggleStoryOptions) {
  const toggleValue = prop(checked)

  return html.div(
    attr.class('bu-flex bu-flex-col bu-gap-lg'),
    html.h3('Toggle Examples'),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-md'),
      html.div(
        attr.class('bu-flex bu-flex-row bu-gap-md bu-items-center'),
        html.span('Interactive Toggle:'),
        Toggle({
          value: toggleValue,
          disabled: disabled ? prop(true) : undefined,
          label: label ? prop(label) : undefined,
          offLabel: offLabel ? prop(offLabel) : undefined,
          onLabel: onLabel ? prop(onLabel) : undefined,
          onChange: (newValue: boolean) => {
            console.log('Toggle changed:', newValue)
            toggleValue.set(newValue)
          },
        })
      ),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('Toggle States:'),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Off:'),
          Toggle({
            value: prop(false),
            label: prop('Feature disabled'),
            offLabel: prop('OFF'),
            onLabel: prop('ON'),
            onChange: (value: boolean) =>
              console.log('Off toggle changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('On:'),
          Toggle({
            value: prop(true),
            label: prop('Feature enabled'),
            offLabel: prop('OFF'),
            onLabel: prop('ON'),
            onChange: (value: boolean) =>
              console.log('On toggle changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Disabled Off:'),
          Toggle({
            value: prop(false),
            disabled: prop(true),
            label: prop('Cannot be changed'),
            offLabel: prop('OFF'),
            onLabel: prop('ON'),
            onChange: (value: boolean) =>
              console.log('Disabled off changed:', value),
          })
        ),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Disabled On:'),
          Toggle({
            value: prop(true),
            disabled: prop(true),
            label: prop('Cannot be changed'),
            offLabel: prop('OFF'),
            onLabel: prop('ON'),
            onChange: (value: boolean) =>
              console.log('Disabled on changed:', value),
          })
        )
      ),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('Without Labels:'),
        html.div(
          attr.class('bu-flex bu-flex-row bu-gap-sm bu-items-center'),
          html.span('Simple Toggle:'),
          Toggle({
            value: prop(false),
            onChange: (value: boolean) =>
              console.log('Simple toggle changed:', value),
          })
        )
      )
    )
  )
}

// Define the meta for the component
const meta = {
  title: 'Components/Form/Toggle',
  tags: ['autodocs'],
  render: renderTempoComponent(renderToggle),
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the toggle is checked',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle is disabled',
    },
    label: {
      control: 'text',
      description: 'The main label text for the toggle',
    },
    offLabel: {
      control: 'text',
      description: 'The label shown when toggle is off',
    },
    onLabel: {
      control: 'text',
      description: 'The label shown when toggle is on',
    },
  },
  args: {
    checked: false,
    disabled: false,
    label: 'Enable feature',
    offLabel: 'OFF',
    onLabel: 'ON',
  },
} satisfies Meta<ToggleStoryOptions>

export default meta
type Story = StoryObj<ToggleStoryOptions>

// Define the stories
export const Default: Story = {
  args: {
    checked: false,
    disabled: false,
    label: 'Enable notifications',
    offLabel: 'OFF',
    onLabel: 'ON',
  },
}

export const WithoutLabels: Story = {
  args: {
    checked: false,
    disabled: false,
  },
}

export const Disabled: Story = {
  args: {
    checked: true,
    disabled: true,
    label: 'Cannot be changed',
    offLabel: 'OFF',
    onLabel: 'ON',
  },
}

export const CustomLabels: Story = {
  args: {
    checked: false,
    disabled: false,
    label: 'Dark mode',
    offLabel: 'Light',
    onLabel: 'Dark',
  },
}

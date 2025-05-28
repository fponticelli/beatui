import type { Meta, StoryObj } from '@storybook/html'
import { renderTempoComponent } from './common'
import { html } from '@tempots/dom'
import { z } from 'zod/v4'
import { useForm } from '../src/'

const schema = z.object({
  name: z.string().min(1),
  email: z.email(),
  addresses: z.array(
    z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      zip: z.string().min(1),
    })
  ),
  phones: z.array(z.string().min(1)),
})

const renderForm = () => {
  const form = useForm({
    schema,
  })
  return html.form(html.input(form.string('name').connect()))
}

// Define the meta for the component
const meta = {
  title: 'Components/Form',
  tags: ['autodocs'],
  render: renderTempoComponent(renderForm),
  argTypes: {},
  args: {},
} satisfies Meta<object>

export default meta
type Story = StoryObj<object>

// Define the stories
export const Standard: Story = {
  args: {},
}

import type { Meta, StoryObj } from '@storybook/html'
import { renderTempoComponent } from './common'
import { attr, Ensure, html } from '@tempots/dom'
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
  const name = form.string('name')
  const email = form.string('email')
  email.disable()
  return html.form(
    html.div(
      html.div(
        html.label(attr.for(name.name), 'Name: '),
        html.input(name.connect())
      ),
      Ensure(name.error, e => html.div(attr.class('text-red-600 text-xs'), e))
    ),
    html.div(
      html.div(
        html.label(attr.for(email.name), 'Email: '),
        html.input(email.connect())
      ),
      Ensure(email.error, e => html.div(attr.class('text-red-600 text-xs'), e))
    ),
    html.div(
      html.div(
        html.label('Phones: ')
        // html.input(email.connect())
      ),
      Ensure(email.error, e => html.div(attr.class('text-red-600 text-xs'), e))
    )
  )
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

import type { Meta, StoryObj } from '@storybook/html'
import { renderTempoComponent } from './common'
import { attr, html, Repeat } from '@tempots/dom'
import { z } from 'zod/v4'
import {
  Button,
  EmailControl,
  Group,
  Icon,
  Stack,
  TextControl,
  useForm,
} from '../src/'

const schema = z.object({
  name: z.string().min(1),
  emails: z.array(z.email()),
  addresses: z.array(
    z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      zip: z.string().min(1),
    })
  ),
})

const renderForm = () => {
  const form = useForm({
    schema,
  })
  const emails = form.list('emails')
  return html.form(
    Stack(
      {},
      attr.class('gap-4'),
      TextControl({
        label: 'Name',
        required: true,
        controller: form.field('name'),
      }),
      Stack(
        {},
        attr.class('gap-4'),
        Repeat(emails.length, ({ index }) => {
          return Group(
            {},
            EmailControl({
              label: `Email ${index}`,
              required: true,
              controller: emails.item(index),
            }),
            Button(
              {
                onClick: () => {
                  emails.removeAt(index)
                },
                size: 'sm',
                variant: 'outline',
              },
              Icon({ icon: 'line-md:close', color: 'red', size: 'sm' })
            )
          )
        }),
        Button(
          {
            onClick: () => {
              emails.push('')
            },
          },
          'Add Email'
        )
      )
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

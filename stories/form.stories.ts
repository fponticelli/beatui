import type { Meta, StoryObj } from '@storybook/html-vite'
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
      state: z.string().length(2),
      zip: z.string().length(5),
    })
  ),
})

const renderForm = () => {
  const form = useForm({
    schema,
    defaultValue: {
      name: 'John Doe',
      emails: ['john@doe.com'],
      addresses: [
        {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip: '12345',
        },
      ],
    },
  })
  const emails = form.list('emails')
  const addresses = form.list('addresses')
  return html.form(
    Stack(
      TextControl({
        label: 'Name',
        required: true,
        controller: form.field('name'),
      }),
      Group(
        attr.class('bu-items-start bu-justify-between'),
        Stack(
          html.h2('Emails'),
          Repeat(emails.length, ({ index, counter }) => {
            return Group(
              EmailControl({
                label: `Email #${counter}`,
                required: true,
                controller: emails.item(index),
              }),
              Button(
                {
                  onClick: () => emails.removeAt(index),
                  size: 'sm',
                  roundedness: 'full',
                  variant: 'outline',
                },
                Icon({ icon: 'line-md:close', color: 'red', size: 'sm' })
              )
            )
          }),
          Button(
            {
              onClick: () => emails.push(''),
            },
            'Add Email'
          )
        ),
        Stack(
          html.h2('Addresses'),
          Repeat(addresses.length, ({ index, counter }) => {
            const address = addresses.group(index)
            return Group(
              Stack(
                TextControl({
                  label: `Street #${counter}`,
                  required: true,
                  controller: address.field(`street`),
                }),
                TextControl({
                  label: `City`,
                  required: true,
                  controller: address.field(`city`),
                }),
                TextControl({
                  label: `State`,
                  required: true,
                  controller: address.field(`state`),
                }),
                TextControl({
                  label: `Zip`,
                  required: true,
                  controller: address.field(`zip`),
                })
              ),
              Button(
                {
                  onClick: () => form.list('addresses').removeAt(index),
                  size: 'sm',
                  roundedness: 'full',
                  variant: 'outline',
                },
                Icon({ icon: 'line-md:close', color: 'red', size: 'sm' })
              )
            )
          }),
          Button(
            {
              onClick: () =>
                form.list('addresses').push({
                  street: '',
                  city: '',
                  state: '',
                  zip: '',
                }),
            },
            'Add Address'
          )
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

import { attr, html } from '@tempots/dom'
import {
  Card,
  Control,
  Group,
  NumberInput,
  ScrollablePanel,
  Stack,
  TextInput,
  useForm,
} from '@tempots/beatui'
import { z } from 'zod'

export default function ControlPage() {
  const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    age: z.number().min(18, 'Must be at least 18'),
  })

  const validForm = useForm({
    schema,
    validationMode: 'continuous',
    initialValue: {
      name: 'Taylor Otwell',
      email: 'taylor@example.com',
      age: 32,
    },
  })

  const errorForm = useForm({
    schema,
    validationMode: 'continuous',
    initialValue: {
      name: '',
      email: 'not-an-email',
      age: 12,
    },
  })

  // Trigger validation once so the error state renders immediately.
  errorForm.controller.change(errorForm.controller.signal.value)

  // const errorProps = <T,>(controller: Controller<T>) => ({
  //   hasError: controller.errorVisible,
  //   error: controller.error.map(err => err ?? ''),
  // })

  const validName = validForm.controller.field('name')
  const validEmail = validForm.controller.field('email')
  const validAge = validForm.controller.field('age')

  const errorName = errorForm.controller.field('name')
  const errorEmail = errorForm.controller.field('email')
  const errorAge = errorForm.controller.field('age')

  return ScrollablePanel({
    body: Stack(
      attr.class('gap-6 p-4'),
      html.div(
        html.h2(attr.class('text-xl font-semibold'), 'Control'),
        html.p(
          attr.class('text-sm text-gray-600'),
          'Control wires inputs to controllers and can display validation errors.'
        )
      ),
      Group(
        attr.class('items-start gap-4 flex-wrap'),
        Card(
          {},
          Stack(
            attr.class('gap-3'),
            html.h3(attr.class('text-lg font-semibold'), 'Good state'),
            Control(TextInput, {
              controller: validName,
              label: 'Name',
              description: 'Looks valid',
              // ...errorProps(validName),
            }),
            Control(TextInput, {
              controller: validEmail,
              label: 'Email',
              description: 'Valid email address',
              // ...errorProps(validEmail),
            }),
            Control(NumberInput, {
              controller: validAge,
              label: 'Age',
              description: 'At least 18',
              // ...errorProps(validAge),
            })
          )
        ),
        Card(
          {},
          Stack(
            attr.class('gap-3'),
            html.h3(attr.class('text-lg font-semibold'), 'Error state'),
            Control(TextInput, {
              controller: errorName,
              label: 'Name',
              description: 'Required field',
              // error: 'ERROR',
              // ...errorProps(errorName),
            }),
            Control(TextInput, {
              controller: errorEmail,
              label: 'Email',
              description: 'Must be a valid address',
              // ...errorProps(errorEmail),
            }),
            Control(NumberInput, {
              controller: errorAge,
              label: 'Age',
              description: 'Must be 18+',
              // ...errorProps(errorAge),
            })
          )
        )
      )
    ),
  })
}

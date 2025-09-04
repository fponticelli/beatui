import { attr, html, style } from '@tempots/dom'
import {
  DropdownControl,
  Option,
  Control,
  DateInput,
  EnsureControl,
  Group,
  Icon,
  ListControl,
  NativeSelectControl,
  NullableDateInput,
  NumberInput,
  ScrollablePanel,
  Stack,
  TextInput,
  useForm,
  ValueOption,
} from '@tempots/beatui'
import { z } from 'zod/v4'

export default function FormPage() {
  const { controller } = useForm({
    schema: z.object({
      name: z.string().min(1),
      favoriteColor: z.string().optional(),
      delaySetting: z.union([
        z.literal('off'),
        z.literal('default'),
        z.object({
          delay: z.number().min(0).max(1000),
        }),
      ]),
      experience: z.array(
        z.object({
          title: z.string(),
          company: z.string().min(1),
          startDate: z.date(),
          endDate: z.date().optional(),
        })
      ),
    }),
    initialValue: {
      name: 'John Doe',
      favoriteColor: 'blue',
      delaySetting: 'off',
      experience: [
        {
          title: 'Software Engineer',
          company: 'Google',
          startDate: new Date(),
          endDate: undefined,
        },
      ],
    },
  })
  const delaySetting = controller.field('delaySetting')
  const delayChoices = delaySetting.transform(
    v => (typeof v === 'string' ? v : 'custom'),
    v => (v === 'custom' ? { delay: 100 } : v)
  )
  const delayValue = delaySetting.transform(
    v => (typeof v === 'string' ? null : v.delay),
    v => (v == null ? 'off' : { delay: v })
  )
  const list = controller.field('experience').array()
  return ScrollablePanel({
    body: Stack(
      attr.class('bu-p-4'),
      Group(
        attr.class('bu-items-start bu-gap-2'),
        Stack(
          attr.class('bu-gap-2'),
          style.width('24rem'),
          Control(TextInput, {
            controller: controller.field('name'),
            label: 'Name',
          }),
          DropdownControl({
            controller: controller.field('favoriteColor'),
            label: 'Favorite Color',
            placeholder: 'Select a color',
            options: [
              Option.value('red', 'Red', {
                before: html.div(
                  attr.class('bu-w-4 bu-h-4 bu-rounded-full'),
                  style.backgroundColor('#ef4444')
                ),
              }),
              Option.value('blue', 'Blue', {
                before: html.div(
                  attr.class('bu-w-4 bu-h-4 bu-rounded-full'),
                  style.backgroundColor('#3b82f6')
                ),
              }),
              Option.value('green', 'Green', {
                before: html.div(
                  attr.class('bu-w-4 bu-h-4 bu-rounded-full'),
                  style.backgroundColor('#10b981')
                ),
              }),
              Option.value('purple', 'Purple', {
                before: html.div(
                  attr.class('bu-w-4 bu-h-4 bu-rounded-full'),
                  style.backgroundColor('#8b5cf6')
                ),
                after: Icon({ icon: 'line-md:star-filled', size: 'sm' }),
              }),
            ],
          }),
          NativeSelectControl({
            controller: delayChoices,
            label: 'Delay',
            options: [
              Option.value('off', 'Off'),
              Option.value('default', 'Default'),
              Option.value('custom', 'Custom'),
            ] as ValueOption<'off' | 'default' | 'custom'>[],
          }),
          EnsureControl(delayValue, controller =>
            Control(NumberInput, {
              controller,
              label: 'Delay Value (with steppers)',
              step: 50,
              min: 0,
              max: 1000,
            })
          ),
          html.div(attr.class('bu-p-2')),
          ListControl({
            label: 'Experience',
            controller: list,
            createItem: () => ({
              title: 'x',
              company: 'abc',
              startDate: new Date(),
              endDate: undefined,
            }),
            element: opts => {
              const group = opts.item.object()
              return Stack(
                attr.class('bu-gap-2'),
                Stack(
                  Control(
                    TextInput,
                    {
                      horizontal: true,
                      controller: group.field('title'),
                      label: 'Title',
                    },
                    style.width('w-full')
                  ),
                  Control(TextInput, {
                    controller: group.field('company'),
                    label: 'Company',
                  })
                ),
                Group(
                  Control(DateInput, {
                    controller: group.field('startDate'),
                    label: 'Start Date',
                  }),
                  Control(NullableDateInput, {
                    controller: group.field('endDate').transform(
                      v => (v == undefined ? null : v),
                      v => (v == null ? undefined : v)
                    ),
                    label: 'End Date',
                  })
                )
              )
            },
            separator: () =>
              html.hr(
                style.border('1px dashed #ccc'),
                style.margin('0.5rem 25%')
              ),
          })
        ),
        Stack(
          html.pre(
            attr.class('bu-whitespace-pre-wrap'),
            controller.value.map(v => JSON.stringify(v, null, 2))
          ),
          html.pre(
            attr.class('bu-whitespace-pre-wrap'),
            controller.dependencyErrors.map(v => JSON.stringify(v, null, 2))
          )
        )
      )
    ),
  })
}

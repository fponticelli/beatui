import { attr, html, style } from '@tempots/dom'
import {
  ComboboxControl,
  ComboboxOption,
  DateControl,
  EnsureControl,
  Group,
  Icon,
  ListControl,
  NativeSelectControl,
  NullableDateControl,
  NumberControl,
  ScrollablePanel,
  SelectOption,
  Stack,
  TextControl,
  useForm,
  ValueOption,
} from '@tempots/beatui'
import { z } from 'zod/v4'

export const FormPage = () => {
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
          TextControl({
            controller: controller.field('name'),
            label: 'Name',
          }),
          ComboboxControl({
            controller: controller.field('favoriteColor'),
            label: 'Favorite Color',
            placeholder: 'Select a color',
            options: [
              ComboboxOption.value('red', 'Red', {
                before: html.div(
                  attr.class('bu-w-4 bu-h-4 bu-rounded-full'),
                  style.backgroundColor('#ef4444')
                ),
              }),
              ComboboxOption.value('blue', 'Blue', {
                before: html.div(
                  attr.class('bu-w-4 bu-h-4 bu-rounded-full'),
                  style.backgroundColor('#3b82f6')
                ),
              }),
              ComboboxOption.value('green', 'Green', {
                before: html.div(
                  attr.class('bu-w-4 bu-h-4 bu-rounded-full'),
                  style.backgroundColor('#10b981')
                ),
              }),
              ComboboxOption.value('purple', 'Purple', {
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
              SelectOption.value('off', 'Off'),
              SelectOption.value('default', 'Default'),
              SelectOption.value('custom', 'Custom'),
            ] as ValueOption<'off' | 'default' | 'custom'>[],
          }),
          EnsureControl(delayValue, controller =>
            NumberControl({
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
                  TextControl(
                    {
                      horizontal: true,
                      controller: group.field('title'),
                      label: 'Title',
                    },
                    style.width('w-full')
                  ),
                  TextControl({
                    controller: group.field('company'),
                    label: 'Company',
                  })
                ),
                Group(
                  DateControl({
                    controller: group.field('startDate'),
                    label: 'Start Date',
                  }),
                  NullableDateControl({
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

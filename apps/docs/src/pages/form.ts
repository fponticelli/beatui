import { attr, html, style } from '@tempots/dom'
import {
  Button,
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
  const controller = useForm({
    schema: z.object({
      name: z.string().min(1),
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
    defaultValue: {
      name: 'John Doe',
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
              label: 'Delay Value',
            })
          ),
          Group(
            attr.class('bu-gap-2'),
            Button(
              {
                onClick: () => {
                  list.push({
                    title: 'x',
                    company: 'abc',
                    startDate: new Date(),
                    endDate: undefined,
                  })
                },
              },
              Icon({ icon: 'line-md:plus' })
            )
          ),
          html.div(attr.class('bu-p-2')),
          ListControl(
            list,
            opts => {
              const group = opts.item.object()
              return Stack(
                attr.class('bu-gap-2'),
                html.div(
                  attr.class('bu-text-sm bu-text--gray'),
                  `Item: ${opts.position.counter}`
                ),
                Group(
                  TextControl(
                    {
                      controller: group.field('title'),
                      label: 'Title',
                    },
                    style.width('18rem')
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
                ),
                Group(
                  attr.class('bu-gap-2 bu-justify-between'),
                  Group(
                    attr.class('bu-gap-2 bu-items-center'),
                    Button(
                      {
                        size: 'xs',
                        roundedness: 'full',
                        variant: 'outline',
                        onClick: () => opts.move('up'),
                        disabled: opts.cannotMove('up'),
                      },
                      Icon({
                        size: 'xs',
                        icon: 'line-md:arrow-up',
                      })
                    ),
                    Button(
                      {
                        size: 'xs',
                        roundedness: 'full',
                        variant: 'outline',
                        onClick: () => opts.move('down'),
                        disabled: opts.cannotMove('down'),
                      },
                      Icon({
                        size: 'xs',
                        icon: 'line-md:arrow-down',
                      })
                    )
                  ),
                  Button(
                    {
                      size: 'xs',
                      roundedness: 'full',
                      variant: 'filled',
                      color: 'warning',
                      onClick: opts.remove,
                    },
                    Icon({ size: 'xs', icon: 'line-md:minus' })
                  )
                )
              )
            },
            () =>
              html.hr(style.border('1px solid #ccc'), style.margin('0.5rem 0'))
          )
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

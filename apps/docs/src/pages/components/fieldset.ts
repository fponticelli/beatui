import {
  Fieldset,
  Field,
  TextInput,
  NumberInput,
  Switch,
  NativeSelect,
  Option,
} from '@tempots/beatui'
import { html, attr, prop, style, Fragment } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Fieldset',
  category: 'Layout',
  component: 'Fieldset',
  description:
    'Groups form fields with a legend, cascading layout configuration, multi-column grid, and optional collapsible content.',
  icon: 'lucide:group',
  order: 1,
}

export default function FieldsetPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('Fieldset', signals => {
      const firstName = prop('')
      const lastName = prop('')
      const age = prop<number>(0)
      const newsletter = prop(false)

      return Fragment(
        attr.class('w-full h-full overflow-auto'),
        Fieldset(
          {
            legend: signals.legend ?? 'Personal Information',
            description: signals.description,
            variant: signals.variant ?? 'plain',
            layout: signals.layout ?? 'vertical',
            labelWidth: signals.labelWidth ?? '7.5rem',
            collapsible: signals.collapsible ?? false,
            compact: signals.compact ?? false,
            disabled: signals.disabled ?? false,
            columns: 2,
          },
          Field({
            label: 'First Name',
            content: TextInput({
              value: firstName,
              placeholder: 'Jane',
              onInput: (v: string) => firstName.set(v),
            }),
          }),
          Field({
            label: 'Last Name',
            content: TextInput({
              value: lastName,
              placeholder: 'Doe',
              onInput: (v: string) => lastName.set(v),
            }),
          }),
          Field({
            label: 'Age',
            content: NumberInput({
              value: age,
              min: 0,
              max: 120,
              onChange: (v: number) => age.set(v),
            }),
          }),
          Field({
            label: 'Newsletter',
            content: Switch({
              value: newsletter,
              onChange: (v: boolean) => newsletter.set(v),
            }),
          })
        )
      )
    }),
    sections: [
      Section(
        'Bordered Variant',
        () => {
          const name = prop('')
          const email = prop('')
          return Fieldset(
            {
              legend: 'Account Details',
              variant: 'bordered',
              description: 'Enter your login credentials.',
              layout: 'vertical',
            },
            Field({
              label: 'Username',
              required: true,
              content: TextInput({
                value: name,
                placeholder: 'johndoe',
                onInput: (v: string) => name.set(v),
              }),
            }),
            Field({
              label: 'Email',
              required: true,
              content: TextInput({
                value: email,
                placeholder: 'john@example.com',
                onInput: (v: string) => email.set(v),
              }),
            })
          )
        },
        'The bordered variant wraps the fieldset in a visible border with an inset legend. Use it for distinct form sections on a page.'
      ),

      Section(
        'Plain Variant',
        () => {
          const city = prop('')
          const country = prop('US')
          return Fieldset(
            {
              legend: 'Address',
              variant: 'plain',
            },
            Field({
              label: 'City',
              content: TextInput({
                value: city,
                placeholder: 'San Francisco',
                onInput: (v: string) => city.set(v),
              }),
            }),
            Field({
              label: 'Country',
              content: NativeSelect({
                value: country,
                onChange: (v: string) => country.set(v),
                options: [
                  Option.value('US', 'United States'),
                  Option.value('GB', 'United Kingdom'),
                  Option.value('CA', 'Canada'),
                  Option.value('AU', 'Australia'),
                ],
              }),
            })
          )
        },
        'The plain variant (default) uses a heading-style legend with a horizontal divider. Best for clean, minimal form layouts.'
      ),

      Section(
        'Card Variant',
        () => {
          const bio = prop('')
          const website = prop('')
          const notifications = prop(true)
          return html.div(
            style.maxWidth('520px'),
            Fieldset(
              {
                legend: 'Profile Settings',
                variant: 'card',
                description: 'Update your public profile information.',
              },
              Field({
                label: 'Bio',
                content: TextInput({
                  value: bio,
                  placeholder: 'Tell us about yourself',
                  onInput: (v: string) => bio.set(v),
                }),
              }),
              Field({
                label: 'Website',
                content: TextInput({
                  value: website,
                  placeholder: 'https://example.com',
                  onInput: (v: string) => website.set(v),
                }),
              }),
              Field({
                label: 'Email notifications',
                content: Switch({
                  value: notifications,
                  onChange: (v: boolean) => notifications.set(v),
                }),
              })
            )
          )
        },
        'The card variant renders the fieldset inside an elevated card container with a bold legend. Ideal for settings pages.'
      ),

      Section(
        'Horizontal Layout',
        () => {
          const firstName = prop('')
          const lastName = prop('')
          const phone = prop('')
          return html.div(
            style.maxWidth('600px'),
            Fieldset(
              {
                legend: 'Contact Information',
                variant: 'bordered',
                layout: 'horizontal-fixed',
                labelWidth: '140px',
              },
              Field({
                label: 'First Name',
                content: TextInput({
                  value: firstName,
                  placeholder: 'Jane',
                  onInput: (v: string) => firstName.set(v),
                }),
              }),
              Field({
                label: 'Last Name',
                content: TextInput({
                  value: lastName,
                  placeholder: 'Doe',
                  onInput: (v: string) => lastName.set(v),
                }),
              }),
              Field({
                label: 'Phone',
                content: TextInput({
                  value: phone,
                  placeholder: '+1 (555) 000-0000',
                  onInput: (v: string) => phone.set(v),
                }),
              })
            )
          )
        },
        'Set layout: "horizontal-fixed" on the Fieldset to cascade it to all child Fields. Each label aligns to a fixed column width specified by labelWidth.'
      ),

      Section(
        'Multi-Column Grid',
        () => {
          const firstName = prop('')
          const lastName = prop('')
          const email = prop('')
          const phone = prop('')
          const city = prop('')
          const country = prop('US')
          return Fieldset(
            {
              legend: 'Registration',
              variant: 'plain',
              columns: 2,
            },
            Field({
              label: 'First Name',
              content: TextInput({
                value: firstName,
                placeholder: 'Jane',
                onInput: (v: string) => firstName.set(v),
              }),
            }),
            Field({
              label: 'Last Name',
              content: TextInput({
                value: lastName,
                placeholder: 'Doe',
                onInput: (v: string) => lastName.set(v),
              }),
            }),
            Field({
              label: 'Email',
              span: 2,
              content: TextInput({
                value: email,
                placeholder: 'jane@example.com',
                onInput: (v: string) => email.set(v),
              }),
            }),
            Field({
              label: 'Phone',
              content: TextInput({
                value: phone,
                placeholder: '+1 (555) 000-0000',
                onInput: (v: string) => phone.set(v),
              }),
            }),
            Field({
              label: 'City',
              content: TextInput({
                value: city,
                placeholder: 'San Francisco',
                onInput: (v: string) => city.set(v),
              }),
            }),
            Field({
              label: 'Country',
              content: NativeSelect({
                value: country,
                onChange: (v: string) => country.set(v),
                options: [
                  Option.value('US', 'United States'),
                  Option.value('GB', 'United Kingdom'),
                  Option.value('CA', 'Canada'),
                ],
              }),
            })
          )
        },
        'Use columns: 2 (or more) for a multi-column grid. Individual fields can span multiple columns with the span prop — the Email field above spans both columns.'
      ),

      Section(
        'Responsive Layout',
        () => {
          const name = prop('')
          const role = prop('viewer')
          const active = prop(true)
          return html.div(
            style.maxWidth('600px'),
            Fieldset(
              {
                legend: 'Team Member',
                variant: 'bordered',
                layout: 'responsive',
              },
              Field({
                label: 'Full Name',
                content: TextInput({
                  value: name,
                  placeholder: 'Alice Johnson',
                  onInput: (v: string) => name.set(v),
                }),
              }),
              Field({
                label: 'Role',
                content: NativeSelect({
                  value: role,
                  onChange: (v: string) => role.set(v),
                  options: [
                    Option.value('admin', 'Admin'),
                    Option.value('editor', 'Editor'),
                    Option.value('viewer', 'Viewer'),
                  ],
                }),
              }),
              Field({
                label: 'Active',
                content: Switch({
                  value: active,
                  onChange: (v: boolean) => active.set(v),
                }),
              })
            )
          )
        },
        'The responsive layout is horizontal on wide containers and automatically switches to vertical below 480px using a CSS container query.'
      ),

      Section(
        'Collapsible',
        () => {
          const apiKey = prop('')
          const timeout = prop<number>(30)
          return html.div(
            style.maxWidth('500px'),
            Fieldset(
              {
                legend: 'Advanced Options',
                variant: 'plain',
                collapsible: true,
                defaultCollapsed: true,
              },
              Field({
                label: 'API Key',
                content: TextInput({
                  value: apiKey,
                  placeholder: 'sk-...',
                  onInput: (v: string) => apiKey.set(v),
                }),
              }),
              Field({
                label: 'Timeout (s)',
                content: NumberInput({
                  value: timeout,
                  min: 1,
                  max: 300,
                  onChange: (v: number) => timeout.set(v),
                }),
              })
            )
          )
        },
        'Set collapsible: true to make the legend a toggle button. Use defaultCollapsed: true to start collapsed. The content animates open and closed.'
      ),

      Section(
        'Compact Mode',
        () => {
          const host = prop('localhost')
          const port = prop<number>(5432)
          const database = prop('mydb')
          const username = prop('admin')
          return html.div(
            attr.class('w-full'),
            Fieldset(
              {
                legend: 'Database Connection',
                variant: 'bordered',
                compact: true,
                size: 'sm',
                columns: 2,
                layout: 'vertical',
              },
              Field({
                label: 'Host',
                content: TextInput({
                  value: host,
                  size: 'sm',
                  onInput: (v: string) => host.set(v),
                }),
              }),
              Field({
                label: 'Port',
                content: NumberInput({
                  value: port,
                  size: 'sm',
                  min: 1,
                  max: 65535,
                  onChange: (v: number) => port.set(v),
                }),
              }),
              Field({
                label: 'Database',
                content: TextInput({
                  value: database,
                  size: 'sm',
                  onInput: (v: string) => database.set(v),
                }),
              }),
              Field({
                label: 'Username',
                content: TextInput({
                  value: username,
                  size: 'sm',
                  onInput: (v: string) => username.set(v),
                }),
              })
            )
          )
        },
        'Compact mode reduces label font size and field gap, ideal for dense data entry interfaces like admin panels or settings dialogs.'
      ),

      Section(
        'Nested Fieldsets',
        () => {
          const company = prop('')
          const department = prop('')
          const firstName = prop('')
          const lastName = prop('')
          const jobTitle = prop('')
          return Fieldset(
            {
              legend: 'Organisation',
              variant: 'plain',
              layout: 'horizontal-fixed',
              labelWidth: '7.5rem',
            },
            Field({
              label: 'Company',
              content: TextInput({
                value: company,
                placeholder: 'Acme Corp',
                onInput: (v: string) => company.set(v),
              }),
            }),
            Field({
              label: 'Department',
              content: TextInput({
                value: department,
                placeholder: 'Engineering',
                onInput: (v: string) => department.set(v),
              }),
            }),
            // Inner nested fieldset overrides layout to vertical
            Fieldset(
              {
                legend: 'Primary Contact',
                variant: 'bordered',
                layout: 'vertical',
                columns: 2,
              },
              Field({
                label: 'First Name',
                content: TextInput({
                  value: firstName,
                  placeholder: 'Alice',
                  onInput: (v: string) => firstName.set(v),
                }),
              }),
              Field({
                label: 'Last Name',
                content: TextInput({
                  value: lastName,
                  placeholder: 'Smith',
                  onInput: (v: string) => lastName.set(v),
                }),
              }),
              Field({
                label: 'Job Title',
                span: 2,
                content: TextInput({
                  value: jobTitle,
                  placeholder: 'Senior Engineer',
                  onInput: (v: string) => jobTitle.set(v),
                }),
              })
            )
          )
        },
        'Fieldsets can be nested. The inner fieldset inherits outer layout by default, but can override it. Here the outer uses horizontal-fixed while the inner switches back to vertical with a 2-column grid.'
      ),

      Section(
        'Disabled',
        () => {
          const name = prop('Alice Johnson')
          const email = prop('alice@example.com')
          const active = prop(true)
          return html.div(
            attr.class('w-full'),
            Fieldset(
              {
                legend: 'Read-Only Profile',
                variant: 'bordered',
                disabled: true,
              },
              Field({
                label: 'Name',
                content: TextInput({
                  value: name,
                  onInput: () => {},
                }),
              }),
              Field({
                label: 'Email',
                content: TextInput({
                  value: email,
                  onInput: () => {},
                }),
              }),
              Field({
                label: 'Active',
                content: Switch({
                  value: active,
                  onChange: () => {},
                }),
              })
            )
          )
        },
        'Setting disabled: true on the Fieldset disables all contained form controls via the native HTML fieldset disabled attribute, which propagates to all descendant form elements.'
      ),
    ],
  })
}

import { attr, html, prop, Value } from '@tempots/dom'
import {
  Notice,
  ScrollablePanel,
  SegmentedInput,
  Stack,
  Label,
  Switch,
  TextInput,
} from '@tempots/beatui'
import { ControlsHeader } from '../elements/controls-header'

export default function NoticePage() {
  const variant = prop<'info' | 'success' | 'warning' | 'error'>('info')
  const tone = prop<'subtle' | 'prominent'>('prominent')
  const role = prop<'auto' | 'status' | 'alert'>('auto')
  const closable = prop(false)
  const title = prop<string>('Info')
  const iconMode = prop<'auto' | 'custom' | 'none'>('auto')
  const customIcon = prop<string>('material-symbols:info-outline')

  const iconValue = Value.map(iconMode, mode =>
    mode === 'none' ? false : mode === 'auto' ? undefined : customIcon.value
  )
  const roleValue = Value.map(role, r => (r === 'auto' ? undefined : r))

  return ScrollablePanel({
    header: ControlsHeader(
      Stack(
        Label('Variant'),
        SegmentedInput({
          value: variant,
          options: {
            info: 'Info',
            success: 'Success',
            warning: 'Warning',
            error: 'Error',
          },
          onChange: variant.set,
          size: 'sm',
        })
      ),
      Stack(
        Label('Tone'),
        SegmentedInput({
          value: tone,
          options: { subtle: 'Subtle', prominent: 'Prominent' },
          onChange: tone.set,
          size: 'sm',
        })
      ),
      Stack(
        Label('Role'),
        SegmentedInput({
          value: role,
          options: { auto: 'Auto', status: 'Status', alert: 'Alert' },
          onChange: role.set,
          size: 'sm',
        })
      ),
      Stack(
        Label('Closable'),
        Switch({ value: closable, onChange: closable.set })
      ),
      Stack(
        Label('Icon'),
        SegmentedInput({
          value: iconMode,
          options: { auto: 'Auto', custom: 'Custom', none: 'None' },
          onChange: iconMode.set,
          size: 'sm',
        })
      ),
      Stack(
        Label('Title'),
        TextInput({
          value: title,
          placeholder: 'Optional title',
          onInput: title.set,
        })
      ),
      // Custom icon text input shown always for simplicity
      Stack(
        Label('Custom icon name'),
        TextInput({
          value: customIcon,
          placeholder: 'e.g. mdi:alert',
          onInput: customIcon.set,
        })
      )
    ),
    body: Stack(
      attr.class('bu-gap-4 bu-p-4'),

      // Live sample
      html.section(
        html.h3(attr.class('bu-text-lg bu-font-semibold'), 'Live Notice'),
        Notice(
          {
            variant,
            tone,
            role: roleValue as Value<'status' | 'alert' | undefined>,
            title: Value.map(title, t => (t === '' ? undefined : t)),
            icon: iconValue,
            closable,
          },
          html.span('This is a Notice message. Adjust options above.')
        )
      ),

      // Gallery
      html.section(
        html.h3(attr.class('bu-text-lg bu-font-semibold'), 'Gallery'),
        Stack(
          attr.class('bu-gap-2'),
          Notice({}, html.span('Default info (subtle).')),
          Notice(
            { variant: 'success', tone: 'prominent' },
            html.span('Prominent success notice.')
          ),
          Notice(
            { variant: 'warning', icon: false },
            html.span('Warning notice without icon.')
          ),
          Notice(
            { variant: 'error', tone: 'prominent', icon: 'mdi:alert' },
            html.span('Error with custom icon (alert).')
          )
        )
      )
    ),
  })
}

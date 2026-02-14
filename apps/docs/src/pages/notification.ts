import {
  InputWrapper,
  Notification,
  RadiusName,
  ScrollablePanel,
  SegmentedInput,
  Stack,
  Switch,
  TextInput,
  ThemeColorName,
} from '@tempots/beatui'
import { attr, computedOf, html, prop, Value, When } from '@tempots/dom'
import { ControlsHeader } from '../elements/controls-header'
import { ColorSelector } from '../elements/color-selector'

const radiusOptions: Partial<Record<RadiusName, string>> = {
  none: 'None',
  sm: 'SM',
  md: 'MD',
  lg: 'LG',
  xl: 'XL',
}

export default function NotificationPage() {
  const color = prop<ThemeColorName>('primary')
  const radius = prop<RadiusName>('lg')
  const withBorder = prop(true)
  const withCloseButton = prop(true)
  const loading = prop(false)
  const showTitle = prop(true)
  const title = prop('System update available')
  const message = prop(
    'New changes are ready. Reload the workspace to apply the update.'
  )
  const icon = prop('material-symbols:notifications-active')
  const showIcon = prop(true)

  const messageContent = Value.map(message, text =>
    text.trim().length > 0 ? text : 'Update the text to change this preview.'
  )

  return ScrollablePanel({
    header: ControlsHeader(
      InputWrapper({
        label: 'Color',
        content: ColorSelector({ color, onChange: color.set }),
      }),
      InputWrapper({
        label: 'Radius',
        content: SegmentedInput({
          options: radiusOptions,
          value: radius,
          onChange: radius.set,
        }),
      }),
      InputWrapper({
        label: 'Show Icon',
        content: Switch({ value: showIcon, onChange: showIcon.set }),
      }),
      InputWrapper({
        label: 'Icon',
        content: TextInput({
          value: icon,
          placeholder: 'material-symbols:notifications-active',
          onInput: icon.set,
        }),
      }),
      InputWrapper({
        label: 'Title',
        content: TextInput({
          value: title,
          placeholder: 'Optional title',
          onInput: title.set,
        }),
      }),
      InputWrapper({
        label: 'Message',
        content: TextInput({
          value: message,
          placeholder: 'Notification copy',
          onInput: message.set,
        }),
      }),
      InputWrapper({
        label: 'With border',
        content: Switch({ value: withBorder, onChange: withBorder.set }),
      }),
      InputWrapper({
        label: 'Close button',
        content: Switch({
          value: withCloseButton,
          onChange: withCloseButton.set,
        }),
      }),
      InputWrapper({
        label: 'Title visible',
        content: Switch({ value: showTitle, onChange: showTitle.set }),
      }),
      InputWrapper({
        label: 'Loading',
        content: Switch({ value: loading, onChange: loading.set }),
      })
    ),
    body: Stack(
      attr.class('gap-4 p-4 w-100'),
      html.section(
        html.h3(attr.class('font-semibold mb-2'), 'Live Notification'),
        Notification(
          {
            color,
            radius,
            withBorder,
            withCloseButton,
            loading,
            title: When(
              showTitle,
              () => html.span(title),
              () => null
            ),
            icon: computedOf(
              showIcon,
              icon
            )((show, iconName) => (show ? iconName : undefined)),
          },
          html.span(messageContent)
        )
      ),
      html.section(
        html.h3(attr.class('font-semibold mb-2'), 'Gallery'),
        Stack(
          attr.class('gap-3'),
          Notification(
            {
              color: 'info',
              withBorder: true,
              icon: 'material-symbols:info-outline-rounded',
              title: 'Product update',
            },
            html.span('Docs now include a Notification container.')
          ),
          Notification(
            {
              color: 'success',
              withCloseButton: true,
              icon: 'material-symbols:check-circle-rounded',
              title: 'Backup complete',
            },
            html.span('Nightly backup finished with no issues.')
          ),
          Notification(
            {
              color: 'warning',
              withBorder: false,
              loading: true,
              icon: 'material-symbols:cloud-sync',
              title: 'Syncing changes',
            },
            html.span('We are applying your pending workspace edits.')
          ),
          Notification(
            {
              color: 'warning',
              withBorder: false,
              title: 'No Icon',
            },
            html.span('We are applying your pending workspace edits.')
          )
        )
      )
    ),
  })
}

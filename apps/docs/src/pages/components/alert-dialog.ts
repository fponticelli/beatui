import { AlertDialog, Button } from '@tempots/beatui'
import { html, attr, MapSignal, Value, computedOf } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'AlertDialog',
  category: 'Overlays',
  component: 'AlertDialog',
  description:
    'An informational dialog for presenting important messages to the user with a single acknowledgement action. Supports info, success, warning, and danger variants.',
  icon: 'lucide:alert-circle',
  order: 4,
}

export default function AlertDialogPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('AlertDialog', signals => {
      // AlertDialog reads variant at construction time (non-reactive),
      // so we recreate the component when variant changes.
      const key = computedOf(
        signals.variant as Value<unknown>,
        signals.dismissable as Value<unknown>
      )((...vals: unknown[]) => vals.map(String).join('|'))

      return MapSignal(key, () =>
        AlertDialog(
          {
            ...signals,
            variant: Value.get(signals.variant) || 'info',
            dismissable: Value.get(signals.dismissable) ?? true,
            body: html.p('This is the alert message body content.'),
            onOk: () => console.log('Alert acknowledged'),
          },
          (open) =>
            Button(
              {
                variant: 'filled',
                color: 'primary',
                onClick: open,
              },
              'Show Alert'
            )
        )
      )
    },
      { defaults: { title: 'Alert', variant: 'info', icon: 'lucide:info' } }
    ),
    sections: [
      Section(
        'Variants',
        () =>
          html.div(
            attr.class('flex flex-wrap gap-3'),
            ...(['info', 'success', 'warning', 'danger'] as const).map(variant =>
              AlertDialog(
                {
                  title: `${variant.charAt(0).toUpperCase() + variant.slice(1)} alert`,
                  body: html.p(`This is a ${variant} alert dialog.`),
                  variant,
                  onOk: () => console.log(`${variant} acknowledged`),
                },
                (open) =>
                  Button(
                    {
                      variant: 'light',
                      color:
                        variant === 'info'
                          ? 'info'
                          : variant === 'success'
                            ? 'success'
                            : variant === 'warning'
                              ? 'warning'
                              : 'danger',
                      onClick: open,
                    },
                    variant
                  )
              )
            )
          ),
        'AlertDialog supports four visual variants: info, success, warning, and danger. Each variant applies a different icon and color.'
      ),
      Section(
        'Custom OK Text',
        () =>
          AlertDialog(
            {
              title: 'Terms updated',
              body: html.div(
                html.p('Our terms of service have been updated.'),
                html.p(
                  attr.class('text-sm text-gray-500 mt-2'),
                  'Please review the changes before continuing.'
                )
              ),
              variant: 'info',
              okText: 'I understand',
              onOk: () => console.log('Terms acknowledged'),
            },
            (open) =>
              Button(
                { variant: 'outline', onClick: open },
                'Show Terms Update'
              )
          ),
        'Customize the acknowledgement button label with okText.'
      ),
      Section(
        'Non-dismissable',
        () =>
          AlertDialog(
            {
              title: 'Critical system error',
              body: html.p(
                'A critical error has occurred. Please acknowledge to continue.'
              ),
              variant: 'danger',
              dismissable: false,
              okText: 'Acknowledge',
              onOk: () => console.log('Error acknowledged'),
            },
            (open) =>
              Button(
                { variant: 'filled', color: 'danger', onClick: open },
                'Trigger Critical Alert'
              )
          ),
        'Set dismissable to false to prevent closing by clicking outside or pressing Escape.'
      ),
      Section(
        'Rich Body Content',
        () =>
          AlertDialog(
            {
              title: 'Maintenance window',
              body: html.div(
                html.p('Scheduled maintenance will occur on Sunday, 2:00 AM – 4:00 AM UTC.'),
                html.ul(
                  attr.class('list-disc list-inside text-sm mt-2 space-y-1'),
                  html.li('All services will be unavailable during this window'),
                  html.li('In-progress operations will be paused'),
                  html.li('Data will not be affected')
                )
              ),
              variant: 'warning',
              onOk: () => console.log('Maintenance acknowledged'),
            },
            (open) =>
              Button(
                { variant: 'light', color: 'warning', onClick: open },
                'View Maintenance Notice'
              )
          ),
        'The body accepts any TNode, allowing rich content like lists and formatted text.'
      ),
    ],
  })
}

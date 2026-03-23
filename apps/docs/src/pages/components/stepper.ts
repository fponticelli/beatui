import { Stepper, createStepper, Button, type StepDefinition } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import {
  ComponentPage,
  Section,
} from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'Stepper',
  category: 'Navigation',
  component: 'Stepper',
  description:
    'A multi-step workflow indicator with content panels, navigation buttons, and programmatic control via createStepper.',
  icon: 'lucide:list-ordered',
  order: 11,
}

export default function StepperPage() {
  return ComponentPage(meta, {
    playground: (() => {
      const steps: StepDefinition[] = [
        { label: 'Account', description: 'Create your account', content: () => html.div(attr.class('p-4'), 'Enter account details') },
        { label: 'Profile', description: 'Set up your profile', content: () => html.div(attr.class('p-4'), 'Fill in profile info') },
        { label: 'Review', description: 'Confirm details', content: () => html.div(attr.class('p-4'), 'Review and submit') },
      ]
      return Stepper({ steps })
    })(),
    sections: [
      Section(
        'Basic',
        () =>
          Stepper({
            steps: [
              { label: 'Account', content: () => html.p('Create your account') },
              { label: 'Profile', content: () => html.p('Set up your profile') },
              { label: 'Review', content: () => html.p('Review and submit') },
            ],
          }),
        'A simple three-step wizard with content panels and navigation buttons.'
      ),
      Section(
        'With Descriptions',
        () =>
          Stepper({
            steps: [
              { label: 'Shipping', description: 'Enter address', content: () => html.p('Shipping form') },
              { label: 'Payment', description: 'Card details', content: () => html.p('Payment form') },
              { label: 'Confirm', description: 'Review order', content: () => html.p('Order summary') },
            ],
          }),
        'Steps can have descriptions below the label.'
      ),
      Section(
        'Vertical',
        () =>
          Stepper({
            orientation: 'vertical',
            steps: [
              { label: 'Step 1', content: () => html.p('First step content') },
              { label: 'Step 2', content: () => html.p('Second step content') },
              { label: 'Step 3', content: () => html.p('Third step content') },
            ],
          }),
        'Set orientation to "vertical" for a top-to-bottom layout.'
      ),
      Section(
        'Programmatic Control',
        () => {
          const [stepper, ctrl] = createStepper({
            steps: [
              { label: 'One', content: () => html.p('Content 1') },
              { label: 'Two', content: () => html.p('Content 2') },
              { label: 'Three', content: () => html.p('Content 3') },
            ],
            showNavigation: false,
          })

          return html.div(
            attr.class('flex flex-col gap-4'),
            stepper,
            html.div(
              attr.class('flex gap-2'),
              Button({ variant: 'outline', onClick: () => ctrl.prev() }, 'Prev'),
              Button({
                variant: 'filled',
                color: 'primary',
                onClick: () => { void ctrl.next() },
              }, 'Next'),
              Button({
                variant: 'outline',
                color: 'danger',
                onClick: () => ctrl.setError(ctrl.currentStep.value),
              }, 'Set Error'),
              Button({
                variant: 'outline',
                onClick: () => ctrl.clearError(ctrl.currentStep.value),
              }, 'Clear Error'),
            )
          )
        },
        'Use createStepper() for programmatic control. Hide built-in navigation with showNavigation: false.'
      ),
      Section(
        'Compact',
        () =>
          Stepper({
            variant: 'compact',
            steps: [
              { label: 'S1', content: () => html.p('Step 1') },
              { label: 'S2', content: () => html.p('Step 2') },
              { label: 'S3', content: () => html.p('Step 3') },
            ],
          }),
        'Compact variant hides step labels, showing only numbered circles.'
      ),
      Section(
        'Sizes',
        () =>
          html.div(
            attr.class('flex flex-col gap-8'),
            ...(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-2'), size),
                Stepper({
                  size,
                  showNavigation: false,
                  value: 1,
                  steps: [{ label: 'Account' }, { label: 'Profile' }, { label: 'Review' }],
                })
              )
            )
          ),
        'Available in all standard sizes.'
      ),
      Section(
        'Colors',
        () =>
          html.div(
            attr.class('flex flex-col gap-8'),
            ...(['primary', 'secondary', 'success', 'warning', 'danger'] as const).map(color =>
              html.div(
                html.div(attr.class('text-xs font-mono text-gray-500 mb-2'), color),
                Stepper({
                  color,
                  showNavigation: false,
                  value: 1,
                  steps: [{ label: 'Step 1' }, { label: 'Step 2' }, { label: 'Step 3' }],
                })
              )
            )
          ),
        'Theme color for active and completed steps.'
      ),
    ],
  })
}

import { OnboardingTour, Button, Stack } from '@tempots/beatui'
import type { OnboardingTourController, TourStep } from '@tempots/beatui'
import { html, attr, prop, Value } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'OnboardingTour',
  category: 'Overlay',
  component: 'OnboardingTour',
  description:
    'A step-by-step guided tour overlay that highlights UI elements with a spotlight effect and tooltip navigation.',
  icon: 'lucide:map',
  order: 12,
}

function DemoTargets() {
  return html.div(
    attr.class('flex flex-wrap gap-4 items-start'),
    html.div(
      attr.id('tour-target-1'),
      attr.class(
        'px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
      ),
      'Feature A'
    ),
    html.div(
      attr.id('tour-target-2'),
      attr.class(
        'px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium'
      ),
      'Feature B'
    ),
    html.div(
      attr.id('tour-target-3'),
      attr.class(
        'px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-medium'
      ),
      'Feature C'
    )
  )
}

export default function OnboardingTourPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('OnboardingTour', () => {
      const steps: TourStep[] = [
        {
          target: '#tour-target-1',
          title: 'Welcome',
          description: 'This is Feature A. It does something amazing.',
        },
        {
          target: '#tour-target-2',
          title: 'Next Up',
          description: 'Feature B complements Feature A perfectly.',
        },
        {
          target: '#tour-target-3',
          title: 'Finally',
          description: 'Feature C ties everything together. You are all set!',
        },
      ]
      const [tour, ctrl] = OnboardingTour({
        steps,
        onComplete: () => console.log('Tour completed'),
        onSkip: () => console.log('Tour skipped'),
      })
      return html.div(
        attr.class('flex flex-col gap-4 w-full'),
        DemoTargets(),
        tour,
        html.div(
          attr.class('flex gap-2'),
          Button(
            {
              variant: 'filled',
              color: 'primary',
              onClick: () => ctrl.startTour(),
            },
            'Start Tour'
          ),
          Button(
            {
              variant: 'outline',
              onClick: () => ctrl.endTour(),
            },
            'End Tour'
          )
        )
      )
    }),
    sections: [
      Section(
        'Basic Tour',
        () => {
          const steps: TourStep[] = [
            {
              target: '#basic-tour-1',
              title: 'Step 1',
              description: 'This is the first element to learn about.',
            },
            {
              target: '#basic-tour-2',
              title: 'Step 2',
              description: 'Next, check out this element.',
            },
          ]
          const [tour, ctrl] = OnboardingTour({ steps })
          return html.div(
            attr.class('flex flex-col gap-4 w-full'),
            html.div(
              attr.class('flex gap-4'),
              html.div(
                attr.id('basic-tour-1'),
                attr.class('px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded'),
                'Element 1'
              ),
              html.div(
                attr.id('basic-tour-2'),
                attr.class('px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded'),
                'Element 2'
              )
            ),
            tour,
            Button(
              {
                variant: 'filled',
                color: 'primary',
                size: 'sm',
                onClick: () => ctrl.startTour(),
              },
              'Start Tour'
            )
          )
        },
        'A simple two-step tour that highlights elements and shows tooltips with navigation controls.'
      ),
      Section(
        'Multi-Step Flow',
        () => {
          const steps: TourStep[] = [
            {
              target: '#multi-step-1',
              title: 'Create',
              description: 'Start by creating a new item.',
              placement: 'bottom',
            },
            {
              target: '#multi-step-2',
              title: 'Edit',
              description: 'Then modify its properties.',
              placement: 'bottom',
            },
            {
              target: '#multi-step-3',
              title: 'Save',
              description: 'Finally, save your changes.',
              placement: 'bottom',
            },
            {
              target: '#multi-step-4',
              title: 'Share',
              description: 'Optionally share with your team.',
              placement: 'left',
            },
          ]
          const [tour, ctrl] = OnboardingTour({
            steps,
            showStepIndicator: true,
          })
          return html.div(
            attr.class('flex flex-col gap-4 w-full'),
            html.div(
              attr.class('flex gap-3'),
              ...['Create', 'Edit', 'Save', 'Share'].map((label, i) =>
                html.button(
                  attr.id(`multi-step-${i + 1}`),
                  attr.class(
                    'px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  ),
                  label
                )
              )
            ),
            tour,
            Button(
              {
                variant: 'filled',
                color: 'primary',
                size: 'sm',
                onClick: () => ctrl.startTour(),
              },
              'Start 4-Step Tour'
            )
          )
        },
        'A four-step tour with step indicators showing progress through the flow.'
      ),
      Section(
        'Custom Step Content',
        () => {
          const steps: TourStep[] = [
            {
              target: '#custom-content-target',
              title: 'Rich Content',
              content: html.div(
                attr.class('space-y-2'),
                html.p(
                  attr.class('text-sm'),
                  'This step uses custom rich content instead of a plain description.'
                ),
                html.ul(
                  attr.class('text-sm list-disc pl-4 space-y-1'),
                  html.li('Supports any TNode content'),
                  html.li('Including lists, images, and more'),
                  html.li('Full styling control')
                )
              ),
            },
          ]
          const [tour, ctrl] = OnboardingTour({ steps, showSkipButton: false })
          return html.div(
            attr.class('flex flex-col gap-4 w-full'),
            html.div(
              attr.id('custom-content-target'),
              attr.class(
                'px-4 py-3 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
              ),
              'Target with rich tooltip content'
            ),
            tour,
            Button(
              {
                variant: 'filled',
                color: 'primary',
                size: 'sm',
                onClick: () => ctrl.startTour(),
              },
              'Show Rich Tooltip'
            )
          )
        },
        'Steps can render arbitrary TNode content instead of plain text descriptions.'
      ),
      Section(
        'Programmatic Control',
        () => {
          const steps: TourStep[] = [
            {
              target: '#prog-1',
              title: 'Step 1',
              description: 'First step.',
            },
            {
              target: '#prog-2',
              title: 'Step 2',
              description: 'Second step.',
            },
            {
              target: '#prog-3',
              title: 'Step 3',
              description: 'Third step.',
            },
          ]
          const [tour, ctrl] = OnboardingTour({ steps })
          return html.div(
            attr.class('flex flex-col gap-4 w-full'),
            html.div(
              attr.class('flex gap-3'),
              ...['A', 'B', 'C'].map((label, i) =>
                html.div(
                  attr.id(`prog-${i + 1}`),
                  attr.class('px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded'),
                  `Target ${label}`
                )
              )
            ),
            tour,
            html.div(
              attr.class('flex flex-wrap gap-2'),
              Button(
                { variant: 'filled', color: 'primary', size: 'sm', onClick: () => ctrl.startTour() },
                'Start'
              ),
              Button(
                { variant: 'outline', size: 'sm', onClick: () => ctrl.goToStep(0) },
                'Go to 1'
              ),
              Button(
                { variant: 'outline', size: 'sm', onClick: () => ctrl.goToStep(1) },
                'Go to 2'
              ),
              Button(
                { variant: 'outline', size: 'sm', onClick: () => ctrl.goToStep(2) },
                'Go to 3'
              ),
              Button(
                { variant: 'outline', size: 'sm', onClick: () => ctrl.endTour() },
                'End'
              )
            )
          )
        },
        'Use startTour(), goToStep(n), and endTour() to control the tour programmatically.'
      ),
      Section(
        'Backdrop Click Behavior',
        () => {
          const steps: TourStep[] = [
            {
              target: '#backdrop-1',
              title: 'Click Outside',
              description: 'Click the dark backdrop area to advance to the next step.',
            },
            {
              target: '#backdrop-2',
              title: 'Last Step',
              description: 'Click the backdrop again to close the tour.',
            },
          ]
          const [tour, ctrl] = OnboardingTour({
            steps,
            backdropAction: 'advance',
            showSkipButton: false,
          })
          return html.div(
            attr.class('flex flex-col gap-4 w-full'),
            html.div(
              attr.class('flex gap-4'),
              html.div(
                attr.id('backdrop-1'),
                attr.class('px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded'),
                'First'
              ),
              html.div(
                attr.id('backdrop-2'),
                attr.class('px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded'),
                'Second'
              )
            ),
            tour,
            Button(
              {
                variant: 'filled',
                color: 'primary',
                size: 'sm',
                onClick: () => ctrl.startTour(),
              },
              'Start (Click Backdrop to Advance)'
            )
          )
        },
        'Set backdropAction to "advance" to let users progress by clicking the backdrop, or "close" to dismiss the tour.'
      ),
    ],
  })
}

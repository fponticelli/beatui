import { OnboardingTour, Button } from '@tempots/beatui'
import type { TourStep } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'OnboardingTour',
  category: 'Feedback',
  component: 'OnboardingTour',
  description:
    'A step-by-step guided tour overlay that highlights UI elements with a spotlight effect and tooltip navigation.',
  icon: 'lucide:map',
  order: 12,
}

function DemoApp() {
  return html.div(
    attr.class('w-full border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden'),

    // Top bar
    html.div(
      attr.class('flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'),
      html.div(
        attr.id('tour-logo'),
        attr.class('font-bold text-base text-blue-600 dark:text-blue-400'),
        'Acme App'
      ),
      html.div(
        attr.class('flex items-center gap-3'),
        html.div(
          attr.id('tour-search'),
          attr.class('px-3 py-1 text-xs rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 w-40'),
          'Search...'
        ),
        html.div(
          attr.id('tour-avatar'),
          attr.class('w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold'),
          'JD'
        )
      )
    ),

    // Body with sidebar + main
    html.div(
      attr.class('flex'),

      // Sidebar
      html.div(
        attr.class('w-36 border-r border-gray-200 dark:border-gray-700 p-3 flex flex-col gap-1 bg-gray-50/50 dark:bg-gray-800/50'),
        ...['Dashboard', 'Projects', 'Tasks', 'Settings'].map((label, i) =>
          html.div(
            attr.id(i === 0 ? 'tour-nav' : ''),
            attr.class(
              `px-2 py-1.5 rounded text-sm cursor-default ${i === 0 ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`
            ),
            label
          )
        )
      ),

      // Main content
      html.div(
        attr.class('flex-1 p-4 flex flex-col gap-3'),
        html.div(
          attr.class('flex items-center justify-between'),
          html.h3(
            attr.id('tour-heading'),
            attr.class('text-base font-semibold'),
            'Dashboard'
          ),
          html.div(
            attr.id('tour-actions'),
            attr.class('flex gap-2'),
            html.div(
              attr.class('px-2.5 py-1 text-xs rounded-md bg-blue-600 text-white font-medium'),
              '+ New'
            ),
            html.div(
              attr.class('px-2.5 py-1 text-xs rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'),
              'Export'
            )
          )
        ),

        // Stat cards row
        html.div(
          attr.id('tour-stats'),
          attr.class('grid grid-cols-3 gap-2'),
          ...['12 Active', '5 Completed', '3 Overdue'].map(label =>
            html.div(
              attr.class('px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-center text-xs'),
              label
            )
          )
        ),

        // Table-like area
        html.div(
          attr.id('tour-table'),
          attr.class('border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden text-xs'),
          html.div(
            attr.class('grid grid-cols-3 gap-0 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 font-medium text-gray-500 dark:text-gray-400'),
            html.span('Name'),
            html.span('Status'),
            html.span('Due')
          ),
          ...['Alpha', 'Beta'].map(name =>
            html.div(
              attr.class('grid grid-cols-3 gap-0 px-3 py-1.5 border-t border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400'),
              html.span(name),
              html.span('Active'),
              html.span('Mar 20')
            )
          )
        )
      )
    )
  )
}

export default function OnboardingTourPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('OnboardingTour', () => {
      const steps: TourStep[] = [
        {
          target: '#tour-logo',
          title: 'Welcome',
          description: 'This is your app. Let us show you around the key areas.',
          placement: 'bottom',
        },
        {
          target: '#tour-search',
          title: 'Search',
          description: 'Quickly find projects, tasks, or team members from anywhere.',
          placement: 'bottom',
        },
        {
          target: '#tour-nav',
          title: 'Navigation',
          description: 'Switch between different sections using the sidebar.',
          placement: 'right',
        },
        {
          target: '#tour-heading',
          title: 'Page Header',
          description: 'Each section has a header showing where you are.',
          placement: 'bottom',
        },
        {
          target: '#tour-actions',
          title: 'Actions',
          description: 'Create new items or export data using these buttons.',
          placement: 'left',
        },
        {
          target: '#tour-stats',
          title: 'Overview Stats',
          description: 'Get a quick summary of your project activity at a glance.',
          placement: 'bottom',
        },
        {
          target: '#tour-table',
          title: 'Data Table',
          description: 'View and manage all your items in a structured list.',
          placement: 'top',
        },
        {
          target: '#tour-avatar',
          title: 'Your Profile',
          description: 'Access your account settings and preferences. You are all set!',
          placement: 'bottom',
        },
      ]
      const [tour, ctrl] = OnboardingTour({
        steps,
        onComplete: () => console.log('Tour completed'),
        onSkip: () => console.log('Tour skipped'),
      })
      return html.div(
        attr.class('flex flex-col gap-4 w-full'),
        DemoApp(),
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

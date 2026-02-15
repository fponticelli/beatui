import { html, attr, prop, When, Value, computedOf } from '@tempots/dom'
import {
  ScrollablePanel,
  Stack,
  Card,
  ProgressBar,
  Button,
  Group,
  Icon,
  ThemeColorName,
} from '@tempots/beatui'

export default function ProgressBarPage() {
  // Reactive state for interactive demos
  const progress = prop(65)
  const uploadProgress = prop(0)
  const isUploading = prop(false)

  // Simulate upload progress
  const simulateUpload = () => {
    isUploading.set(true)
    uploadProgress.set(0)

    const interval = setInterval(() => {
      uploadProgress.update(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            isUploading.set(false)
            uploadProgress.set(0)
          }, 1000)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return ScrollablePanel({
    body: Stack(
      attr.class('gap-4 p-4 h-full overflow-auto'),

      // Basic usage
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-xl font-semibold'), 'ProgressBar – Basic'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Progress bar component for showing completion status.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), '25% Progress'),
              ProgressBar({ value: 25 })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), '50% Progress'),
              ProgressBar({ value: 50 })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), '75% Progress'),
              ProgressBar({ value: 75 })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), '100% Complete'),
              ProgressBar({ value: 100 })
            )
          )
        )
      ),

      // With labels
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'With Labels'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Progress bars can display percentage labels.'
          ),
          html.div(
            attr.class('space-y-4'),
            ProgressBar({ value: 30, showLabel: true }),
            ProgressBar({ value: 60, showLabel: true, color: 'success' }),
            ProgressBar({ value: 90, showLabel: true, color: 'warning' })
          )
        )
      ),

      // Sizes
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Sizes'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Progress bars come in three different sizes.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.h3(
                attr.class('text-sm font-semibold'),
                'Small (4px height)'
              ),
              ProgressBar({ value: 60, size: 'sm' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(
                attr.class('text-sm font-semibold'),
                'Medium (8px height, default)'
              ),
              ProgressBar({ value: 60, size: 'md' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(
                attr.class('text-sm font-semibold'),
                'Large (12px height)'
              ),
              ProgressBar({ value: 60, size: 'lg' })
            )
          )
        )
      ),

      // Colors
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Colors'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Progress bars support all theme colors.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Primary (default)'),
              ProgressBar({ value: 70, color: 'primary' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Success'),
              ProgressBar({ value: 70, color: 'success' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Warning'),
              ProgressBar({ value: 70, color: 'warning' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Danger'),
              ProgressBar({ value: 70, color: 'danger' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Info'),
              ProgressBar({ value: 70, color: 'info' })
            )
          )
        )
      ),

      // Indeterminate state
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Indeterminate State'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Use indeterminate progress bars when the completion time is unknown.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Loading...'),
              ProgressBar({ indeterminate: true })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Processing...'),
              ProgressBar({ indeterminate: true, color: 'success', size: 'lg' })
            )
          )
        )
      ),

      // Border radius
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Border Radius'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Control the border radius of progress bars.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'None'),
              ProgressBar({ value: 60, roundedness: 'none', size: 'lg' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Small'),
              ProgressBar({ value: 60, roundedness: 'sm', size: 'lg' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Full (default)'),
              ProgressBar({ value: 60, roundedness: 'full', size: 'lg' })
            )
          )
        )
      ),

      // Interactive demo
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Interactive Demo'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Adjust progress value with buttons.'
          ),
          Group(
            { gap: 'sm' },
            Button(
              {
                onClick: () => progress.set(Math.max(0, progress.value - 10)),
                disabled: progress.map(v => v === 0),
              },
              Icon({ icon: 'lucide:minus' })
            ),
            Button(
              {
                onClick: () => progress.set(0),
              },
              'Reset'
            ),
            Button(
              {
                onClick: () => progress.set(Math.min(100, progress.value + 10)),
                disabled: progress.map(v => v === 100),
              },
              Icon({ icon: 'lucide:plus' })
            )
          ),
          html.div(
            attr.class('mt-4'),
            ProgressBar({ value: progress, showLabel: true, size: 'lg' })
          )
        )
      ),

      // Upload simulation
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Upload Simulation'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Simulated file upload with progress tracking.'
          ),
          Group(
            { gap: 'sm' },
            Button(
              {
                onClick: simulateUpload,
                disabled: isUploading,
              },
              Icon({ icon: 'lucide:upload' }),
              Value.map(isUploading, u => (u ? 'Uploading...' : 'Start Upload'))
            )
          ),
          html.div(
            attr.class('mt-4 space-y-2'),
            When(
              computedOf(isUploading, uploadProgress)((u, p) => u || p > 0),
              () =>
                html.div(
                  attr.class('space-y-2'),
                  html.div(
                    attr.class('flex items-center justify-between text-sm'),
                    html.span('document.pdf'),
                    html.span(
                      attr.class('text-gray-600 dark:text-gray-400'),
                      Value.map(uploadProgress, p =>
                        p === 100 ? 'Complete!' : `${p}%`
                      )
                    )
                  ),
                  ProgressBar({
                    value: uploadProgress,
                    color: uploadProgress.map(
                      p => (p === 100 ? 'success' : 'primary') as ThemeColorName
                    ),
                    size: 'md',
                  })
                ),
              () =>
                html.div(
                  attr.class('text-sm text-gray-500 dark:text-gray-400 italic'),
                  'Click "Start Upload" to begin'
                )
            )
          )
        )
      ),

      // Common use cases
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Common Use Cases'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Examples of common progress bar usage patterns.'
          ),
          html.div(
            attr.class('space-y-6'),
            // Task completion
            html.div(
              attr.class('space-y-3'),
              html.h3(attr.class('text-sm font-semibold'), 'Task Completion'),
              html.div(
                attr.class('space-y-2'),
                html.div(
                  attr.class('flex items-center justify-between text-sm'),
                  html.span('Profile Setup'),
                  html.span(
                    attr.class('text-gray-600 dark:text-gray-400'),
                    '3 of 4 steps complete'
                  )
                ),
                ProgressBar({ value: 75, color: 'success', showLabel: true })
              )
            ),
            // Storage usage
            html.div(
              attr.class('space-y-3'),
              html.h3(attr.class('text-sm font-semibold'), 'Storage Usage'),
              html.div(
                attr.class('space-y-2'),
                html.div(
                  attr.class('flex items-center justify-between text-sm'),
                  html.span('Cloud Storage'),
                  html.span(attr.class('text-gray-600 dark:text-gray-400'), '8.2 GB of 10 GB used')
                ),
                ProgressBar({ value: 82, color: 'warning', size: 'lg' })
              )
            ),
            // Skill levels
            html.div(
              attr.class('space-y-3'),
              html.h3(attr.class('text-sm font-semibold'), 'Skill Levels'),
              html.div(
                attr.class('space-y-3'),
                html.div(
                  attr.class('space-y-1'),
                  html.div(attr.class('text-sm font-medium'), 'TypeScript'),
                  ProgressBar({ value: 90, color: 'primary', size: 'sm' })
                ),
                html.div(
                  attr.class('space-y-1'),
                  html.div(attr.class('text-sm font-medium'), 'React'),
                  ProgressBar({ value: 85, color: 'primary', size: 'sm' })
                ),
                html.div(
                  attr.class('space-y-1'),
                  html.div(attr.class('text-sm font-medium'), 'CSS'),
                  ProgressBar({ value: 75, color: 'primary', size: 'sm' })
                )
              )
            )
          )
        )
      )
    ),
  })
}

import { html, attr, prop, When, Value } from '@tempots/dom'
import {
  ScrollablePanel,
  Stack,
  Card,
  Skeleton,
  Button,
  Group,
} from '@tempots/beatui'

export default function SkeletonPage() {
  // Reactive state for demonstrating loading simulation
  const isLoading = prop(true)

  return ScrollablePanel({
    body: Stack(
      attr.class('gap-4 p-4 h-full overflow-auto'),

      // Basic variants
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-xl font-semibold'), 'Skeleton – Variants'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Skeleton component with different shape variants for loading states.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Text (default)'),
              Skeleton({ variant: 'text' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Rectangle'),
              Skeleton({ variant: 'rect', height: '100px' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Circle'),
              Skeleton({ variant: 'circle', width: '64px', height: '64px' })
            )
          )
        )
      ),

      // Multi-line text skeleton
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Multi-line Text'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Text skeletons can render multiple lines. The last line is automatically 80% width for a natural look.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), '3 Lines'),
              Skeleton({ variant: 'text', lines: 3 })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), '5 Lines'),
              Skeleton({ variant: 'text', lines: 5 })
            )
          )
        )
      ),

      // Animation control
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Animation'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Skeletons have a shimmer animation by default, but can be disabled.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.h3(
                attr.class('text-sm font-semibold'),
                'With Animation (default)'
              ),
              Skeleton({ variant: 'text', animate: true })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Without Animation'),
              Skeleton({ variant: 'text', animate: false })
            )
          )
        )
      ),

      // Custom dimensions
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Custom Dimensions'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Skeletons support custom width and height values.'
          ),
          html.div(
            attr.class('space-y-4'),
            Skeleton({ variant: 'rect', width: '100%', height: '200px' }),
            Skeleton({ variant: 'rect', width: '50%', height: '80px' }),
            Skeleton({ variant: 'rect', width: '300px', height: '40px' })
          )
        )
      ),

      // Roundedness
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(attr.class('text-lg font-semibold'), 'Border Radius'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Control the border radius of skeleton elements.'
          ),
          html.div(
            attr.class('space-y-4'),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'None'),
              Skeleton({ variant: 'rect', height: '40px', roundedness: 'none' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Small (default)'),
              Skeleton({ variant: 'rect', height: '40px', roundedness: 'sm' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Large'),
              Skeleton({ variant: 'rect', height: '40px', roundedness: 'lg' })
            ),
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Full'),
              Skeleton({ variant: 'rect', height: '40px', roundedness: 'full' })
            )
          )
        )
      ),

      // Common patterns
      Card(
        {},
        html.div(
          attr.class('space-y-3'),
          html.h2(
            attr.class('text-lg font-semibold'),
            'Common Loading Patterns'
          ),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Examples of common skeleton usage patterns for loading states.'
          ),
          html.div(
            attr.class('space-y-6'),
            // User card loading
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'User Card Loading'),
              html.div(
                attr.class('flex gap-4 items-start'),
                Skeleton({ variant: 'circle', width: '64px', height: '64px' }),
                html.div(
                  attr.class('flex-1 space-y-2'),
                  Skeleton({ variant: 'text', width: '200px' }),
                  Skeleton({ variant: 'text', width: '150px' }),
                  Skeleton({ variant: 'text', width: '100px' })
                )
              )
            ),
            // Article loading
            html.div(
              attr.class('space-y-2'),
              html.h3(attr.class('text-sm font-semibold'), 'Article Loading'),
              html.div(
                attr.class('space-y-3'),
                Skeleton({
                  variant: 'rect',
                  height: '200px',
                  roundedness: 'lg',
                }),
                Skeleton({ variant: 'text', width: '80%' }),
                Skeleton({ variant: 'text', lines: 3 })
              )
            ),
            // List item loading
            html.div(
              attr.class('space-y-2'),
              html.h3(
                attr.class('text-sm font-semibold'),
                'List Items Loading'
              ),
              html.div(
                attr.class('space-y-3'),
                html.div(
                  attr.class('flex gap-3 items-center'),
                  Skeleton({
                    variant: 'circle',
                    width: '40px',
                    height: '40px',
                  }),
                  html.div(
                    attr.class('flex-1'),
                    Skeleton({ variant: 'text', width: '60%' })
                  )
                ),
                html.div(
                  attr.class('flex gap-3 items-center'),
                  Skeleton({
                    variant: 'circle',
                    width: '40px',
                    height: '40px',
                  }),
                  html.div(
                    attr.class('flex-1'),
                    Skeleton({ variant: 'text', width: '70%' })
                  )
                ),
                html.div(
                  attr.class('flex gap-3 items-center'),
                  Skeleton({
                    variant: 'circle',
                    width: '40px',
                    height: '40px',
                  }),
                  html.div(
                    attr.class('flex-1'),
                    Skeleton({ variant: 'text', width: '50%' })
                  )
                )
              )
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
            'Toggle between loading and loaded states.'
          ),
          Group(
            attr.class('gap-2'),
            Button(
              {
                onClick: () => isLoading.set(!isLoading.value),
              },
              Value.map(isLoading, loading =>
                loading ? 'Show Content' : 'Show Loading'
              )
            )
          ),
          html.div(
            attr.class('mt-4'),
            When(
              isLoading,
              () =>
                html.div(
                  attr.class('space-y-4'),
                  html.div(
                    attr.class('flex gap-4 items-start'),
                    Skeleton({
                      variant: 'circle',
                      width: '48px',
                      height: '48px',
                    }),
                    html.div(
                      attr.class('flex-1 space-y-2'),
                      Skeleton({ variant: 'text', width: '200px' }),
                      Skeleton({ variant: 'text', width: '150px' })
                    )
                  ),
                  Skeleton({
                    variant: 'rect',
                    height: '120px',
                    roundedness: 'md',
                  }),
                  Skeleton({ variant: 'text', lines: 3 })
                ),
              () =>
                html.div(
                  attr.class('space-y-4'),
                  html.div(
                    attr.class('flex gap-4 items-start'),
                    html.div(
                      attr.class(
                        'w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700'
                      )
                    ),
                    html.div(
                      attr.class('flex-1 space-y-1'),
                      html.div(attr.class('font-semibold'), 'John Doe'),
                      html.div(
                        attr.class('text-sm text-gray-600 dark:text-gray-400'),
                        'Software Engineer'
                      )
                    )
                  ),
                  html.div(
                    attr.class(
                      'p-4 rounded-md bg-gradient-to-br from-blue-50 to-purple-50'
                    ),
                    html.p(
                      attr.class('text-lg font-semibold'),
                      'Content Loaded Successfully!'
                    )
                  ),
                  html.p(
                    attr.class('text-gray-700 dark:text-gray-300'),
                    'This is the actual content that appears after loading. The skeleton provides a pleasant loading experience by showing where content will appear.'
                  )
                )
            )
          )
        )
      )
    ),
  })
}

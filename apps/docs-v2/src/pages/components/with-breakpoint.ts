import { WithBreakpoint, WithBeatUIBreakpoint, WithBeatUIElementBreakpoint } from '@tempots/beatui'
import { html, attr } from '@tempots/dom'
import { ComponentPage, manualPlayground, Section } from '../../framework'
import type { ComponentPageMeta } from '../../framework/types'

export const meta: ComponentPageMeta = {
  name: 'WithBreakpoint',
  category: 'Layout',
  component: 'WithBreakpoint',
  description:
    'A reactive breakpoint utility that monitors viewport or element width and provides the current breakpoint name and comparison helpers to a render callback.',
  icon: 'lucide:monitor-smartphone',
  order: 8,
}

export default function WithBreakpointPage() {
  return ComponentPage(meta, {
    playground: manualPlayground('WithBreakpoint', _signals => {
      return WithBreakpoint(
        ({ value, is }) =>
          html.div(
            attr.class('w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center'),
            value.map(({ width, breakpoint }) =>
              html.div(
                html.div(
                  attr.class('text-2xl font-bold text-sky-600 dark:text-sky-400 mb-1'),
                  String(breakpoint).toUpperCase()
                ),
                html.div(
                  attr.class('text-sm text-gray-500 dark:text-gray-400 mb-3'),
                  `${width}px wide`
                ),
                html.div(
                  attr.class('flex flex-wrap justify-center gap-2'),
                  html.span(
                    attr.class(
                      is('>=md', width)
                        ? 'px-2 py-1 rounded text-xs bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300'
                        : 'px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-500'
                    ),
                    '>= md'
                  ),
                  html.span(
                    attr.class(
                      is('>=lg', width)
                        ? 'px-2 py-1 rounded text-xs bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300'
                        : 'px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-500'
                    ),
                    '>= lg'
                  ),
                  html.span(
                    attr.class(
                      is('<sm', width)
                        ? 'px-2 py-1 rounded text-xs bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300'
                        : 'px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-500'
                    ),
                    '< sm'
                  )
                )
              )
            )
          ),
        {
          breakpoints: { sm: 0, md: 768, lg: 1024, xl: 1280 },
          mode: 'viewport',
        }
      )
    }),
    sections: [
      Section(
        'Viewport Breakpoints',
        () =>
          WithBreakpoint(
            ({ value, is }) =>
              html.div(
                attr.class('p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'),
                value.map(({ width, breakpoint }) =>
                  html.div(
                    html.p(
                      attr.class('text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'),
                      `Current breakpoint: `,
                      html.strong(attr.class('text-sky-600 dark:text-sky-400'), String(breakpoint)),
                      ` (${width}px)`
                    ),
                    html.div(
                      attr.class('text-xs text-gray-500 dark:text-gray-400'),
                      is('>=md', width) ? 'Desktop layout active' : 'Mobile layout active'
                    )
                  )
                )
              ),
            {
              breakpoints: { mobile: 0, tablet: 640, desktop: 1024 },
              mode: 'viewport',
            }
          ),
        'Track viewport width with custom breakpoint names. Resize the browser window to see the breakpoint update reactively.'
      ),
      Section(
        'Element Breakpoints (Container Queries)',
        () =>
          html.div(
            attr.class('flex gap-4 flex-wrap'),
            ...([200, 400, 600] as const).map(maxWidth =>
              html.div(
                attr.class('border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'),
                attr.style(`width: ${maxWidth}px; flex-shrink: 0`),
                WithBreakpoint(
                  ({ value }) =>
                    value.map(({ width, breakpoint }) =>
                      html.div(
                        attr.class('p-3 bg-gray-50 dark:bg-gray-800/50'),
                        html.div(
                          attr.class('text-xs font-mono text-sky-600 dark:text-sky-400'),
                          String(breakpoint)
                        ),
                        html.div(
                          attr.class('text-xs text-gray-400'),
                          `${width}px`
                        )
                      )
                    ),
                  {
                    breakpoints: { xs: 0, sm: 256, md: 400, lg: 600 },
                    mode: 'element',
                  }
                )
              )
            )
          ),
        'Use mode: "element" for container-query-like behavior — each instance tracks its own element width independently.'
      ),
      Section(
        'Standard BeatUI Breakpoints',
        () =>
          WithBeatUIBreakpoint(({ value, is }) =>
            value.map(({ width, breakpoint }) =>
              html.div(
                attr.class('p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-sm'),
                html.div(
                  attr.class('font-semibold text-gray-700 dark:text-gray-300 mb-2'),
                  `Breakpoint: `,
                  html.span(attr.class('text-sky-600 dark:text-sky-400'), String(breakpoint)),
                  ` at ${width}px`
                ),
                html.div(
                  attr.class('flex flex-wrap gap-2'),
                  ...(['zero', 'xs', 'sm', 'md', 'lg', 'xl'] as const).map(bp =>
                    html.span(
                      attr.class(
                        breakpoint === bp
                          ? 'px-2 py-0.5 rounded text-xs bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 font-semibold'
                          : 'px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-500'
                      ),
                      bp
                    )
                  )
                ),
                html.div(
                  attr.class('mt-2 text-xs text-gray-500'),
                  is('>=md', width) ? 'Desktop: multi-column layout' : 'Mobile: single-column layout'
                )
              )
            )
          ),
        'WithBeatUIBreakpoint is a convenience wrapper that uses the standard BeatUI viewport breakpoints read from CSS custom properties.'
      ),
      Section(
        'Element Container Breakpoints',
        () =>
          html.div(
            attr.class('w-full resize overflow-auto border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2'),
            html.p(attr.class('text-xs text-gray-400 mb-2'), 'Drag the corner to resize this container'),
            WithBeatUIElementBreakpoint(({ value }) =>
              value.map(({ width, breakpoint }) =>
                html.div(
                  attr.class('p-3 rounded bg-gray-50 dark:bg-gray-800/50 text-sm'),
                  html.span(attr.class('font-mono text-sky-600 dark:text-sky-400'), String(breakpoint)),
                  html.span(attr.class('text-gray-400 ml-2'), `(${width}px)`)
                )
              )
            )
          ),
        'WithBeatUIElementBreakpoint tracks the element width against Tailwind-inspired container breakpoints.'
      ),
      Section(
        'Comparison Operators',
        () =>
          html.div(
            attr.class('space-y-3'),
            html.p(attr.class('text-sm text-gray-600 dark:text-gray-400'), 'The is() helper supports operators: =, !=, <, >, <=, >='),
            html.div(
              attr.class('font-mono text-xs bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-1'),
              html.div(attr.class('text-gray-700 dark:text-gray-300'), "is('>=md', width)  // width >= 768"),
              html.div(attr.class('text-gray-700 dark:text-gray-300'), "is('<lg', width)   // width < 1024"),
              html.div(attr.class('text-gray-700 dark:text-gray-300'), "is('=sm', width)   // width in [640, 768)"),
              html.div(attr.class('text-gray-700 dark:text-gray-300'), "is('!=md', width)  // width not in [768, 1024)")
            )
          ),
        'Comparison expressions combine an operator with a breakpoint name for flexible range checks.'
      ),
    ],
  })
}

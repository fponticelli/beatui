import type { Meta, StoryObj } from '@storybook/html-vite'
import { Button, Use, Theme, ThemeAppeareance } from '../src/'
import { renderTempoComponent } from './common'
import { html, attr, on } from '@tempots/dom'

// Create a theme demonstration
const renderThemeDemo = () => {
  return Use(
    Theme,
    ({ appearance, appearancePreference, setAppearancePreference }) =>
      html.div(
        ThemeAppeareance(),
        html.h1('Theme System Demo'),

        // Theme controls
        html.div(
          attr.style(
            'background: #f5f5f5; padding: 1.5rem; border-radius: 0.5rem; margin: 1rem 0;'
          ),
          html.h2('Theme Controls'),
          html.div(
            attr.style(
              'display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;'
            ),
            html.div(
              html.label('Appearance: '),
              html.select(
                attr.value(appearancePreference.map(String)),
                on.change((e: Event) => {
                  const target = e.target as HTMLSelectElement
                  const value = target.value as 'light' | 'dark' | 'system'
                  setAppearancePreference(value)
                }),
                html.option(attr.value('system'), 'System'),
                html.option(attr.value('light'), 'Light'),
                html.option(attr.value('dark'), 'Dark')
              )
            ),
            html.div(
              attr.style('margin-left: 2rem;'),
              html.span('Current: '),
              html.strong(appearance.map(String))
            )
          )
        ),

        // Component examples
        html.div(
          html.h2('Component Examples'),
          html.div(
            attr.style('display: grid; gap: 2rem; margin: 1rem 0;'),

            // Buttons
            html.div(
              html.h3('Buttons'),
              html.div(
                attr.style('display: flex; gap: 1rem; flex-wrap: wrap;'),
                Button({ variant: 'filled', color: 'primary' }, 'Primary'),
                Button({ variant: 'filled', color: 'secondary' }, 'Secondary'),
                Button({ variant: 'outline', color: 'primary' }, 'Outline'),
                Button({ variant: 'text', color: 'primary' }, 'Text'),
                Button({ variant: 'light', color: 'primary' }, 'Light')
              )
            ),

            // Different colors
            html.div(
              html.h3('Color Variants'),
              html.div(
                attr.style('display: flex; gap: 1rem; flex-wrap: wrap;'),
                Button({ variant: 'filled', color: 'red' }, 'Red'),
                Button({ variant: 'filled', color: 'orange' }, 'Orange'),
                Button({ variant: 'filled', color: 'green' }, 'Green'),
                Button({ variant: 'filled', color: 'blue' }, 'Blue'),
                Button({ variant: 'filled', color: 'purple' }, 'Purple'),
                Button({ variant: 'filled', color: 'pink' }, 'Pink')
              )
            ),

            // Sizes and roundedness
            html.div(
              html.h3('Sizes & Roundedness'),
              html.div(
                attr.style(
                  'display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;'
                ),
                Button(
                  {
                    variant: 'filled',
                    color: 'sky',
                    size: 'sm',
                    roundedness: 'none',
                  },
                  'Small/None'
                ),
                Button(
                  {
                    variant: 'filled',
                    color: 'sky',
                    size: 'md',
                    roundedness: 'sm',
                  },
                  'Medium/Small'
                ),
                Button(
                  {
                    variant: 'filled',
                    color: 'sky',
                    size: 'lg',
                    roundedness: 'md',
                  },
                  'Large/Medium'
                ),
                Button(
                  {
                    variant: 'filled',
                    color: 'sky',
                    size: 'md',
                    roundedness: 'full',
                  },
                  'Full Round'
                )
              )
            )
          )
        ),

        // Technical details
        html.div(
          html.h2('Technical Implementation'),
          html.div(
            attr.style(
              'background: #f8f9fa; padding: 1.5rem; border-radius: 0.5rem; margin: 1rem 0;'
            ),
            html.br(),
            html.h3('CSS Variables'),
            html.div(
              attr.style(
                'font-family: monospace; font-size: 0.875rem; line-height: 1.5;'
              ),
              html.div('Colors: var(--color-purple-600)'),
              html.div('Spacing: var(--spacing-1-5)'),
              html.div('Border radius: var(--radius-lg)'),
              html.div('Font sizes: var(--font-size-sm)')
            )
          )
        ),

        // Migration benefits
        html.div(
          html.h2('Migration Benefits'),
          html.ul(
            attr.style('line-height: 1.6;'),
            html.li(
              '✅ All 22 colors supported - Complete Tailwind color palette'
            ),
            html.li('✅ CSS variables - Modern, flexible theming system'),
            html.li(
              '✅ Optimized bundle - 44.22 KB focused CSS (5.23 KB gzipped)'
            ),
            html.li('✅ Better debugging - Clear class names in DevTools'),
            html.li(
              '✅ Runtime theming - CSS variables can be changed dynamically'
            ),
            html.li(
              '✅ Type safety - CSS generated from TypeScript definitions'
            ),
            html.li('✅ Zero breaking changes - Same component APIs'),
            html.li(
              '✅ File watching - Auto-regenerates CSS during development'
            )
          )
        )
      )
  )
}

const meta = {
  title: 'Showcase/Theme System',
  tags: ['autodocs'],
  render: renderTempoComponent(renderThemeDemo),
} satisfies Meta

export default meta
type Story = StoryObj

export const ThemeDemo: Story = {}

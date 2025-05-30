import type { Meta, StoryObj } from '@storybook/html'
import { Button, Use, ThemeProvider } from '../src/'
import { renderTempoComponent } from './common'
import { html, attr, on } from '@tempots/dom'

// Create a theme demonstration
const renderThemeDemo = () => {
  return Use(ThemeProvider, theme =>
    html.div(
      html.h1('Theme System Demo'),
      html.p('Demonstrates the BEM-based theme system with CSS variables'),

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
              attr.value(theme.appearancePreference.get()),
              on.change((e: Event) => {
                const target = e.target as HTMLSelectElement
                const value = target.value as 'light' | 'dark' | 'system'
                // Update appearance preference directly
                if (value === 'light' || value === 'dark') {
                  theme.setAppearance(value)
                } else {
                  // For 'system', we need to set the preference directly
                  // This is a workaround for the type system limitation
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const pref = theme.appearancePreference as any
                  pref.set('system')
                }
              }),
              html.option(attr.value('system'), 'System'),
              html.option(attr.value('light'), 'Light'),
              html.option(attr.value('dark'), 'Dark')
            )
          ),
          html.div(
            attr.style('margin-left: 2rem;'),
            html.span('Current: '),
            html.strong(theme.appearance.get())
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
              Button(
                { variant: 'filled', color: 'primary', size: 'medium' },
                'Primary'
              ),
              Button(
                { variant: 'filled', color: 'secondary', size: 'medium' },
                'Secondary'
              ),
              Button(
                { variant: 'outline', color: 'primary', size: 'medium' },
                'Outline'
              ),
              Button(
                { variant: 'text', color: 'primary', size: 'medium' },
                'Text'
              ),
              Button(
                { variant: 'light', color: 'primary', size: 'medium' },
                'Light'
              )
            )
          ),

          // Different colors
          html.div(
            html.h3('Color Variants'),
            html.div(
              attr.style('display: flex; gap: 1rem; flex-wrap: wrap;'),
              Button(
                { variant: 'filled', color: 'red', size: 'medium' },
                'Red'
              ),
              Button(
                { variant: 'filled', color: 'orange', size: 'medium' },
                'Orange'
              ),
              Button(
                { variant: 'filled', color: 'green', size: 'medium' },
                'Green'
              ),
              Button(
                { variant: 'filled', color: 'blue', size: 'medium' },
                'Blue'
              ),
              Button(
                { variant: 'filled', color: 'purple', size: 'medium' },
                'Purple'
              ),
              Button(
                { variant: 'filled', color: 'pink', size: 'medium' },
                'Pink'
              )
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
                  size: 'small',
                  roundedness: 'none',
                },
                'Small/None'
              ),
              Button(
                {
                  variant: 'filled',
                  color: 'sky',
                  size: 'medium',
                  roundedness: 'small',
                },
                'Medium/Small'
              ),
              Button(
                {
                  variant: 'filled',
                  color: 'sky',
                  size: 'large',
                  roundedness: 'medium',
                },
                'Large/Medium'
              ),
              Button(
                {
                  variant: 'filled',
                  color: 'sky',
                  size: 'medium',
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
          html.h3('BEM Class Structure'),
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
          html.li('✅ Pure BEM methodology - Clean, semantic class names'),
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
          html.li('✅ Type safety - CSS generated from TypeScript definitions'),
          html.li('✅ Zero breaking changes - Same component APIs'),
          html.li('✅ File watching - Auto-regenerates CSS during development')
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

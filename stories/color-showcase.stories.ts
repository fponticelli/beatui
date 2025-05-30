import type { Meta, StoryObj } from '@storybook/html'
import { allColors, Button, ThemedColor } from '../src/'
import { renderTempoComponent } from './common'
import { html, attr } from '@tempots/dom'

// Create a comprehensive color showcase
const renderColorShowcase = () => {
  const variants = ['filled', 'outline', 'text', 'light'] as const
  const themedColors: ThemedColor[] = ['primary', 'secondary', 'neutral']
  const allTestColors = [...themedColors, ...allColors]

  return html.div(
    html.h1('Tempo UI Color Showcase'),
    html.p('All 22 colors with 4 variants each, using generated BEM CSS'),

    // Color grid
    html.div(
      attr.style('display: grid; gap: 2rem; margin: 2rem 0;'),

      variants.map(variant =>
        html.div(
          html.h2(
            `${variant.charAt(0).toUpperCase() + variant.slice(1)} Variant`
          ),
          html.div(
            attr.style(
              'display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin: 1rem 0;'
            ),
            allTestColors.map(color =>
              html.div(
                attr.style('text-align: center;'),
                Button(
                  {
                    variant,
                    color,
                    size: 'medium',
                    disabled: false,
                  },
                  String(color) // Ensure color is converted to string
                ),
                html.div(
                  attr.style(
                    'font-size: 0.75rem; margin-top: 0.5rem; color: #666;'
                  ),
                  String(color) // Ensure color is converted to string
                )
              )
            )
          )
        )
      )
    ),

    // Interactive states showcase
    html.div(
      html.h2('Interactive States'),
      html.div(
        attr.style(
          'display: flex; gap: 1rem; margin: 1rem 0; flex-wrap: wrap;'
        ),
        html.div(
          html.h3('Normal'),
          Button(
            { variant: 'filled', color: 'sky', size: 'medium' },
            'Sky Button'
          )
        ),
        html.div(
          html.h3('Disabled'),
          Button(
            { variant: 'filled', color: 'sky', size: 'medium', disabled: true },
            'Disabled'
          )
        ),
        html.div(
          html.h3('Different Sizes'),
          html.div(
            attr.style('display: flex; gap: 0.5rem; align-items: center;'),
            Button(
              { variant: 'filled', color: 'purple', size: 'small' },
              'Small'
            ),
            Button(
              { variant: 'filled', color: 'purple', size: 'medium' },
              'Medium'
            ),
            Button(
              { variant: 'filled', color: 'purple', size: 'large' },
              'Large'
            )
          )
        )
      )
    ),

    // CSS Variables demonstration
    html.div(
      html.h2('CSS Variables'),
      html.p(
        'All colors use CSS variables like var(--color-purple-600) for easy theming'
      ),
      html.div(
        attr.style(
          'background: #f5f5f5; padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 0.875rem;'
        ),
        html.div('.tempo-button--variant-filled.tempo-button--color-purple {'),
        html.div('  background-color: var(--color-purple-600);'),
        html.div('  color: white;'),
        html.div('  border-color: transparent;'),
        html.div('}'),
        html.br(),
        html.div(
          '.tempo-button--variant-filled.tempo-button--color-purple:hover {'
        ),
        html.div('  background-color: var(--color-purple-700);'),
        html.div('  transform: scale(1.05);'),
        html.div('}')
      )
    )
  )
}

const meta = {
  title: 'Showcase/Color System',
  tags: ['autodocs'],
  render: renderTempoComponent(renderColorShowcase),
} satisfies Meta

export default meta
type Story = StoryObj

export const AllColors: Story = {}

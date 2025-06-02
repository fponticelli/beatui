import type { Meta, StoryObj } from '@storybook/html-vite'
import { Button } from '../src/'
import { renderTempoComponent } from './common'
import { html, attr } from '@tempots/dom'

// Create a comprehensive color showcase
const renderColorShowcase = () => {
  const variants = ['filled', 'light', 'outline', 'default', 'text'] as const
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const

  return html.div(
    html.h1('Tempo UI Color Showcase'),
    html.p(
      'New layered CSS architecture with semantic variants and design tokens'
    ),

    // Variant showcase
    html.div(
      attr.style('display: grid; gap: 2rem; margin: 2rem 0;'),

      variants.map(variant =>
        html.div(
          html.h2(
            `${variant.charAt(0).toUpperCase() + variant.slice(1)} Variant`
          ),
          html.div(
            attr.style(
              'display: flex; gap: 1rem; margin: 1rem 0; flex-wrap: wrap;'
            ),
            Button(
              {
                variant,
                size: 'md',
                disabled: false,
              },
              `${variant.charAt(0).toUpperCase() + variant.slice(1)} Button`
            ),
            Button(
              {
                variant,
                size: 'md',
                disabled: true,
              },
              'Disabled'
            )
          )
        )
      )
    ),

    // Size showcase
    html.div(
      html.h2('Button Sizes'),
      html.div(
        attr.style(
          'display: flex; gap: 1rem; margin: 1rem 0; align-items: center; flex-wrap: wrap;'
        ),
        sizes.map(size =>
          Button(
            {
              size,
              disabled: false,
            },
            `${size.toUpperCase()} Button`
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
          Button({ variant: 'filled', size: 'md' }, 'Primary Button')
        ),
        html.div(
          html.h3('Disabled'),
          Button({ variant: 'filled', size: 'md', disabled: true }, 'Disabled')
        ),
        html.div(
          html.h3('Hover States'),
          html.div(
            attr.style('display: flex; gap: 0.5rem; align-items: center;'),
            Button({ variant: 'filled', size: 'md' }, 'Outline'),
            Button({ variant: 'outline', size: 'md' }, 'Ghost'),
            Button(
              { variant: 'filled', color: 'orange', size: 'md' },
              'Destructive'
            )
          )
        )
      )
    ),

    // CSS Variables demonstration
    html.div(
      html.h2('CSS Variables & Design Tokens'),
      html.p(
        'New layered CSS architecture uses design tokens with CSS variables'
      ),
      html.div(
        attr.style(
          'background: var(--color-neutral-100); padding: 1rem; border-radius: var(--radius-lg); font-family: var(--font-family-mono); font-size: var(--font-size-sm);'
        ),
        html.div('.bc-button--primary {'),
        html.div('  background-color: var(--color-primary-500);'),
        html.div('  border-color: var(--color-primary-500);'),
        html.div('  color: white;'),
        html.div('}'),
        html.br(),
        html.div('.bc-button--primary:hover:not(:disabled) {'),
        html.div('  background-color: var(--color-primary-600);'),
        html.div('  border-color: var(--color-primary-600);'),
        html.div('}')
      )
    ),

    // Dark mode demonstration
    html.div(
      html.h2('Dark Mode Support'),
      html.p('Toggle dark mode to see automatic color adaptation'),
      html.div(
        attr.style('display: flex; gap: 1rem; margin: 1rem 0;'),
        Button(
          {
            variant: 'outline',
            size: 'md',
            onClick: () => {
              document.documentElement.classList.toggle('dark')
            },
          },
          'Toggle Dark Mode'
        )
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

import type { Meta, StoryObj } from '@storybook/html'
import { Icon } from '../src/'
import { renderTempoComponent } from './common'
import { html, attr } from '@tempots/dom'

// Create a comprehensive icon showcase
const renderIconShowcase = () => {
  const iconSets = [
    {
      name: 'Line MD Icons',
      icons: [
        'line-md:home',
        'line-md:account',
        'line-md:cog',
        'line-md:heart',
        'line-md:alert',
        'line-md:close',
        'line-md:check',
        'line-md:arrow-left',
        'line-md:arrow-right',
        'line-md:arrow-up',
        'line-md:arrow-down',
        'line-md:plus',
        'line-md:minus',
        'line-md:edit',
        'line-md:delete',
        'line-md:search',
        'line-md:menu',
        'line-md:star',
        'line-md:email',
        'line-md:phone',
      ],
    },
    {
      name: 'Tabler Icons',
      icons: [
        'tabler:home',
        'tabler:user',
        'tabler:settings',
        'tabler:heart',
        'tabler:alert-circle',
        'tabler:x',
        'tabler:check',
        'tabler:arrow-left',
        'tabler:arrow-right',
        'tabler:plus',
        'tabler:minus',
        'tabler:edit',
        'tabler:trash',
        'tabler:search',
        'tabler:menu-2',
        'tabler:star',
      ],
    },
  ]

  const sizes = [
    { name: 'Small', value: 'small' },
    { name: 'Medium', value: 'medium' },
    { name: 'Large', value: 'large' },
  ] as const

  const colors = [
    { name: 'Default', value: undefined },
    { name: 'Red', value: 'red' },
    { name: 'Blue', value: 'blue' },
    { name: 'Green', value: 'green' },
    { name: 'Purple', value: 'purple' },
    { name: 'Orange', value: 'orange' },
  ]

  return html.div(
    html.h1('Icon System Showcase'),
    html.p(
      'Demonstrating pure CSS Iconify icons with layered CSS architecture'
    ),

    // Size demonstration
    html.div(
      attr.style('margin: 2rem 0;'),
      html.h2('Icon Sizes'),
      html.div(
        attr.style(
          'display: flex; gap: 2rem; align-items: center; flex-wrap: wrap;'
        ),
        sizes.map(size =>
          html.div(
            attr.style('text-align: center;'),
            html.div(
              attr.style('margin-bottom: 0.5rem;'),
              Icon({ icon: 'line-md:home', size: size.value })
            ),
            html.div(attr.style('font-size: 0.875rem; color: #666;'), size.name)
          )
        )
      )
    ),

    // Color demonstration
    html.div(
      attr.style('margin: 2rem 0;'),
      html.h2('Icon Colors'),
      html.div(
        attr.style(
          'display: flex; gap: 2rem; align-items: center; flex-wrap: wrap;'
        ),
        colors.map(color =>
          html.div(
            attr.style('text-align: center;'),
            html.div(
              attr.style('margin-bottom: 0.5rem;'),
              Icon({
                icon: 'line-md:heart',
                size: 'medium',
                color: color.value,
              })
            ),
            html.div(
              attr.style('font-size: 0.875rem; color: #666;'),
              color.name
            )
          )
        )
      )
    ),

    // Icon sets
    iconSets.map(iconSet =>
      html.div(
        attr.style('margin: 3rem 0;'),
        html.h2(iconSet.name),
        html.div(
          attr.style(
            'display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1.5rem; margin: 1rem 0;'
          ),
          iconSet.icons.map(iconName =>
            html.div(
              attr.style(
                'display: flex; flex-direction: column; align-items: center; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; text-align: center;'
              ),
              html.div(
                attr.style('margin-bottom: 0.5rem;'),
                Icon({ icon: iconName, size: 'medium' })
              ),
              html.div(
                attr.style(
                  'font-size: 0.75rem; color: #666; word-break: break-all;'
                ),
                iconName
              )
            )
          )
        )
      )
    ),

    // Technical details
    html.div(
      attr.style(
        'margin: 3rem 0; background: #f8f9fa; padding: 1.5rem; border-radius: 0.5rem;'
      ),
      html.h2('Technical Implementation'),
      html.div(
        attr.style(
          'font-family: monospace; font-size: 0.875rem; line-height: 1.6;'
        ),
        html.h3('Icon System Stack'),
        html.div('✅ Pure CSS solution with CSS mask'),
        html.div('✅ Vite plugin for build-time icon processing'),
        html.div(
          '✅ Iconify JSON collections (@iconify-json/line-md, @iconify-json/tabler)'
        ),
        html.div('✅ Layered CSS architecture for sizing and colors'),
        html.div('✅ CSS variables for dynamic theming'),
        html.div('✅ No JavaScript runtime dependencies'),
        html.br(),
        html.h3('Usage Example'),
        html.div(
          'Icon({ icon: "line-md:home", size: "medium", color: "blue" })'
        ),
        html.br(),
        html.h3('Generated CSS Classes'),
        html.div('.icon-\\[line-md\\:home\\] { -webkit-mask-image: url(...); }')
      )
    ),

    // Migration notes
    html.div(
      attr.style(
        'margin: 3rem 0; background: #e0f2fe; padding: 1.5rem; border-radius: 0.5rem;'
      ),
      html.h2('Pure CSS Migration Success'),
      html.ul(
        attr.style('line-height: 1.6;'),
        html.li('✅ Pure CSS solution - no JavaScript runtime dependencies'),
        html.li('✅ CSS mask for perfect color control and performance'),
        html.li('✅ Vite plugin processes icons at build time'),
        html.li('✅ Layered CSS architecture for consistent sizing'),
        html.li('✅ Clean icon syntax (collection:name format unchanged)'),
        html.li('✅ Multiple icon collections available (line-md, tabler)'),
        html.li('✅ CSS variables enable runtime theming'),
        html.li('✅ Zero breaking changes to Icon component API'),
        html.li('✅ Smaller bundle size - removed iconify-icon dependency'),
        html.li('✅ Better browser compatibility - no web components needed')
      )
    )
  )
}

const meta = {
  title: 'Showcase/Icon System',
  tags: ['autodocs'],
  render: renderTempoComponent(renderIconShowcase),
} satisfies Meta

export default meta
type Story = StoryObj

export const IconShowcase: Story = {}

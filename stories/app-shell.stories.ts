import type { Meta, StoryObj } from '@storybook/html'
import { renderTempoComponent } from './common'
import { html } from '@tempots/dom'
import { AppShell, AppShellOptions } from '../src/components/app-shell'

// Create a wrapper function to render the Button with Theme
const renderAppShell = (args: AppShellOptions) => {
  const { ...options } = args

  return AppShell({
    ...options,
    banner: html.div('Banner'),
    header: html.div('Header'),
    footer: html.div('Footer'),
    menu: html.div('Menu'),
    aside: html.div('Aside'),
    main: html.div('Main'),
    mainHeader: html.div('Main Header'),
    mainFooter: html.div('Main Footer'),
  })
}

// Define the meta for the component
const meta = {
  title: 'Components/AppShell',
  tags: ['autodocs'],
  render: renderTempoComponent(renderAppShell),
  argTypes: {},
  args: {},
} satisfies Meta<AppShellOptions>

export default meta
type Story = StoryObj<AppShellOptions>

// Define the stories
export const Standard: Story = {
  args: {},
}

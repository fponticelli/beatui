import type { Meta, StoryObj } from '@storybook/html-vite'
import { renderTempoComponent } from './common'
import { html } from '@tempots/dom'
import { AppShell } from '../src/'
import './fullpage.css'

type Options = {
  banner: boolean
  header: boolean
  footer: boolean
  menu: boolean
  aside: boolean
  mainHeader: boolean
  mainFooter: boolean
}

// Create a wrapper function to render the Button with Theme
const renderAppShell = (args: Options) => {
  return AppShell({
    banner: args.banner ? { content: html.div('Banner') } : undefined,
    header: args.header ? { content: html.div('Header') } : undefined,
    footer: args.footer ? { content: html.div('Footer') } : undefined,
    menu: args.menu ? { content: html.div('Menu') } : undefined,
    aside: args.aside ? { content: html.div('Aside') } : undefined,
    main: { content: html.div('Main') },
    mainHeader: args.mainHeader
      ? { content: html.div('Main Header') }
      : undefined,
    mainFooter: args.mainFooter
      ? { content: html.div('Main Footer') }
      : undefined,
  })
}

// Define the meta for the component
const meta = {
  title: 'Components/AppShell',
  tags: ['autodocs'],
  render: renderTempoComponent(renderAppShell),
  argTypes: {
    banner: { control: 'boolean' },
    header: { control: 'boolean' },
    footer: { control: 'boolean' },
    menu: { control: 'boolean' },
    aside: { control: 'boolean' },
    mainHeader: { control: 'boolean' },
    mainFooter: { control: 'boolean' },
  },
  args: {
    banner: true,
    header: true,
    footer: true,
    menu: true,
    aside: true,
    mainHeader: true,
    mainFooter: true,
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<Options>

export default meta
type Story = StoryObj<Options>

// Define the stories
export const Standard: Story = {
  args: {},
}

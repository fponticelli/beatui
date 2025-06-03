import type { Meta, StoryObj } from '@storybook/html-vite'
import { renderTempoComponent } from './common'
import { attr, html, style } from '@tempots/dom'
import {
  BreakpointInfo,
  Breakpoints,
  Icon,
  WithTWBreakpoint,
  WithTWElementBreakpoint,
} from '../src/'

const SatisfiesBreakpoint = (
  info: BreakpointInfo<Breakpoints>,
  name: keyof Breakpoints
) => {
  const isSuccess = info.value.map(({ width }) => info.is(name, width))
  return Icon({
    color: isSuccess.map((is): string => (is ? 'green' : 'red')),
    icon: isSuccess.map((is): string =>
      is ? 'line-md:confirm-square' : 'line-md:minus-circle'
    ),
  })
}

function BreakpointsTable<T extends Breakpoints>(info: BreakpointInfo<T>) {
  return html.table(
    style.borderCollapse('collapse'),
    html.tr(
      html.th(
        style.border('1px solid #ccc'),
        style.padding('4px'),
        'Breakpoint'
      ),
      html.th(style.border('1px solid #ccc'), style.padding('4px'), 'Width'),
      html.th(style.border('1px solid #ccc'), style.padding('4px'), '='),
      html.th(style.border('1px solid #ccc'), style.padding('4px'), '<'),
      html.th(style.border('1px solid #ccc'), style.padding('4px'), '<='),
      html.th(style.border('1px solid #ccc'), style.padding('4px'), '>'),
      html.th(style.border('1px solid #ccc'), style.padding('4px'), '>='),
      html.th(style.border('1px solid #ccc'), style.padding('4px'), '!=')
    ),
    info.asList.flatMap(([width, name]) => [
      html.tr(
        html.th(
          style.border('1px solid #ccc'),
          style.padding('4px'),
          String(name)
        ),
        html.td(
          style.border('1px solid #ccc'),
          style.padding('4px'),
          width.toString()
        ),
        html.td(
          style.border('1px solid #ccc'),
          style.padding('4px'),
          SatisfiesBreakpoint(info, name)
        ),
        html.td(
          style.border('1px solid #ccc'),
          style.padding('4px'),
          SatisfiesBreakpoint(info, `<${name}`)
        ),
        html.td(
          style.border('1px solid #ccc'),
          style.padding('4px'),
          SatisfiesBreakpoint(info, `<=${name}`)
        ),
        html.td(
          style.border('1px solid #ccc'),
          style.padding('4px'),
          SatisfiesBreakpoint(info, `>${name}`)
        ),
        html.td(
          style.border('1px solid #ccc'),
          style.padding('4px'),
          SatisfiesBreakpoint(info, `>=${name}`)
        ),
        html.td(
          style.border('1px solid #ccc'),
          style.padding('4px'),
          SatisfiesBreakpoint(info, `!=${name}`)
        )
      ),
    ])
  )
}

// Create a wrapper function to render the Button with Theme
const renderWithBreakpoint = () => {
  return html.div(
    html.h1(attr.class('text-2xl'), 'Viewport Breakpoints'),
    WithTWBreakpoint(info =>
      html.div(
        html.div(
          'Viewport width: ',
          html.span(
            attr.class('font-bold'),
            info.value.map(({ width }) => `${width}px`)
          )
        ),
        html.div(
          'Current breakpoint: ',
          html.span(
            attr.class('font-bold'),
            info.value.$.breakpoint.map(String)
          )
        ),
        BreakpointsTable(info)
      )
    ),
    html.h1(attr.class('text-2xl mt-8'), 'Element Breakpoints'),
    WithTWElementBreakpoint(info =>
      html.div(
        html.div(
          'Element width: ',
          html.span(
            attr.class('font-bold'),
            info.value.map(({ width }) => `${width}px`)
          )
        ),
        html.div(
          'Current breakpoint: ',
          html.span(
            attr.class('font-bold'),
            info.value.$.breakpoint.map(String)
          )
        ),
        BreakpointsTable(info)
      )
    )
  )
}

// Define the meta for the component
const meta = {
  title: 'Components/WithBreakpoint',
  tags: ['autodocs'],
  render: renderTempoComponent(renderWithBreakpoint),
  argTypes: {},
  args: {},
} satisfies Meta<unknown>

export default meta
type Story = StoryObj<unknown>

// Define the stories
export const Standard: Story = {
  args: {},
}

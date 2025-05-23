import type { Meta, StoryObj } from '@storybook/html'
import { renderTempoComponent } from './common'
import { attr, html } from '@tempots/dom'
import {
  BreakpointInfo,
  Breakpoints,
  WithTWBreakpoint,
  WithTWElementBreakpoint,
} from '../src/components/with-breakpoint'

const trueOrFale = (value: boolean): string => {
  return value ? '✅' : '❌'
}

function BreakpointsTable<T extends Breakpoints>(info: BreakpointInfo<T>) {
  return html.table(
    html.tr(
      html.th(attr.class('px-4'), 'Breakpoint'),
      html.th(attr.class('px-4'), 'Width'),
      html.th(attr.class('px-4'), '='),
      html.th(attr.class('px-4'), '<'),
      html.th(attr.class('px-4'), '<='),
      html.th(attr.class('px-4'), '>'),
      html.th(attr.class('px-4'), '>='),
      html.th(attr.class('px-4'), '!=')
    ),
    info.asList.flatMap(([width, name]) => [
      html.tr(
        html.td(String(name)),
        html.td(width.toString()),
        html.td(info.width.map(w => trueOrFale(info.is(name, w)))),
        html.td(info.width.map(w => trueOrFale(info.is(`<${name}`, w)))),
        html.td(info.width.map(w => trueOrFale(info.is(`<=${name}`, w)))),
        html.td(info.width.map(w => trueOrFale(info.is(`>${name}`, w)))),
        html.td(info.width.map(w => trueOrFale(info.is(`>=${name}`, w)))),
        html.td(info.width.map(w => trueOrFale(info.is(`!=${name}`, w))))
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
            info.width.map(v => `${v}px`)
          )
        ),
        html.div(
          'Current breakpoint: ',
          html.span(attr.class('font-bold'), info.breakpoint)
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
            info.width.map(v => `${v}px`)
          )
        ),
        html.div(
          'Current breakpoint: ',
          html.span(attr.class('font-bold'), info.breakpoint)
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

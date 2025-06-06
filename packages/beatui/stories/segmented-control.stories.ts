import type { Meta, StoryObj } from '@storybook/html-vite'

import { SegmentedControl } from '../src/'
import { renderTempoComponent } from './common'
import { attr, html, prop } from '@tempots/dom'
import { ControlSize } from '../src/components/theme'

// Define the SegmentedControl options interface for Storybook
interface SegmentedControlStoryOptions {
  size: ControlSize
  segmentCount: number
}

// Create a wrapper function to render the SegmentedControl with Theme
const renderSegmentedControl = (args: SegmentedControlStoryOptions) => {
  const { size, segmentCount } = args

  const activeSegment = prop<number | null>(0)

  // Generate segments based on count
  const generateSegments = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      label: `Option ${i + 1}`,
      onSelect: () => console.log(`Selected option ${i + 1}`),
    }))
  }

  return html.div(
    attr.class('bu-flex bu-flex-col bu-items-center bu-gap-lg bu-p-lg'),
    html.h3('Segmented Control Examples'),
    html.div(
      attr.class('bu-flex bu-flex-col bu-items-center bu-gap-md'),
      html.span('Interactive Example:'),
      html.div(
        attr.class('bu-max-w-md'),
        SegmentedControl({
          options: {
            option1: 'Option 1',
            option2: 'Option 2',
            option3: 'Option 3',
          },
          value: prop('option1'),
          onChange: value => console.log('Changed to:', value),
          // segments: generateSegments(segmentCount),
          // activeSegment,
          // size: prop(size),
          // onSegmentChange: index => {
          //   activeSegment.set(index ?? null)
          //   console.log('Segment changed to:', index)
          // },
        })
      ),
      html.div(
        attr.class('bu-mt-md bu-p-md bu-bg-gray-100 bu-rounded'),
        html.span('Selected: '),
        html.span(
          attr.class('bu-font-semibold'),
          activeSegment.map(i => (i !== null ? `Option ${i + 1}` : 'None'))
        )
      )
    ),
    html.div(
      attr.class('bu-flex bu-flex-col bu-items-center bu-gap-sm'),
      html.span('Size Examples:'),
      html.div(
        attr.class('bu-flex bu-flex-col bu-items-center bu-gap-md'),
        html.div(
          attr.class('bu-flex bu-flex-col bu-items-center bu-gap-sm'),
          html.span('Extra Small:'),
          html.div(
            attr.class('bu-max-w-sm'),
            SegmentedControl({
              options: {
                xs1: 'XS 1',
                xs2: 'XS 2',
                xs3: 'XS 3',
              },
              value: prop('xs1'),
              onChange: value => console.log('Changed to:', value),
              // segments: [
              //   { label: 'XS 1' },
              //   { label: 'XS 2' },
              //   { label: 'XS 3' },
              // ],
              // activeSegment: prop(0),
              size: prop('xs'),
            })
          )
        ),
        html.div(
          attr.class('bu-flex bu-flex-col bu-items-center bu-gap-sm'),
          html.span('Small:'),
          html.div(
            attr.class('bu-max-w-sm'),
            SegmentedControl({
              options: {
                sm1: 'SM 1',
                sm2: 'SM 2',
                sm3: 'SM 3',
              },
              value: prop('sm1'),
              onChange: value => console.log('Changed to:', value),
              // segments: [
              //   { label: 'Small 1' },
              //   { label: 'Small 2' },
              //   { label: 'Small 3' },
              // ],
              // activeSegment: prop(0),
              size: prop('sm'),
            })
          )
        ),
        html.div(
          attr.class('bu-flex bu-flex-col bu-items-center bu-gap-sm'),
          html.span('Medium (Default):'),
          html.div(
            attr.class('bu-max-w-md'),
            SegmentedControl({
              options: {
                md1: 'MD 1',
                md2: 'MD 2',
                md3: 'MD 3',
              },
              value: prop('md1'),
              onChange: value => console.log('Changed to:', value),
              // segments: [
              //   { label: 'Medium 1' },
              //   { label: 'Medium 2' },
              //   { label: 'Medium 3' },
              // ],
              // activeSegment: prop(0),
              size: prop('md'),
            })
          )
        ),
        html.div(
          attr.class('bu-flex bu-flex-col bu-items-center bu-gap-sm'),
          html.span('Large:'),
          html.div(
            attr.class('bu-max-w-lg'),
            SegmentedControl({
              options: {
                lg1: 'LG 1',
                lg2: 'LG 2',
                lg3: 'LG 3',
              },
              value: prop('lg1'),
              onChange: value => console.log('Changed to:', value),
              // segments: [
              //   { label: 'Large 1' },
              //   { label: 'Large 2' },
              //   { label: 'Large 3' },
              // ],
              // activeSegment: prop(0),
              size: prop('lg'),
            })
          )
        ),
        html.div(
          attr.class('bu-flex bu-flex-col bu-items-center bu-gap-sm'),
          html.span('Extra Large:'),
          html.div(
            attr.class('bu-max-w-xl'),
            SegmentedControl({
              options: {
                xl1: 'XL 1',
                xl2: 'XL 2',
                xl3: 'XL 3',
              },
              value: prop('xl1'),
              onChange: value => console.log('Changed to:', value),
              // segments: [
              //   { label: 'XL 1' },
              //   { label: 'XL 2' },
              //   { label: 'XL 3' },
              // ],
              // activeSegment: prop(0),
              size: prop('xl'),
            })
          )
        )
      )
    ),
    html.div(
      attr.class('bu-flex bu-flex-col bu-items-center bu-gap-sm'),
      html.span('Segment Count Examples:'),
      html.div(
        attr.class('bu-flex bu-flex-col bu-items-center bu-gap-md'),
        html.div(
          attr.class('bu-flex bu-flex-col bu-items-center bu-gap-sm'),
          html.span('Two Segments:'),
          html.div(
            attr.class('bu-max-w-sm'),
            SegmentedControl({
              options: {
                yes: 'Yes',
                no: 'No',
              },
              value: prop('yes'),
              onChange: value => console.log('Changed to:', value),
              // segments: [{ label: 'Yes' }, { label: 'No' }],
              activeSegment: prop(0),
            })
          )
        ),
        html.div(
          attr.class('bu-flex bu-flex-col bu-items-center bu-gap-sm'),
          html.span('Four Segments:'),
          html.div(
            attr.class('bu-max-w-lg'),
            SegmentedControl({
              options: {
                daily: 'Daily',
                weekly: 'Weekly',
                monthly: 'Monthly',
                yearly: 'Yearly',
              },
              value: prop('weekly'),
              onChange: value => console.log('Changed to:', value),
              // segments: [
              //   { label: 'Daily' },
              //   { label: 'Weekly' },
              //   { label: 'Monthly' },
              //   { label: 'Yearly' },
              // ],
              activeSegment: prop(1),
            })
          )
        ),
        html.div(
          attr.class('bu-flex bu-flex-col bu-items-center bu-gap-sm'),
          html.span('Five Segments:'),
          html.div(
            attr.class('bu-max-w-xl'),
            SegmentedControl({
              options: {
                xs: 'XS',
                sm: 'SM',
                md: 'MD',
                lg: 'LG',
                xl: 'XL',
              },
              value: prop('md'),
              onChange: value => console.log('Changed to:', value),
              // segments: [
              //   { label: 'XS' },
              //   { label: 'SM' },
              //   { label: 'MD' },
              //   { label: 'LG' },
              //   { label: 'XL' },
              // ],
              activeSegment: prop(2),
            })
          )
        )
      )
    ),
    html.div(
      attr.class('bu-flex bu-flex-col bu-items-center bu-gap-sm'),
      html.span('Use Cases:'),
      html.div(
        attr.class('bu-flex bu-flex-col bu-items-center bu-gap-md'),
        html.div(
          attr.class('bu-flex bu-flex-col bu-items-center bu-gap-sm'),
          html.span('View Toggle:'),
          html.div(
            attr.class('bu-max-w-sm'),
            SegmentedControl({
              options: {
                list: '📋 List',
                grid: '🔲 Grid',
                chart: '📊 Chart',
              },
              value: prop('list'),
              onChange: value => console.log('Changed to:', value),
              // segments: [
              //   { label: '📋 List' },
              //   { label: '🔲 Grid' },
              //   { label: '📊 Chart' },
              // ],
              activeSegment: prop(0),
            })
          )
        ),
        html.div(
          attr.class('bu-flex bu-flex-col bu-items-center bu-gap-sm'),
          html.span('Time Period:'),
          html.div(
            attr.class('bu-max-w-md'),
            SegmentedControl({
              options: {
                '1D': '1D',
                '1W': '1W',
                '1M': '1M',
                '3M': '3M',
                '1Y': '1Y',
              },
              value: prop('1M'),
              onChange: value => console.log('Changed to:', value),
              // segments: [
              //   { label: '1D' },
              //   { label: '1W' },
              //   { label: '1M' },
              //   { label: '3M' },
              //   { label: '1Y' },
              // ],
              activeSegment: prop(2),
            })
          )
        ),
        html.div(
          attr.class('bu-flex bu-flex-col bu-items-center bu-gap-sm'),
          html.span('Status Filter:'),
          html.div(
            attr.class('bu-max-w-lg'),
            SegmentedControl({
              options: {
                all: 'All',
                active: 'Active',
                pending: 'Pending',
                completed: 'Completed',
              },
              value: prop('all'),
              onChange: value => console.log('Changed to:', value),
              // segments: [
              //   { label: 'All' },
              //   { label: 'Active' },
              //   { label: 'Pending' },
              //   { label: 'Completed' },
              // ],
              activeSegment: prop(0),
            })
          )
        )
      )
    )
  )
}

// Define the meta for the component
const meta = {
  title: 'Components/Form/SegmentedControl',
  tags: ['autodocs'],
  render: renderTempoComponent(renderSegmentedControl),
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'The size of the segmented control',
    },
    segmentCount: {
      control: { type: 'range', min: 2, max: 6, step: 1 },
      description: 'Number of segments to display',
    },
  },
  args: {
    size: 'sm',
    segmentCount: 3,
  },
} satisfies Meta<SegmentedControlStoryOptions>

export default meta
type Story = StoryObj<SegmentedControlStoryOptions>

// Define the stories
export const Default: Story = {
  args: {
    size: 'sm',
    segmentCount: 3,
  },
}

export const Small: Story = {
  args: {
    size: 'xs',
    segmentCount: 3,
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    segmentCount: 3,
  },
}

export const TwoSegments: Story = {
  args: {
    size: 'sm',
    segmentCount: 2,
  },
}

export const FiveSegments: Story = {
  args: {
    size: 'sm',
    segmentCount: 5,
  },
}

export const ViewToggle: Story = {
  args: {
    size: 'md',
    segmentCount: 3,
  },
}

export const TimePeriod: Story = {
  args: {
    size: 'sm',
    segmentCount: 5,
  },
}

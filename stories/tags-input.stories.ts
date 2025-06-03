import type { Meta, StoryObj } from '@storybook/html-vite'

import { TagsInput, Tag } from '../src/'
import { renderTempoComponent } from './common'
import { attr, html, prop } from '@tempots/dom'

// Define the TagsInput options interface for Storybook
interface TagsInputStoryOptions {
  tags: string[]
  disabled: boolean
  hasError: boolean
  placeholder: string
}

// Create a wrapper function to render the TagsInput with Theme
const renderTagsInput = (args: TagsInputStoryOptions) => {
  const { tags, disabled, hasError, placeholder } = args
  const tagsValue = prop(tags)

  return html.div(
    attr.class('bu-flex bu-flex-col bu-gap-lg'),
    html.h3('Tags Input Examples'),
    html.div(
      attr.class('bu-flex bu-flex-col bu-gap-md'),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('Interactive Example:'),
        html.div(
          attr.style('min-height: 60px;'),
          TagsInput({
            value: tagsValue,
            disabled: disabled ? prop(true) : undefined,
            hasError: hasError ? prop(true) : undefined,
            placeholder: placeholder ? prop(placeholder) : undefined,
            onChange: (newTags: string[]) => {
              console.log('Tags changed:', newTags)
              tagsValue.set(newTags)
            },
            onBlur: (tags: string[]) => console.log('Tags blur:', tags),
          })
        )
      ),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('Tags Input States:'),
        html.div(
          attr.class('bu-flex bu-flex-col bu-gap-sm'),
          html.div(
            html.span('With Tags:'),
            TagsInput({
              value: prop(['JavaScript', 'TypeScript', 'React']),
              placeholder: 'Add technology',
              onChange: (tags: string[]) => console.log('With tags changed:', tags),
            })
          ),
          html.div(
            html.span('Empty:'),
            TagsInput({
              value: prop([]),
              placeholder: 'Add tags',
              onChange: (tags: string[]) => console.log('Empty changed:', tags),
            })
          ),
          html.div(
            html.span('Disabled:'),
            TagsInput({
              value: prop(['Read-only', 'Disabled']),
              disabled: prop(true),
              placeholder: 'Cannot edit',
              onChange: (tags: string[]) => console.log('Disabled changed:', tags),
            })
          ),
          html.div(
            html.span('With Error:'),
            TagsInput({
              value: prop(['Invalid']),
              hasError: prop(true),
              placeholder: 'Fix errors',
              onChange: (tags: string[]) => console.log('Error changed:', tags),
            })
          )
        )
      ),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('Common Use Cases:'),
        html.div(
          attr.class('bu-flex bu-flex-col bu-gap-sm'),
          html.div(
            html.span('Skills:'),
            TagsInput({
              value: prop(['JavaScript', 'Python', 'Go', 'Rust']),
              placeholder: 'Add programming language',
              onChange: (tags: string[]) => console.log('Skills changed:', tags),
            })
          ),
          html.div(
            html.span('Categories:'),
            TagsInput({
              value: prop(['Frontend', 'Backend', 'DevOps']),
              placeholder: 'Add category',
              onChange: (tags: string[]) => console.log('Categories changed:', tags),
            })
          ),
          html.div(
            html.span('Keywords:'),
            TagsInput({
              value: prop(['web', 'development', 'ui', 'ux']),
              placeholder: 'Add keyword',
              onChange: (tags: string[]) => console.log('Keywords changed:', tags),
            })
          ),
          html.div(
            html.span('Interests:'),
            TagsInput({
              value: prop(['Music', 'Photography', 'Travel', 'Cooking']),
              placeholder: 'Add interest',
              onChange: (tags: string[]) => console.log('Interests changed:', tags),
            })
          )
        )
      ),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('Form Example:'),
        html.form(
          attr.class('bu-flex bu-flex-col bu-gap-sm bu-p-md bu-border bu-rounded'),
          html.div(
            attr.class('bu-flex bu-flex-col bu-gap-sm'),
            html.span('Technologies:'),
            TagsInput({
              value: prop(['React', 'Node.js', 'PostgreSQL']),
              placeholder: 'Add technology',
              onChange: (tags: string[]) => console.log('Technologies changed:', tags),
            })
          ),
        html.div(
          attr.class('bu-flex bu-flex-col bu-gap-sm'),
          html.span('Individual Colored Tags (using Tag component):'),
          html.div(
            attr.class('bu-flex bu-flex-row bu-gap-sm bu-flex-wrap'),
            Tag({ value: prop('JavaScript'), color: prop('primary') }),
            Tag({ value: prop('TypeScript'), color: prop('info') }),
            Tag({ value: prop('React'), color: prop('success') }),
            Tag({ value: prop('Vue'), color: prop('success') }),
            Tag({ value: prop('Angular'), color: prop('error') }),
            Tag({ value: prop('Svelte'), color: prop('warning') }),
            Tag({ value: prop('Node.js'), color: prop('secondary') })
          )
        ),
          html.div(
            attr.class('bu-flex bu-flex-col bu-gap-sm'),
            html.span('Project Tags:'),
            TagsInput({
              value: prop(['urgent', 'frontend', 'responsive']),
              placeholder: 'Add project tag',
              onChange: (tags: string[]) => console.log('Project tags changed:', tags),
            })
          ),
          html.div(
            attr.class('bu-flex bu-flex-col bu-gap-sm'),
            html.span('Team Members:'),
            TagsInput({
              value: prop(['alice', 'bob', 'charlie']),
              placeholder: 'Add team member',
              onChange: (tags: string[]) => console.log('Team members changed:', tags),
            })
          )
        )
      ),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('Usage Instructions:'),
        html.ul(
          attr.class('bu-text-sm bu-text-gray-600'),
          html.li('• Type a tag and press Enter to add it'),
          html.li('• Click the × button on any tag to remove it'),
          html.li('• Duplicate tags are automatically prevented'),
          html.li('• Empty tags are ignored'),
          html.li('• Tags are trimmed of whitespace')
        )
      ),
      html.div(
        attr.class('bu-flex bu-flex-col bu-gap-sm'),
        html.span('Long Tags Example:'),
        TagsInput({
          value: prop([
            'Very Long Tag Name That Demonstrates Wrapping',
            'Another Extremely Long Tag That Shows How The Component Handles Extended Content',
            'Short',
            'Medium Length Tag',
            'Yet Another Long Tag Name For Testing Purposes'
          ]),
          placeholder: 'Add long tag',
          onChange: (tags: string[]) => console.log('Long tags changed:', tags),
        })
      )
    )
  )
}

// Define the meta for the component
const meta = {
  title: 'Components/Form/TagsInput',
  tags: ['autodocs'],
  render: renderTempoComponent(renderTagsInput),
  argTypes: {
    tags: {
      control: 'object',
      description: 'Array of tag strings',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    hasError: {
      control: 'boolean',
      description: 'Whether the input has an error state',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input field',
    },
  },
  args: {
    tags: ['JavaScript', 'TypeScript', 'React'],
    disabled: false,
    hasError: false,
    placeholder: 'Add tag',
  },
} satisfies Meta<TagsInputStoryOptions>

export default meta
type Story = StoryObj<TagsInputStoryOptions>

// Define the stories
export const Default: Story = {
  args: {
    tags: ['JavaScript', 'TypeScript', 'React'],
    disabled: false,
    hasError: false,
    placeholder: 'Add tag',
  },
}

export const Empty: Story = {
  args: {
    tags: [],
    disabled: false,
    hasError: false,
    placeholder: 'Start typing to add tags',
  },
}

export const Disabled: Story = {
  args: {
    tags: ['Read-only', 'Disabled', 'Cannot Edit'],
    disabled: true,
    hasError: false,
    placeholder: 'Cannot edit',
  },
}

export const WithError: Story = {
  args: {
    tags: ['Invalid Tag'],
    disabled: false,
    hasError: true,
    placeholder: 'Fix validation errors',
  },
}

export const ManyTags: Story = {
  args: {
    tags: [
      'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Svelte',
      'Node.js', 'Express', 'Fastify', 'Koa', 'Python', 'Django',
      'Flask', 'FastAPI', 'Go', 'Gin', 'Echo', 'Rust', 'Actix'
    ],
    disabled: false,
    hasError: false,
    placeholder: 'Add more technologies',
  },
}

export const LongTags: Story = {
  args: {
    tags: [
      'Very Long Tag Name That Demonstrates Wrapping Behavior',
      'Another Extremely Long Tag That Shows Component Flexibility',
      'Short',
      'Medium Length Tag Name',
      'Yet Another Very Long Tag Name For Comprehensive Testing'
    ],
    disabled: false,
    hasError: false,
    placeholder: 'Add descriptive tag',
  },
}

export const SingleTag: Story = {
  args: {
    tags: ['Lonely Tag'],
    disabled: false,
    hasError: false,
    placeholder: 'Add another tag',
  },
}

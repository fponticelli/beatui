import { attr, html, prop, style } from '@tempots/dom'
import {
  DropdownControl,
  DropdownOption,
  Group,
  Icon,
  ScrollablePanel,
  Stack,
  useController,
  DropdownInput,
  Option,
} from '@tempots/beatui'

export const DropdownPage = () => {
  // Basic example
  const basicValue = prop<string>('')
  const basicOptions = prop<DropdownOption<string>[]>([
    Option.value('apple', 'Apple', {
      before: html.span(style.color('red'), '🍎'),
    }),
    Option.value('banana', 'Banana', {
      before: html.span(style.color('yellow'), '🍌'),
    }),
    Option.value('cherry', 'Cherry', {
      before: html.span(style.color('red'), '🍒'),
    }),
    Option.value('date', 'Date', {
      before: html.span(style.color('brown'), '🌰'),
    }),
    Option.value('elderberry', 'Elderberry', {
      before: html.span(style.color('purple'), '🍇'),
    }),
  ])

  // Rich content example
  const colorValue = prop<string>('')
  const colorOptions = prop<DropdownOption<string>[]>([
    Option.value('red', 'Red', {
      before: html.div(
        style.width('1rem'),
        style.height('1rem'),
        style.borderRadius('50%'),
        style.backgroundColor('#ef4444')
      ),
    }),
    Option.value('blue', 'Blue', {
      before: html.div(
        style.width('1rem'),
        style.height('1rem'),
        style.borderRadius('50%'),
        style.backgroundColor('#3b82f6')
      ),
    }),
    Option.value('green', 'Green', {
      before: html.div(
        style.width('1rem'),
        style.height('1rem'),
        style.borderRadius('50%'),
        style.backgroundColor('#10b981')
      ),
    }),
    Option.value('purple', 'Purple', {
      before: html.div(
        style.width('1rem'),
        style.height('1rem'),
        style.borderRadius('50%'),
        style.backgroundColor('#8b5cf6')
      ),
      after: Icon({ icon: 'line-md:star-filled', size: 'sm' }),
    }),
  ])

  // Grouped options example
  const categoryValue = prop<string>('')
  const categoryOptions = prop<DropdownOption<string>[]>([
    Option.group('Fruits', [
      Option.value('apple', 'Apple'),
      Option.value('banana', 'Banana'),
      Option.value('cherry', 'Cherry'),
    ]),
    Option.break,
    Option.group('Vegetables', [
      Option.value('carrot', 'Carrot'),
      Option.value('broccoli', 'Broccoli'),
      Option.value('spinach', 'Spinach'),
    ]),
  ])

  // Form integration example
  const { controller: formController } = useController({
    initialValue: 'medium',
  })

  const sizeOptions = prop<DropdownOption<string>[]>([
    Option.value('small', 'Small', {
      before: Icon({ icon: 'line-md:circle-small', size: 'sm' }),
    }),
    Option.value('medium', 'Medium', {
      before: Icon({ icon: 'line-md:circle', size: 'sm' }),
    }),
    Option.value('large', 'Large', {
      before: Icon({ icon: 'line-md:circle-large', size: 'sm' }),
    }),
  ])

  return ScrollablePanel({
    body: Stack(
      attr.class('bu-p-6 bu-gap-8'),

      // Page title
      html.h1(
        attr.class('bu-text-3xl bu-font-bold bu-text-gray'),
        'Dropdown Component'
      ),

      html.p(
        attr.class('bu-text-lg bu-text-light-gray'),
        'A flexible dropdown component that supports rich content, keyboard navigation, and accessibility features.'
      ),

      // Basic Example
      Stack(
        attr.class('bu-gap-4'),
        html.h2(
          attr.class('bu-text-2xl bu-font-semibold bu-text-gray'),
          'Basic Usage'
        ),
        html.p(
          attr.class('bu-text-light-gray'),
          'A simple dropdown with text options.'
        ),
        Group(
          attr.class('bu-gap-4 bu-items-end'),
          Stack(
            attr.class('bu-gap-2'),
            style.width('16rem'),
            html.label(
              attr.class('bu-text-sm bu-font-medium bu-text-gray'),
              'Select a fruit:'
            ),
            DropdownInput({
              value: basicValue,
              options: basicOptions,
              placeholder: 'Choose a fruit...',
              onChange: value => basicValue.set(value),
            })
          ),
          html.div(
            attr.class('bu-text-sm bu-text-light-gray'),
            'Selected: ',
            basicValue.map(v => v || 'None')
          )
        )
      ),

      // Rich Content Example
      Stack(
        attr.class('bu-gap-4'),
        html.h2(
          attr.class('bu-text-2xl bu-font-semibold bu-text-gray'),
          'Rich Content'
        ),
        html.p(
          attr.class('bu-text-light-gray'),
          'Options can include icons, colors, and other rich content.'
        ),
        Group(
          attr.class('bu-gap-4 bu-items-end'),
          Stack(
            attr.class('bu-gap-2'),
            style.width('16rem'),
            html.label(
              attr.class('bu-text-sm bu-font-medium bu-text-gray'),
              'Pick a color:'
            ),
            DropdownInput({
              value: colorValue,
              options: colorOptions,
              placeholder: 'Select color...',
              onChange: value => colorValue.set(value),
            })
          ),
          html.div(
            attr.class('bu-text-sm bu-text-light-gray'),
            'Selected: ',
            colorValue.map(v => v || 'None')
          )
        )
      ),

      // Grouped Options Example
      Stack(
        attr.class('bu-gap-4'),
        html.h2(
          attr.class('bu-text-2xl bu-font-semibold bu-text-gray'),
          'Grouped Options'
        ),
        html.p(
          attr.class('bu-text-light-gray'),
          'Options can be organized into groups with separators.'
        ),
        Group(
          attr.class('bu-gap-4 bu-items-end'),
          Stack(
            attr.class('bu-gap-2'),
            style.width('16rem'),
            html.label(
              attr.class('bu-text-sm bu-font-medium bu-text-gray'),
              'Choose category:'
            ),
            DropdownInput({
              value: categoryValue,
              options: categoryOptions,
              placeholder: 'Select item...',
              onChange: value => categoryValue.set(value),
            })
          ),
          html.div(
            attr.class('bu-text-sm bu-text-light-gray'),
            'Selected: ',
            categoryValue.map(v => v || 'None')
          )
        )
      ),

      // Form Integration Example
      Stack(
        attr.class('bu-gap-4'),
        html.h2(
          attr.class('bu-text-2xl bu-font-semibold bu-text-gray'),
          'Form Integration'
        ),
        html.p(
          attr.class('bu-text-light-gray'),
          'Dropdown works seamlessly with BeatUI form controllers.'
        ),
        Group(
          attr.class('bu-gap-4 bu-items-end'),
          Stack(
            attr.class('bu-gap-2'),
            style.width('16rem'),
            DropdownControl({
              controller: formController,
              label: 'Size',
              description: 'Choose your preferred size',
              options: sizeOptions,
            })
          ),
          html.div(
            attr.class('bu-text-sm bu-text-light-gray'),
            'Controller value: ',
            formController.value.map(v => v || 'None')
          )
        )
      ),

      // Accessibility Features
      Stack(
        attr.class('bu-gap-4'),
        html.h2(
          attr.class('bu-text-2xl bu-font-semibold bu-text-gray'),
          'Accessibility Features'
        ),
        html.ul(
          attr.class(
            'bu-list-disc bu-list-inside bu-text-light-gray bu-space-y-2'
          ),
          html.li('Full keyboard navigation (Arrow keys, Enter, Escape)'),
          html.li('ARIA attributes for screen readers'),
          html.li('Focus management and visual indicators'),
          html.li('High contrast mode support'),
          html.li('Reduced motion support')
        )
      ),

      // Usage Instructions
      Stack(
        attr.class('bu-gap-4'),
        html.h2(
          attr.class('bu-text-2xl bu-font-semibold bu-text-gray'),
          'Keyboard Navigation'
        ),
        html.div(
          attr.class('bu-grid bu-grid-cols-2 bu-gap-4 bu-text-sm'),
          html.div(
            attr.class('bu-space-y-2'),
            html.div(attr.class('bu-font-medium'), 'Navigation:'),
            html.ul(
              attr.class('bu-space-y-1 bu-text-light-gray'),
              html.li('↓ Arrow Down - Open dropdown / Move down'),
              html.li('↑ Arrow Up - Move up'),
              html.li('Enter - Select focused option'),
              html.li('Escape - Close dropdown')
            )
          ),
          html.div(
            attr.class('bu-space-y-2'),
            html.div(attr.class('bu-font-medium'), 'Interaction:'),
            html.ul(
              attr.class('bu-space-y-1 bu-text-light-gray'),
              html.li('Click - Open/close dropdown'),
              html.li('Tab - Move to next element'),
              html.li('Space - Open dropdown (when not searchable)')
            )
          )
        )
      )
    ),
  })
}

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

export default function DropdownPage() {
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
      attr.class('p-6 gap-8'),

      // Page title
      html.h1(
        attr.class('text-3xl font-bold text-gray-600 dark:text-gray-400'),
        'Dropdown Component'
      ),

      html.p(
        attr.class('text-lg text-gray-500 dark:text-gray-400'),
        'A flexible dropdown component that supports rich content, keyboard navigation, and accessibility features.'
      ),

      // Basic Example
      Stack(
        attr.class('gap-4'),
        html.h2(
          attr.class('text-2xl font-semibold text-gray-600 dark:text-gray-400'),
          'Basic Usage'
        ),
        html.p(
          attr.class('text-gray-500 dark:text-gray-400'),
          'A simple dropdown with text options.'
        ),
        Group(
          attr.class('gap-4 items-end'),
          Stack(
            attr.class('gap-2'),
            style.width('16rem'),
            html.label(
              attr.class('text-sm font-medium text-gray-600 dark:text-gray-400'),
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
            attr.class('text-sm text-gray-500 dark:text-gray-400'),
            'Selected: ',
            basicValue.map(v => v || 'None')
          )
        )
      ),

      // Rich Content Example
      Stack(
        attr.class('gap-4'),
        html.h2(
          attr.class('text-2xl font-semibold text-gray-600 dark:text-gray-400'),
          'Rich Content'
        ),
        html.p(
          attr.class('text-gray-500 dark:text-gray-400'),
          'Options can include icons, colors, and other rich content.'
        ),
        Group(
          attr.class('gap-4 items-end'),
          Stack(
            attr.class('gap-2'),
            style.width('16rem'),
            html.label(
              attr.class('text-sm font-medium text-gray-600 dark:text-gray-400'),
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
            attr.class('text-sm text-gray-500 dark:text-gray-400'),
            'Selected: ',
            colorValue.map(v => v || 'None')
          )
        )
      ),

      // Grouped Options Example
      Stack(
        attr.class('gap-4'),
        html.h2(
          attr.class('text-2xl font-semibold text-gray-600 dark:text-gray-400'),
          'Grouped Options'
        ),
        html.p(
          attr.class('text-gray-500 dark:text-gray-400'),
          'Options can be organized into groups with separators.'
        ),
        Group(
          attr.class('gap-4 items-end'),
          Stack(
            attr.class('gap-2'),
            style.width('16rem'),
            html.label(
              attr.class('text-sm font-medium text-gray-600 dark:text-gray-400'),
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
            attr.class('text-sm text-gray-500 dark:text-gray-400'),
            'Selected: ',
            categoryValue.map(v => v || 'None')
          )
        )
      ),

      // Form Integration Example
      Stack(
        attr.class('gap-4'),
        html.h2(
          attr.class('text-2xl font-semibold text-gray-600 dark:text-gray-400'),
          'Form Integration'
        ),
        html.p(
          attr.class('text-gray-500 dark:text-gray-400'),
          'Dropdown works seamlessly with BeatUI form controllers.'
        ),
        Group(
          attr.class('gap-4 items-end'),
          Stack(
            attr.class('gap-2'),
            style.width('16rem'),
            DropdownControl({
              controller: formController,
              label: 'Size',
              description: 'Choose your preferred size',
              options: sizeOptions,
            })
          ),
          html.div(
            attr.class('text-sm text-gray-500 dark:text-gray-400'),
            'Controller value: ',
            formController.signal.map(v => v || 'None')
          )
        )
      ),

      // Accessibility Features
      Stack(
        attr.class('gap-4'),
        html.h2(
          attr.class('text-2xl font-semibold text-gray-600 dark:text-gray-400'),
          'Accessibility Features'
        ),
        html.ul(
          attr.class('list-disc list-inside text-gray-500 dark:text-gray-400 space-y-2'),
          html.li('Full keyboard navigation (Arrow keys, Enter, Escape)'),
          html.li('ARIA attributes for screen readers'),
          html.li('Focus management and visual indicators'),
          html.li('High contrast mode support'),
          html.li('Reduced motion support')
        )
      ),

      // Usage Instructions
      Stack(
        attr.class('gap-4'),
        html.h2(
          attr.class('text-2xl font-semibold text-gray-600 dark:text-gray-400'),
          'Keyboard Navigation'
        ),
        html.div(
          attr.class('grid grid-cols-2 gap-4 text-sm'),
          html.div(
            attr.class('space-y-2'),
            html.div(attr.class('font-medium'), 'Navigation:'),
            html.ul(
              attr.class('space-y-1 text-gray-500 dark:text-gray-400'),
              html.li('↓ Arrow Down - Open dropdown / Move down'),
              html.li('↑ Arrow Up - Move up'),
              html.li('Enter - Select focused option'),
              html.li('Escape - Close dropdown')
            )
          ),
          html.div(
            attr.class('space-y-2'),
            html.div(attr.class('font-medium'), 'Interaction:'),
            html.ul(
              attr.class('space-y-1 text-gray-500 dark:text-gray-400'),
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

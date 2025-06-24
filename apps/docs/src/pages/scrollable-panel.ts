import { html, attr, style } from '@tempots/dom'
import { ScrollablePanel, Stack, Button, Group } from '@tempots/beatui'

export const ScrollablePanelPage = () => {
  return Stack(
    attr.class('bu-h-full bu-overflow-auto bu-p-4'),
    html.h1(attr.class('bu-text-2xl bu-mb-4'), 'Scrollable Panel'),
    html.p(
      attr.class('bu-mb-6'),
      'A layout component that provides a scrollable content area with optional sticky header and footer. When content exceeds the available space, shadows automatically appear to indicate scrollable content.'
    ),

    // Basic Example
    html.section(
      attr.class('bu-mb-8'),
      html.h2(attr.class('bu-text-xl bu-mb-4'), 'Basic Example'),
      html.div(
        attr.class('bu-border bu-border-gray-300 bu-rounded-lg'),
        style.height('300px'),
        ScrollablePanel({
          header: html.div(
            attr.class('bu-p-2 bu-bg--lighter-gray bu-border-b'),
            html.h3(attr.class('bu-font-semibold'), 'Header Content'),
            html.p(
              attr.class('bu-text-sm bu-text-gray-600'),
              'This header stays at the top'
            )
          ),
          body: html.div(
            attr.class('bu-p-2'),
            html.h4(attr.class('bu-font-medium bu-mb-2'), 'Scrollable Content'),
            ...Array.from({ length: 20 }, (_, i) =>
              html.p(
                attr.class('bu-mb-2'),
                `This is paragraph ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
              )
            )
          ),
          footer: html.div(
            attr.class('bu-p-2 bu-bg--lighter-gray bu-border-t'),
            html.p(
              attr.class('bu-text-sm bu-text-gray-600'),
              'This footer stays at the bottom'
            )
          ),
          shadowOnScroll: true,
        })
      )
    ),

    // Header Only Example
    html.section(
      attr.class('bu-mb-8'),
      html.h2(attr.class('bu-text-xl bu-mb-4'), 'Header Only'),
      html.div(
        attr.class('bu-border bu-border-gray-300 bu-rounded-lg'),
        style.height('250px'),
        ScrollablePanel({
          header: html.div(
            attr.class('bu-p-4 bu-bg-blue-100 bu-border-b'),
            html.h3(attr.class('bu-font-semibold'), 'Sticky Header'),
            html.p(
              attr.class('bu-text-sm bu-text-blue-600'),
              'Only header, no footer'
            )
          ),
          body: html.div(
            attr.class('bu-p-4'),
            ...Array.from({ length: 15 }, (_, i) =>
              html.div(
                attr.class('bu-mb-3 bu-p-3 bu-bg-gray-50 bu-rounded'),
                html.h5(attr.class('bu-font-medium'), `Item ${i + 1}`),
                html.p(
                  attr.class('bu-text-sm bu-text-gray-600'),
                  'Some content for this item that makes it take up space.'
                )
              )
            )
          ),
          shadowOnScroll: true,
        })
      )
    ),

    // Footer Only Example
    html.section(
      attr.class('bu-mb-8'),
      html.h2(attr.class('bu-text-xl bu-mb-4'), 'Footer Only'),
      html.div(
        attr.class('bu-border bu-border-gray-300 bu-rounded-lg'),
        style.height('250px'),
        ScrollablePanel({
          body: html.div(
            attr.class('bu-p-4'),
            html.h4(attr.class('bu-font-medium bu-mb-4'), 'Content Area'),
            ...Array.from({ length: 12 }, (_, i) =>
              html.div(
                attr.class(
                  'bu-mb-2 bu-p-2 bu-border-l-4 bu-border-green-400 bu-bg-green-50'
                ),
                `Message ${i + 1}: This is some content that will scroll.`
              )
            )
          ),
          footer: html.div(
            attr.class('bu-p-4 bu-bg-green-100 bu-border-t'),
            Group(
              attr.class('bu-gap-2'),
              Button({ variant: 'filled', color: 'primary' }, 'Send'),
              Button({ variant: 'outline', color: 'secondary' }, 'Cancel')
            )
          ),
          shadowOnScroll: true,
        })
      )
    ),

    // No Shadows Example
    html.section(
      attr.class('bu-mb-8'),
      html.h2(attr.class('bu-text-xl bu-mb-4'), 'Without Shadows'),
      html.div(
        attr.class('bu-border bu-border-gray-300 bu-rounded-lg'),
        style.height('200px'),
        ScrollablePanel({
          header: html.div(
            attr.class('bu-p-3 bu-bg-purple-100'),
            html.h3(attr.class('bu-font-semibold'), 'No Shadow Header')
          ),
          body: html.div(
            attr.class('bu-p-4'),
            ...Array.from({ length: 10 }, (_, i) =>
              html.p(
                attr.class('bu-mb-2'),
                `Line ${i + 1}: This example has shadows disabled.`
              )
            )
          ),
          footer: html.div(
            attr.class('bu-p-3 bu-bg-purple-100'),
            html.p(attr.class('bu-text-sm'), 'No shadow footer')
          ),
          shadowOnScroll: false,
        })
      )
    ),

    // Usage Information
    html.section(
      attr.class('bu-mb-8'),
      html.h2(attr.class('bu-text-xl bu-mb-4'), 'Usage'),
      html.div(
        attr.class('bu-bg-gray-50 bu-p-4 bu-rounded-lg'),
        html.h3(attr.class('bu-font-semibold bu-mb-2'), 'Props'),
        html.ul(
          attr.class('bu-list-disc bu-list-inside bu-space-y-1 bu-text-sm'),
          html.li(
            html.strong('header'),
            ' (optional): Content for the sticky header'
          ),
          html.li(
            html.strong('footer'),
            ' (optional): Content for the sticky footer'
          ),
          html.li(
            html.strong('body'),
            ' (required): The main scrollable content'
          ),
          html.li(
            html.strong('shadowOnScroll'),
            ' (optional, default: true): Whether to show shadows when scrolling'
          )
        ),
        html.h3(attr.class('bu-font-semibold bu-mb-2 bu-mt-4'), 'CSS Classes'),
        html.ul(
          attr.class('bu-list-disc bu-list-inside bu-space-y-1 bu-text-sm'),
          html.li(html.code('.bc-scrollable-panel'), ' - Main container'),
          html.li(
            html.code('.bc-scrollable-panel--shadow'),
            ' - Enables shadow effects'
          ),
          html.li(
            html.code('.bc-scrollable-panel__header'),
            ' - Header container'
          ),
          html.li(
            html.code('.bc-scrollable-panel__body'),
            ' - Scrollable body container'
          ),
          html.li(
            html.code('.bc-scrollable-panel__footer'),
            ' - Footer container'
          )
        )
      )
    )
  )
}

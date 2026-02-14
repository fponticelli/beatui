import { html, attr } from '@tempots/dom'
import {
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  ToolbarDivider,
  Icon,
} from '@tempots/beatui'
import { WidgetPage } from '../views/widget-page'
import { SectionBlock } from '../views/section'

export default function FloatingToolbarPage() {
  return WidgetPage({
    id: 'floating-toolbar',
    title: 'Floating Toolbar',
    description: 'Compact floating toolbar for text formatting and editing.',
    body: html.div(
      attr.style('display: flex; flex-direction: column; gap: 4px'),

      SectionBlock(
        'Text Formatting',
        html.div(
          attr.style('padding: 16px 0; display: flex; justify-content: center'),
          Toolbar(
            attr.class('bc-toolbar--floating'),
            ToolbarGroup(
              ToolbarButton({}, html.span(attr.style('font-weight: 700'), 'B')),
              ToolbarButton(
                {},
                html.span(attr.style('font-style: italic'), 'I')
              ),
              ToolbarButton(
                {},
                html.span(attr.style('text-decoration: underline'), 'U')
              ),
              ToolbarButton(
                {},
                html.span(attr.style('text-decoration: line-through'), 'S')
              )
            ),
            ToolbarDivider(),
            ToolbarGroup(
              ToolbarButton(
                {},
                html.span(
                  attr.style('font-family: monospace; font-size: 11px'),
                  '<>'
                )
              ),
              ToolbarButton({}, Icon({ icon: 'lucide:link', size: 'sm' }))
            ),
            ToolbarDivider(),
            ToolbarGroup(
              ToolbarButton(
                {},
                html.span(
                  attr.style(
                    'font-family: monospace; color: var(--color-primary-600)'
                  ),
                  'ƒ'
                )
              ),
              ToolbarButton(
                {},
                html.span(
                  attr.style('color: var(--color-primary-600)'),
                  '@'
                )
              )
            )
          )
        )
      )
    ),
  })
}

import {
  Stack,
  BreakpointInfo,
  Breakpoints,
  Icon,
  WithTWBreakpoint,
  WithTWElementBreakpoint,
} from '@tempots/beatui'
import { html, attr, style } from '@tempots/dom'

function SatisfiesBreakpoint(
  info: BreakpointInfo<Breakpoints>,
  name: keyof Breakpoints
) {
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

export const BreakpointPage = () => {
  return Stack(
    attr.class('bu-p-4 bu-h-full bu-overflow-auto'),
    html.h1(attr.class('bu-text-2xl'), 'Viewport Breakpoints'),
    WithTWBreakpoint(info =>
      html.div(
        html.div(
          'Viewport width: ',
          html.span(
            attr.class('bu-font-bold'),
            info.value.map(({ width }) => `${width}px`)
          )
        ),
        html.div(
          'Current breakpoint: ',
          html.span(
            attr.class('bu-font-bold'),
            info.value.$.breakpoint.map(String)
          )
        ),
        html.br(),
        BreakpointsTable(info)
      )
    ),
    html.br(),
    html.h1(attr.class('bu-text-2xl'), 'Element Breakpoints'),
    WithTWElementBreakpoint(info =>
      html.div(
        html.div(
          'Element width: ',
          html.span(
            attr.class('bu-font-bold'),
            info.value.map(({ width }) => `${width}px`)
          )
        ),
        html.div(
          'Current breakpoint: ',
          html.span(
            attr.class('bu-font-bold'),
            info.value.$.breakpoint.map(String)
          )
        ),
        html.br(),
        BreakpointsTable(info)
      )
    )
  )
}

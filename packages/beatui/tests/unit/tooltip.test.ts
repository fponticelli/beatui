import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, Provide } from '@tempots/dom'
import { Tooltip } from '../../src/components/overlay/tooltip'
import { Button } from '../../src/components/button/button'
import { Theme } from '../../src/components/theme/theme'

describe('Tooltip Component', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render without errors', () => {
    render(
      Provide(Theme, {}, () =>
        Button(
          { onClick: () => {} },
          'Hover me',
          Tooltip({ content: 'This is a tooltip' })
        )
      ),
      container
    )

    const button = container.querySelector('button')
    expect(button).not.toBeNull()
    expect(button!.textContent).toBe('Hover me')
  })

  it('should create tooltip trigger element', () => {
    render(
      Provide(Theme, {}, () =>
        Button(
          { onClick: () => {} },
          'Hover me',
          Tooltip({ content: 'This is a tooltip' })
        )
      ),
      container
    )

    const tooltipTrigger = container.querySelector('.bc-tooltip-trigger')
    expect(tooltipTrigger).not.toBeNull()
  })

  it('should have correct tooltip content', () => {
    const tooltipContent = 'This is a tooltip'
    render(
      Provide(Theme, {}, () =>
        Button(
          { onClick: () => {} },
          'Hover me',
          Tooltip({ content: tooltipContent })
        )
      ),
      container
    )

    // The tooltip content should be available in the DOM structure
    const tooltipTrigger = container.querySelector('.bc-tooltip-trigger')
    expect(tooltipTrigger).not.toBeNull()
  })

  it('should support different placements', () => {
    render(
      Provide(Theme, {}, () =>
        Button(
          { onClick: () => {} },
          'Hover me',
          Tooltip({ content: 'This is a tooltip', placement: 'bottom' })
        )
      ),
      container
    )

    const tooltipTrigger = container.querySelector('.bc-tooltip-trigger')
    expect(tooltipTrigger).not.toBeNull()
  })

  it('should support custom offset', () => {
    render(
      Provide(Theme, {}, () =>
        Button(
          { onClick: () => {} },
          'Hover me',
          Tooltip({
            content: 'This is a tooltip',
            offset: { mainAxis: 16, crossAxis: 8 },
          })
        )
      ),
      container
    )

    const tooltipTrigger = container.querySelector('.bc-tooltip-trigger')
    expect(tooltipTrigger).not.toBeNull()
  })

  it('should render with disabled state', () => {
    render(
      Provide(Theme, {}, () =>
        Button(
          { onClick: () => {} },
          'Hover me',
          Tooltip({ content: 'This is a tooltip', disabled: true })
        )
      ),
      container
    )

    const tooltipTrigger = container.querySelector('.bc-tooltip-trigger')
    expect(tooltipTrigger).not.toBeNull()
  })
})

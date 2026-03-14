import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, prop } from '@tempots/dom'
import { DropdownInput } from '../../src/components/form/input/dropdown-input'
import { WithProviders } from '../helpers/test-providers'
import { DropdownOption, Option } from '../../src/index'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('Dropdown reopen behavior', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  function renderDropdown(onChange?: (val: string) => void) {
    const value = prop<string>('')
    const options = prop<DropdownOption<string>[]>([
      Option.value('apple', 'Apple'),
      Option.value('banana', 'Banana'),
      Option.value('cherry', 'Cherry'),
    ])

    render(
      WithProviders(() =>
        DropdownInput({
          value,
          options,
          onChange: onChange ?? (() => {}),
        })
      ),
      container
    )

    return {
      value,
      trigger: container.querySelector('.bc-dropdown') as HTMLElement,
    }
  }

  it('should open and close on click toggle', async () => {
    const { trigger } = renderDropdown()

    // Open
    trigger.click()
    await wait(100)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(document.querySelector('.bc-dropdown__listbox')).not.toBeNull()

    // Close
    trigger.click()
    await wait(100)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('should reopen after closing with Escape', async () => {
    const { trigger } = renderDropdown()

    // Open
    trigger.click()
    await wait(100)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    // Close with Escape
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    )
    await wait(100)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    // Reopen — this is the core bug fix test
    trigger.click()
    await wait(100)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(document.querySelector('.bc-dropdown__listbox')).not.toBeNull()
  })

  it('should reopen after selecting an option', async () => {
    const onChange = vi.fn()
    const { trigger } = renderDropdown(onChange)

    // Open
    trigger.click()
    await wait(100)

    // Select an option
    const option = document.querySelector(
      '[data-value="apple"]'
    ) as HTMLElement
    if (option) {
      option.click()
      await wait(100)

      expect(onChange).toHaveBeenCalledWith('apple')
      expect(trigger.getAttribute('aria-expanded')).toBe('false')

      // Reopen
      trigger.click()
      await wait(100)
      expect(trigger.getAttribute('aria-expanded')).toBe('true')
      expect(document.querySelector('.bc-dropdown__listbox')).not.toBeNull()
    }
  })

  it('should handle rapid open/close/open without state desync', async () => {
    const { trigger } = renderDropdown()

    for (let i = 0; i < 5; i++) {
      // Open
      trigger.click()
      await wait(100)
      expect(trigger.getAttribute('aria-expanded')).toBe('true')

      // Close
      trigger.click()
      await wait(100)
      expect(trigger.getAttribute('aria-expanded')).toBe('false')
    }
  })

  it('should reset focus state when closed externally', async () => {
    const { trigger } = renderDropdown()

    // Open
    trigger.click()
    await wait(100)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    // Verify activedescendant is set (first option focused)
    const activedesc = trigger.getAttribute('aria-activedescendant')
    expect(activedesc).not.toBe('')

    // Close with Escape
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    )
    await wait(100)

    // activedescendant should be cleared
    expect(trigger.getAttribute('aria-activedescendant')).toBe('')
  })

  it('should close dropdown with Escape and Enter to reopen', async () => {
    const { trigger } = renderDropdown()

    // Open with Enter
    trigger.focus()
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    )
    await wait(100)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    // Close with Escape
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    )
    await wait(100)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    // Reopen with Enter
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    )
    await wait(100)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('should close dropdown with Escape and ArrowDown to reopen', async () => {
    const { trigger } = renderDropdown()

    // Open with ArrowDown
    trigger.focus()
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    )
    await wait(100)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    // Close with Escape
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    )
    await wait(100)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    // Reopen with ArrowDown
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    )
    await wait(100)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })
})

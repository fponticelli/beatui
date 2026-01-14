/**
 * NativeSelect showPicker Tests
 *
 * Tests for the showPicker() functionality in NativeSelect component,
 * specifically handling edge cases where the element may be removed from DOM.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { prop, render } from '@tempots/dom'
import { NativeSelect } from '../../src/components/form/input/native-select'
import { WithI18nProviders } from '../helpers/test-providers'

describe('NativeSelect showPicker', () => {
  let container: HTMLElement
  let dispose: (() => void) | undefined

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (dispose) {
      dispose()
    }
    container.remove()
  })

  it('should render NativeSelect and handle clicks without throwing', () => {
    const value = prop<string>('option1')
    const options = [
      { type: 'value' as const, value: 'option1', label: 'Option 1' },
      { type: 'value' as const, value: 'option2', label: 'Option 2' },
    ]

    // Render the component with providers
    dispose = render(
      WithI18nProviders(() =>
        NativeSelect({
          options: prop(options),
          value,
          onChange: v => value.set(v),
        })
      ),
      container
    )

    // Find the container element (the outer wrapper)
    const wrapper = container.querySelector('.bc-input-container, .bc-base-input-container')
    expect(wrapper).toBeTruthy()

    // Find the select element
    const select = container.querySelector('select')
    expect(select).toBeTruthy()

    // Override showPicker to throw (simulating disconnected element)
    Object.defineProperty(select, 'showPicker', {
      value: function() {
        throw new DOMException(
          "Failed to execute 'showPicker' on 'HTMLSelectElement': showPicker() requires the select is rendered.",
          'NotSupportedError'
        )
      },
      configurable: true,
    })

    // Click on the wrapper - this should NOT throw even though showPicker throws
    expect(() => {
      wrapper!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    }).not.toThrow()
  })

  it('should handle showPicker not being available (older browsers)', () => {
    const value = prop<string>('option1')
    const options = [
      { type: 'value' as const, value: 'option1', label: 'Option 1' },
      { type: 'value' as const, value: 'option2', label: 'Option 2' },
    ]

    dispose = render(
      WithI18nProviders(() =>
        NativeSelect({
          options: prop(options),
          value,
          onChange: v => value.set(v),
        })
      ),
      container
    )

    const wrapper = container.querySelector('.bc-input-container, .bc-base-input-container')
    const select = container.querySelector('select')

    // Remove showPicker to simulate older browser
    Object.defineProperty(select, 'showPicker', {
      value: undefined,
      configurable: true,
    })

    // Click should work without issues
    expect(() => {
      wrapper!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    }).not.toThrow()
  })

  it('should call showPicker when it succeeds', () => {
    const value = prop<string>('option1')
    const options = [
      { type: 'value' as const, value: 'option1', label: 'Option 1' },
      { type: 'value' as const, value: 'option2', label: 'Option 2' },
    ]

    dispose = render(
      WithI18nProviders(() =>
        NativeSelect({
          options: prop(options),
          value,
          onChange: v => value.set(v),
        })
      ),
      container
    )

    const wrapper = container.querySelector('.bc-input-container, .bc-base-input-container')
    const select = container.querySelector('select')

    let showPickerCalled = false
    Object.defineProperty(select, 'showPicker', {
      value: function() {
        showPickerCalled = true
      },
      configurable: true,
    })

    // Click should call showPicker
    wrapper!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(showPickerCalled).toBe(true)
  })
})

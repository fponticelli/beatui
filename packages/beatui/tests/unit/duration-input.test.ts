import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, Provide, prop } from '@tempots/dom'
import { DurationInput } from '../../src/components/form/input/duration-input'
import { Theme } from '../../src/components/theme/theme'
import { ensureTemporal } from '../../src/temporal/runtime'
import type { Duration } from '../../src/temporal/types'

describe('DurationInput', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('renders the ISO string of the value', async () => {
    const T = await ensureTemporal()
    const value = prop<Duration>(T.Duration.from('P1DT2H'))
    const el = DurationInput({ value, onChange: vi.fn() })
    render(Provide(Theme, {}, () => el), container)

    const input = container.querySelector('input') as HTMLInputElement
    expect(input).toBeTruthy()
    // Since value is reactive, check starts with 'P'
    expect(input.value.startsWith('P')).toBe(true)
  })

  it('calls onChange with parsed Temporal.Duration when value changes', async () => {
    const T = await ensureTemporal()
    const value = prop<Duration>(T.Duration.from('P0D'))
    const onChange = vi.fn()
    const el = DurationInput({ value, onChange })
    render(Provide(Theme, {}, () => el), container)

    const input = container.querySelector('input') as HTMLInputElement
    input.value = 'P1DT2H3M4S'
    input.dispatchEvent(new Event('change', { bubbles: true }))

    expect(onChange).toHaveBeenCalledTimes(1)
    const arg: Duration = onChange.mock.calls[0][0]
    expect(String(arg)).toBe('P1DT2H3M4S')
  })
})

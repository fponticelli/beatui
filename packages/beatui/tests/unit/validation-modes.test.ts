import { describe, it, expect, vi } from 'vitest'
import { useController } from '../../src/components/form'
import { Validation } from '@tempots/std'

describe('Validation modes in useController', () => {
  it('onSubmit: does not validate on change', async () => {
    const { controller } = useController<string>({
      initialValue: '',
      validationMode: 'onSubmit',
      validate: () => Validation.invalid({ message: 'err' }),
    })
    expect(controller.status.value.type).toBe('valid')
    await controller.change('x')
    expect(controller.status.value.type).toBe('valid')
  })

  it('continuous: validates on change and shows errors immediately', async () => {
    const { controller } = useController<string>({
      initialValue: '',
      validationMode: 'continuous',
      validate: () => Validation.invalid({ message: 'err' }),
    })
    await controller.change('x')
    expect(controller.status.value.type).toBe('invalid')
    // errorVisible ignores touched in continuous mode
    expect(controller.errorVisible.value).toBe(true)
  })

  it('touchedOrSubmit: validates on change but shows only after touched', async () => {
    const { controller } = useController<string>({
      initialValue: '',
      validationMode: 'touchedOrSubmit',
      validate: () => Validation.invalid({ message: 'err' }),
    })
    await controller.change('x')
    expect(controller.status.value.type).toBe('invalid')
    expect(controller.errorVisible.value).toBe(false)
    controller.markTouched()
    expect(controller.errorVisible.value).toBe(true)
  })

  it('debounces validation calls when validateDebounceMs is set', async () => {
    vi.useFakeTimers()
    let calls = 0
    const { controller } = useController<string>({
      initialValue: '',
      validationMode: 'continuous',
      validateDebounceMs: 50,
      validate: () => {
        calls++
        return Validation.invalid({ message: 'err' })
      },
    })

    controller.change('a')
    controller.change('ab')
    controller.change('abc')
    expect(calls).toBe(0)
    vi.advanceTimersByTime(60)
    expect(calls).toBe(1)
    vi.useRealTimers()
  })
})


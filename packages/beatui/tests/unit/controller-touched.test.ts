import { describe, it, expect } from 'vitest'
import { useController } from '../../src/components/form'
import { Validation } from '@tempots/std'

describe('Controller touched and errorVisible', () => {
  it('defaults to not touched; shows error only after touched', async () => {
    const { controller, setStatus } = useController<string>({
      initialValue: '',
      validate: () => Validation.valid,
    })

    // Simulate a validation error
    setStatus(Validation.invalid({ message: 'Required' }))

    expect(controller.touched.value).toBe(false)
    // Not visible until touched in default mode
    expect(controller.errorVisible.value).toBe(false)

    controller.markTouched()
    expect(controller.touched.value).toBe(true)
    expect(controller.errorVisible.value).toBe(true)

    controller.resetTouched()
    expect(controller.touched.value).toBe(false)
    // Error hidden again when not touched
    expect(controller.errorVisible.value).toBe(false)
  })
})

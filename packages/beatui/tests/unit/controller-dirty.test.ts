import { describe, it, expect } from 'vitest'
import { useController } from '../../src/components/form'
import { Validation } from '@tempots/std'

describe('Controller dirty baseline, markPristine and reset', () => {
  it('tracks dirty vs baseline and supports markPristine/reset', async () => {
    const { controller } = useController<string>({
      initialValue: 'a',
      validate: () => Validation.valid,
    })
    expect(controller.dirty.value).toBe(false)

    controller.change('b')
    expect(controller.dirty.value).toBe(true)

    controller.markPristine()
    expect(controller.dirty.value).toBe(false)

    controller.change('c')
    expect(controller.dirty.value).toBe(true)
    controller.reset()
    expect(controller.value.value).toBe('b')
    expect(controller.dirty.value).toBe(false)
  })
})

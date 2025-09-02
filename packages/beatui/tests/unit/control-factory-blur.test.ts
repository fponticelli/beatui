import { describe, it, expect } from 'vitest'
import { useController } from '../../src/components/form'
import { makeOnBlurHandler } from '../../src/components/form/control/control-factory'
import { Validation } from '@tempots/std'

describe('Control factory blur handling', () => {
  it('marks controller as touched on blur', async () => {
    const { controller } = useController<string>({
      initialValue: '',
      validate: () => Validation.valid,
    })

    const onBlur = makeOnBlurHandler(controller)
    expect(controller.touched.value).toBe(false)
    onBlur()
    expect(controller.touched.value).toBe(true)
  })
})

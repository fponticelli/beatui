import { describe, it, expect } from 'vitest'
import { prop } from '@tempots/dom'
import { Validation } from '@tempots/std'
import { UnionController, type UnionBranch } from '../../src/components/form/controller/union-controller'
import { ControllerValidation } from '../../src/components/form/controller/controller-validation'

describe('UnionController validation and state', () => {
  const branches: UnionBranch[] = [
    {
      key: 'string',
      label: 'String',
      detect: (v): v is string => typeof v === 'string',
      defaultValue: () => '',
    },
    {
      key: 'number',
      label: 'Number',
      detect: (v): v is number => typeof v === 'number',
      defaultValue: () => 0,
    },
  ]

  it('propagates validationMode to branch controllers for errorVisible behavior', () => {
    const value = prop<string | number>('a')
    const status = prop<ControllerValidation>({ type: 'valid' })
    const disabled = prop(false)
    const mode = prop<'onSubmit' | 'eager' | 'onTouched'>('eager')

    const controller = new UnionController(
      [],
      v => value.set(v),
      value,
      status,
      { disabled, validationMode: mode },
      branches
    )

    // Inject an error on the active branch path
    status.set(
      Validation.invalid({ dependencies: { string: { message: 'err' } } })
    )
    const active = controller.getBranchController('string')
    // In eager mode, errorVisible should be true without touching
    expect(active.errorVisible.value).toBe(true)

    // Switch to onTouched and verify gating kicks in
    mode.set('onTouched')
    expect(active.errorVisible.value).toBe(false)
    active.markTouched()
    expect(active.errorVisible.value).toBe(true)

    controller.dispose()
  })

  it('dirty tracks within active branch and resets with markPristine', () => {
    const value = prop<string | number>('a')
    const status = prop<ControllerValidation>({ type: 'valid' })
    const disabled = prop(false)
    const controller = new UnionController(
      [],
      v => value.set(v),
      value,
      status,
      {
        disabled,
        validationMode: prop<'onSubmit' | 'eager' | 'onTouched'>('onTouched'),
      },
      branches
    )
    const str = controller.getBranchController('string')
    expect(str.dirty.value).toBe(false)
    str.change('b')
    expect(str.dirty.value).toBe(true)
    str.markPristine()
    expect(str.dirty.value).toBe(false)
    controller.dispose()
  })
})

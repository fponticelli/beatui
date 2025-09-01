import { describe, it, expect, vi } from 'vitest'
import { prop } from '@tempots/dom'
import {
  UnionController,
  type UnionBranch,
} from '../../src/components/form/controller/union-controller'
import { ControllerValidation } from '../../src/components/form/controller/controller-validation'

describe('UnionController', () => {
  const createStringNumberBranches = (): UnionBranch[] => [
    {
      key: 'string',
      label: 'String',
      detect: (value): value is string => typeof value === 'string',
      convert: value => ({ ok: true, value: String(value) }),
      defaultValue: () => '',
    },
    {
      key: 'number',
      label: 'Number',
      detect: (value): value is number => typeof value === 'number',
      convert: value => {
        if (typeof value === 'string') {
          const n = Number(value)
          return Number.isFinite(n) ? { ok: true, value: n } : { ok: false }
        }
        return { ok: false }
      },
      defaultValue: () => 0,
    },
  ]

  it('should detect active branch based on current value', () => {
    const value = prop<string | number>('hello')
    const status = prop<ControllerValidation>({ type: 'valid' })
    const disabled = prop(false)
    const branches = createStringNumberBranches()

    const controller = new UnionController(
      [],
      () => {},
      value,
      status,
      { disabled },
      branches
    )

    expect(controller.activeBranch.value).toBe('string')
    expect(controller.activeBranchDefinition?.key).toBe('string')

    // Change value to number
    value.set(42)
    expect(controller.activeBranch.value).toBe('number')
    expect(controller.activeBranchDefinition?.key).toBe('number')

    controller.dispose()
  })

  it('should provide controllers for each branch', () => {
    const value = prop<string | number>('hello')
    const status = prop<ControllerValidation>({ type: 'valid' })
    const disabled = prop(false)
    const branches = createStringNumberBranches()

    const controller = new UnionController(
      [],
      () => {},
      value,
      status,
      { disabled },
      branches
    )

    const stringController = controller.getBranchController('string')
    const numberController = controller.getBranchController('number')

    expect(stringController).toBeDefined()
    expect(numberController).toBeDefined()
    expect(stringController.value.value).toBe('hello')
    expect(numberController.value.value).toBe(0) // default value

    controller.dispose()
  })

  it('should switch branches with conversion', () => {
    const value = prop<string | number>('42')
    const status = prop<ControllerValidation>({ type: 'valid' })
    const disabled = prop(false)
    const branches = createStringNumberBranches()
    const changeSpy = vi.fn()

    const controller = new UnionController(
      [],
      changeSpy,
      value,
      status,
      { disabled },
      branches
    )

    expect(controller.activeBranch.value).toBe('string')

    // Switch to number branch - should convert "42" to 42
    const success = controller.switchToBranch('number')
    expect(success).toBe(true)
    expect(changeSpy).toHaveBeenCalledWith(42)

    controller.dispose()
  })

  it('should switch branches with default value when conversion fails', () => {
    const value = prop<string | number>('not-a-number')
    const status = prop<ControllerValidation>({ type: 'valid' })
    const disabled = prop(false)
    const branches = createStringNumberBranches()
    const changeSpy = vi.fn()

    const controller = new UnionController(
      [],
      changeSpy,
      value,
      status,
      { disabled },
      branches
    )

    expect(controller.activeBranch.value).toBe('string')

    // Switch to number branch - conversion should fail, use default
    const success = controller.switchToBranch('number')
    expect(success).toBe(true)
    expect(changeSpy).toHaveBeenCalledWith(0) // default value

    controller.dispose()
  })

  it('should handle confirmation dialog for branch switching', () => {
    const value = prop<string | number>('test')
    const status = prop<ControllerValidation>({ type: 'valid' })
    const disabled = prop(false)
    const branches = createStringNumberBranches()
    const changeSpy = vi.fn()

    // Mock window.confirm
    const originalConfirm = window.confirm
    window.confirm = vi.fn().mockReturnValue(false)

    const controller = new UnionController(
      [],
      changeSpy,
      value,
      status,
      { disabled },
      branches
    )

    // Switch with confirmation required - should be cancelled
    const success = controller.switchToBranch('number', true)
    expect(success).toBe(false)
    expect(changeSpy).not.toHaveBeenCalled()

    // Switch with confirmation required - should succeed
    window.confirm = vi.fn().mockReturnValue(true)
    const success2 = controller.switchToBranch('number', true)
    expect(success2).toBe(true)
    expect(changeSpy).toHaveBeenCalledWith(0)

    // Restore original confirm
    window.confirm = originalConfirm
    controller.dispose()
  })

  it('should dispose child controllers properly', () => {
    const value = prop<string | number>('hello')
    const status = prop<ControllerValidation>({ type: 'valid' })
    const disabled = prop(false)
    const branches = createStringNumberBranches()

    const controller = new UnionController(
      [],
      () => {},
      value,
      status,
      { disabled },
      branches
    )

    // Create branch controllers
    const stringController = controller.getBranchController('string')
    const numberController = controller.getBranchController('number')

    const stringDisposeSpy = vi.fn()
    const numberDisposeSpy = vi.fn()
    stringController.onDispose(stringDisposeSpy)
    numberController.onDispose(numberDisposeSpy)

    // Dispose parent controller
    controller.dispose()

    // Verify child controllers were disposed
    expect(stringDisposeSpy).toHaveBeenCalled()
    expect(numberDisposeSpy).toHaveBeenCalled()
  })

  it('should throw error for unknown branch', () => {
    const value = prop<string | number>('hello')
    const status = prop<ControllerValidation>({ type: 'valid' })
    const disabled = prop(false)
    const branches = createStringNumberBranches()

    const controller = new UnionController(
      [],
      () => {},
      value,
      status,
      { disabled },
      branches
    )

    expect(() => controller.getBranchController('unknown')).toThrow(
      'Unknown branch: unknown'
    )
    expect(() => controller.switchToBranch('unknown')).toThrow(
      'Unknown branch: unknown'
    )

    controller.dispose()
  })
})

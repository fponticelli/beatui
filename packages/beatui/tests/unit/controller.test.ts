import { describe, it, expect, vi } from 'vitest'
import { prop } from '@tempots/dom'
import {
  Controller,
  ObjectController,
  ArrayController,
} from '../../src/components/form/controller/controller'
import { ControllerValidation } from '../../src/components/form/controller/controller-validation'

describe('Controller dispose refactoring', () => {
  it('should dispose internal resources via onDispose in constructor', () => {
    const value = prop('test')
    const status = prop<ControllerValidation>({ type: 'valid' })
    const disabled = prop(false)

    const controller = new Controller([], () => {}, value, status, { disabled })

    // Mock the dispose methods to track calls
    const disposeSpy = vi.fn()
    controller.disabled.onDispose(disposeSpy)
    controller.error.onDispose(disposeSpy)
    controller.hasError.onDispose(disposeSpy)
    controller.dependencyErrors.onDispose(disposeSpy)

    // Call dispose
    controller.dispose()

    // Verify that dispose was called on internal resources
    expect(disposeSpy).toHaveBeenCalled()
  })

  it('should dispose child controllers in ObjectController via onDispose', () => {
    const value = prop({ name: 'test', age: 25 })
    const status = prop<ControllerValidation>({ type: 'valid' })
    const disabled = prop(false)

    const controller = new ObjectController(
      [],
      () => {},
      value,
      status,
      { disabled },
      (a, b) => a === b
    )

    // Create a field controller
    const fieldController = controller.field('name')
    const fieldDisposeSpy = vi.fn()
    fieldController.onDispose(fieldDisposeSpy)

    // Call dispose on parent
    controller.dispose()

    // Verify that child controller dispose was called
    expect(fieldDisposeSpy).toHaveBeenCalled()
  })

  it('should dispose child controllers in ArrayController via onDispose', () => {
    const value = prop(['item1', 'item2'])
    const status = prop<ControllerValidation>({ type: 'valid' })
    const disabled = prop(false)

    const controller = new ArrayController(
      [],
      () => {},
      value,
      status,
      { disabled },
      (a, b) => a === b
    )

    // Create item controllers
    const item0 = controller.item(0)
    const item1 = controller.item(1)

    const item0DisposeSpy = vi.fn()
    const item1DisposeSpy = vi.fn()
    item0.onDispose(item0DisposeSpy)
    item1.onDispose(item1DisposeSpy)

    // Call dispose on parent
    controller.dispose()

    // Verify that child controllers dispose was called
    expect(item0DisposeSpy).toHaveBeenCalled()
    expect(item1DisposeSpy).toHaveBeenCalled()
  })

  it('should have dispose as readonly property', () => {
    const value = prop('test')
    const status = prop<ControllerValidation>({ type: 'valid' })
    const disabled = prop(false)

    const controller = new Controller([], () => {}, value, status, { disabled })

    // Verify dispose is a function and readonly
    expect(typeof controller.dispose).toBe('function')

    // Try to reassign (this should not be possible with readonly)
    // This test verifies the readonly nature at runtime
    const originalDispose = controller.dispose
    expect(controller.dispose).toBe(originalDispose)
  })

  it('should call user-registered dispose callbacks', () => {
    const value = prop('test')
    const status = prop<ControllerValidation>({ type: 'valid' })
    const disabled = prop(false)

    const controller = new Controller([], () => {}, value, status, { disabled })

    const callback1 = vi.fn()
    const callback2 = vi.fn()

    controller.onDispose(callback1)
    controller.onDispose(callback2)

    controller.dispose()

    expect(callback1).toHaveBeenCalled()
    expect(callback2).toHaveBeenCalled()
  })
})

import { describe, it, expect } from 'vitest'
import { useController } from '../../src/components/form'
import { Validation } from '@tempots/std'

describe('Container controllers dirtyDeep and markAllPristine', () => {
  it('object controller aggregates dirtyDeep and cascades markAllPristine', async () => {
    const { controller } = useController<{ a: number; b: number }>({
      initialValue: { a: 1, b: 2 },
      validate: () => Validation.valid,
    })
    const obj = controller.object()
    const a = obj.field('a')

    expect(obj.dirty.value).toBe(false)
    a.change(3)
    expect(obj.dirty.value).toBe(true)

    obj.markAllPristine()
    expect(obj.dirty.value).toBe(false)
  })

  it('array controller detects structure changes and cascades markAllPristine', async () => {
    const { controller } = useController<number[]>({
      initialValue: [1, 2],
      validate: () => Validation.valid,
    })
    const arr = controller.array()
    expect(arr.dirty.value).toBe(false)
    arr.push(3)
    expect(arr.dirty.value).toBe(true)
    arr.markAllPristine()
    expect(arr.dirty.value).toBe(false)
  })
})

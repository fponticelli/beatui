import { describe, it, expect } from 'vitest'
import { useController } from '../../src/components/form'
import { Validation } from '@tempots/std'

describe('Container controllers touchedDeep and markAllTouched', () => {
  it('object controller aggregates touchedDeep', async () => {
    const { controller } = useController<{ a: string; b: string }>({
      initialValue: { a: '', b: '' },
      validate: () => Validation.valid,
    })
    const obj = controller.object()
    const a = obj.field('a')
    const b = obj.field('b')

    expect(obj.touched.value).toBe(false)
    expect(obj['touchedDeep'].value).toBe(false)

    a.markTouched()
    expect(a.touched.value).toBe(true)
    expect(obj['touchedDeep'].value).toBe(true)

    obj.resetTouched()
    expect(obj.touched.value).toBe(false)

    obj.markAllTouched()
    expect(obj.touched.value).toBe(true)
    expect(a.touched.value).toBe(true)
    expect(b.touched.value).toBe(true)
  })

  it('array controller markAllTouched touches all items', async () => {
    const { controller } = useController<number[]>({
      initialValue: [1, 2, 3],
      validate: () => Validation.valid,
    })
    const arr = controller.array()
    const i0 = arr.item(0)
    const i1 = arr.item(1)
    expect(arr['touchedDeep'].value).toBe(false)

    arr.markAllTouched()
    expect(arr.touched.value).toBe(true)
    expect(i0.touched.value).toBe(true)
    expect(i1.touched.value).toBe(true)
    expect(arr['touchedDeep'].value).toBe(true)
  })
})

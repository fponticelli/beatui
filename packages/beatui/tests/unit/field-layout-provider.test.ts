import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, Provide, Use, Value } from '@tempots/dom'
import {
  FieldLayout,
  FIELD_LAYOUT_DEFAULTS,
} from '../../src/components/form/input/field-layout'
import { WithProviders } from '../helpers/test-providers'

describe('FieldLayout Provider', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should provide default values when created without options', () => {
    let capturedLayout: string | undefined
    let capturedLabelWidth: string | undefined
    let capturedSize: string | undefined
    let capturedCompact: boolean | undefined

    render(
      WithProviders(() =>
        Provide(FieldLayout, {}, () =>
          Use(FieldLayout, ctx => {
            capturedLayout = Value.get(ctx.layout)
            capturedLabelWidth = Value.get(ctx.labelWidth)
            capturedSize = Value.get(ctx.size)
            capturedCompact = Value.get(ctx.compact)
            return 'ok'
          })
        )
      ),
      container
    )

    expect(capturedLayout).toBe('vertical')
    expect(capturedLabelWidth).toBe('7.5rem')
    expect(capturedSize).toBe('md')
    expect(capturedCompact).toBe(false)
  })

  it('should override defaults with provided options', () => {
    let capturedLayout: string | undefined
    let capturedLabelWidth: string | undefined
    let capturedCompact: boolean | undefined

    render(
      WithProviders(() =>
        Provide(
          FieldLayout,
          {
            layout: 'horizontal-fixed',
            labelWidth: '200px',
            compact: true,
          },
          () =>
            Use(FieldLayout, ctx => {
              capturedLayout = Value.get(ctx.layout)
              capturedLabelWidth = Value.get(ctx.labelWidth)
              capturedCompact = Value.get(ctx.compact)
              return 'ok'
            })
        )
      ),
      container
    )

    expect(capturedLayout).toBe('horizontal-fixed')
    expect(capturedLabelWidth).toBe('200px')
    expect(capturedCompact).toBe(true)
  })

  it('should preserve unspecified defaults when partially configured', () => {
    let capturedLayout: string | undefined
    let capturedSize: string | undefined
    let capturedGap: string | undefined
    let capturedColumns: number | undefined

    render(
      WithProviders(() =>
        Provide(FieldLayout, { layout: 'horizontal' }, () =>
          Use(FieldLayout, ctx => {
            capturedLayout = Value.get(ctx.layout)
            capturedSize = Value.get(ctx.size)
            capturedGap = Value.get(ctx.gap)
            capturedColumns = Value.get(ctx.columns)
            return 'ok'
          })
        )
      ),
      container
    )

    expect(capturedLayout).toBe('horizontal')
    expect(capturedSize).toBe('md')
    expect(capturedGap).toBe('md')
    expect(capturedColumns).toBe(1)
  })

  it('should allow nested providers to override parent', () => {
    let outerLayout: string | undefined
    let innerLayout: string | undefined

    render(
      WithProviders(() =>
        Provide(FieldLayout, { layout: 'horizontal-fixed' }, () =>
          Use(FieldLayout, ctx => {
            outerLayout = Value.get(ctx.layout)
            return Provide(FieldLayout, { layout: 'vertical' }, () =>
              Use(FieldLayout, innerCtx => {
                innerLayout = Value.get(innerCtx.layout)
                return 'ok'
              })
            )
          })
        )
      ),
      container
    )

    expect(outerLayout).toBe('horizontal-fixed')
    expect(innerLayout).toBe('vertical')
  })

  it('should have correct default constant values', () => {
    expect(FIELD_LAYOUT_DEFAULTS.layout).toBe('vertical')
    expect(FIELD_LAYOUT_DEFAULTS.labelWidth).toBe('7.5rem')
expect(FIELD_LAYOUT_DEFAULTS.size).toBe('md')
    expect(FIELD_LAYOUT_DEFAULTS.gap).toBe('md')
    expect(FIELD_LAYOUT_DEFAULTS.columns).toBe(1)
    expect(FIELD_LAYOUT_DEFAULTS.minFieldWidth).toBe('15rem')
    expect(FIELD_LAYOUT_DEFAULTS.compact).toBe(false)
  })
})

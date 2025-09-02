import { describe, it, expect } from 'vitest'
import { prop } from '@tempots/dom'
import { Validation } from '@tempots/std'
import {
  ColorController,
  createColorController,
  colorInputOptionsFromController,
} from '../../src/components/form/controller/color-controller'
import { Controller } from '../../src/components/form/controller/controller'
import { ControllerValidation } from '../../src/components/form/controller/controller-validation'

function createTestColorController(initialValue = '#ff0000') {
  const value = prop(initialValue)
  const status = prop<ControllerValidation>(Validation.valid)
  const disabled = prop(false)

  return new ColorController(
    ['test'],
    newValue => value.set(newValue),
    value,
    status,
    { disabled }
  )
}

describe('ColorController', () => {
  describe('constructor', () => {
    it('should create a ColorController instance', () => {
      const controller = createTestColorController()
      expect(controller).toBeInstanceOf(ColorController)
      expect(controller).toBeInstanceOf(Controller)
    })
  })

  describe('isValidColor', () => {
    it('should validate color values', () => {
      const controller = createTestColorController('#ff0000')
      expect(controller.isValidColor.value).toBe(true)

      controller.change('invalid-color')
      expect(controller.isValidColor.value).toBe(false)
    })
  })

  describe('isValidHex', () => {
    it('should validate hex color values', () => {
      const controller = createTestColorController('#ff0000')
      expect(controller.isValidHex.value).toBe(true)

      controller.change('rgb(255, 0, 0)')
      expect(controller.isValidHex.value).toBe(false)
    })
  })

  describe('normalizedHex', () => {
    it('should normalize hex colors', () => {
      const controller = createTestColorController('#f00')
      expect(controller.normalizedHex.value).toBe('#ff0000')

      controller.change('#ABCDEF')
      expect(controller.normalizedHex.value).toBe('#abcdef')
    })

    it('should return original value for invalid hex', () => {
      const controller = createTestColorController('invalid')
      expect(controller.normalizedHex.value).toBe('invalid')
    })
  })

  describe('setColor', () => {
    it('should normalize hex colors when setting', () => {
      const controller = createTestColorController()

      controller.setColor('#f00')
      expect(controller.value.value).toBe('#ff0000')

      controller.setColor('#ABCDEF')
      expect(controller.value.value).toBe('#abcdef')
    })

    it('should set non-hex colors as-is', () => {
      const controller = createTestColorController()

      controller.setColor('rgb(255, 0, 0)')
      expect(controller.value.value).toBe('rgb(255, 0, 0)')
    })
  })

  describe('setHex', () => {
    it('should set normalized hex colors', () => {
      const controller = createTestColorController()

      controller.setHex('#f00')
      expect(controller.value.value).toBe('#ff0000')

      controller.setHex('ABCDEF')
      expect(controller.value.value).toBe('#abcdef')
    })

    it('should ignore invalid hex colors', () => {
      const controller = createTestColorController('#ff0000')
      const originalValue = controller.value.value

      controller.setHex('invalid')
      expect(controller.value.value).toBe(originalValue)
    })
  })

  describe('setRgb', () => {
    it('should convert RGB to hex and set', () => {
      const controller = createTestColorController()

      controller.setRgb(255, 0, 0)
      expect(controller.value.value).toBe('#ff0000')

      controller.setRgb(0, 255, 0)
      expect(controller.value.value).toBe('#00ff00')

      controller.setRgb(0, 0, 255)
      expect(controller.value.value).toBe('#0000ff')
    })

    it('should clamp RGB values to valid range', () => {
      const controller = createTestColorController()

      controller.setRgb(300, -10, 128)
      expect(controller.value.value).toBe('#ff0080')
    })
  })

  describe('getRgb', () => {
    it('should convert hex to RGB values', () => {
      const controller = createTestColorController('#ff0000')
      expect(controller.getRgb()).toEqual({ r: 255, g: 0, b: 0 })

      controller.change('#00ff00')
      expect(controller.getRgb()).toEqual({ r: 0, g: 255, b: 0 })

      controller.change('#0000ff')
      expect(controller.getRgb()).toEqual({ r: 0, g: 0, b: 255 })
    })

    it('should return null for invalid hex colors', () => {
      const controller = createTestColorController('invalid')
      expect(controller.getRgb()).toBe(null)
    })
  })

  describe('withFormat', () => {
    it('should create a controller with hex format transformation', () => {
      const controller = createTestColorController('#f00')
      const hexController = controller.withFormat('hex')

      expect(hexController.value.value).toBe('#ff0000')
    })

    it('should create a controller with RGB format transformation', () => {
      const controller = createTestColorController('#ff0000')
      const rgbController = controller.withFormat('rgb')

      expect(rgbController.value.value).toBe('rgb(255, 0, 0)')
    })

    it('should create a controller with HSL format transformation', () => {
      const controller = createTestColorController('#ff0000')
      const hslController = controller.withFormat('hsl')

      // For now, HSL just returns the original value
      expect(hslController.value.value).toBe('#ff0000')
    })
  })
})

describe('createColorController', () => {
  it('should create a ColorController from a regular Controller', () => {
    const value = prop('#ff0000')
    const status = prop<ControllerValidation>(Validation.valid)
    const disabled = prop(false)

    const baseController = new Controller(
      ['test'],
      newValue => value.set(newValue),
      value,
      status,
      { disabled }
    )

    const colorController = createColorController(baseController)

    expect(colorController).toBeInstanceOf(ColorController)
    expect(colorController.value.value).toBe('#ff0000')
  })
})

describe('colorInputOptionsFromController', () => {
  it('should create input options from ColorController', () => {
    const controller = createTestColorController('#ff0000')
    const options = colorInputOptionsFromController(controller)

    expect(options).toHaveProperty('id')
    expect(options).toHaveProperty('disabled')
    expect(options).toHaveProperty('value')
    expect(options).toHaveProperty('hasError')
    expect(options).toHaveProperty('onChange')
    expect(options).toHaveProperty('onInput')

    expect(options.value.value).toBe('#ff0000')
  })

  it('should use normalized hex for value', () => {
    const controller = createTestColorController('#f00')
    const options = colorInputOptionsFromController(controller)

    expect(options.value.value).toBe('#ff0000')
  })
})

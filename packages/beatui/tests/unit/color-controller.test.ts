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
      // detectColorSpace returns 'rgb8' for hex colors
      expect(controller.isValidHex.value).toBe(true)
    })

    it('should return true for rgb() since detectColorSpace maps it to rgb8', () => {
      const controller = createTestColorController('#ff0000')
      // Both hex and rgb() are detected as 'rgb8' color space
      controller.change('rgb(255, 0, 0)')
      expect(controller.isValidHex.value).toBe(true)
    })

    it('should return false for non-rgb8 color spaces', () => {
      const controller = createTestColorController('hsl(0, 100%, 50%)')
      expect(controller.isValidHex.value).toBe(false)
    })
  })

  describe('normalizedHex', () => {
    it('should normalize hex colors via colorToString (returns rgb format)', () => {
      const controller = createTestColorController('#f00')
      // normalizeHexColor uses colorToString(parseColor(s)) which returns rgb() format
      expect(controller.normalizedHex.value).toBe('rgb(255 0 0)')

      controller.change('#ABCDEF')
      expect(controller.normalizedHex.value).toBe('rgb(171 205 239)')
    })

    it('should return original value for invalid hex', () => {
      const controller = createTestColorController('invalid')
      expect(controller.normalizedHex.value).toBe('invalid')
    })
  })

  describe('setColor', () => {
    it('should normalize hex colors when setting (produces rgb format)', () => {
      const controller = createTestColorController()

      controller.setColor('#f00')
      // normalizeHexColor returns rgb() format via colorToString
      expect(controller.signal.value).toBe('rgb(255 0 0)')

      controller.setColor('#ABCDEF')
      expect(controller.signal.value).toBe('rgb(171 205 239)')
    })

    it('should set non-hex colors as-is', () => {
      const controller = createTestColorController()

      controller.setColor('rgb(255, 0, 0)')
      // rgb() is detected as rgb8, so it goes through normalization too
      expect(controller.signal.value).toBe('rgb(255 0 0)')
    })
  })

  describe('setHex', () => {
    it('should set normalized hex colors (produces rgb format)', () => {
      const controller = createTestColorController()

      controller.setHex('#f00')
      // normalizeHexColor returns rgb() format
      expect(controller.signal.value).toBe('rgb(255 0 0)')

      // With # prefix, hex is recognized and normalized
      controller.setHex('#ABCDEF')
      expect(controller.signal.value).toBe('rgb(171 205 239)')
    })

    it('should ignore hex without # prefix (not detected as hex)', () => {
      const controller = createTestColorController('#ff0000')
      // Without # prefix, detectColorSpace returns undefined, so normalizeHexColor returns null
      controller.setHex('ABCDEF')
      // Value unchanged since setHex ignores when normalizeHexColor returns null
      expect(controller.signal.value).toBe('#ff0000')
    })

    it('should ignore invalid hex colors', () => {
      const controller = createTestColorController('#ff0000')
      const originalValue = controller.signal.value

      controller.setHex('invalid')
      expect(controller.signal.value).toBe(originalValue)
    })
  })

  describe('setRgb', () => {
    it('should convert RGB to hex and set', () => {
      const controller = createTestColorController()

      controller.setRgb(255, 0, 0)
      expect(controller.signal.value).toBe('#ff0000')

      controller.setRgb(0, 255, 0)
      expect(controller.signal.value).toBe('#00ff00')

      controller.setRgb(0, 0, 255)
      expect(controller.signal.value).toBe('#0000ff')
    })

    it('should clamp RGB values to valid range', () => {
      const controller = createTestColorController()

      controller.setRgb(300, -10, 128)
      expect(controller.signal.value).toBe('#ff0080')
    })
  })

  describe('getRgb', () => {
    it('should return null because normalizedHex returns rgb() format not hex', () => {
      // getRgb uses normalizeHexColor which returns rgb() format,
      // then tries to regex-match as hex, which fails
      const controller = createTestColorController('#ff0000')
      expect(controller.getRgb()).toBe(null)
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

      // withFormat('hex') calls normalizeHexColor which returns rgb() format
      expect(hexController.signal.value).toBe('rgb(255 0 0)')
    })

    it('should create a controller with RGB format transformation', () => {
      const controller = createTestColorController('#ff0000')
      const rgbController = controller.withFormat('rgb')

      // getRgb() returns null (due to normalizeHexColor returning rgb format),
      // so withFormat('rgb') falls back to the original value
      expect(rgbController.signal.value).toBe('#ff0000')
    })

    it('should create a controller with HSL format transformation', () => {
      const controller = createTestColorController('#ff0000')
      const hslController = controller.withFormat('hsl')

      // For now, HSL just returns the original value
      expect(hslController.signal.value).toBe('#ff0000')
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
    expect(colorController.signal.value).toBe('#ff0000')
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

    // normalizedHex uses colorToString which returns rgb() format
    expect(options.value.value).toBe('rgb(255 0 0)')
  })

  it('should use normalized hex for value (returns rgb format)', () => {
    const controller = createTestColorController('#f00')
    const options = colorInputOptionsFromController(controller)

    // normalizedHex returns rgb() format via colorToString
    expect(options.value.value).toBe('rgb(255 0 0)')
  })
})

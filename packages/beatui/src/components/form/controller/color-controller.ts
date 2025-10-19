import { Controller } from './controller'
import {
  isValidColor,
  isValidHexColor,
  normalizeHexColor,
} from '../../../utils/color-validation'
import { Signal } from '@tempots/dom'
import { Path } from './path'
import { ControllerValidation } from './controller-validation'

/**
 * Specialized controller for color values with validation and transformation utilities
 */
export class ColorController extends Controller<string> {
  constructor(
    path: Path,
    change: (value: string) => void,
    signal: Signal<string>,
    status: Signal<ControllerValidation>,
    parent: {
      disabled: Signal<boolean>
    }
  ) {
    super(path, change, signal, status, parent)
  }

  /**
   * Validates that the current value is a valid color
   */
  readonly isValidColor = this.signal.map(isValidColor)

  /**
   * Validates that the current value is a valid hex color
   */
  readonly isValidHex = this.signal.map(isValidHexColor)

  /**
   * Gets the normalized hex color (always 6 characters with # prefix)
   */
  readonly normalizedHex = this.signal.map(
    color => normalizeHexColor(color) ?? color
  )

  /**
   * Sets the color value with automatic normalization for hex colors
   * @param color - The color value to set
   */
  readonly setColor = (color: string) => {
    // If it's a valid hex color, normalize it
    if (isValidHexColor(color)) {
      const normalized = normalizeHexColor(color)
      if (normalized) {
        this.change(normalized)
        return
      }
    }

    // Otherwise, set the value as-is
    this.change(color)
  }

  /**
   * Sets a hex color value
   * @param hex - The hex color value (with or without #)
   */
  readonly setHex = (hex: string) => {
    const normalized = normalizeHexColor(hex)
    if (normalized) {
      this.change(normalized)
    }
  }

  /**
   * Sets an RGB color value
   * @param r - Red value (0-255)
   * @param g - Green value (0-255)
   * @param b - Blue value (0-255)
   */
  readonly setRgb = (r: number, g: number, b: number) => {
    // Convert to hex for consistent storage
    const toHex = (n: number) => {
      const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }

    const hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`
    this.change(hexColor)
  }

  /**
   * Gets RGB values from the current color
   * @returns RGB values or null if not a valid hex color
   */
  readonly getRgb = () => {
    const color = this.signal.value
    const normalized = normalizeHexColor(color)
    if (!normalized) return null

    const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  /**
   * Creates a controller that transforms between different color formats
   * @param format - The target color format ('hex', 'rgb', 'hsl')
   * @returns A new controller with format transformation
   */
  readonly withFormat = (format: 'hex' | 'rgb' | 'hsl') => {
    const transform = (value: string) => {
      switch (format) {
        case 'hex':
          return normalizeHexColor(value) ?? value
        case 'rgb':
          const rgb = this.getRgb()
          return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : value
        case 'hsl':
          // For now, return the original value for HSL
          // Could implement RGB to HSL conversion here
          return value
        default:
          return value
      }
    }

    const untransform = (value: string) => {
      // Always store as normalized hex internally
      return normalizeHexColor(value) ?? value
    }

    return this.transform(transform, untransform, [`format-${format}`])
  }
}

/**
 * Creates a ColorController from a regular Controller<string>
 * @param controller - The base string controller
 * @returns A new ColorController with color-specific functionality
 */
export function createColorController(
  controller: Controller<string>
): ColorController {
  return new ColorController(
    controller.path,
    controller.change,
    controller.signal,
    controller.status,
    { disabled: controller.disabled }
  )
}

/**
 * Helper function to create color input options from a ColorController
 * @param controller - The ColorController instance
 * @returns Input options compatible with ColorInput component
 */
export function colorInputOptionsFromController(controller: ColorController) {
  return {
    id: controller.name,
    disabled: controller.disabled,
    value: controller.normalizedHex,
    hasError: controller.errorVisible,
    onChange: controller.setColor,
    onInput: controller.setColor,
  }
}

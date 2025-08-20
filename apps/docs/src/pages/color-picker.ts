import { attr, html, prop, style } from '@tempots/dom'
import {
  Button,
  Card,
  ColorInput,
  createColorController,
  colorInputOptionsFromController,
  Group,
  InputWrapper,
  ScrollablePanel,
  Stack,
  TextInput,
  useForm,
  isValidHexColor,
  hexToRgb,
  getContrastRatio,
} from '@tempots/beatui'
import { z } from 'zod/v4'

export const ColorPickerPage = () => {
  // Simple color picker example
  const simpleColor = prop('#3b82f6')

  // Form with color picker
  const { controller } = useForm({
    schema: z.object({
      primaryColor: z
        .string()
        .refine(isValidHexColor, 'Must be a valid hex color'),
      secondaryColor: z
        .string()
        .refine(isValidHexColor, 'Must be a valid hex color'),
      backgroundColor: z
        .string()
        .refine(isValidHexColor, 'Must be a valid hex color'),
      textColor: z
        .string()
        .refine(isValidHexColor, 'Must be a valid hex color'),
    }),
    initialValue: {
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
    },
  })

  // Create color controllers
  const primaryColorController = createColorController(
    controller.field('primaryColor')
  )
  const secondaryColorController = createColorController(
    controller.field('secondaryColor')
  )
  const backgroundColorController = createColorController(
    controller.field('backgroundColor')
  )
  const textColorController = createColorController(
    controller.field('textColor')
  )

  // Computed values for preview
  const contrastRatio = controller.value.map(values => {
    const ratio = getContrastRatio(values.textColor, values.backgroundColor)
    return ratio ? ratio.toFixed(2) : 'N/A'
  })

  const rgbValues = primaryColorController.value.map(color => {
    const rgb = hexToRgb(color)
    return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : 'Invalid'
  })

  return ScrollablePanel({
    body: Stack(
      attr.class('bu-p-6 bu-gap-8'),

      // Page Header
      Stack(
        attr.class('bu-gap-2'),
        html.h1(attr.class('bu-text-3xl bu-font-bold'), 'Color Picker'),
        html.p(
          attr.class('bu-text-gray-600'),
          'Interactive color picker component with validation and format conversion.'
        )
      ),

      // Simple Example
      Card(
        {},
        Stack(
          attr.class('bu-gap-4'),
          html.h2(
            attr.class('bu-text-xl bu-font-semibold'),
            'Basic Color Picker'
          ),
          html.p(
            attr.class('bu-text-sm bu-text-gray-600'),
            'A simple color picker that updates a preview box.'
          ),
          Group(
            attr.class('bu-items-center bu-gap-4'),
            InputWrapper({
              label: 'Pick a Color',
              content: ColorInput({
                value: simpleColor,
                onChange: color => simpleColor.set(color),
                id: 'simple-color',
              }),
            }),
            html.div(
              attr.class(
                'bu-w-16 bu-h-16 bu-rounded-lg bu-border-2 bu-border-gray-300'
              ),
              style.backgroundColor(simpleColor)
            ),
            Stack(
              attr.class('bu-text-sm'),
              html.div(html.strong('Selected: '), simpleColor)
            )
          )
        )
      ),

      // Form Example with Controllers
      Card(
        {},
        Stack(
          attr.class('bu-gap-6'),
          html.h2(
            attr.class('bu-text-xl bu-font-semibold'),
            'Color Theme Designer'
          ),
          html.p(
            attr.class('bu-text-sm bu-text-gray-600'),
            'Design a color theme with validation and real-time preview.'
          ),

          Group(
            attr.class('bu-gap-8 bu-items-start'),

            // Color Controls
            Stack(
              attr.class('bu-gap-4 bu-min-w-80'),
              InputWrapper({
                label: 'Primary Color',
                description: 'Main brand color',
                content: ColorInput(
                  colorInputOptionsFromController(primaryColorController)
                ),
              }),
              InputWrapper({
                label: 'Secondary Color',
                description: 'Accent color',
                content: ColorInput(
                  colorInputOptionsFromController(secondaryColorController)
                ),
              }),
              InputWrapper({
                label: 'Background Color',
                description: 'Page background',
                content: ColorInput(
                  colorInputOptionsFromController(backgroundColorController)
                ),
              }),
              InputWrapper({
                label: 'Text Color',
                description: 'Main text color',
                content: ColorInput(
                  colorInputOptionsFromController(textColorController)
                ),
              }),

              // Alternative text input for hex values
              InputWrapper({
                label: 'Primary Color (Hex)',
                description: 'Edit hex value directly',
                content: TextInput({
                  value: primaryColorController.normalizedHex,
                  onChange: hex => primaryColorController.setHex(hex),
                  placeholder: '#3b82f6',
                  id: 'primary-hex',
                }),
              })
            ),

            // Preview Panel
            Stack(
              attr.class('bu-gap-4 bu-flex-1'),
              html.h3(attr.class('bu-text-lg bu-font-medium'), 'Live Preview'),

              // Color swatches
              Group(
                attr.class('bu-gap-2 bu-flex-wrap'),
                html.div(
                  attr.class(
                    'bu-w-20 bu-h-20 bu-rounded-lg bu-border bu-flex bu-items-center bu-justify-center bu-text-xs bu-font-medium bu-px-1'
                  ),
                  style.backgroundColor(
                    controller.value.map(v => v.primaryColor)
                  ),
                  style.color('#ffffff'),
                  'Primary'
                ),
                html.div(
                  attr.class(
                    'bu-w-20 bu-h-20 bu-rounded-lg bu-border bu-flex bu-items-center bu-justify-center bu-text-xs bu-font-medium bu-px-1'
                  ),
                  style.backgroundColor(
                    controller.value.map(v => v.secondaryColor)
                  ),
                  style.color('#ffffff'),
                  'Secondary'
                ),
                html.div(
                  attr.class(
                    'bu-w-20 bu-h-20 bu-rounded-lg bu-border bu-flex bu-items-center bu-justify-center bu-text-xs bu-font-medium bu-px-1'
                  ),
                  style.backgroundColor(
                    controller.value.map(v => v.backgroundColor)
                  ),
                  style.color(controller.value.map(v => v.textColor)),
                  'Background'
                )
              ),

              // Sample UI with theme colors
              html.div(
                attr.class('bu-p-6 bu-rounded-lg bu-border-2'),
                style.backgroundColor(
                  controller.value.map(v => v.backgroundColor)
                ),
                style.color(controller.value.map(v => v.textColor)),
                Stack(
                  attr.class('bu-gap-4'),
                  html.h4(
                    attr.class('bu-text-lg bu-font-semibold'),
                    'Sample UI'
                  ),
                  html.p(
                    'This is how your theme colors would look in a real interface.'
                  ),
                  Group(
                    attr.class('bu-gap-2'),
                    Button(
                      {
                        variant: 'filled',
                      },
                      style.backgroundColor(
                        controller.value.map(v => v.primaryColor)
                      ),
                      'Primary Button'
                    ),
                    Button(
                      {
                        variant: 'outline',
                      },
                      style.borderColor(
                        controller.value.map(v => v.secondaryColor)
                      ),
                      style.color(controller.value.map(v => v.secondaryColor)),
                      'Secondary Button'
                    )
                  )
                )
              ),

              // Color Information
              Stack(
                attr.class('bu-gap-2 bu-text-sm'),
                html.h4(attr.class('bu-font-medium'), 'Color Information'),
                html.div(html.strong('Primary RGB: '), rgbValues),
                html.div(html.strong('Contrast Ratio: '), contrastRatio),
                html.div(
                  attr.class(
                    contrastRatio.map((ratio): string => {
                      const r = parseFloat(ratio)
                      return r >= 4.5
                        ? 'bu-text-green-600'
                        : r >= 3
                          ? 'bu-text-yellow-600'
                          : 'bu-text-red-600'
                    })
                  ),
                  contrastRatio.map((ratio): string => {
                    const r = parseFloat(ratio)
                    return r >= 4.5
                      ? '✓ WCAG AA Compliant'
                      : r >= 3
                        ? '⚠ WCAG AA Large Text'
                        : '✗ Poor Contrast'
                  })
                )
              )
            )
          )
        )
      )
    ),
  })
}

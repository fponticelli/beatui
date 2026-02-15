import { attr, html, prop, style } from '@tempots/dom'
import {
  Button,
  Card,
  ColorSwatchInput,
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
import { z } from 'zod'

export default function ColorSwatchPage() {
  // Simple color swatch example
  const simpleColor = prop('#3b82f6')

  // Form with color swatch
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
  const contrastRatio = controller.signal.map(values => {
    const ratio = getContrastRatio(values.textColor, values.backgroundColor)
    return ratio ? ratio.toFixed(2) : 'N/A'
  })

  const rgbValues = primaryColorController.signal.map(color => {
    const rgb = hexToRgb(color)
    return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : 'Invalid'
  })

  return ScrollablePanel({
    body: Stack(
      attr.class('p-6 gap-8'),

      // Page Header
      Stack(
        attr.class('gap-2'),
        html.h1(attr.class('text-3xl font-bold'), 'Color Swatch'),
        html.p(
          attr.class('text-gray-600 dark:text-gray-400'),
          'Interactive color swatch component with validation and format conversion.'
        )
      ),

      // Simple Example
      Card(
        {},
        Stack(
          attr.class('gap-4'),
          html.h2(attr.class('text-xl font-semibold'), 'Basic Color Swatch'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'A simple color swatch that updates a preview box.'
          ),
          Group(
            attr.class('items-center gap-4'),
            InputWrapper({
              label: 'Pick a Color',
              content: ColorSwatchInput({
                value: simpleColor,
                onChange: color => simpleColor.set(color),
                id: 'simple-color',
              }),
            }),
            html.div(
              attr.class(
                'w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600'
              ),
              style.backgroundColor(simpleColor)
            ),
            Stack(
              attr.class('text-sm'),
              html.div(html.strong('Selected: '), simpleColor)
            )
          )
        )
      ),

      // Form Example with Controllers
      Card(
        {},
        Stack(
          attr.class('gap-6'),
          html.h2(attr.class('text-xl font-semibold'), 'Color Theme Designer'),
          html.p(
            attr.class('text-sm text-gray-600 dark:text-gray-400'),
            'Design a color theme with validation and real-time preview.'
          ),

          Group(
            attr.class('gap-8 items-start'),

            // Color Controls
            Stack(
              attr.class('gap-4 min-w-80'),
              InputWrapper({
                label: 'Primary Color',
                description: 'Main brand color',
                content: ColorSwatchInput(
                  colorInputOptionsFromController(primaryColorController)
                ),
              }),
              InputWrapper({
                label: 'Secondary Color',
                description: 'Accent color',
                content: ColorSwatchInput(
                  colorInputOptionsFromController(secondaryColorController)
                ),
              }),
              InputWrapper({
                label: 'Background Color',
                description: 'Page background',
                content: ColorSwatchInput(
                  colorInputOptionsFromController(backgroundColorController)
                ),
              }),
              InputWrapper({
                label: 'Text Color',
                description: 'Main text color',
                content: ColorSwatchInput(
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
              attr.class('gap-4 flex-1'),
              html.h3(attr.class('text-lg font-medium'), 'Live Preview'),

              // Color swatches
              Group(
                attr.class('gap-2 flex-wrap'),
                html.div(
                  attr.class(
                    'w-20 h-20 rounded-lg border flex items-center justify-center text-xs font-medium px-1'
                  ),
                  style.backgroundColor(
                    controller.signal.map(v => v.primaryColor)
                  ),
                  style.color('#ffffff'),
                  'Primary'
                ),
                html.div(
                  attr.class(
                    'w-20 h-20 rounded-lg border flex items-center justify-center text-xs font-medium px-1'
                  ),
                  style.backgroundColor(
                    controller.signal.map(v => v.secondaryColor)
                  ),
                  style.color('#ffffff'),
                  'Secondary'
                ),
                html.div(
                  attr.class(
                    'w-20 h-20 rounded-lg border flex items-center justify-center text-xs font-medium px-1'
                  ),
                  style.backgroundColor(
                    controller.signal.map(v => v.backgroundColor)
                  ),
                  style.color(controller.signal.map(v => v.textColor)),
                  'Background'
                )
              ),

              // Sample UI with theme colors
              html.div(
                attr.class('p-6 rounded-lg border-2'),
                style.backgroundColor(
                  controller.signal.map(v => v.backgroundColor)
                ),
                style.color(controller.signal.map(v => v.textColor)),
                Stack(
                  attr.class('gap-4'),
                  html.h4(attr.class('text-lg font-semibold'), 'Sample UI'),
                  html.p(
                    'This is how your theme colors would look in a real interface.'
                  ),
                  Group(
                    attr.class('gap-2'),
                    Button(
                      {
                        variant: 'filled',
                      },
                      style.backgroundColor(
                        controller.signal.map(v => v.primaryColor)
                      ),
                      'Primary Button'
                    ),
                    Button(
                      {
                        variant: 'outline',
                      },
                      style.borderColor(
                        controller.signal.map(v => v.secondaryColor)
                      ),
                      style.color(controller.signal.map(v => v.secondaryColor)),
                      'Secondary Button'
                    )
                  )
                )
              ),

              // Color Information
              Stack(
                attr.class('gap-2 text-sm'),
                html.h4(attr.class('font-medium'), 'Color Information'),
                html.div(html.strong('Primary RGB: '), rgbValues),
                html.div(html.strong('Contrast Ratio: '), contrastRatio),
                html.div(
                  attr.class(
                    contrastRatio.map((ratio): string => {
                      const r = parseFloat(ratio)
                      return r >= 4.5
                        ? 'text-green-600 dark:text-green-400'
                        : r >= 3
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
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

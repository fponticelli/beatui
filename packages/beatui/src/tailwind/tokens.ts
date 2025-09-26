import {
  colorShades,
  semanticColors,
  themeColorNames,
  type ColorShade,
  type SemanticColorName,
  type ThemeColorName,
} from '../tokens/colors'
import { spacing } from '../tokens/spacing'
import { radius } from '../tokens/radius'
import { shadows } from '../tokens/shadows'
import { zIndex } from '../tokens/z-index'
import {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  type FontSize as TokenFontSize,
} from '../tokens/typography'
import { breakpoints } from '../tokens/breakpoints'

export type TailwindColorScale = Record<ColorShade, string>

const buildColorScale = (name: ThemeColorName): TailwindColorScale => {
  return colorShades.reduce((scale, shade) => {
    scale[shade] = `var(--color-${name}-${shade})`
    return scale
  }, {} as TailwindColorScale)
}

export const beatuiColors: Record<string, TailwindColorScale> = (() => {
  const palette: Record<string, TailwindColorScale> = {}
  themeColorNames.forEach((token) => {
    palette[token] = buildColorScale(token)
  })

  ;(Object.keys(semanticColors) as SemanticColorName[]).forEach((semantic) => {
    const resolved = semanticColors[semantic]
    palette[semantic] = buildColorScale(resolved)
  })

  return palette
})()

export const beatuiSpacing = { ...spacing }

export const beatuiRadii = { ...radius }

export const beatuiShadows = { ...shadows }

export const beatuiZIndex = Object.entries(zIndex).reduce(
  (acc, [key, value]) => {
    acc[key] = String(value)
    return acc
  },
  {} as Record<string, string>
)

export const beatuiFontFamily = { ...fontFamily }

export const beatuiFontWeight = { ...fontWeight }

export const beatuiLineHeight = { ...lineHeight }

export const beatuiLetterSpacing = { ...letterSpacing }

export const beatuiFontSize = (Object.entries(fontSize) as [
  TokenFontSize,
  [string, { lineHeight: string }],
][]).reduce((acc, [key, [size, options]]) => {
  acc[key] = [size, options]
  return acc
}, {} as Record<TokenFontSize, [string, { lineHeight: string }]>)

export const beatuiScreens = { ...breakpoints }

export const beatuiThemeExtensions = {
  colors: beatuiColors,
  spacing: beatuiSpacing,
  borderRadius: beatuiRadii,
  boxShadow: beatuiShadows,
  fontFamily: beatuiFontFamily,
  fontWeight: beatuiFontWeight,
  lineHeight: beatuiLineHeight,
  letterSpacing: beatuiLetterSpacing,
  fontSize: beatuiFontSize,
  zIndex: beatuiZIndex,
}

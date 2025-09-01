import {
  NativeSelect,
  Option,
  ThemeColorName,
  themeColorNames,
} from '@tempots/beatui'
import { Value } from '@tempots/dom'

export function ColorSelector({
  color,
  onChange,
}: {
  color: Value<ThemeColorName>
  onChange?: (value: ThemeColorName) => void
}) {
  return NativeSelect({
    options: themeColorNames.map(name => Option.value(name, name)),
    value: color,
    onChange,
  })
}

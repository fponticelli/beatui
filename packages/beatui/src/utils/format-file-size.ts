export type FormatFileSizeOptions = {
  units?: string[]
  decimalPlaces?: number
  locale?: string
}

export function formatFileSize(
  bytes: number | bigint,
  {
    units = ['B', 'KB', 'MB', 'GB', 'TB'],
    decimalPlaces = 0,
    locale,
  }: FormatFileSizeOptions = {}
): string {
  if (bytes === 0 || bytes === 0n) {
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'byte',
      unitDisplay: 'short',
      maximumFractionDigits: 0,
    })
      .format(0)
      .replace('byte', units[0])
  }

  let unitIndex: number
  let value: number

  if (typeof bytes === 'bigint') {
    // Handle bigint without losing precision
    const absBytes = bytes < 0n ? -bytes : bytes
    let tempBytes = absBytes
    unitIndex = 0

    // Find the appropriate unit by dividing by 1024 until we get a manageable size
    while (tempBytes >= 1024n && unitIndex < units.length - 1) {
      tempBytes = tempBytes / 1024n
      unitIndex++
    }

    // Convert to number only after we've reduced to a manageable size
    value = Number(bytes) / Math.pow(1024, unitIndex)
  } else {
    // Handle regular number
    unitIndex = Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024))
    const clampedIndex = Math.min(unitIndex, units.length - 1)
    unitIndex = clampedIndex
    value = bytes / Math.pow(1024, unitIndex)
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'byte',
    unitDisplay: 'short',
    minimumFractionDigits: unitIndex === 0 ? 0 : decimalPlaces,
    maximumFractionDigits: unitIndex === 0 ? 0 : decimalPlaces,
  })

  return formatter.format(value).replace('byte', units[unitIndex])
}

export const dateToISOString = (date: Date): string => {
  return date.toISOString()
}

export const dateToISODate = (date: Date): string => {
  return date.toISOString().split('T')[0]!
}

export const stringToDate = (value: string): Date => {
  return new Date(value)
}

export const nullableStringToDate = (value: string | null): Date | null => {
  return value != null && value !== '' ? new Date(value) : null
}

export const nullableDateToISOString = (date: Date | null): string | null => {
  return date != null ? date.toISOString() : null
}

export const nullableDateToISODate = (date: Date | null): string | null => {
  return date != null ? date.toISOString().split('T')[0]! : null
}

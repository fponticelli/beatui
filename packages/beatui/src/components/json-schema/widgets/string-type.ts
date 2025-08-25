export type StringWidgetOptions = {
  pattern?: string
  minLength?: number
  maxLength?: number
}

export type TextAreaWidgetOptions = StringWidgetOptions & {
  format: 'textarea'
  rows?: number
}

export type EmailWidgetOptions = StringWidgetOptions & {
  format: 'email'
}

export type DateWidgetOptions = StringWidgetOptions & {
  format: 'date'
}

export type DateTimeWidgetOptions = StringWidgetOptions & {
  format: 'date-time'
}

export type TimeWidgetOptions = StringWidgetOptions & {
  format: 'time'
}

export type PasswordWidgetOptions = StringWidgetOptions & {
  format: 'password'
}

export type BinaryWidgetOptions = StringWidgetOptions & {
  format: 'binary'
  mediaType?: string
}

export type UUIDWidgetOptions = StringWidgetOptions & {
  format: 'uuid'
}

export type AnyStringWidgetOptions =
  | TextAreaWidgetOptions
  | EmailWidgetOptions
  | DateWidgetOptions
  | DateTimeWidgetOptions
  | TimeWidgetOptions
  | PasswordWidgetOptions
  | BinaryWidgetOptions
  | UUIDWidgetOptions

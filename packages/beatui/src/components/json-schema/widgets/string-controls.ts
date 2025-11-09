import {
  Controller,
  InputWrapperOptions,
  transformNullToUndefined,
  Control,
  MappedControl,
} from '../../form'
import { SchemaContext } from '../schema-context'
import { Renderable } from '@tempots/dom'
import { stringFormatDetection } from './string-detection'
import {
  NullableEmailInput,
  NullableDateInput,
  NullableDateTimeInput,
  NullablePasswordInput,
  NullableTextArea,
  NullableTextInput,
  NullableUUIDInput,
  NullableDurationInput,
  ColorSwatchInput,
  NullableUrlInput,
} from '../../form/input'
import { NullableBase64Input } from '../../form/input/nullable-base64-input'
import { WithTemporal } from '../../../temporal'

export function StringControl({
  ctx,
  options,
  controller,
}: {
  ctx: SchemaContext
  options: Partial<InputWrapperOptions>
  controller: Controller<string | undefined>
}): Renderable {
  const format = stringFormatDetection(ctx)
  switch (format?.format) {
    case 'email':
      return Control(NullableEmailInput, {
        ...options,
        controller: transformNullToUndefined(controller),
      })
    case 'date':
      return MappedControl(NullableDateInput, {
        ...options,
        controller: transformNullToUndefined(controller),
        toInput: v => (v == null ? null : new Date(v)),
        fromInput: (v: Date | null) => v?.toISOString().split('T')[0] ?? null,
      })
    case 'date-time':
      return MappedControl(NullableDateTimeInput, {
        ...options,
        controller: transformNullToUndefined(controller),
        toInput: v => (v == null ? null : new Date(v)),
        fromInput: (v: Date | null) => v?.toISOString() ?? null,
      })
    case 'time':
      // TODO: Implement time input
      return Control(NullableTextInput, {
        ...options,
        controller: transformNullToUndefined(controller),
        placeholder: 'HH:MM:SS',
      })
    case 'password':
      return Control(NullablePasswordInput, {
        ...options,
        controller: transformNullToUndefined(controller),
      })
    case 'binary': {
      const { definition } = ctx
      const xui =
        typeof definition === 'object'
          ? (definition['x:ui'] as Record<string, unknown> | undefined)
          : undefined

      // Check if this should be a file upload vs base64 text
      const shouldUseFileUpload =
        format.mediaType &&
        (format.mediaType.startsWith('image/') ||
          format.mediaType.startsWith('video/') ||
          format.mediaType.startsWith('audio/') ||
          format.mediaType === 'application/pdf' ||
          xui?.preferFileUpload === true)

      if (shouldUseFileUpload) {
        // Use Base64Input for file upload with base64 encoding
        return Control(NullableBase64Input, {
          ...options,
          controller: transformNullToUndefined(controller),
          mode: 'compact',
          accept: format.mediaType || '*/*',
          maxFileSize:
            (typeof xui?.maxBytes === 'number' ? xui.maxBytes : undefined) ||
            (typeof xui?.maxFileSize === 'number'
              ? xui.maxFileSize
              : undefined),
          showFileList: true,
        })
      }

      // For non-file binary data, use a text area for base64 content
      return Control(NullableTextArea, {
        ...options,
        controller: transformNullToUndefined(controller),
        placeholder: 'Paste base64-encoded data',
        rows: 3,
      })
    }
    case 'uri':
    case 'url':
      return Control(NullableUrlInput, {
        ...options,
        controller: transformNullToUndefined(controller),
        placeholder: 'https://example.com',
      })
    case 'uri-reference':
      return Control(NullableTextInput, {
        ...options,
        controller: transformNullToUndefined(controller),
        placeholder: 'Enter URL...',
      })
    case 'hostname':
      return Control(NullableTextInput, {
        ...options,
        controller: transformNullToUndefined(controller),
        placeholder: 'example.com',
      })
    case 'ipv4':
      return Control(NullableTextInput, {
        ...options,
        controller: transformNullToUndefined(controller),
        placeholder: '192.168.1.1',
      })
    case 'ipv6':
      return Control(NullableTextInput, {
        ...options,
        controller: transformNullToUndefined(controller),
        placeholder: '2001:db8::1',
      })
    case 'regex':
      return Control(NullableTextArea, {
        ...options,
        controller: transformNullToUndefined(controller),
        placeholder: '^[a-zA-Z0-9]+$',
        rows: 3,
      })
    case 'duration':
      return WithTemporal(({ Duration }) =>
        MappedControl(NullableDurationInput, {
          ...options,
          controller: transformNullToUndefined(controller),
          toInput: v => (v == null ? null : Duration.from(v)),
          fromInput: (v: unknown) =>
            (v as { toString?: () => string })?.toString?.() ?? null,
        })
      )
    case 'color':
      return Control(ColorSwatchInput, {
        ...options,
        controller,
        displayValue: true,
      })
    case 'uuid':
      return Control(NullableUUIDInput, {
        ...options,
        controller: transformNullToUndefined(controller),
      })
    case 'textarea':
      return Control(NullableTextArea, {
        ...options,
        controller: transformNullToUndefined(controller),
      })
    default:
      return Control(NullableTextInput, {
        ...options,
        controller: transformNullToUndefined(controller),
      })
  }
}

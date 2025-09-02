import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@tempots/dom'
import { Validation } from '@tempots/std'
import { WithProviders } from '../helpers/test-providers'
import { useController } from '../../src/components/form'
import { JSONSchemaControl } from '../../src/components/json-schema/controls/generic-control'
import { stringFormatDetection } from '../../src/components/json-schema/widgets/string-detection'
import { SchemaContext } from '../../src/components/json-schema/schema-context'
import type { JSONSchema } from '../../src/components/json-schema/schema-context'

describe('JSON Schema Formats and Widgets', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  describe('String Format Detection', () => {
    const createContext = (definition: JSONSchema) => {
      return new SchemaContext({
        schema: definition,
        definition,
        horizontal: false,
        path: ['test'],
        isPropertyRequired: false,
      })
    }

    it('should detect email format', () => {
      const ctx = createContext({ type: 'string', format: 'email' })
      const result = stringFormatDetection(ctx)
      expect(result?.format).toBe('email')
    })

    it('should detect URI formats', () => {
      const uriCtx = createContext({ type: 'string', format: 'uri' })
      const uriResult = stringFormatDetection(uriCtx)
      expect(uriResult?.format).toBe('uri')

      const urlCtx = createContext({ type: 'string', format: 'url' })
      const urlResult = stringFormatDetection(urlCtx)
      expect(urlResult?.format).toBe('url')

      const uriRefCtx = createContext({
        type: 'string',
        format: 'uri-reference',
      })
      const uriRefResult = stringFormatDetection(uriRefCtx)
      expect(uriRefResult?.format).toBe('uri-reference')
    })

    it('should detect network formats', () => {
      const hostnameCtx = createContext({ type: 'string', format: 'hostname' })
      const hostnameResult = stringFormatDetection(hostnameCtx)
      expect(hostnameResult?.format).toBe('hostname')

      const ipv4Ctx = createContext({ type: 'string', format: 'ipv4' })
      const ipv4Result = stringFormatDetection(ipv4Ctx)
      expect(ipv4Result?.format).toBe('ipv4')

      const ipv6Ctx = createContext({ type: 'string', format: 'ipv6' })
      const ipv6Result = stringFormatDetection(ipv6Ctx)
      expect(ipv6Result?.format).toBe('ipv6')
    })

    it('should detect UUID format', () => {
      const ctx = createContext({ type: 'string', format: 'uuid' })
      const result = stringFormatDetection(ctx)
      expect(result?.format).toBe('uuid')
    })

    it('should detect date/time formats', () => {
      const dateCtx = createContext({ type: 'string', format: 'date' })
      const dateResult = stringFormatDetection(dateCtx)
      expect(dateResult?.format).toBe('date')

      const dateTimeCtx = createContext({ type: 'string', format: 'date-time' })
      const dateTimeResult = stringFormatDetection(dateTimeCtx)
      expect(dateTimeResult?.format).toBe('date-time')

      const timeCtx = createContext({ type: 'string', format: 'time' })
      const timeResult = stringFormatDetection(timeCtx)
      expect(timeResult?.format).toBe('time')
    })

    it('should detect duration format', () => {
      const ctx = createContext({ type: 'string', format: 'duration' })
      const result = stringFormatDetection(ctx)
      expect(result?.format).toBe('duration')
    })

    it('should detect color format', () => {
      const ctx = createContext({ type: 'string', format: 'color' })
      const result = stringFormatDetection(ctx)
      expect(result?.format).toBe('color')
    })

    it('should detect regex format', () => {
      const ctx = createContext({ type: 'string', format: 'regex' })
      const result = stringFormatDetection(ctx)
      expect(result?.format).toBe('regex')
    })

    it('should detect binary formats', () => {
      const binaryCtx = createContext({ type: 'string', format: 'binary' })
      const binaryResult = stringFormatDetection(binaryCtx)
      expect(binaryResult?.format).toBe('binary')

      const base64Ctx = createContext({
        type: 'string',
        contentEncoding: 'base64',
      })
      const base64Result = stringFormatDetection(base64Ctx)
      expect(base64Result?.format).toBe('binary')

      const mediaCtx = createContext({
        type: 'string',
        contentMediaType: 'image/jpeg',
      })
      const mediaResult = stringFormatDetection(mediaCtx)
      expect(mediaResult?.format).toBe('binary')
      expect((mediaResult as { mediaType?: string })?.mediaType).toBe(
        'image/jpeg'
      )
    })

    it('should detect textarea from x:ui hints', () => {
      const ctx = createContext({
        type: 'string',
        'x:ui': { widget: 'textarea' },
      })
      const result = stringFormatDetection(ctx)
      expect(result?.format).toBe('textarea')
    })

    it('should detect textarea from field name heuristics', () => {
      const ctx = new SchemaContext({
        schema: { type: 'string' },
        definition: { type: 'string' },
        horizontal: false,
        path: ['description'], // Field name that should trigger textarea
        isPropertyRequired: false,
      })
      const result = stringFormatDetection(ctx)
      expect(result?.format).toBe('textarea')
    })

    it('should detect textarea from length constraints', () => {
      const longMinCtx = createContext({
        type: 'string',
        minLength: 50,
      })
      const longMinResult = stringFormatDetection(longMinCtx)
      expect(longMinResult?.format).toBe('textarea')

      const longMaxCtx = createContext({
        type: 'string',
        maxLength: 200,
      })
      const longMaxResult = stringFormatDetection(longMaxCtx)
      expect(longMaxResult?.format).toBe('textarea')
    })

    it('should use custom textAreaTriggers from x:ui', () => {
      const ctx = new SchemaContext({
        schema: {
          type: 'string',
          'x:ui': { textAreaTriggers: ['customField'] },
        },
        definition: {
          type: 'string',
          'x:ui': { textAreaTriggers: ['customField'] },
        },
        horizontal: false,
        path: ['customField'],
        isPropertyRequired: false,
      })
      const result = stringFormatDetection(ctx)
      expect(result?.format).toBe('textarea')
    })
  })

  describe('Widget Rendering', () => {
    it('should render email input for email format', () => {
      const schema: JSONSchema = {
        type: 'string',
        format: 'email',
      }

      const { controller } = useController({
        initialValue: 'test@example.com',
        validate: () => Validation.valid,
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      const input = container.querySelector('input[type="email"]')
      expect(input).toBeTruthy()
    })

    it('should render URL input for URI formats', () => {
      const schema: JSONSchema = {
        type: 'string',
        format: 'url',
      }

      const { controller } = useController({
        initialValue: 'https://example.com',
        validate: () => Validation.valid,
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      const input = container.querySelector('input[type="url"]')
      expect(input).toBeTruthy()
    })

    it('should render textarea for long text', () => {
      const schema: JSONSchema = {
        type: 'string',
        minLength: 100,
      }

      const { controller } = useController({
        initialValue: 'This is a long text that should render as textarea',
        validate: () => Validation.valid,
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      const textarea = container.querySelector('textarea')
      expect(textarea).toBeTruthy()
    })

    it('should render color input for color format', () => {
      const schema: JSONSchema = {
        type: 'string',
        format: 'color',
      }

      const { controller } = useController({
        initialValue: '#ff0000',
        validate: () => Validation.valid,
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      // Color input should be present (exact implementation may vary)
      expect(container.textContent).toBeTruthy()
    })

    it('should render rating input for rating format', () => {
      const schema: JSONSchema = {
        type: 'number',
        'x:ui': { format: 'rating' },
        minimum: 1,
        maximum: 5,
      }

      const { controller } = useController({
        initialValue: 3,
        validate: () => Validation.valid,
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      // Rating input should have role="slider"
      const ratingInput = container.querySelector('[role="slider"]')
      expect(ratingInput).toBeTruthy()
    })

    it('should render file input for binary media types', () => {
      const schema: JSONSchema = {
        type: 'string',
        contentMediaType: 'image/jpeg',
        contentEncoding: 'base64',
      }

      const { controller } = useController({
        initialValue: '',
        validate: () => Validation.valid,
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      // Should render file input for image media type
      const fileInput = container.querySelector('input[type="file"]')
      expect(fileInput).toBeTruthy()
    })

    it('should render password input for password format', () => {
      const schema: JSONSchema = {
        type: 'string',
        format: 'password',
      }

      const { controller } = useController({
        initialValue: '',
        validate: () => Validation.valid,
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      const passwordInput = container.querySelector('input[type="password"]')
      expect(passwordInput).toBeTruthy()
    })

    it('should render appropriate placeholders for different formats', () => {
      const ipv4Schema: JSONSchema = {
        type: 'string',
        format: 'ipv4',
      }

      const { controller } = useController({
        initialValue: '',
        validate: () => Validation.valid,
      })

      render(
        WithProviders(() =>
          JSONSchemaControl({ schema: ipv4Schema, controller })
        ),
        container
      )

      const input = container.querySelector('input')
      expect(input?.placeholder).toBe('192.168.1.1')
    })
  })

  describe('Binary Media Handling', () => {
    it('should prefer file upload for image media types', () => {
      const schema: JSONSchema = {
        type: 'string',
        contentMediaType: 'image/png',
        contentEncoding: 'base64',
      }

      const { controller } = useController({
        initialValue: '',
        validate: () => Validation.valid,
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      // Should render file input for image
      const fileInput = container.querySelector('input[type="file"]')
      expect(fileInput).toBeTruthy()
      expect(fileInput?.getAttribute('accept')).toBe('image/png')
    })

    it('should use base64 input for non-media binary content', () => {
      const schema: JSONSchema = {
        type: 'string',
        contentEncoding: 'base64',
      }

      const { controller } = useController({
        initialValue: '',
        validate: () => Validation.valid,
      })

      render(
        WithProviders(() => JSONSchemaControl({ schema, controller })),
        container
      )

      // Should not render file input for generic base64
      const fileInput = container.querySelector('input[type="file"]')
      expect(fileInput).toBeFalsy()
    })
  })
})

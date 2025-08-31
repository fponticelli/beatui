export default {
  type: 'object',
  title: 'Formats & Media',
  description:
    'Covers common string formats and binary/media handling via contentMediaType/contentEncoding.',
  properties: {
    email: { type: 'string', format: 'email', title: 'Email' },
    homepage: { type: 'string', format: 'uri', title: 'Homepage' },
    id: { type: 'string', format: 'uuid', title: 'UUID' },
    createdAt: { type: 'string', format: 'date-time', title: 'Created At' },
    startTime: { type: 'string', format: 'time', title: 'Start Time' },
    duration: { type: 'string', format: 'duration', title: 'Duration' },
    favoriteColor: { type: 'string', format: 'color', title: 'Favorite Color' },

    // Binary upload (raw)
    avatar: {
      type: 'string',
      title: 'Avatar (binary)',
      format: 'binary',
      contentMediaType: 'image/png',
      description: 'PNG image file',
    },

    // Base64-encoded content
    attachment: {
      type: 'string',
      title: 'Attachment (base64)',
      contentEncoding: 'base64',
      contentMediaType: 'application/pdf',
      description: 'PDF encoded in base64',
    },
  },
  required: ['email', 'id'],
  additionalProperties: false,
}

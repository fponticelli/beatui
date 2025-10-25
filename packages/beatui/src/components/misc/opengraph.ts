import {
  Portal,
  Renderable,
  Value,
  attr,
  html,
  ForEach,
  When,
  coalesce,
} from '@tempots/dom'

/**
 * OpenGraph meta tag options for social media sharing and SEO.
 * All properties are optional and support reactive Values.
 */
export type OpenGraphOptions = {
  // Basic OpenGraph properties
  /** The title of your object as it should appear within the graph */
  title?: Value<string>
  /** The type of your object, e.g., "website", "article", "video.movie" */
  type?: Value<string>
  /** The canonical URL of your object that will be used as its permanent ID in the graph */
  url?: Value<string>
  /** An image URL which should represent your object within the graph */
  image?: Value<string>
  /** A one to two sentence description of your object */
  description?: Value<string>
  /** The name of the overall site */
  siteName?: Value<string>
  /** The locale these tags are marked up in. Format: language_TERRITORY (default: en_US) */
  locale?: Value<string>
  /** An array of other locales this page is available in */
  localeAlternate?: Value<string[]>

  // Image properties
  /** A description of what is in the image (not a caption) */
  imageAlt?: Value<string>
  /** The width of the image in pixels */
  imageWidth?: Value<number>
  /** The height of the image in pixels */
  imageHeight?: Value<number>
  /** The MIME type of the image */
  imageType?: Value<string>
  /** An array of additional image URLs */
  images?: Value<string[]>

  // Video properties
  /** A URL to a video file that complements this object */
  video?: Value<string>
  /** The MIME type of the video */
  videoType?: Value<string>
  /** The width of the video in pixels */
  videoWidth?: Value<number>
  /** The height of the video in pixels */
  videoHeight?: Value<number>
  /** A URL to a video file that complements this object (secure URL) */
  videoSecureUrl?: Value<string>

  // Audio properties
  /** A URL to an audio file to accompany this object */
  audio?: Value<string>
  /** The MIME type of the audio */
  audioType?: Value<string>
  /** A URL to an audio file to accompany this object (secure URL) */
  audioSecureUrl?: Value<string>

  // Article properties (when type is "article")
  /** When the article was first published (ISO 8601) */
  publishedTime?: Value<string>
  /** When the article was last changed (ISO 8601) */
  modifiedTime?: Value<string>
  /** When the article is out of date after (ISO 8601) */
  expirationTime?: Value<string>
  /** Writers of the article */
  author?: Value<string | string[]>
  /** A high-level section name */
  section?: Value<string>
  /** Tag words associated with this article */
  tags?: Value<string[]>

  // Profile properties (when type is "profile")
  /** A person's first name */
  firstName?: Value<string>
  /** A person's last name */
  lastName?: Value<string>
  /** A person's username */
  username?: Value<string>
  /** A person's gender */
  gender?: Value<string>

  // Twitter Card properties
  /** The card type: "summary", "summary_large_image", "app", or "player" */
  twitterCard?: Value<string>
  /** @username of website */
  twitterSite?: Value<string>
  /** @username of content creator */
  twitterCreator?: Value<string>
  /** Title for Twitter (falls back to og:title if not provided) */
  twitterTitle?: Value<string>
  /** Description for Twitter (falls back to og:description if not provided) */
  twitterDescription?: Value<string>
  /** Image URL for Twitter (falls back to og:image if not provided) */
  twitterImage?: Value<string>
  /** Alt text for Twitter image */
  twitterImageAlt?: Value<string>

  // Additional meta tags
  /** Canonical URL for SEO */
  canonical?: Value<string>
  /** Robots meta tag */
  robots?: Value<string>
  /** Keywords for SEO */
  keywords?: Value<string>
  /** Author meta tag */
  metaAuthor?: Value<string>
}

/**
 * Helper to create a single meta tag with reactive content
 */
function MetaName<T>(
  name: string,
  content: Value<T> | undefined
): Renderable | null {
  if (content == null) return null
  return html.meta(
    attr.name(name),
    attr.content(Value.map(content, v => String(v)))
  )
}

function MetaProp<T>(
  name: string,
  content: Value<T> | undefined
): Renderable | null {
  if (content == null) return null
  return html.meta(
    attr.property(name),
    attr.content(Value.map(content, v => String(v)))
  )
}

/**
 * Helper to create multiple meta tags from an array of values
 */
function MetaProps(
  name: string,
  content: Value<string[]> | undefined
): Renderable | null {
  if (content == null) return null
  return ForEach(content, v => MetaProp(name, v))
}

/**
 * Helper to create meta tags from a value that can be either a single value or an array
 */
function MetaPropOrProps(
  name: string | null,
  content: Value<string | string[]> | undefined
): Renderable | null {
  if (content == null) return null

  return When(
    Value.map(content, v => Array.isArray(v)),
    () => MetaProps(name!, content as Value<string[]>),
    () => MetaProp(name!, content as Value<string>)
  )
}

/**
 * OpenGraph component that injects OpenGraph and Twitter Card meta tags into <head> via Portal.
 * Supports comprehensive social media metadata for optimal sharing on platforms like Facebook,
 * Twitter, LinkedIn, and more.
 *
 * @example
 * ```typescript
 * OpenGraph({
 *   title: 'My Awesome Page',
 *   description: 'This is a description of my page',
 *   image: 'https://example.com/image.jpg',
 *   url: 'https://example.com/page',
 *   type: 'article',
 *   siteName: 'My Site',
 *   twitterCard: 'summary_large_image',
 *   twitterSite: '@mysite',
 * })
 * ```
 */
export const OpenGraph = (options: OpenGraphOptions): Renderable => {
  const tags: (Renderable | Renderable[] | null)[] = []

  // Basic OpenGraph tags
  tags.push(MetaProp('og:title', options.title))
  tags.push(MetaProp('og:type', options.type))
  tags.push(MetaProp('og:url', options.url))
  tags.push(MetaProp('og:image', options.image))
  tags.push(MetaProp('og:description', options.description))
  tags.push(MetaProp('og:site_name', options.siteName))
  tags.push(MetaProp('og:locale', options.locale))

  // Locale alternates (array)
  if (options.localeAlternate != null) {
    const localeTags = MetaProps('og:locale:alternate', options.localeAlternate)
    if (localeTags != null) {
      tags.push(localeTags)
    }
  }

  // Image properties
  tags.push(MetaProp('og:image:alt', options.imageAlt))
  tags.push(MetaProp('og:image:width', options.imageWidth))
  tags.push(MetaProp('og:image:height', options.imageHeight))
  tags.push(MetaProp('og:image:type', options.imageType))

  // Additional images (array)
  if (options.images != null) {
    const imageTags = MetaProps('og:image', options.images)
    if (imageTags != null) {
      tags.push(imageTags)
    }
  }

  // Video properties
  tags.push(MetaProp('og:video', options.video))
  tags.push(MetaProp('og:video:type', options.videoType))
  tags.push(MetaProp('og:video:width', options.videoWidth))
  tags.push(MetaProp('og:video:height', options.videoHeight))
  tags.push(MetaProp('og:video:secure_url', options.videoSecureUrl))

  // Audio properties
  tags.push(MetaProp('og:audio', options.audio))
  tags.push(MetaProp('og:audio:type', options.audioType))
  tags.push(MetaProp('og:audio:secure_url', options.audioSecureUrl))

  // Article properties
  tags.push(MetaProp('article:published_time', options.publishedTime))
  tags.push(MetaProp('article:modified_time', options.modifiedTime))
  tags.push(MetaProp('article:expiration_time', options.expirationTime))
  // Author can be string or array
  tags.push(MetaPropOrProps('article:author', options.author))
  tags.push(MetaProp('article:section', options.section))
  // Tags is always an array
  if (options.tags != null) {
    const tagTags = MetaProps('article:tag', options.tags)
    if (tagTags != null) {
      tags.push(tagTags)
    }
  }

  // Profile properties
  tags.push(MetaProp('profile:first_name', options.firstName))
  tags.push(MetaProp('profile:last_name', options.lastName))
  tags.push(MetaProp('profile:username', options.username))
  tags.push(MetaProp('profile:gender', options.gender))

  // Twitter Card tags with fallbacks to OpenGraph tags
  tags.push(MetaName('twitter:card', options.twitterCard))
  tags.push(MetaName('twitter:site', options.twitterSite))
  tags.push(MetaName('twitter:creator', options.twitterCreator))
  // Twitter title falls back to og:title
  tags.push(
    MetaName('twitter:title', coalesce(options.twitterTitle, options.title))
  )
  // Twitter description falls back to og:description
  tags.push(
    MetaName(
      'twitter:description',
      coalesce(options.twitterDescription, options.description)
    )
  )
  // Twitter image falls back to og:image
  tags.push(
    MetaName('twitter:image', coalesce(options.twitterImage, options.image))
  )
  // Twitter image alt falls back to og:image:alt
  tags.push(
    MetaName(
      'twitter:image:alt',
      coalesce(options.twitterImageAlt, options.imageAlt)
    )
  )

  // Additional SEO meta tags
  if (options.canonical != null) {
    const canonicalUrl = Value.get(options.canonical)
    if (canonicalUrl != null) {
      tags.push(html.link(attr.rel('canonical'), attr.href(options.canonical)))
    }
  }

  tags.push(MetaName('robots', options.robots))
  tags.push(MetaName('keywords', options.keywords))
  tags.push(MetaName('author', options.metaAuthor))

  // Filter out null values, flatten arrays, and wrap in Portal
  return Portal('head', tags.filter(tag => tag != null).flat())
}

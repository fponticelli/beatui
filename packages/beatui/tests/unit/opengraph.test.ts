import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { OpenGraph } from '@/components/misc/opengraph'

describe('OpenGraph', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    container.remove()
    // Clean up meta tags added to head
    document
      .querySelectorAll('meta[property^="og:"]')
      .forEach(el => el.remove())
    document
      .querySelectorAll('meta[name^="twitter:"]')
      .forEach(el => el.remove())
    document.querySelectorAll('meta[name="robots"]').forEach(el => el.remove())
    document
      .querySelectorAll('meta[name="keywords"]')
      .forEach(el => el.remove())
    document.querySelectorAll('meta[name="author"]').forEach(el => el.remove())
    document
      .querySelectorAll('link[rel="canonical"]')
      .forEach(el => el.remove())
  })

  it('should inject basic OpenGraph meta tags into head', () => {
    render(
      OpenGraph({
        title: 'Test Title',
        description: 'Test Description',
        url: 'https://example.com',
        image: 'https://example.com/image.jpg',
      }),
      container
    )

    expect(
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute('content')
    ).toBe('Test Title')
    expect(
      document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute('content')
    ).toBe('Test Description')
    expect(
      document.querySelector('meta[property="og:url"]')?.getAttribute('content')
    ).toBe('https://example.com')
    expect(
      document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute('content')
    ).toBe('https://example.com/image.jpg')
  })

  it('should inject article-specific meta tags', () => {
    render(
      OpenGraph({
        type: 'article',
        publishedTime: '2024-01-01T00:00:00Z',
        modifiedTime: '2024-01-02T00:00:00Z',
        author: 'John Doe',
        section: 'Technology',
        tags: ['javascript', 'typescript', 'web'],
      }),
      container
    )

    expect(
      document
        .querySelector('meta[property="og:type"]')
        ?.getAttribute('content')
    ).toBe('article')
    expect(
      document
        .querySelector('meta[property="article:published_time"]')
        ?.getAttribute('content')
    ).toBe('2024-01-01T00:00:00Z')
    expect(
      document
        .querySelector('meta[property="article:modified_time"]')
        ?.getAttribute('content')
    ).toBe('2024-01-02T00:00:00Z')
    expect(
      document
        .querySelector('meta[property="article:author"]')
        ?.getAttribute('content')
    ).toBe('John Doe')
    expect(
      document
        .querySelector('meta[property="article:section"]')
        ?.getAttribute('content')
    ).toBe('Technology')

    // Check tags (should create multiple meta tags)
    const tagElements = document.querySelectorAll(
      'meta[property="article:tag"]'
    )
    expect(tagElements.length).toBe(3)
    expect(tagElements[0]?.getAttribute('content')).toBe('javascript')
    expect(tagElements[1]?.getAttribute('content')).toBe('typescript')
    expect(tagElements[2]?.getAttribute('content')).toBe('web')
  })

  it('should inject Twitter Card meta tags', () => {
    render(
      OpenGraph({
        twitterCard: 'summary_large_image',
        twitterSite: '@example',
        twitterCreator: '@creator',
        twitterTitle: 'Twitter Title',
        twitterDescription: 'Twitter Description',
        twitterImage: 'https://example.com/twitter-image.jpg',
        twitterImageAlt: 'Twitter Image Alt',
      }),
      container
    )

    expect(
      document
        .querySelector('meta[name="twitter:card"]')
        ?.getAttribute('content')
    ).toBe('summary_large_image')
    expect(
      document
        .querySelector('meta[name="twitter:site"]')
        ?.getAttribute('content')
    ).toBe('@example')
    expect(
      document
        .querySelector('meta[name="twitter:creator"]')
        ?.getAttribute('content')
    ).toBe('@creator')
    expect(
      document
        .querySelector('meta[name="twitter:title"]')
        ?.getAttribute('content')
    ).toBe('Twitter Title')
    expect(
      document
        .querySelector('meta[name="twitter:description"]')
        ?.getAttribute('content')
    ).toBe('Twitter Description')
    expect(
      document
        .querySelector('meta[name="twitter:image"]')
        ?.getAttribute('content')
    ).toBe('https://example.com/twitter-image.jpg')
    expect(
      document
        .querySelector('meta[name="twitter:image:alt"]')
        ?.getAttribute('content')
    ).toBe('Twitter Image Alt')
  })

  it('should inject image properties', () => {
    render(
      OpenGraph({
        image: 'https://example.com/image.jpg',
        imageAlt: 'Image description',
        imageWidth: 1200,
        imageHeight: 630,
        imageType: 'image/jpeg',
      }),
      container
    )

    expect(
      document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute('content')
    ).toBe('https://example.com/image.jpg')
    expect(
      document
        .querySelector('meta[property="og:image:alt"]')
        ?.getAttribute('content')
    ).toBe('Image description')
    expect(
      document
        .querySelector('meta[property="og:image:width"]')
        ?.getAttribute('content')
    ).toBe('1200')
    expect(
      document
        .querySelector('meta[property="og:image:height"]')
        ?.getAttribute('content')
    ).toBe('630')
    expect(
      document
        .querySelector('meta[property="og:image:type"]')
        ?.getAttribute('content')
    ).toBe('image/jpeg')
  })

  it('should inject video properties', () => {
    render(
      OpenGraph({
        video: 'https://example.com/video.mp4',
        videoType: 'video/mp4',
        videoWidth: 1920,
        videoHeight: 1080,
        videoSecureUrl: 'https://example.com/video-secure.mp4',
      }),
      container
    )

    expect(
      document
        .querySelector('meta[property="og:video"]')
        ?.getAttribute('content')
    ).toBe('https://example.com/video.mp4')
    expect(
      document
        .querySelector('meta[property="og:video:type"]')
        ?.getAttribute('content')
    ).toBe('video/mp4')
    expect(
      document
        .querySelector('meta[property="og:video:width"]')
        ?.getAttribute('content')
    ).toBe('1920')
    expect(
      document
        .querySelector('meta[property="og:video:height"]')
        ?.getAttribute('content')
    ).toBe('1080')
    expect(
      document
        .querySelector('meta[property="og:video:secure_url"]')
        ?.getAttribute('content')
    ).toBe('https://example.com/video-secure.mp4')
  })

  it('should inject canonical link', () => {
    render(
      OpenGraph({
        canonical: 'https://example.com/canonical',
      }),
      container
    )

    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute('href')
    ).toBe('https://example.com/canonical')
  })

  it('should inject SEO meta tags', () => {
    render(
      OpenGraph({
        robots: 'index, follow',
        keywords: 'javascript, typescript, web development',
        metaAuthor: 'John Doe',
      }),
      container
    )

    expect(
      document.querySelector('meta[name="robots"]')?.getAttribute('content')
    ).toBe('index, follow')
    expect(
      document.querySelector('meta[name="keywords"]')?.getAttribute('content')
    ).toBe('javascript, typescript, web development')
    expect(
      document.querySelector('meta[name="author"]')?.getAttribute('content')
    ).toBe('John Doe')
  })

  it('should support reactive values', () => {
    const title = prop('Initial Title')
    const description = prop('Initial Description')

    render(
      OpenGraph({
        title,
        description,
      }),
      container
    )

    expect(
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute('content')
    ).toBe('Initial Title')
    expect(
      document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute('content')
    ).toBe('Initial Description')

    // Update reactive values
    title.value = 'Updated Title'
    description.value = 'Updated Description'

    expect(
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute('content')
    ).toBe('Updated Title')
    expect(
      document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute('content')
    ).toBe('Updated Description')
  })

  it('should handle multiple images', () => {
    render(
      OpenGraph({
        images: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
          'https://example.com/image3.jpg',
        ],
      }),
      container
    )

    const imageElements = document.querySelectorAll('meta[property="og:image"]')
    expect(imageElements.length).toBe(3)
    expect(imageElements[0]?.getAttribute('content')).toBe(
      'https://example.com/image1.jpg'
    )
    expect(imageElements[1]?.getAttribute('content')).toBe(
      'https://example.com/image2.jpg'
    )
    expect(imageElements[2]?.getAttribute('content')).toBe(
      'https://example.com/image3.jpg'
    )
  })

  it('should handle profile properties', () => {
    render(
      OpenGraph({
        type: 'profile',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        gender: 'male',
      }),
      container
    )

    expect(
      document
        .querySelector('meta[property="og:type"]')
        ?.getAttribute('content')
    ).toBe('profile')
    expect(
      document
        .querySelector('meta[property="profile:first_name"]')
        ?.getAttribute('content')
    ).toBe('John')
    expect(
      document
        .querySelector('meta[property="profile:last_name"]')
        ?.getAttribute('content')
    ).toBe('Doe')
    expect(
      document
        .querySelector('meta[property="profile:username"]')
        ?.getAttribute('content')
    ).toBe('johndoe')
    expect(
      document
        .querySelector('meta[property="profile:gender"]')
        ?.getAttribute('content')
    ).toBe('male')
  })
})

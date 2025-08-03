import * as fsp from 'fs/promises'
import * as fse from 'fs-extra'
import * as path from 'path'
import { runHeadless } from '@tempots/dom'
import * as cheerio from 'cheerio'

/**
 * Comprehensive static site generator for BeatUI documentation
 * Uses runHeadless for server-side rendering and crawls all internal links
 */

const BASE_URL = 'https://beatui.dev'

// Mock browser APIs for server-side rendering
const setupBrowserMocks = () => {
  // Mock indexedDB
  global.indexedDB = {
    open: () => ({
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: {
        objectStoreNames: { contains: () => false },
        createObjectStore: () => ({}),
        transaction: () => ({
          objectStore: () => ({
            get: () => ({ onsuccess: null, onerror: null }),
            put: () => ({ onsuccess: null, onerror: null }),
          }),
        }),
      },
    }),
  } as unknown as IDBFactory

  // Mock localStorage
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  } as Storage

  // Mock sessionStorage
  global.sessionStorage = global.localStorage

  // Mock window.matchMedia
  global.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList

  // Mock IntersectionObserver
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver

  // Mock ResizeObserver
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

const main = async () => {
  console.log('🚀 Starting comprehensive static site generation...')

  // Set up browser mocks before importing any components
  setupBrowserMocks()

  // Import components for SSG
  const { html, attr } = await import('@tempots/dom')
  const { BeatUI } = await import('@tempots/beatui')
  const { HomePage } = await import('../src/pages/home')
  const { ButtonPage } = await import('../src/pages/button')
  const { SwitchPage } = await import('../src/pages/switch')
  const { IconPage } = await import('../src/pages/icon')
  const { LinkPage } = await import('../src/pages/link')
  const { SegmentedControlPage } = await import(
    '../src/pages/segmented-control'
  )
  const { TagsPage } = await import('../src/pages/tags')
  // const { FormPage } = await import('../src/pages/form')
  const { EditableTextPage } = await import('../src/pages/editable-text')
  const { BreakpointPage } = await import('../src/pages/breakpoint')
  const { CollapsePage } = await import('../src/pages/collapse')
  const { SidebarPage } = await import('../src/pages/sidebar')
  const { ModalPage } = await import('../src/pages/modal')
  const { DrawerPage } = await import('../src/pages/drawer')
  // const { TooltipPage } = await import('../src/pages/tooltip')
  const { ScrollablePanelPage } = await import('../src/pages/scrollable-panel')
  const { FlyoutPage } = await import('../src/pages/flyout')
  const { TooltipPage } = await import('../src/pages/tooltip')
  const { RTLLTRPage } = await import('../src/pages/rtl-ltr')
  const { FormPage } = await import('../src/pages/form')

  // Load HTML template
  const htmlTemplate = (async () => {
    const htmlPath = path.resolve(process.cwd(), './dist/index.html')
    const html = await fsp.readFile(htmlPath, 'utf-8')
    return html
  })()

  // Create a poller to handle async operations during rendering
  const makePoller = (delay: number = 0, initialWait: number = 10) => {
    let fetchCount = 0
    let outerResolve: () => void
    const done = new Promise<void>(resolve => {
      outerResolve = resolve
    })
    const initialTimer = setTimeout(() => {
      // Resolve if there are no outstanding fetches
      if (fetchCount === 0) {
        outerResolve()
      }
    }, initialWait)

    const start = () => {
      clearTimeout(initialTimer)
      fetchCount++
    }

    const end = () => {
      fetchCount--
      if (fetchCount > 0) {
        return
      }
      setTimeout(outerResolve, delay)
    }

    return { start, end, done }
  }

  // Render a single page using runHeadless
  const renderPage = async (pageUrl: string): Promise<string> => {
    const url = `${BASE_URL}${pageUrl}`
    console.log(`📄 Rendering page: ${pageUrl}`)

    try {
      const $ = cheerio.load(await htmlTemplate)
      const { start, end, done } = makePoller()

      // Mock fetch for local assets
      const makeFetch = (originalFetch: typeof fetch) => {
        return async (input: RequestInfo | URL, init?: RequestInit) => {
          start()
          if (typeof input === 'string' && input.startsWith('/')) {
            try {
              const file = await fsp.readFile(
                path.resolve(process.cwd(), `./dist${input}`),
                'utf-8'
              )
              return new Response(file, { status: 200 })
            } catch (_error) {
              console.warn(`⚠️  Asset not found: ${input}`)
              return new Response('Not found', { status: 404 })
            } finally {
              end()
            }
          }
          return originalFetch(`${BASE_URL}${input}`, init).finally(end)
        }
      }

      const originalFetch = global.fetch
      global.fetch = makeFetch(originalFetch)

      // Create SSG-compatible app that bypasses AppShell
      const createSSGApp = (pageUrl: string) => {
        // Map URLs to page components (matches original App.ts routes)
        const pageMap: Record<string, () => ReturnType<typeof html.div>> = {
          '/': HomePage,
          '/button': ButtonPage,
          '/switch': SwitchPage,
          '/collapse': CollapsePage,
          '/icon': IconPage,
          '/link': LinkPage,
          '/modal': ModalPage,
          '/drawer': DrawerPage,
          '/tooltip': TooltipPage,
          '/flyout': FlyoutPage,
          '/scrollable-panel': ScrollablePanelPage,
          '/rtl-ltr': RTLLTRPage,
          '/segmented-control': SegmentedControlPage,
          '/sidebar': SidebarPage,
          '/tags': TagsPage,
          // Temporarily disable form page due to SSR issues
          '/form': FormPage,
          '/editable-text': EditableTextPage,
          '/breakpoint': BreakpointPage,
        }

        const PageComponent = pageMap[pageUrl] || (() => html.div('Not Found'))

        // Create a simple layout that works in headless environment using BeatUI
        return BeatUI(
          {
            includeAuthI18n: true,
          },
          html.div(
            // Simple layout structure without AppShell
            html.header(
              html.h1('BeatUI Documentation'),
              html.nav(
                html.a(attr.href('/'), 'Home'),
                html.a(attr.href('/button'), 'Button'),
                html.a(attr.href('/switch'), 'Switch'),
                html.a(attr.href('/collapse'), 'Collapse'),
                html.a(attr.href('/icon'), 'Icon'),
                html.a(attr.href('/link'), 'Link'),
                html.a(attr.href('/modal'), 'Modal'),
                html.a(attr.href('/drawer'), 'Drawer'),
                html.a(attr.href('/tooltip'), 'Tooltip'),
                html.a(attr.href('/segmented-control'), 'Segmented Control'),
                html.a(attr.href('/sidebar'), 'Sidebar'),
                html.a(attr.href('/tags'), 'Tags'),
                html.a(attr.href('/form'), 'Form'),
                html.a(attr.href('/editable-text'), 'Editable Text'),
                html.a(attr.href('/breakpoint'), 'Breakpoint')
              )
            ),
            html.main(PageComponent())
          )
        )
      }

      // Create and render the app using runHeadless
      const { root } = runHeadless(() => createSSGApp(pageUrl), {
        selector: 'body', // Use body as the root selector
        startUrl: url,
      })
      await done

      // Get the rendered content from the body portal
      const portals = root.getPortals()

      // Find the body portal which should contain our app content
      const bodyPortal = portals.find(p => p.selector === 'body')

      if (
        bodyPortal &&
        (bodyPortal.hasChildren() || bodyPortal.hasInnerHTML())
      ) {
        // Extract the app content and inject it into the #app element
        const appElement = $('#app')
        if (appElement.length > 0) {
          if (bodyPortal.hasInnerHTML()) {
            appElement.html(bodyPortal.getInnerHTML())
          } else if (bodyPortal.hasChildren()) {
            appElement.html(bodyPortal.contentToHTML())
          }
        }
      }

      // Process other portals (excluding body since we handled it specially)
      portals.forEach(p => {
        if (p.selector === ':root') {
          $('body').prepend(p.contentToHTML())
        } else if (
          p.selector !== 'body' &&
          (p.hasRenderableProperties() ||
            p.hasChildren() ||
            p.hasInnerHTML() ||
            p.hasInnerText())
        ) {
          const elements = $(p.selector as string)
          if (elements.length > 0) {
            if (p.hasInnerHTML()) {
              elements.html(p.getInnerHTML())
            }
            if (p.hasInnerText()) {
              elements.text(p.getInnerText())
            }
            if (p.hasChildren()) {
              elements.append(p.contentToHTML())
            }
            if (p.hasClasses()) {
              elements.addClass(p.getClasses().join(' '))
            }
            if (p.hasStyles()) {
              const styles = p.getStyles()
              Object.entries(styles).forEach(([key, value]) => {
                elements.css(key, String(value))
              })
            }
            if (p.hasAttributes()) {
              const attrs = Object.fromEntries(p.getAttributes())
              Object.entries(attrs).forEach(([key, value]) => {
                elements.attr(key, String(value))
              })
            }
          }
        }
      })

      global.fetch = originalFetch

      // Add enhanced SEO meta tags
      const seoMeta = `
  <meta name="description" content="BeatUI - Modern TypeScript UI Component Library with design tokens and layered CSS architecture">
  <meta name="keywords" content="typescript, ui components, design tokens, css architecture, vite, dom manipulation">
  <meta name="author" content="Franco Ponticelli">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${BASE_URL}${pageUrl}">
  <meta property="og:title" content="BeatUI - Modern TypeScript UI Components">
  <meta property="og:description" content="Build beautiful, accessible interfaces with TypeScript-first design tokens and layered CSS architecture">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:site" content="@beatui_dev">
  <meta property="twitter:url" content="${BASE_URL}${pageUrl}">
  <meta property="twitter:title" content="BeatUI - Modern TypeScript UI Components">
  <meta property="twitter:image" content="https://beatui.dev/beatui.png">
  <meta property="twitter:description" content="Build beautiful, accessible interfaces with TypeScript-first design tokens and layered CSS architecture">

  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "BeatUI",
    "description": "Modern TypeScript UI Component Library",
    "url": "${BASE_URL}",
    "author": {
      "@type": "Person",
      "name": "Franco Ponticelli"
    },
    "programmingLanguage": "TypeScript",
    "operatingSystem": "Cross-platform"
  }
  </script>`

      // console.log($.html())

      // Insert SEO meta tags before closing head tag
      const finalHtml = $.html().replace('</head>', `${seoMeta}\n</head>`)

      return finalHtml
    } catch (error) {
      console.error(`❌ Error rendering ${url}:`, error)
      return ''
    }
  }

  // Extract URLs from HTML content
  const extractURLs = (html: string): string[] => {
    const urls = new Set<string>()
    const urlPattern = /href="([^"]+)"/g
    let match: RegExpExecArray | null
    while ((match = urlPattern.exec(html)) !== null) {
      urls.add(match[1])
    }
    return Array.from(urls)
  }

  // Filter URLs to only include internal links
  const filterURLs = (urls: string[]): string[] => {
    return urls
      .filter(url => url.startsWith('/'))
      .filter(url => !url.startsWith('/assets/'))
      .filter(url => !url.includes('#')) // Remove anchor links
      .filter(url => !url.endsWith('.png'))
      .filter(url => !url.endsWith('.svg'))
      .filter(url => !url.endsWith('.css'))
      .filter(url => !url.endsWith('.js'))
      .filter(url => !url.endsWith('.json'))
  }

  // Convert URL to file path
  const urlToFilePath = (url: string): string => {
    if (url === '/') {
      return '/index.html'
    }
    if (url.endsWith('/')) {
      return `${url}index.html`
    }
    if (!url.includes('.')) {
      return `${url}.html`
    }
    return url
  }

  console.log('🔍 Starting link crawling and static generation...')
  const generated = new Set<string>()
  const toGenerate = [
    '/',
    '/authentication/components',
    '/authentication/examples',
    '/authentication/api',
  ]
  let processedCount = 0

  while (toGenerate.length > 0) {
    const url = toGenerate.pop()!

    try {
      const basePath = path.resolve(process.cwd(), './dist')
      const filePath = path.join(basePath, urlToFilePath(url))
      const dirPath = path.dirname(filePath)

      // Skip if already generated
      if (generated.has(url)) {
        continue
      }

      generated.add(url)
      processedCount++

      // Skip if file already exists (except for root)
      if (url !== '/' && (await fse.pathExists(filePath))) {
        console.log(`⏭️  Skipping existing file: ${url}`)
        continue
      }

      // Render the page
      const html = await renderPage(url)

      if (!html) {
        console.warn(`⚠️  Failed to render: ${url}`)
        continue
      }

      // Extract and queue new URLs
      console.log(`🔍 Extracting links from: ${url}`)
      const extractedUrls = extractURLs(html)
      console.log(
        `🔍 Found ${extractedUrls.length} links: ${extractedUrls.join(', ')}`
      )
      const urls = filterURLs(extractedUrls)
      console.log(`🔍 Found ${urls.length} links`)
      const newUrls = urls.filter(url => !generated.has(url))
      toGenerate.push(...newUrls)

      if (newUrls.length > 0) {
        console.log(
          `🔗 Found ${newUrls.length} new links: ${newUrls.join(', ')}`
        )
      }

      // Save the rendered HTML
      await fse.ensureDir(dirPath)
      await fsp.writeFile(filePath, html, 'utf-8')
      console.log(
        `✅ Generated: ${url} → ${path.relative(process.cwd(), filePath)}`
      )
    } catch (error) {
      console.error(`❌ Error processing ${url}:`, error)
      continue
    }
  }

  console.log(`🎉 Static generation completed successfully!`)
  console.log(`📊 Processed ${processedCount} pages`)
  console.log(`📁 Generated files in: ${path.resolve(process.cwd(), 'dist')}`)
}

main().catch(error => {
  console.error('💥 Static generation failed:', error)
  process.exit(1)
})

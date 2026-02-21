import * as fsp from 'fs/promises'
import * as fse from 'fs-extra'
import * as path from 'path'
import { runHeadless } from '@tempots/dom'
import * as cheerio from 'cheerio'
import { JSDOM } from 'jsdom'

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

  // Initialize a real DOM with jsdom
  const dom = new JSDOM(
    '<!doctype html><html><head></head><body><div id="app"></div></body></html>',
    { url: `${BASE_URL}/`, pretendToBeVisual: true }
  )
  const { window } = dom
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gThis = globalThis as any

  gThis.window = window
  gThis.document = window.document
  if (!('navigator' in globalThis) || gThis.navigator !== window.navigator) {
    Object.defineProperty(globalThis, 'navigator', {
      value: window.navigator,
      configurable: true,
    })
  }

  gThis.HTMLElement = window.HTMLElement
  gThis.HTMLAnchorElement = window.HTMLAnchorElement
  gThis.SVGElement = window.SVGElement
  gThis.getComputedStyle = window.getComputedStyle.bind(window)
  gThis.requestAnimationFrame = window.requestAnimationFrame.bind(window)
  gThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window)

  // Provide storage shims
  gThis.localStorage = window.localStorage
  gThis.sessionStorage = window.sessionStorage

  // matchMedia
  if (!window.matchMedia) {
    gThis.matchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false
      },
    })
  } else {
    gThis.matchMedia = window.matchMedia.bind(window)
  }

  // Observer stubs
  gThis.IntersectionObserver =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).IntersectionObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  gThis.ResizeObserver =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).ResizeObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }

  // Keep indexedDB light stub if missing
  if (!gThis.indexedDB) {
    gThis.indexedDB = {
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
  }

  // Return a teardown if needed by callers
  return () => dom.window.close()
}

const main = async () => {
  console.log('🚀 Starting comprehensive static site generation...')

  // Set up browser mocks before importing any components
  setupBrowserMocks()

  // Import components for SSG
  const { html, attr } = await import('@tempots/dom')
  const { BeatUI } = await import('@tempots/beatui')
  const { default: HomePage } = await import('../src/pages/home')
  const { default: AboutPage } = await import('../src/pages/about')
  const { default: AuthenticationPage } = await import(
    '../src/pages/authentication'
  )
  const { default: AuthenticationComponentsPage } = await import(
    '../src/pages/authentication-components'
  )
  const { default: ButtonPage } = await import('../src/pages/button')
  const { default: DropdownPage } = await import('../src/pages/dropdown')
  const { default: ComboboxPage } = await import('../src/pages/combobox')
  const { default: SwitchPage } = await import('../src/pages/switch')
  const { default: CollapsePage } = await import('../src/pages/collapse')
  const { default: IconPage } = await import('../src/pages/icon')
  const { default: LinkPage } = await import('../src/pages/link')
  const { default: ModalPage } = await import('../src/pages/modal')
  const { default: LightboxPage } = await import('../src/pages/lightbox')
  const { default: DrawerPage } = await import('../src/pages/drawer')
  const { default: TooltipPage } = await import('../src/pages/tooltip')
  const { default: FlyoutPage } = await import('../src/pages/flyout')
  const { default: MenuPage } = await import('../src/pages/menu')
  const { default: ScrollablePanelPage } = await import(
    '../src/pages/scrollable-panel'
  )
  const { default: RTLLTRPage } = await import('../src/pages/rtl-ltr')
  const { default: SegmentedControlPage } = await import(
    '../src/pages/segmented-control'
  )
  const { default: SidebarPage } = await import('../src/pages/sidebar')
  const { default: TabsPage } = await import('../src/pages/tabs')
  const { default: TagsPage } = await import('../src/pages/tags')
  const { default: TagsInputPage } = await import('../src/pages/tags-input')
  const { default: FormPage } = await import('../src/pages/form')
  const { default: FileInputPage } = await import('../src/pages/file-input')
  const { default: PageDropZonePage } = await import(
    '../src/pages/page-drop-zone'
  )
  const { default: ColorPickerPage } = await import('../src/pages/color-swatch')
  const { default: EditableTextPage } = await import(
    '../src/pages/editable-text'
  )
  const { default: BreakpointPage } = await import('../src/pages/breakpoint')
  const { default: NineSliceScrollViewPage } = await import(
    '../src/pages/nine-slice-scroll-view'
  )
  const { default: JSONSchemaFormPage } = await import(
    '../src/pages/json-schema-form'
  )
  const { default: MonacoEditorPage } = await import(
    '../src/pages/monaco-editor'
  )
  const { default: MaskInputPage } = await import('../src/pages/mask-input')
  const { default: ToolbarPage } = await import('../src/pages/toolbar')
  const { default: TemporalPage } = await import('../src/pages/temporal')
  const { default: InputsPage } = await import('../src/pages/inputs')
  const { default: MarkdownPage } = await import('../src/pages/markdown')
  const { default: NoticePage } = await import('../src/pages/notice')
  const { default: RibbonPage } = await import('../src/pages/ribbon')
  const { default: AnnouncementBarPage } = await import(
    '../src/pages/announcement-bar'
  )

  const { default: VideoPlayerPage } = await import('../src/pages/video-player')
  const { default: PDFPreviewPage } = await import('../src/pages/pdf-preview')
  const { default: PDFPageViewerPage } = await import(
    '../src/pages/pdf-page-viewer'
  )

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
            } catch {
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
        const pageMap: Record<string, () => import('@tempots/dom').Renderable> =
          {
            '/': HomePage,
            '/about': AboutPage,
            '/authentication': AuthenticationPage,
            '/authentication/components': AuthenticationComponentsPage,
            '/button': ButtonPage,
            '/dropdown': DropdownPage,
            '/combobox': ComboboxPage,
            '/switch': SwitchPage,
            '/collapse': CollapsePage,
            '/icon': IconPage,
            '/link': LinkPage,
            '/modal': ModalPage,
            '/lightbox': LightboxPage,
            '/announcement-bar': AnnouncementBarPage,
            '/drawer': DrawerPage,
            '/tooltip': TooltipPage,
            '/flyout': FlyoutPage,
            '/menu': MenuPage,
            '/scrollable-panel': ScrollablePanelPage,
            '/rtl-ltr': RTLLTRPage,
            '/segmented-control': SegmentedControlPage,
            '/sidebar': SidebarPage,
            '/tabs': TabsPage,
            '/tags': TagsPage,
            '/tags-input': TagsInputPage,
            '/form': FormPage,
            '/file-input': FileInputPage,
            '/page-drop-zone': PageDropZonePage,
            '/color-picker': ColorPickerPage,
            '/editable-text': EditableTextPage,
            '/breakpoint': BreakpointPage,
            '/nine-slice-scroll-view': NineSliceScrollViewPage,
            '/json-schema-form': JSONSchemaFormPage,
            '/monaco-editor': MonacoEditorPage,
            '/mask-input': MaskInputPage,
            '/toolbar': ToolbarPage,
            '/temporal': TemporalPage,
            '/inputs': InputsPage,
            '/markdown': MarkdownPage,
            '/video-player': VideoPlayerPage,
            '/pdf-preview': PDFPreviewPage,
            '/pdf-page-viewer': PDFPageViewerPage,

            '/notice': NoticePage,
            '/ribbon': RibbonPage,
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
                html.a(attr.href('/authentication'), 'Authentication'),
                html.a(
                  attr.href('/authentication/components'),
                  'Auth Components'
                ),
                html.a(attr.href('/button'), 'Button'),
                html.a(attr.href('/dropdown'), 'Dropdown'),
                html.a(attr.href('/combobox'), 'Combobox'),
                html.a(attr.href('/switch'), 'Switch'),
                html.a(attr.href('/collapse'), 'Collapse'),
                html.a(attr.href('/icon'), 'Icon'),
                html.a(attr.href('/link'), 'Link'),
                html.a(attr.href('/modal'), 'Modal'),
                html.a(attr.href('/lightbox'), 'Lightbox'),
                html.a(attr.href('/announcement-bar'), 'Announcement Bar'),
                html.a(attr.href('/drawer'), 'Drawer'),
                html.a(attr.href('/tooltip'), 'Tooltip'),
                html.a(attr.href('/flyout'), 'Flyout'),
                html.a(attr.href('/menu'), 'Menu'),
                html.a(attr.href('/segmented-control'), 'Segmented Control'),
                html.a(attr.href('/scrollable-panel'), 'Scrollable Panel'),
                html.a(attr.href('/rtl-ltr'), 'RTL/LTR'),
                html.a(attr.href('/sidebar'), 'Sidebar'),
                html.a(attr.href('/tabs'), 'Tabs'),
                html.a(attr.href('/tags'), 'Tags'),
                html.a(attr.href('/tags-input'), 'Tags Input'),
                html.a(attr.href('/form'), 'Form'),
                html.a(attr.href('/file-input'), 'File Input'),
                html.a(attr.href('/color-picker'), 'Color Picker'),
                html.a(attr.href('/editable-text'), 'Editable Text'),
                html.a(attr.href('/breakpoint'), 'Breakpoint'),
                html.a(
                  attr.href('/nine-slice-scroll-view'),
                  'Nine-slice Scroll View'
                ),
                html.a(attr.href('/json-schema-form'), 'JSON Schema Form'),
                html.a(attr.href('/monaco-editor'), 'Monaco Editor'),
                html.a(attr.href('/mask-input'), 'Mask Input'),
                html.a(attr.href('/toolbar'), 'Toolbar'),
                html.a(attr.href('/temporal'), 'Temporal'),
                html.a(attr.href('/video-player'), 'Video Player'),

                html.a(attr.href('/inputs'), 'Inputs'),
                html.a(attr.href('/markdown'), 'Markdown'),
                html.a(attr.href('/notice'), 'Notice'),
                html.a(attr.href('/ribbon'), 'Ribbon')
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
      .filter(url => !url.startsWith('/api')) // API pages are SPA-only
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
  const toGenerate = ['/', '/authentication', '/authentication/components']
  let processedCount = 0
  const BATCH_SIZE = 8

  const processPage = async (
    url: string
  ): Promise<{ url: string; html: string; newUrls: string[] } | null> => {
    try {
      const basePath = path.resolve(process.cwd(), './dist')
      const filePath = path.join(basePath, urlToFilePath(url))
      const dirPath = path.dirname(filePath)

      // Skip if file already exists (except for root)
      if (url !== '/' && (await fse.pathExists(filePath))) {
        console.log(`⏭️  Skipping existing file: ${url}`)
        return null
      }

      // Render the page
      const html = await renderPage(url)

      if (!html) {
        console.warn(`⚠️  Failed to render: ${url}`)
        return null
      }

      // Extract new URLs
      const extractedUrls = extractURLs(html)
      const filteredUrls = filterURLs(extractedUrls)

      // Save the rendered HTML
      await fse.ensureDir(dirPath)
      await fsp.writeFile(filePath, html, 'utf-8')
      console.log(
        `✅ Generated: ${url} → ${path.relative(process.cwd(), filePath)}`
      )

      return { url, html, newUrls: filteredUrls }
    } catch (error) {
      console.error(`❌ Error processing ${url}:`, error)
      return null
    }
  }

  while (toGenerate.length > 0) {
    // Grab a batch of unique, ungenerated URLs
    const batch: string[] = []
    while (toGenerate.length > 0 && batch.length < BATCH_SIZE) {
      const url = toGenerate.pop()!
      if (!generated.has(url)) {
        generated.add(url)
        batch.push(url)
      }
    }

    if (batch.length === 0) break

    processedCount += batch.length

    // Render the batch in parallel
    const results = await Promise.all(batch.map(url => processPage(url)))

    // Collect newly discovered URLs from all results
    for (const result of results) {
      if (!result) continue
       
      const newUrls = result.newUrls.filter(u => !generated.has(u))
      if (newUrls.length > 0) {
        console.log(
          `🔗 Found ${newUrls.length} new links from ${result.url}: ${newUrls.join(', ')}`
        )
        toGenerate.push(...newUrls)
      }
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

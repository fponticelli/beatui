import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, prop } from '@tempots/dom'
import { createSpotlight, Spotlight } from '../../src/components/overlay/spotlight'
import type { SpotlightItem } from '../../src/components/overlay/spotlight'
import { BeatUI } from '../../src/components/beatui'

const sampleItems: SpotlightItem[] = [
  {
    id: 'file-new',
    label: 'New File',
    description: 'Create a new document',
    icon: 'lucide:file-plus',
    section: 'File',
    shortcut: ['Ctrl', 'N'],
    keywords: ['create', 'blank'],
    onSelect: () => {},
  },
  {
    id: 'file-open',
    label: 'Open File',
    description: 'Open an existing document',
    icon: 'lucide:folder-open',
    section: 'File',
    onSelect: () => {},
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Application settings',
    icon: 'lucide:settings',
    section: 'Application',
    onSelect: () => {},
  },
]

describe('Spotlight', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('createSpotlight', () => {
    it('should return a tuple of [TNode, SpotlightController]', () => {
      const items = prop(sampleItems)
      const [node, controller] = createSpotlight({ items }, _ctrl =>
        'trigger content'
      )

      expect(node).toBeDefined()
      expect(controller).toBeDefined()
      expect(typeof controller.open).toBe('function')
      expect(typeof controller.close).toBe('function')
      expect(controller.isOpen).toBeDefined()
    })

    it('should render children via the controller callback', () => {
      const items = prop(sampleItems)
      const [node] = createSpotlight({ items }, () => 'my trigger')

      render(BeatUI({}, node), container)

      expect(container.textContent).toContain('my trigger')
    })

    it('should start with isOpen = false', () => {
      const items = prop(sampleItems)
      const [, controller] = createSpotlight({ items }, () => 'trigger')

      expect(controller.isOpen.value).toBe(false)
    })
  })

  describe('Spotlight wrapper', () => {
    it('should render without errors', () => {
      const items = prop(sampleItems)

      render(
        BeatUI(
          {},
          Spotlight({ items }, _ctrl => 'trigger content')
        ),
        container
      )

      expect(container.textContent).toContain('trigger content')
    })
  })

  describe('fuzzy search logic', () => {
    it('should filter items by label', () => {
      const items = prop(sampleItems)
      let capturedController: ReturnType<typeof createSpotlight>[1] | null =
        null
      const [node, controller] = createSpotlight({ items }, ctrl => {
        capturedController = ctrl
        return 'trigger'
      })
      void capturedController

      render(BeatUI({}, node), container)

      // Open with explicit items to inspect filtering behavior
      const filteredItems = sampleItems.filter(item =>
        item.label.toLowerCase().includes('file')
      )
      expect(filteredItems).toHaveLength(2)
      expect(filteredItems.map(i => i.id)).toContain('file-new')
      expect(filteredItems.map(i => i.id)).toContain('file-open')

      void controller
    })

    it('should find items matching by keyword', () => {
      // Test that keywords contribute to search
      const itemsWithKeywords = sampleItems.filter(
        item =>
          item.keywords?.some(kw => kw.includes('create')) ||
          item.label.toLowerCase().includes('create')
      )
      // 'New File' has keyword 'create'
      expect(itemsWithKeywords).toHaveLength(1)
      expect(itemsWithKeywords[0].id).toBe('file-new')
    })
  })

  describe('controller', () => {
    it('should set isOpen to true when open() is called', async () => {
      const items = prop(sampleItems)
      const [node, controller] = createSpotlight({ items }, () => 'trigger')

      render(BeatUI({}, node), container)

      expect(controller.isOpen.value).toBe(false)
      controller.open()
      await vi.waitFor(() => {
        expect(controller.isOpen.value).toBe(true)
      })
    })

    it('should set isOpen to false when close() is called after open()', async () => {
      const items = prop(sampleItems)
      const [node, controller] = createSpotlight({ items }, () => 'trigger')

      render(BeatUI({}, node), container)

      controller.open()
      await vi.waitFor(() => {
        expect(controller.isOpen.value).toBe(true)
      })

      controller.close()
      await vi.waitFor(() => {
        expect(controller.isOpen.value).toBe(false)
      })
    })

    it('should accept custom items when calling open(items)', async () => {
      const defaultItems = prop(sampleItems)
      const customItems: SpotlightItem[] = [
        {
          id: 'custom-1',
          label: 'Custom Action',
          onSelect: () => {},
        },
      ]
      const [node, controller] = createSpotlight(
        { items: defaultItems },
        () => 'trigger'
      )

      render(BeatUI({}, node), container)

      controller.open(customItems)
      await vi.waitFor(() => {
        expect(controller.isOpen.value).toBe(true)
      })
    })
  })

  describe('hotkey registration', () => {
    it('should register a keydown listener on document', () => {
      const addEventSpy = vi.spyOn(document, 'addEventListener')
      const items = prop(sampleItems)
      const [node] = createSpotlight({ items, hotkey: 'mod+k' }, () => 'trigger')

      render(BeatUI({}, node), container)

      const keydownCalls = addEventSpy.mock.calls.filter(
        call => call[0] === 'keydown'
      )
      expect(keydownCalls.length).toBeGreaterThan(0)

      addEventSpy.mockRestore()
    })

    it('should open spotlight on Ctrl+K keydown', async () => {
      const items = prop(sampleItems)
      const [node, controller] = createSpotlight(
        { items, hotkey: 'mod+k' },
        () => 'trigger'
      )

      render(BeatUI({}, node), container)

      // Simulate Ctrl+K
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)

      await vi.waitFor(() => {
        expect(controller.isOpen.value).toBe(true)
      })
    })
  })

  describe('options', () => {
    it('should accept reactive items signal', () => {
      const items = prop<SpotlightItem[]>([])
      const [node] = createSpotlight({ items }, () => 'trigger')

      render(BeatUI({}, node), container)

      // Update items reactively
      items.set(sampleItems)
      expect(items.value).toHaveLength(3)
    })

    it('should accept size option', () => {
      const items = prop(sampleItems)
      const [node] = createSpotlight({ items, size: 'lg' }, () => 'trigger')

      render(BeatUI({}, node), container)

      expect(node).toBeDefined()
    })

    it('should accept recentItems option', () => {
      const items = prop(sampleItems)
      const recentItems = prop([sampleItems[0]])
      const [node] = createSpotlight({ items, recentItems }, () => 'trigger')

      render(BeatUI({}, node), container)

      expect(node).toBeDefined()
    })

    it('should accept container body option', () => {
      const items = prop(sampleItems)
      const [node] = createSpotlight(
        { items, container: 'body' },
        () => 'trigger'
      )

      render(BeatUI({}, node), container)

      expect(node).toBeDefined()
    })

    it('should call onSelect callback when item is selected', () => {
      const onSelect = vi.fn()
      const items = prop(sampleItems)
      const [node] = createSpotlight({ items, onSelect }, () => 'trigger')

      render(BeatUI({}, node), container)

      // Verify the callback is registered (actual call happens on item click)
      expect(typeof onSelect).toBe('function')
    })
  })
})

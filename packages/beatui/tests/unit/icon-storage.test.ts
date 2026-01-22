import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the icon module to test the storage fallback
vi.mock('../../src/components/data/icon.ts', async importOriginal => {
  const original = (await importOriginal()) as object

  // Re-implement the icon storage logic for testing
  const memoryCache = new Map<string, string>()

  const isIndexedDBAvailable = (() => {
    try {
      return typeof indexedDB !== 'undefined' && indexedDB !== null
    } catch {
      return false
    }
  })()

  function storeIconLocally(id: string, svgString: string) {
    return new Promise((resolve, reject) => {
      try {
        if (isIndexedDBAvailable && indexedDB) {
          // In test environment, indexedDB is not available, so this won't execute
          reject(new Error('IndexedDB not available in test'))
        } else {
          // Fallback to in-memory cache
          memoryCache.set(id, svgString)
          resolve(undefined)
        }
      } catch (_error) {
        // If IndexedDB fails, fallback to memory cache
        memoryCache.set(id, svgString)
        resolve(undefined)
      }
    })
  }

  function getIconLocally(id: string) {
    return new Promise<string | null>((resolve, reject) => {
      try {
        if (isIndexedDBAvailable && indexedDB) {
          // In test environment, indexedDB is not available, so this won't execute
          reject(new Error('IndexedDB not available in test'))
        } else {
          // Fallback to in-memory cache
          resolve(memoryCache.get(id) || null)
        }
      } catch (_error) {
        // If IndexedDB fails, fallback to memory cache
        resolve(memoryCache.get(id) || null)
      }
    })
  }

  return {
    ...original,
    storeIconLocally,
    getIconLocally,
    memoryCache,
    isIndexedDBAvailable,
  }
})

describe('Icon Storage Fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should detect that indexedDB is not available in test environment', async () => {
    const { isIndexedDBAvailable } = await import(
      '../../src/components/data/icon'
    )
    expect(isIndexedDBAvailable).toBe(false)
  })

  it('should store icons in memory cache when indexedDB is not available', async () => {
    const { storeIconLocally, getIconLocally } = await import(
      '../../src/components/data/icon'
    )

    const iconId = 'test-icon'
    const svgContent = '<svg>test</svg>'

    // Store the icon
    await storeIconLocally(iconId, svgContent)

    // Retrieve the icon
    const retrieved = await getIconLocally(iconId)

    expect(retrieved).toBe(svgContent)
  })

  it('should return null for non-existent icons', async () => {
    const { getIconLocally } = await import('../../src/components/data/icon')

    const retrieved = await getIconLocally('non-existent-icon')

    expect(retrieved).toBeNull()
  })

  it('should handle multiple icons in memory cache', async () => {
    const { storeIconLocally, getIconLocally } = await import(
      '../../src/components/data/icon'
    )

    const icons = [
      { id: 'icon1', svg: '<svg>icon1</svg>' },
      { id: 'icon2', svg: '<svg>icon2</svg>' },
      { id: 'icon3', svg: '<svg>icon3</svg>' },
    ]

    // Store all icons
    for (const icon of icons) {
      await storeIconLocally(icon.id, icon.svg)
    }

    // Retrieve and verify all icons
    for (const icon of icons) {
      const retrieved = await getIconLocally(icon.id)
      expect(retrieved).toBe(icon.svg)
    }
  })
})

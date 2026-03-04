import { beforeEach, afterEach } from 'vitest'

// Speed up animations in tests by overriding CSS transition duration
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    .bc-animated-toggle {
      transition-duration: 50ms !important;
    }
  `
  document.head.appendChild(style)
}

// Mock matchMedia for jsdom (needed by ReducedMotion provider)
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
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
}

// Mock Web Animations API for jsdom
if (typeof Element !== 'undefined' && !Element.prototype.getAnimations) {
  Element.prototype.getAnimations = function () {
    return []
  }
}

// Mock localStorage.clear for jsdom compatibility
if (typeof Storage !== 'undefined' && !Storage.prototype.clear) {
  Storage.prototype.clear = function () {
    const keys = Object.keys(this)
    for (const key of keys) {
      this.removeItem(key)
    }
  }
}

// Clear localStorage between tests to avoid test pollution
beforeEach(() => {
  // Clear localStorage safely
  if (typeof localStorage !== 'undefined') {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) keys.push(key)
    }
    keys.forEach(key => localStorage.removeItem(key))
  }
})

afterEach(() => {
  // Clear localStorage safely
  if (typeof localStorage !== 'undefined') {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) keys.push(key)
    }
    keys.forEach(key => localStorage.removeItem(key))
  }
  // Clean up any DOM elements that might have been added during tests
  document.body.innerHTML = ''
})

import { beforeEach, afterEach } from 'vitest'

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

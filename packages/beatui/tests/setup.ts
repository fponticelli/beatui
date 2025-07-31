import { beforeEach, afterEach } from 'vitest'

// Mock Web Animations API for jsdom
if (typeof Element !== 'undefined' && !Element.prototype.getAnimations) {
  Element.prototype.getAnimations = function () {
    return []
  }
}

// Clear localStorage between tests to avoid test pollution
beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
  // Clean up any DOM elements that might have been added during tests
  document.body.innerHTML = ''
})

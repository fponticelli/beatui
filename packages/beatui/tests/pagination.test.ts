import { describe, it, expect } from 'vitest'
import { generatePaginationRange } from '../src/components/navigation/pagination'

describe('Pagination', () => {
  describe('generatePaginationRange', () => {
    it('should generate range for first page with siblings=1', () => {
      const range = generatePaginationRange(1, 10, 1)
      expect(range).toEqual([1, 2, 'dots', 10])
    })

    it('should generate range for last page with siblings=1', () => {
      const range = generatePaginationRange(10, 10, 1)
      expect(range).toEqual([1, 'dots', 9, 10])
    })

    it('should generate range for middle page with siblings=1', () => {
      const range = generatePaginationRange(5, 10, 1)
      expect(range).toEqual([1, 'dots', 4, 5, 6, 'dots', 10])
    })

    it('should generate range for page near start with siblings=1', () => {
      const range = generatePaginationRange(2, 10, 1)
      expect(range).toEqual([1, 2, 3, 'dots', 10])
    })

    it('should generate range for page near end with siblings=1', () => {
      const range = generatePaginationRange(9, 10, 1)
      expect(range).toEqual([1, 'dots', 8, 9, 10])
    })

    it('should show all pages when total is small', () => {
      const range = generatePaginationRange(2, 5, 1)
      expect(range).toEqual([1, 2, 3, 'dots', 5])
    })

    it('should handle siblings=0', () => {
      const range = generatePaginationRange(5, 10, 0)
      expect(range).toEqual([1, 'dots', 5, 'dots', 10])
    })

    it('should handle siblings=2', () => {
      const range = generatePaginationRange(5, 10, 2)
      expect(range).toEqual([1, 'dots', 3, 4, 5, 6, 7, 'dots', 10])
    })

    it('should handle single page', () => {
      const range = generatePaginationRange(1, 1, 1)
      expect(range).toEqual([1])
    })

    it('should handle two pages', () => {
      const range = generatePaginationRange(1, 2, 1)
      expect(range).toEqual([1, 2])
    })

    it('should not show duplicate first page', () => {
      const range = generatePaginationRange(3, 10, 1)
      expect(range).toEqual([1, 2, 3, 4, 'dots', 10])
    })

    it('should not show duplicate last page', () => {
      const range = generatePaginationRange(8, 10, 1)
      expect(range).toEqual([1, 'dots', 7, 8, 9, 10])
    })

    it('should show continuous range when siblings cover everything', () => {
      const range = generatePaginationRange(3, 5, 2)
      expect(range).toEqual([1, 2, 3, 4, 5])
    })
  })
})

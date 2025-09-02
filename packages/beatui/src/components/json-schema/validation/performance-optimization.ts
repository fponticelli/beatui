import type { ValidateFunction } from 'ajv'
import type { ControllerValidation } from '../../form/controller/controller-validation'
import { Validation } from '@tempots/std'

/**
 * Validation cache entry
 */
interface ValidationCacheEntry {
  /** Cached validation result */
  result: ControllerValidation
  /** Timestamp when cached */
  timestamp: number
  /** Hash of the validated value */
  valueHash: string
  /** Dependencies that affect this validation */
  dependencies: string[]
}

/**
 * Performance optimization configuration
 */
export interface ValidationPerformanceConfig {
  /** Enable validation result caching */
  enableCaching?: boolean
  /** Cache TTL in milliseconds (default: 5 minutes) */
  cacheTTL?: number
  /** Maximum cache size (default: 1000 entries) */
  maxCacheSize?: number
  /** Enable validation batching */
  enableBatching?: boolean
  /** Batch delay in milliseconds (default: 50ms) */
  batchDelay?: number
  /** Enable incremental validation */
  enableIncremental?: boolean
  /** Enable validation prioritization */
  enablePrioritization?: boolean
  /** Validation timeout in milliseconds */
  validationTimeout?: number
}

/**
 * Validation task for batching
 */
interface ValidationTask {
  id: string
  value: unknown
  validator: ValidateFunction
  resolve: (result: ControllerValidation) => void
  reject: (error: Error) => void
  priority: number
  timestamp: number
}

/**
 * Performance metrics
 */
export interface ValidationMetrics {
  /** Total validations performed */
  totalValidations: number
  /** Cache hits */
  cacheHits: number
  /** Cache misses */
  cacheMisses: number
  /** Average validation time (ms) */
  averageValidationTime: number
  /** Batched validations */
  batchedValidations: number
  /** Skipped validations (incremental) */
  skippedValidations: number
}

/**
 * Validation performance optimizer
 */
export class ValidationPerformanceOptimizer {
  private cache = new Map<string, ValidationCacheEntry>()
  private batchQueue: ValidationTask[] = []
  private batchTimeout: ReturnType<typeof setTimeout> | undefined
  private metrics: ValidationMetrics = {
    totalValidations: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageValidationTime: 0,
    batchedValidations: 0,
    skippedValidations: 0,
  }
  private validationTimes: number[] = []

  constructor(private config: ValidationPerformanceConfig = {}) {
    // Set defaults
    this.config = {
      enableCaching: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      maxCacheSize: 1000,
      enableBatching: true,
      batchDelay: 50,
      enableIncremental: true,
      enablePrioritization: true,
      validationTimeout: 5000,
      ...config,
    }
  }

  /**
   * Create a hash of a value for caching
   */
  private createValueHash(value: unknown): string {
    try {
      return btoa(JSON.stringify(value)).slice(0, 32)
    } catch {
      return String(value).slice(0, 32)
    }
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheEntryValid(entry: ValidationCacheEntry): boolean {
    const now = Date.now()
    return now - entry.timestamp < (this.config.cacheTTL || 300000)
  }

  /**
   * Clean expired cache entries
   */
  private cleanCache(): void {
    const now = Date.now()
    const ttl = this.config.cacheTTL || 300000

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > ttl) {
        this.cache.delete(key)
      }
    }

    // Enforce max cache size
    const maxSize = this.config.maxCacheSize || 1000
    if (this.cache.size > maxSize) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)

      const toRemove = entries.slice(0, this.cache.size - maxSize)
      for (const [key] of toRemove) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cached validation result
   */
  private getCachedResult(
    cacheKey: string,
    valueHash: string
  ): ControllerValidation | null {
    if (!this.config.enableCaching) return null

    const entry = this.cache.get(cacheKey)
    if (
      !entry ||
      !this.isCacheEntryValid(entry) ||
      entry.valueHash !== valueHash
    ) {
      return null
    }

    this.metrics.cacheHits++
    return entry.result
  }

  /**
   * Cache validation result
   */
  private setCachedResult(
    cacheKey: string,
    valueHash: string,
    result: ControllerValidation,
    dependencies: string[] = []
  ): void {
    if (!this.config.enableCaching) return

    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      valueHash,
      dependencies,
    })

    // Clean cache periodically
    if (this.cache.size % 100 === 0) {
      this.cleanCache()
    }
  }

  /**
   * Process validation batch
   */
  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return

    const tasks = [...this.batchQueue]
    this.batchQueue = []

    // Sort by priority (higher first)
    if (this.config.enablePrioritization) {
      tasks.sort((a, b) => b.priority - a.priority)
    }

    // Process tasks
    for (const task of tasks) {
      try {
        const startTime = performance.now()
        const isValid = task.validator(task.value)
        const endTime = performance.now()

        this.recordValidationTime(endTime - startTime)
        this.metrics.batchedValidations++

        const result = isValid
          ? Validation.valid
          : Validation.invalid({ message: 'Validation failed' })

        task.resolve(result)
      } catch (error) {
        task.reject(
          error instanceof Error ? error : new Error('Validation error')
        )
      }
    }
  }

  /**
   * Record validation timing
   */
  private recordValidationTime(time: number): void {
    this.validationTimes.push(time)

    // Keep only last 1000 measurements
    if (this.validationTimes.length > 1000) {
      this.validationTimes = this.validationTimes.slice(-1000)
    }

    // Update average
    this.metrics.averageValidationTime =
      this.validationTimes.reduce((sum, t) => sum + t, 0) /
      this.validationTimes.length
  }

  /**
   * Optimized validation with caching, batching, and performance tracking
   */
  async validateOptimized(
    value: unknown,
    validator: ValidateFunction,
    cacheKey: string,
    options: {
      priority?: number
      dependencies?: string[]
      skipIncremental?: boolean
    } = {}
  ): Promise<ControllerValidation> {
    this.metrics.totalValidations++

    const valueHash = this.createValueHash(value)
    const priority = options.priority || 0
    const dependencies = options.dependencies || []

    // Check cache first
    const cachedResult = this.getCachedResult(cacheKey, valueHash)
    if (cachedResult) {
      return cachedResult
    }

    this.metrics.cacheMisses++

    // If batching is enabled, add to batch queue
    if (this.config.enableBatching) {
      return new Promise<ControllerValidation>((resolve, reject) => {
        const task: ValidationTask = {
          id: `${cacheKey}_${Date.now()}`,
          value,
          validator,
          resolve: result => {
            this.setCachedResult(cacheKey, valueHash, result, dependencies)
            resolve(result)
          },
          reject,
          priority,
          timestamp: Date.now(),
        }

        this.batchQueue.push(task)

        // Schedule batch processing
        if (this.batchTimeout === undefined) {
          this.batchTimeout = setTimeout(() => {
            this.batchTimeout = undefined
            this.processBatch()
          }, this.config.batchDelay || 50)
        }
      })
    }

    // Direct validation (no batching)
    try {
      const startTime = performance.now()
      const isValid = validator(value)
      const endTime = performance.now()

      this.recordValidationTime(endTime - startTime)

      const result = isValid
        ? Validation.valid
        : Validation.invalid({ message: 'Validation failed' })

      this.setCachedResult(cacheKey, valueHash, result, dependencies)
      return result
    } catch (error) {
      throw error instanceof Error ? error : new Error('Validation error')
    }
  }

  /**
   * Invalidate cache entries that depend on changed fields
   */
  invalidateDependentCache(changedFields: string[]): void {
    if (!this.config.enableCaching) return

    const toRemove: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      // Check if any dependencies were changed
      const hasChangedDependency = entry.dependencies.some(dep =>
        changedFields.some(
          changed => changed.startsWith(dep) || dep.startsWith(changed)
        )
      )

      if (hasChangedDependency) {
        toRemove.push(key)
      }
    }

    for (const key of toRemove) {
      this.cache.delete(key)
    }
  }

  /**
   * Check if incremental validation should be skipped
   */
  shouldSkipValidation(
    newValue: unknown,
    oldValue: unknown,
    _fieldPath: string
  ): boolean {
    if (!this.config.enableIncremental) return false

    // Skip if values are identical
    if (newValue === oldValue) {
      this.metrics.skippedValidations++
      return true
    }

    // Skip if both values are empty/null/undefined
    const isNewEmpty = newValue == null || newValue === ''
    const isOldEmpty = oldValue == null || oldValue === ''

    if (isNewEmpty && isOldEmpty) {
      this.metrics.skippedValidations++
      return true
    }

    return false
  }

  /**
   * Get performance metrics
   */
  getMetrics(): ValidationMetrics {
    return { ...this.metrics }
  }

  /**
   * Reset performance metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalValidations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageValidationTime: 0,
      batchedValidations: 0,
      skippedValidations: 0,
    }
    this.validationTimes = []
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number
    hitRate: number
    averageAge: number
  } {
    const now = Date.now()
    let totalAge = 0

    for (const entry of this.cache.values()) {
      totalAge += now - entry.timestamp
    }

    const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses
    const hitRate =
      totalRequests > 0 ? this.metrics.cacheHits / totalRequests : 0

    return {
      size: this.cache.size,
      hitRate,
      averageAge: this.cache.size > 0 ? totalAge / this.cache.size : 0,
    }
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    if (this.batchTimeout !== undefined) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = undefined
    }

    this.cache.clear()
    this.batchQueue = []
    this.validationTimes = []
  }
}

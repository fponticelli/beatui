import { describe, it, expect } from 'vitest'
import { taskToValidation } from '../../src/components/form/use-form'

describe('wrapAsyncOperation', () => {
  it('should return Valid result when operation succeeds', async () => {
    const operation = async () => {
      return 'success'
    }

    const result = await taskToValidation(operation)

    expect(result).toEqual({ type: 'Valid' })
  })

  it('should return Invalid result with error message when operation throws', async () => {
    const operation = async () => {
      throw new Error('Something went wrong')
    }

    const result = await taskToValidation(operation)

    expect(result).toEqual({
      type: 'Invalid',
      error: 'Something went wrong',
    })
  })

  it('should use custom error message when provided', async () => {
    const operation = async () => {
      throw new Error('Original error')
    }

    const result = await taskToValidation(operation, 'Custom error message')

    expect(result).toEqual({
      type: 'Invalid',
      error: 'Custom error message',
    })
  })

  it('should handle non-Error thrown values', async () => {
    const operation = async () => {
      throw 'String error'
    }

    const result = await taskToValidation(operation)

    expect(result).toEqual({
      type: 'Invalid',
      error: 'Operation failed',
    })
  })

  it('should create nested error structure for field paths', async () => {
    const operation = async () => {
      throw new Error('Field error')
    }

    const result = await taskToValidation(operation, 'Custom error', [
      'user',
      'email',
    ])

    expect(result).toEqual({
      type: 'Invalid',
      dependencies: {
        user: {
          dependencies: {
            email: {
              error: 'Custom error',
            },
          },
        },
      },
    })
  })

  it('should handle single field path', async () => {
    const operation = async () => {
      throw new Error('Field error')
    }

    const result = await taskToValidation(operation, 'Custom error', ['email'])

    expect(result).toEqual({
      type: 'Invalid',
      dependencies: {
        email: {
          error: 'Custom error',
        },
      },
    })
  })

  it('should handle root path specially', async () => {
    const operation = async () => {
      throw new Error('Root error')
    }

    const result = await taskToValidation(operation, 'Custom error', ['root'])

    expect(result).toEqual({
      type: 'Invalid',
      error: 'Custom error',
    })
  })
})

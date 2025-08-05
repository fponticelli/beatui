import { describe, it, expect } from 'vitest'
import { taskToValidation } from '../../src/components/form/use-form'

describe('wrapAsyncOperation', () => {
  it('should return Valid result when operation succeeds', async () => {
    const operation = async () => {
      return 'success'
    }

    const result = await taskToValidation({ task: operation })

    expect(result).toEqual({ type: 'valid' })
  })

  it('should return Invalid result with error message when operation throws', async () => {
    const operation = async () => {
      throw new Error('Something went wrong')
    }

    const result = await taskToValidation({ task: operation })

    expect(result).toEqual({
      type: 'invalid',
      error: {
        message: 'Something went wrong',
      },
    })
  })

  it('should use custom error message when provided', async () => {
    const operation = async () => {
      throw new Error('Original error')
    }

    const result = await taskToValidation({
      task: operation,
      errorMessage: 'Custom error message',
    })

    expect(result).toEqual({
      type: 'invalid',
      error: {
        message: 'Custom error message',
      },
    })
  })

  it('should handle non-Error thrown values', async () => {
    const operation = async () => {
      throw 'String error'
    }

    const result = await taskToValidation({ task: operation })

    expect(result).toEqual({
      type: 'invalid',
      error: {
        message: 'Operation failed',
      },
    })
  })

  it('should create nested error structure for field paths', async () => {
    const operation = async () => {
      throw new Error('Field error')
    }

    const result = await taskToValidation({
      task: operation,
      errorMessage: 'Custom error',
      errorPath: ['user', 'email'],
    })

    expect(result).toEqual({
      type: 'invalid',
      error: {
        dependencies: {
          user: {
            dependencies: {
              email: {
                message: 'Custom error',
              },
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

    const result = await taskToValidation({
      task: operation,
      errorMessage: 'Custom error',
      errorPath: ['email'],
    })

    expect(result).toEqual({
      type: 'invalid',
      error: {
        dependencies: {
          email: {
            message: 'Custom error',
          },
        },
      },
    })
  })

  it('should handle root path specially', async () => {
    const operation = async () => {
      throw new Error('Root error')
    }

    const result = await taskToValidation({
      task: operation,
      errorMessage: 'Custom error',
      errorPath: ['root'],
    })

    expect(result).toEqual({
      type: 'invalid',
      error: {
        message: 'Custom error',
      },
    })
  })
})

import { describe, expect, it } from 'vitest'
import { ApiError } from './api-error'
import { unwrapResponseData } from './response-transform'

describe('response transformation', () => {
  it('unwraps success, empty and list responses exactly once', () => {
    expect(unwrapResponseData({ code: 200, data: { id: 1 }, message: 'ok' }))
      .toEqual({ id: 1 })
    expect(unwrapResponseData({ code: 200, data: null, message: 'ok' }))
      .toBeNull()
    expect(unwrapResponseData({ code: 200, data: [], message: 'ok' }))
      .toEqual([])
  })

  it('keeps non-envelope transport data untouched', () => {
    const rawData = new Uint8Array([1, 2, 3])
    expect(unwrapResponseData(rawData)).toBe(rawData)
  })

  it('throws a structured ApiError for a wrapped business failure', () => {
    expect(() => unwrapResponseData({
      code: 40301,
      data: null,
      message: 'raw permission details',
      traceId: 'trace-response',
    })).toThrow(ApiError)

    try {
      unwrapResponseData({
        code: 40301,
        data: null,
        message: 'raw permission details',
        traceId: 'trace-response',
      })
    }
    catch (error) {
      expect(error).toMatchObject({
        code: 40301,
        kind: 'business',
        status: 403,
        traceId: 'trace-response',
      })
    }
  })
})

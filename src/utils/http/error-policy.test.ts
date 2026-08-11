import type { AxiosResponse } from 'axios'
import { AxiosError, CanceledError } from 'axios'
import { describe, expect, it } from 'vitest'
import { normalizeApiError } from './api-error'
import { shouldShowGlobalError } from './error-policy'

function createBusinessError(): AxiosError {
  return new AxiosError(
    'request failed',
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    {
      config: { headers: {} },
      data: {
        code: 42201,
        data: null,
        message: 'raw validation detail',
        traceId: 'trace-test',
      },
      headers: {},
      status: 422,
      statusText: 'Unprocessable Entity',
    } as AxiosResponse,
  )
}

describe('hTTP error classification', () => {
  it('distinguishes cancellation, timeout, network and business failures', () => {
    expect(normalizeApiError(new CanceledError()).kind).toBe('cancelled')
    expect(normalizeApiError(new AxiosError('timeout', 'ECONNABORTED')).kind)
      .toBe('timeout')
    expect(normalizeApiError(new AxiosError('network', 'ERR_NETWORK')).kind)
      .toBe('network')

    const businessError = normalizeApiError(createBusinessError())
    expect(businessError).toMatchObject({
      code: 42201,
      kind: 'business',
      status: 422,
      traceId: 'trace-test',
    })
    expect(businessError.message).toBe('raw validation detail')
  })

  it.each([401, 403, 404, 422, 429, 500])(
    'falls back to a safe message for HTTP %i when no server message exists',
    (status) => {
      const error = normalizeApiError(new AxiosError(
        'unsafe server detail',
        'ERR_BAD_RESPONSE',
        undefined,
        undefined,
        {
          config: { headers: {} },
          data: { data: null },
          headers: {},
          status,
          statusText: 'failed',
        } as AxiosResponse,
      ))

      expect(error.kind).toBe('business')
      expect(error.status).toBe(status)
      expect(error.message).not.toContain('unsafe server detail')
      expect(error.message).not.toBe('')
    },
  )

  it('prioritizes the backend message over the status fallback', () => {
    const error = normalizeApiError(new AxiosError(
      'unsafe server detail',
      'ERR_BAD_RESPONSE',
      undefined,
      undefined,
      {
        config: { headers: {} },
        data: { data: null, message: '没有权限访问该资源' },
        headers: {},
        status: 403,
        statusText: 'Forbidden',
      } as AxiosResponse,
    ))

    expect(error.kind).toBe('business')
    expect(error.status).toBe(403)
    expect(error.message).toBe('没有权限访问该资源')
  })

  it('treats a blank server message as absent and uses the fallback', () => {
    const error = normalizeApiError(new AxiosError(
      'unsafe server detail',
      'ERR_BAD_RESPONSE',
      undefined,
      undefined,
      {
        config: { headers: {} },
        data: { data: null, message: '   ' },
        headers: {},
        status: 404,
        statusText: 'Not Found',
      } as AxiosResponse,
    ))

    expect(error.message).not.toContain('unsafe server detail')
    expect(error.message).toBe('请求的资源不存在')
  })
})

describe('global error policy', () => {
  it('silentFail suppresses the global prompt without swallowing the error', () => {
    const error = normalizeApiError(createBusinessError())

    expect(shouldShowGlobalError(error, true)).toBe(false)
    expect(error.kind).toBe('business')
    expect(error).toBeInstanceOf(Error)
  })

  it('cancellation is silent while timeout, network and business failures notify', () => {
    expect(shouldShowGlobalError(new CanceledError())).toBe(false)
    expect(shouldShowGlobalError(new AxiosError('timeout', 'ETIMEDOUT')))
      .toBe(true)
    expect(shouldShowGlobalError(new AxiosError('network', 'ERR_NETWORK')))
      .toBe(true)
    expect(shouldShowGlobalError(createBusinessError())).toBe(true)
  })
})

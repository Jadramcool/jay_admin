import type { RouteLocationNormalized } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { isErrorTab } from './tab'

function createRoute(
  overrides: Partial<RouteLocationNormalized>,
): RouteLocationNormalized {
  return {
    fullPath: '/home',
    hash: '',
    matched: [],
    meta: { title: '首页' },
    name: 'Home',
    params: {},
    path: '/home',
    query: {},
    redirectedFrom: undefined,
    ...overrides,
  }
}

describe('tab route filtering', () => {
  it('rejects catch-all and explicit 404 routes', () => {
    expect(isErrorTab(createRoute({ name: 'NotFound', path: '/missing' }))).toBe(true)
    expect(isErrorTab(createRoute({ name: '404', path: '/404' }))).toBe(true)
  })

  it('rejects persisted tabs whose title came from the 404 page', () => {
    expect(isErrorTab(createRoute({ meta: { title: '404' }, path: '/legacy-missing' }))).toBe(true)
  })

  it('keeps normal business routes', () => {
    expect(isErrorTab(createRoute({ name: 'UserList', path: '/system/user/list' }))).toBe(false)
  })
})

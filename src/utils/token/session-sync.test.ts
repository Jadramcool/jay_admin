import { describe, expect, it, vi } from 'vitest'
import {
  resolveTokenStorageChange,
  TOKEN_STORAGE_KEYS,
} from './index'
import { applyTokenStorageChange } from './session-sync'

describe('cross-tab token storage events', () => {
  it('recognizes refresh rotation and logout without double-clearing on access removal', () => {
    expect(resolveTokenStorageChange({
      key: TOKEN_STORAGE_KEYS.accessToken,
      newValue: '"new-access-token"',
    })).toBe('session-updated')
    expect(resolveTokenStorageChange({
      key: TOKEN_STORAGE_KEYS.refreshToken,
      newValue: '"new-refresh-token"',
    })).toBe('session-updated')
    expect(resolveTokenStorageChange({
      key: TOKEN_STORAGE_KEYS.accessToken,
      newValue: null,
    })).toBeNull()
    expect(resolveTokenStorageChange({
      key: TOKEN_STORAGE_KEYS.refreshToken,
      newValue: null,
    })).toBe('session-cleared')
  })

  it('syncs a rotated session and clears a logged-out session', () => {
    const actions = {
      clearSession: vi.fn(),
      redirectToLogin: vi.fn(),
      syncSession: vi.fn(),
    }

    applyTokenStorageChange('session-updated', actions)
    expect(actions.syncSession).toHaveBeenCalledOnce()
    expect(actions.clearSession).not.toHaveBeenCalled()

    applyTokenStorageChange('session-cleared', actions)
    expect(actions.clearSession).toHaveBeenCalledOnce()
    expect(actions.redirectToLogin).toHaveBeenCalledOnce()
  })
})

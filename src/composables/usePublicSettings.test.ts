import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SettingsApi } from '@/api/system'
import { getPublicSettings, invalidatePublicSettings, usePublicSetting } from './usePublicSettings'

vi.mock('@/api/system', () => ({
  SettingsApi: { getPublic: vi.fn() },
}))

const getPublic = vi.mocked(SettingsApi.getPublic)

describe('usePublicSettings', () => {
  beforeEach(() => {
    invalidatePublicSettings()
    getPublic.mockReset()
    getPublic.mockResolvedValue({ 'site.name': 'Jay Admin', 'site.primaryColor': '#1890ff' })
  })

  it('首次读取走接口,重复读取命中缓存', async () => {
    expect(await usePublicSetting('site.name')).toBe('Jay Admin')
    expect(await usePublicSetting('site.primaryColor')).toBe('#1890ff')
    expect(getPublic).toHaveBeenCalledTimes(1)
  })

  it('缺失的键回退到 fallback', async () => {
    expect(await usePublicSetting('site.copyright', '默认版权')).toBe('默认版权')
  })

  it('失效缓存后重新拉取', async () => {
    await getPublicSettings()
    invalidatePublicSettings()
    await getPublicSettings()
    expect(getPublic).toHaveBeenCalledTimes(2)
  })

  it('接口失败时降级为空对象而不是抛错(登录页/布局不应因此白屏)', async () => {
    getPublic.mockRejectedValue(new Error('network down'))
    expect(await usePublicSetting('site.name', '兜底名称')).toBe('兜底名称')
  })
})

import { SettingsApi } from '@/api/system'

/**
 * 公开设置读取(匿名可读白名单,无需登录态)。
 *
 * 用于登录页、布局等未登录/低权限场景的品牌信息展示,
 * 数据来自 `GET /system/settings/public`(后端注册表里 expose=public 的项)。
 * 模块级缓存 5 分钟;管理端改完设置后可调 `invalidatePublicSettings()` 立刻生效。
 */

let cached: Record<string, string> | null = null
let cachedAt = 0
const TTL = 5 * 60 * 1000

/** 拉取全部公开设置(带模块级缓存,force 可绕过) */
export async function getPublicSettings(force = false): Promise<Record<string, string>> {
  if (!force && cached && Date.now() - cachedAt < TTL)
    return cached

  try {
    cached = (await SettingsApi.getPublic()) ?? {}
    cachedAt = Date.now()
  }
  catch {
    cached ??= {}
    cachedAt = Date.now()
  }
  return cached
}

/** 读取单个公开设置,不存在或读取失败时返回 fallback */
export async function usePublicSetting<T = string>(key: string, fallback?: T): Promise<T> {
  const settings = await getPublicSettings()
  const value: unknown = settings[key] ?? fallback ?? null
  return value as T
}

/** 失效公开设置缓存(管理端保存设置后调用) */
export function invalidatePublicSettings(): void {
  cached = null
  cachedAt = 0
}

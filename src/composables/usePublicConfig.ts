import { SysConfigApi } from '@/api/system'

/**
 * 公开配置读取(匿名可读,无需登录态)
 *
 * 用于登录页、布局等未登录/低权限场景的品牌信息展示,
 * 数据来自 `GET /system/config/public`(仅返回 isPublic=true 的配置)。
 * 模块级缓存 5 分钟,刷新页面可重新拉取。
 *
 * 用法: const siteName = await usePublicConfig('site_name', '默认站点名')
 */

let cached: Record<string, string> | null = null
let cachedAt = 0
const TTL = 5 * 60 * 1000

/** 拉取全部公开配置(带模块级缓存,force 可绕过) */
export async function getPublicConfigs(force = false): Promise<Record<string, string>> {
  if (!force && cached && Date.now() - cachedAt < TTL)
    return cached

  try {
    const list = await SysConfigApi.getPublic()
    cached = Object.fromEntries(list.map(config => [config.key, config.value]))
    cachedAt = Date.now()
  }
  catch {
    cached ??= {}
    cachedAt = Date.now()
  }
  return cached
}

/** 读取单个公开配置,不存在或读取失败时返回 fallback */
export async function usePublicConfig<T = string>(key: string, fallback?: T): Promise<T> {
  const configs = await getPublicConfigs()
  const value: unknown = configs[key] ?? fallback ?? null
  return value as T
}

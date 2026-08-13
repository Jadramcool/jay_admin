import { SysConfigApi } from '@/api/system'

/**
 * 系统配置类型化读取(带前端缓存)
 *
 * 用法: const siteName = await useConfig<string>('site_name')
 * 管理页修改配置后调用 invalidateConfig(key) 使缓存失效
 */
const cache = new Map<string, { value: unknown, at: number }>()
const TTL = 5 * 60 * 1000

export async function useConfig<T = unknown>(key: string, fallback?: T): Promise<T> {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL)
    return hit.value as T

  const value = await SysConfigApi.resolve<T>(key)
  const resolved = value ?? fallback ?? null
  cache.set(key, { value: resolved, at: Date.now() })
  return resolved as T
}

/** 失效配置缓存(不传 key 清空全部) */
export function invalidateConfig(key?: string) {
  if (key)
    cache.delete(key)
  else
    cache.clear()
}

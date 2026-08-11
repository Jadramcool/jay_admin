import { defineStore } from 'pinia'
import { DictApi } from '@/api/system'

interface DictCacheEntry {
  items: System.DictItem[]
  loadedAt: number
}

/**
 * 字典缓存 store
 *
 * 按类型编码缓存字典项,供 DictSelect 等组件复用;
 * 字典管理页修改后调用 clear(code) 失效对应缓存。
 */
export const useDictStore = defineStore('dict', () => {
  const cache = ref<Record<string, DictCacheEntry>>({})

  /** 获取字典项(带缓存),force=true 时强制刷新 */
  async function getItems(code: string, force = false): Promise<System.DictItem[]> {
    const entry = cache.value[code]
    if (!force && entry)
      return entry.items
    const items = await DictApi.getItemsByCode(code)
    cache.value[code] = { items, loadedAt: Date.now() }
    return items
  }

  /** 同步读取已缓存项(未加载时返回空数组) */
  function getOptions(code: string): System.DictItem[] {
    return cache.value[code]?.items ?? []
  }

  /** 失效缓存:指定 code 或全部 */
  function clear(code?: string) {
    if (code) {
      delete cache.value[code]
    }
    else {
      cache.value = {}
    }
  }

  return { cache, getItems, getOptions, clear }
})

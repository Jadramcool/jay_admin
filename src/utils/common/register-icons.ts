import type { IconifyJSON } from '@iconify/vue'
import { addCollection } from '@iconify/vue'

/**
 * 本地图标集注册
 *
 * renderIcon 基于 @iconify/vue 在线按需模式：图标未命中浏览器缓存时会向
 * api.iconify.design（境外服务）拉取，国内网络下经常超时失败、图标空白。
 * 改为启动时注册本地 @iconify-json 包数据，运行时零外网请求。
 *
 * 动态 import 由 Vite 拆为异步 chunk，不阻塞首屏；注册完成后已挂载的
 * Icon 组件会自动重新渲染。
 */
const collections = [
  // 清单来源：菜单表 icon 字段在用集合 + IconPicker 预设集合
  () => import('@iconify-json/fe/icons.json'),
  () => import('@iconify-json/icon-park-outline/icons.json'),
  () => import('@iconify-json/iconoir/icons.json'),
  () => import('@iconify-json/material-symbols/icons.json'),
  () => import('@iconify-json/mdi/icons.json'),
  () => import('@iconify-json/mingcute/icons.json'),
  () => import('@iconify-json/solar/icons.json'),
]

export function registerLocalIconCollections(): void {
  collections.forEach(load =>
    load()
      // resolveJsonModule 开启时 TS 会按 JSON 文件推导出巨型字面类型（部分包甚至
      // 推导为 {}），ambient declaration 在该场景下不生效，这里显式断言兜底
      .then(({ default: collection }) => addCollection(collection as IconifyJSON))
      .catch((error: unknown) => {
        // 图标数据缺失不应阻塞应用，仅开发期提示
        if (import.meta.env.DEV)
          console.warn('[register-icons] 本地图标集加载失败', error)
      }),
  )
}

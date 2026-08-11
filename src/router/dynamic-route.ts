import type { RouteRecordRaw } from 'vue-router'

type RouteComponent = RouteRecordRaw['component']

interface SupplementalPageDefinition {
  component: string
  meta: RouteRecordRaw['meta']
  name: string
  path: string
  permission: string
}

const supplementalPageDefinitions: SupplementalPageDefinition[] = [
  {
    path: '/system/user/edit',
    name: 'UserCreatePage',
    component: '/src/views/system/user/UserEdit.vue',
    permission: 'system:user:create',
    meta: { title: '新增用户', layout: 'normal', keepAlive: false },
  },
  {
    path: '/notice/notice/add',
    name: 'NoticeCreatePage',
    component: '/src/views/notice/notice/NoticeEdit.vue',
    permission: 'notice:create',
    meta: { title: '新增公告', layout: 'normal', keepAlive: false },
  },
]

export function resolveRouteComponent(
  requestedPath: string | null | undefined,
  components: Record<string, RouteComponent>,
): RouteComponent | undefined {
  if (!requestedPath)
    return undefined

  if (components[requestedPath])
    return components[requestedPath]

  const normalizedPath = requestedPath.toLowerCase()
  const matchedKey = Object.keys(components).find(
    key => key.toLowerCase() === normalizedPath,
  )
  return matchedKey ? components[matchedKey] : undefined
}

export function createSupplementalPageRoutes(
  permissionKeys: string[],
  components: Record<string, RouteComponent>,
): RouteRecordRaw[] {
  const granted = new Set(permissionKeys)

  return supplementalPageDefinitions
    .filter(route => granted.has(route.permission))
    .map(route => ({
      path: route.path,
      name: route.name,
      component: resolveRouteComponent(route.component, components),
      meta: route.meta,
    }))
    .filter(route => route.component) as RouteRecordRaw[]
}

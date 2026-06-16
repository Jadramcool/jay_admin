import type { MenuOption } from 'naive-ui'
import type { RouteRecordRaw } from 'vue-router'
import { hyphenate } from '@vueuse/core'
import cloneDeep from 'lodash-es/cloneDeep'
import { defineStore } from 'pinia'
import { arrayToTree, isExternal, renderIcon } from '@/utils/common'

export const routeComponents = import.meta.glob('/src/views/**/*.vue')

function parseExtraData(item: System.Menu) {
  if (!item.extraData)
    return null
  return typeof item.extraData === 'string'
    ? JSON.parse(item.extraData)
    : item.extraData
}

function resolveIframe(item: System.Menu) {
  if (item.isFrame && item.frameSrc) {
    return { originPath: item.frameSrc, component: '/src/views/iframe/index.vue' as const, path: `/iframe/${hyphenate(item.code)}` }
  }
  if (item.path && isExternal(item.path)) {
    return { originPath: item.path, component: '/src/views/iframe/index.vue' as const, path: `/iframe/${hyphenate(item.code)}` }
  }
  return null
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    accessRoutes: null as RouteRecordRaw | null,
    permissions: [] as System.Menu[],
    menus: [] as MenuOption[],
    buttonPermissionKeys: [] as string[],
  }),
  getters: {
    getButtonPermissionKeys: state => state.buttonPermissionKeys,
  },
  actions: {
    setPermissions(menus: System.Menu[]) {
      this.permissions = cloneDeep(menus)
    },
    setMenus(menus: System.Menu[]) {
      const cloneMenus = cloneDeep(menus)
      // 非顶层目录（pid !== null）+ redirect → 聚合目录，子菜单不在侧边栏展开
      const aggregateDirectoryIds = new Set(
        cloneMenus
          .filter(item =>
            item.type === 'DIRECTORY'
            && item.redirect
            && item.pid != null,
          )
          .map(item => item.id),
      )
      this.menus = arrayToTree(
        cloneMenus
          .filter(item => item.type !== 'BUTTON')
          .filter(item => !aggregateDirectoryIds.has(item.pid!))
          .map(item => this.getMenuItem(item))
          .filter((item): item is NonNullable<typeof item> => item != null)
          .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)),
      )
    },
    async setRoutes(menus: System.Menu[]) {
      this.createRoutes(cloneDeep(menus))
    },
    createRoutes(menus: System.Menu[]) {
      const btnPermissions: System.Menu[] = []
      const nonButtonMenus: System.Menu[] = []

      for (const item of menus) {
        if (item.type === 'BUTTON') {
          btnPermissions.push(item)
        }
        else {
          nonButtonMenus.push(item)
        }
      }

      this.buttonPermissionKeys = btnPermissions.map(item => item.permission ?? item.code)

      const formatSortMenus = nonButtonMenus
        .map(item => this.generateRoute(item))
        .sort((a, b) => a.order - b.order)

      const accessRoutes = arrayToTree(formatSortMenus)
      const homePath = import.meta.env.VITE_HOME_PATH || '/home'

      this.accessRoutes = {
        path: '/',
        name: 'pageHome',
        redirect: homePath,
        component: () => import('@/layout/index.vue'),
        meta: { title: '首页', icon: 'icon-park-outline:home' },
        children: accessRoutes,
      } as unknown as RouteRecordRaw
    },
    getMenuItem(item: System.Menu) {
      if (!item.show)
        return null
      const iframe = resolveIframe(item)
      return {
        id: item.id,
        label: item.name,
        key: item.code,
        path: iframe?.path ?? item.path,
        originPath: iframe?.originPath,
        icon: item.icon ? renderIcon(item.icon) : undefined,
        order: item.order ?? 0,
        pid: item.pid ?? null,
      }
    },
    generateRoute(item: System.Menu) {
      const iframe = resolveIframe(item)
      const extraData = parseExtraData(item)
      return {
        id: item.id,
        name: item.code,
        path: iframe?.path ?? item.path,
        redirect: item.redirect,
        component: iframe ? undefined : routeComponents[item.component!],
        pid: item.pid ?? null,
        order: item.order ?? 0,
        meta: {
          originPath: iframe?.originPath,
          icon: item.icon,
          title: item.name,
          layout: item.layout || null,
          keepAlive: !!item.keepAlive,
          affix: !!item.affix,
          target: item.target || '_self',
          withContentCard: extraData?.withContentCard !== false,
          extraData,
        },
      }
    },
    resetPermission() {
      this.$reset()
    },
  },
})

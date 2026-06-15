import { defineStore } from "pinia";
import { arrayToTree, isExternal, renderIcon } from "@/utils/common";
import { hyphenate } from "@vueuse/core";
import type { MenuOption } from "naive-ui";
import type { RouteRecordRaw } from "vue-router";
import * as _ from "lodash-es";

export const routeComponents = import.meta.glob("/src/views/**/*.vue");

export const usePermissionStore = defineStore("permission", {
  state: () => ({
    accessRoutes: null as RouteRecordRaw | null,
    permissions: [] as System.Menu[],
    menus: [] as MenuOption[],
    buttonPermissions: [] as System.Menu[],
    buttonPermissionKeys: [] as string[],
  }),
  getters: {
    getButtonPermissionKeys: (state) => state.buttonPermissionKeys,
  },
  actions: {
    async setPermissions(menus: System.Menu[]) {
      this.permissions = _.cloneDeep(menus);
    },
    async setMenus(menus: System.Menu[]) {
      const cloneMenus = _.cloneDeep(menus);
      // 非顶层目录（pid !== null）+ redirect → 聚合目录，子菜单不在侧边栏展开
      const aggregateDirectoryIds = new Set(
        cloneMenus
          .filter(
            (item) =>
              item.type === "DIRECTORY" &&
              item.redirect &&
              item.pid !== null,
          )
          .map((item) => item.id),
      );
      this.menus = arrayToTree(
        cloneMenus
          .filter((item) => item.type !== "BUTTON")
          .filter((item) => !aggregateDirectoryIds.has(item.pid))
          .map((item) => this.getMenuItem(item))
          .filter((item): item is NonNullable<typeof item> => item != null)
          .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)),
      );
    },
    async setRoutes(menus: System.Menu[]) {
      const cloneMenus = _.cloneDeep(menus);
      this.createRoutes(cloneMenus);
    },
    createRoutes(menus: System.Menu[]) {
      if (!Array.isArray(menus)) throw new Error("无效的参数，请传入菜单数组");

      const btnPermissions: System.Menu[] = [];
      const nonButtonMenus: System.Menu[] = [];
      const routeCache: Record<string, RouteRecordRaw> = {};

      menus.forEach((item) => {
        if (item.type === "BUTTON") {
          btnPermissions.push(item);
        } else {
          nonButtonMenus.push(item);
        }
      });

      this.buttonPermissions = btnPermissions;
      this.buttonPermissionKeys = btnPermissions.map((item) => item.code);

      const formatSortMenus = nonButtonMenus
        .map((item) => {
          if (routeCache[item.id]) return routeCache[item.id];
          const route = this.generateRoute(item);
          if (route && typeof route === "object") {
            routeCache[item.id] = route;
            return route;
          }
          return null;
        })
        .filter((item): item is NonNullable<typeof item> => item != null)
        .sort((a, b) => a.order - b.order);

      const accessRoutes = arrayToTree(formatSortMenus);
      const homePath = import.meta.env.VITE_HOME_PATH || "/home";

      this.accessRoutes = {
        path: "/",
        name: "pageHome",
        redirect: homePath,
        component: () => import("@/layout/index.vue"),
        meta: { title: "首页", icon: "icon-park-outline:home" },
        children: accessRoutes,
      } as unknown as RouteRecordRaw;
    },
    getMenuItem(item: System.Menu) {
      let originPath;
      if (item.path && isExternal(item.path)) {
        originPath = item.path;
        item.component = "/src/views/iframe/index.vue";
        item.path = `/iframe/${hyphenate(item.code)}`;
      }
      if (!item.show) return null;
      const { children: _children, ...itemData } = item;
      return {
        ...itemData,
        id: item.id,
        label: item.name,
        key: item.code,
        path: item.path,
        originPath,
        icon: item.icon ? renderIcon(item.icon) : undefined,
        order: item.order ?? 0,
        pid: item.pid || null,
      };
    },
    generateRoute(item: any): any {
      let originPath;
      if (isExternal(item.path)) {
        originPath = item.path;
        item.component = "/src/views/iframe/index.vue";
        item.path = `/iframe/${hyphenate(item.code)}`;
      }
      return {
        id: item.id,
        name: item.code,
        path: item.path,
        redirect: item.redirect,
        component: routeComponents[item.component] || undefined,
        pid: item.pid || null,
        meta: {
          originPath,
          icon: item.icon,
          title: item.name,
          layout: item.layout || null,
          keepAlive: !!item.keepAlive,
          extraData: item.extraData ? JSON.parse(item.extraData) : null,
        },
      };
    },
    resetPermission() {
      this.$reset();
    },
  },
});


<script setup lang="ts">
import dayjs from 'dayjs'
import { computed, provide, ref } from 'vue'
import Footer from '@/layout/components/footer/index.vue'
import Header from '@/layout/components/header/index.vue'
import SideLogo from '@/layout/components/sider/SideLogo.vue'
import SideMenu from '@/layout/components/sider/SideMenu.vue'
import TabBar from '@/layout/components/tab/TabBar.vue'
import { useAppStore, usePermissionStore, useUserStore } from '@/store/modules'
import SettingsDrawer from '@/views/settings/index.vue'

const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()
const userStore = useUserStore()

/** 全局水印:当前用户 + 日期(登录后生效) */
const watermarkText = computed(() => {
  const name = userStore.userInfo?.name || userStore.userInfo?.username
  if (!name)
    return ''
  return [`${name}`, dayjs().format('YYYY-MM-DD')]
})

const settingsRef = ref<any>(null)

provide('openSettings', () => {
  settingsRef.value?.openDrawer()
})

const keepAliveRoutes = computed(() => {
  const routes: string[] = []
  const collect = (items: any[]) => {
    items.forEach((item) => {
      if (item.keepAlive && item.name)
        routes.push(item.name)
      if (item.children)
        collect(item.children)
    })
  }
  collect(permissionStore.permissions)
  return routes
})
</script>

<template>
  <n-layout v-watermark="watermarkText" class="wh-full" has-sider>
    <n-layout-sider
      bordered
      :width="224"
      :collapsed-width="64"
      :collapsed="appStore.collapsed"
      :native-scrollbar="false"
      collapse-mode="width"
      show-trigger="bar"
      @collapse="appStore.switchCollapsed()"
      @expand="appStore.switchCollapsed()"
    >
      <SideLogo />
      <SideMenu />
    </n-layout-sider>

    <n-layout
      class="layout h-full"
      content-style="display: flex; flex-direction: column"
      embedded
    >
      <n-layout-header bordered>
        <Header />
      </n-layout-header>

      <TabBar v-if="appStore.showTabs" />

      <n-layout-content
        class="h-full flex-1 overflow-hidden"
        embedded
        content-style="padding: 18px 20px"
      >
        <template v-if="appStore.loadFlag">
          <n-card
            v-if="route.meta?.withContentCard !== false"
            :bordered="false"
            content-style="overflow: auto; height: 100%; padding: 18px;"
            class="content-card"
          >
            <router-view v-slot="{ Component: Comp, route: r }">
              <transition :name="appStore.transitionAnimation" mode="out-in">
                <keep-alive :include="keepAliveRoutes">
                  <component :is="Comp" :key="r.fullPath" />
                </keep-alive>
              </transition>
            </router-view>
          </n-card>
          <router-view v-else v-slot="{ Component: Comp, route: r }">
            <transition :name="appStore.transitionAnimation" mode="out-in">
              <keep-alive :include="keepAliveRoutes">
                <component :is="Comp" :key="r.fullPath" />
              </keep-alive>
            </transition>
          </router-view>
        </template>
      </n-layout-content>

      <n-layout-footer
        v-if="appStore.showFooter"
        bordered
        class="layout-footer"
      >
        <Footer />
      </n-layout-footer>
    </n-layout>

    <SettingsDrawer ref="settingsRef" />
    <NoticePopup />
  </n-layout>
</template>

<style lang="scss" scoped>
.content-card {
  height: 100%;
  border: 1px solid var(--layout-border-light);
  box-shadow: var(--surface-shadow);
}

.layout-footer {
  flex-shrink: 0;
  background: var(--layout-bg);
}
</style>

<template>
  <n-layout class="wh-full" has-sider>
    <n-layout-sider
      bordered
      :width="240"
      :collapsed-width="64"
      :collapsed="appStore.collapsed"
      :native-scrollbar="false"
      collapse-mode="width"
      show-trigger="bar"
      @collapse="appStore.switchCollapsed()"
      @expand="appStore.switchCollapsed()">
      <SideLogo />
      <SideMenu />
    </n-layout-sider>

    <n-layout
      class="layout h-full"
      content-style="display: flex; flex-direction: column"
      embedded>
      <n-layout-header bordered>
        <Header />
      </n-layout-header>

      <TabBar v-if="appStore.showTabs" />

      <n-layout-content
        class="h-full flex-1 overflow-hidden"
        embedded
        content-style="padding: 14px">
        <n-card
          v-if="appStore.loadFlag"
          content-style="overflow: auto; height: 100%;"
          class="content-card">
          <router-view v-slot="{ Component: Comp, route: r }">
            <transition :name="appStore.transitionAnimation" mode="out-in">
              <keep-alive :include="keepAliveRoutes">
                <component :is="Comp" :key="r.fullPath" />
              </keep-alive>
            </transition>
          </router-view>
        </n-card>
      </n-layout-content>

      <n-layout-footer
        v-if="appStore.showFooter"
        bordered
        class="layout-footer">
        <Footer />
      </n-layout-footer>
    </n-layout>

    <SettingsDrawer ref="settingsRef" />
  </n-layout>
</template>

<script setup lang="ts">
import { useAppStore, usePermissionStore, useTabStore } from "@/store/modules";
import SideLogo from "@/layout/components/sider/SideLogo.vue";
import SideMenu from "@/layout/components/sider/SideMenu.vue";
import Header from "@/layout/components/header/index.vue";
import TabBar from "@/layout/components/tab/TabBar.vue";
import Footer from "@/layout/components/footer/index.vue";
import SettingsDrawer from "@/views/settings/index.vue";
import { provide, ref, computed } from "vue";

const appStore = useAppStore();
const permissionStore = usePermissionStore();
const tabStore = useTabStore();

const settingsRef = ref<any>(null);

provide("openSettings", () => {
  settingsRef.value?.openDrawer();
});

const keepAliveRoutes = computed(() => {
  const routes: string[] = [];
  const collect = (items: any[]) => {
    items.forEach((item) => {
      if (item.keepAlive && item.name) routes.push(item.name);
      if (item.children) collect(item.children);
    });
  };
  collect(permissionStore.permissions);
  return routes;
});
</script>

<style lang="scss" scoped>
.content-card {
  height: 100%;
}

.layout-footer {
  flex-shrink: 0;
  background: #fff;
}
</style>


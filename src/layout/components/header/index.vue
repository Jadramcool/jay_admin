<script setup lang="ts">
import { useAppStore } from '@/store/modules'
import Breadcrumb from './Breadcrumb.vue'
import DarkModeSwitch from './components/DarkModeSwitch.vue'
import FontSelector from './components/FontSelector.vue'
import FullScreen from './components/FullScreen.vue'
import Setting from './components/Setting.vue'
import UserControl from './components/UserControl.vue'
import MenuCollapse from './MenuCollapse.vue'

const appStore = useAppStore()
</script>

<template>
  <div class="app-header">
    <div class="flex items-center gap-12px">
      <MenuCollapse />
      <Breadcrumb v-if="appStore.showBreadcrumb" />
    </div>
    <div class="flex items-center gap-8px">
      <DarkModeSwitch />
      <FontSelector />
      <FullScreen />
      <Setting />
      <UserControl />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
  padding: 0 20px;
}
</style>

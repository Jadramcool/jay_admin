<script setup lang="ts">
import { darkTheme, dateZhCN, zhCN } from 'naive-ui'
import { computed, onMounted, watch } from 'vue'
import Application from '@/components/application/Application.vue'
import { useAppStore } from '@/store/modules'

const appStore = useAppStore()
appStore.syncColorMode()

// Drive Naive UI's built-in theme from the resolved dark state so all Naive
// components switch in lockstep with the custom components.
const theme = computed(() => (appStore.isDark ? darkTheme : null))

onMounted(() => {
  appStore.setFont(appStore.currentFont)
})

// Auto mode follows OS preference through the same atomic transition path used
// by the manual switch, keeping Naive UI and global CSS on one visual timeline.
watch(() => appStore.systemPrefersDark, () => {
  if (appStore.colorMode === 'auto')
    appStore.syncColorMode(true)
})
</script>

<template>
  <n-config-provider
    class="wh-full"
    :theme="theme"
    :theme-overrides="appStore.theme"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <n-global-style />
    <Application>
      <router-view />
    </Application>
  </n-config-provider>
</template>

<style lang="scss">
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: var(--font-family);
}
</style>

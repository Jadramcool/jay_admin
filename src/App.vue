<script setup lang="ts">
import { darkTheme, dateZhCN, zhCN } from 'naive-ui'
import { computed, onMounted, watch } from 'vue'
import Application from '@/components/application/Application.vue'
import { useAppStore } from '@/store/modules'

const appStore = useAppStore()

// Drive Naive UI's built-in theme from the resolved dark state so all Naive
// components switch in lockstep with the custom components.
const theme = computed(() => (appStore.isDark ? darkTheme : null))

onMounted(() => {
  appStore.setPrimaryColor()
  appStore.setFont(appStore.currentFont)
  appStore.applyDarkClass()
})

// In 'auto' mode the OS preference can change at runtime; keep the <html> class
// (and thus the CSS variables) in sync whenever the resolved state flips.
// Use the transition-wrapped path so it animates consistently with manual toggles.
watch(() => appStore.isDark, () => {
  appStore.applyDarkClassWithTransition()
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

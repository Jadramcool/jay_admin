<script setup lang="ts">
import { dateZhCN, zhCN } from 'naive-ui'
import { onMounted } from 'vue'
import Application from '@/components/application/Application.vue'
import { useAppStore } from '@/store/modules'

const appStore = useAppStore()

onMounted(() => {
  appStore.setPrimaryColor()
  appStore.setFont(appStore.currentFont)
})
</script>

<template>
  <n-config-provider
    class="wh-full"
    :theme="null"
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

<style>
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

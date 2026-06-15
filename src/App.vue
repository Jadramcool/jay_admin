<template>
  <n-config-provider
    class="wh-full"
    :theme="isDark ? darkTheme : null"
    :theme-overrides="appStore.theme"
    :locale="zhCN"
    :date-locale="dateZhCN">
    <n-global-style />
    <Application>
      <router-view />
    </Application>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { darkTheme, zhCN, dateZhCN } from "naive-ui";
import { useAppStore } from "@/store/modules";
import Application from "@/components/application/Application.vue";

const appStore = useAppStore();

const isDark = computed(() => appStore.colorMode === "dark");

onMounted(() => {
  appStore.setPrimaryColor();
  appStore.setFont(appStore.currentFont);
});
</script>

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


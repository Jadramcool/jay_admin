<script setup lang="ts">
import { useAppStore } from '@/store/modules'

const appStore = useAppStore()
</script>

<template>
  <div v-if="appStore.showLogo" class="side-logo">
    <img src="/vite.svg" alt="logo" class="logo">
    <span v-show="appStore.collapsed ? false : true" key="title" class="title text-lg">JDM Admin</span>
  </div>
</template>

<style lang="scss" scoped>
.side-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 64px;
  padding: 0 16px;
  overflow: hidden;

  .logo {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .title {
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: opacity 0.2s;
  }
}
</style>

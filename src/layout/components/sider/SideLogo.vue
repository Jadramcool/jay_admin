<script setup lang="ts">
import { useAppStore } from '@/store/modules'

const appStore = useAppStore()
</script>

<template>
  <div class="side-logo">
    <img src="/vite.svg" alt="logo" class="logo">
    <Transition name="fade" mode="out-in">
      <span v-show="appStore.collapsed ? false : true" key="title" class="title">JDM Admin</span>
    </Transition>
  </div>
</template>

<style scoped>
.side-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 64px;
  padding: 0 16px;
  overflow: hidden;
  border-bottom: 1px solid var(--n-border-color, rgba(239, 239, 245, 1));
}

.logo {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.title {
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 0.2s;
}
</style>

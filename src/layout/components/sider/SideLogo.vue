<script setup lang="ts">
import { useAppStore } from '@/store/modules'

const appStore = useAppStore()
</script>

<template>
  <div v-if="appStore.showLogo" class="side-logo">
    <div class="logo" aria-hidden="true">
      J
    </div>
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
    display: grid;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    place-items: center;
    border-radius: 9px;
    background: linear-gradient(145deg, var(--primary-color-hover), var(--primary-color-pressed));
    box-shadow: 0 7px 18px rgba(var(--primary-color-rgb), 0.24);
    color: #fff;
    font-size: 18px;
    font-weight: 800;
  }

  .title {
    color: var(--card-header-text);
    font-weight: 750;
    letter-spacing: -0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: opacity 0.2s;
  }
}
</style>

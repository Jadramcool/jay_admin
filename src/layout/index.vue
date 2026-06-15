<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import NormalLayout from './normal/index.vue'

const route = useRoute()

const layoutMap: Record<string, Component> = {
  normal: NormalLayout,
}

const layoutComponent = computed(() => {
  const layout = (route.meta?.layout as string) || 'normal'
  return layoutMap[layout] || NormalLayout
})
</script>

<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/modules'

const appStore = useAppStore()

// Sun in light mode, moon in dark mode. The quick toggle always lands on an
// explicit light/dark (never 'auto'); the auto option lives in the settings drawer.
const icon = computed(() =>
  appStore.isDark ? 'icon-park-outline:moon' : 'icon-park-outline:sun',
)
</script>

<template>
  <n-button quaternary size="small" @click="appStore.toggleDark()">
    <template #icon>
      <JIcon :icon="icon" />
    </template>
  </n-button>
</template>

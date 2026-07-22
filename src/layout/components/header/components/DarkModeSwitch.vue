<script setup lang="ts">
import { computed } from 'vue'
import { JIconButton } from '@/components'
import { useAppStore } from '@/store/modules'

const appStore = useAppStore()

// Sun in light mode, moon in dark mode. The quick toggle always lands on an
// explicit light/dark (never 'auto'); the auto option lives in the settings drawer.
const icon = computed(() =>
  appStore.isDark ? 'icon-park-outline:moon' : 'icon-park-outline:sun',
)
const buttonLabel = computed(() =>
  appStore.isDark ? '切换到浅色模式' : '切换到深色模式',
)

function handleToggle() {
  appStore.toggleDark()
}
</script>

<template>
  <JIconButton
    :icon="icon"
    :label="buttonLabel"
    @click="handleToggle"
  />
</template>

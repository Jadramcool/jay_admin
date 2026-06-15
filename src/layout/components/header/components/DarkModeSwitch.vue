<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useColorMode } from '@vueuse/core'
import { computed } from 'vue'
import { useAppStore } from '@/store/modules'

const appStore = useAppStore()
const colorMode = useColorMode()

const iconName = computed(() => {
  if (colorMode.store.value === 'auto') {
    return colorMode.system.value === 'dark'
      ? 'icon-park-outline:dark-mode'
      : 'icon-park-outline:light-mode'
  }
  return colorMode.store.value === 'dark'
    ? 'icon-park-outline:dark-mode'
    : 'icon-park-outline:light-mode'
})

const modes: App.ColorMode[] = ['light', 'dark', 'auto']

function handleSwitch() {
  const next = modes[(modes.indexOf(colorMode.store.value as any) + 1) % modes.length]
  colorMode.store.value = next
  appStore.setColorMode(next)
}
</script>

<template>
  <n-button quaternary size="small" @click="handleSwitch">
    <template #icon>
      <n-icon size="18">
        <Icon :icon="iconName" />
      </n-icon>
    </template>
  </n-button>
</template>

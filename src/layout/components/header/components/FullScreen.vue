<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useFullscreen } from '@vueuse/core'

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()
</script>

<template>
  <n-button quaternary size="small" @click="toggleFullscreen">
    <template #icon>
      <n-icon size="18">
        <Icon :icon="isFullscreen ? 'icon-park-outline:off-screen' : 'icon-park-outline:full-screen'" />
      </n-icon>
    </template>
  </n-button>
</template>

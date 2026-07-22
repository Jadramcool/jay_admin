<script setup lang="ts">
import { useFullscreen } from '@vueuse/core'
import { computed } from 'vue'
import { JIconButton } from '@/components'

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()

const buttonLabel = computed(() => isFullscreen.value ? '退出全屏' : '进入全屏')

async function handleToggle() {
  await toggleFullscreen()
}
</script>

<template>
  <JIconButton
    :icon="isFullscreen ? 'icon-park-outline:off-screen' : 'icon-park-outline:full-screen'"
    :label="buttonLabel"
    @click="handleToggle"
  />
</template>

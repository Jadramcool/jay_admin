<script setup lang="ts">
import { inject } from 'vue'
import { JIconButton } from '@/components'

const openSettings = inject<() => void>('openSettings', () => {})

function handleOpen() {
  openSettings()
}
</script>

<template>
  <JIconButton
    icon="icon-park-outline:setting"
    label="打开设置"
    @click="handleOpen"
  />
</template>

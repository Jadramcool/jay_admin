<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { inject } from 'vue'

const openSettings = inject<() => void>('openSettings', () => {})

function handleOpen() {
  openSettings()
}
</script>

<template>
  <n-button quaternary size="small" @click="handleOpen">
    <template #icon>
      <n-icon size="18">
        <Icon icon="icon-park-outline:setting" />
      </n-icon>
    </template>
  </n-button>
</template>

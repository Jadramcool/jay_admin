<script setup lang="ts">
import { useAppStore } from '@/store/modules'

const appStore = useAppStore()
</script>

<template>
  <n-button quaternary size="small" @click="appStore.switchCollapsed()">
    <template #icon>
      <JIcon
        :size="20"
        :icon="
          appStore.collapsed
            ? 'icon-park-outline:indent-right'
            : 'icon-park-outline:indent-left'
        "
      />
    </template>
  </n-button>
</template>

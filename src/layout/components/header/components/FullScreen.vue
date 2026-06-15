<template>
  <n-button quaternary size="small" @click="toggleFullscreen">
    <template #icon>
      <n-icon size="18">
        <icon :icon="isFullscreen ? 'icon-park-outline:full-screen' : 'icon-park-outline:off-screen'" />
      </n-icon>
    </template>
  </n-button>
</template>

<script setup lang="ts">
import { useFullscreen } from '@vueuse/core';
import { Icon } from '@iconify/vue';

const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
</script>

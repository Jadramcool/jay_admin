<template>
  <n-button quaternary size="small" @click="handleOpen">
    <template #icon>
      <n-icon size="18">
        <icon icon="icon-park-outline:setting" />
      </n-icon>
    </template>
  </n-button>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { Icon } from '@iconify/vue';

const openSettings = inject<() => void>('openSettings', () => {});

function handleOpen() {
  openSettings();
}
</script>

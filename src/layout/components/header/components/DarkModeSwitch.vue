<template>
  <n-button quaternary size="small" @click="handleSwitch">
    <template #icon>
      <n-icon size="18">
        <icon :icon="iconName" />
      </n-icon>
    </template>
  </n-button>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/modules';
import { useColorMode } from '@vueuse/core';
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

const appStore = useAppStore();
const colorMode = useColorMode();

const iconName = computed(() => {
  if (colorMode.store.value === 'auto') {
    return colorMode.system.value === 'dark'
      ? 'icon-park-outline:dark-mode'
      : 'icon-park-outline:light-mode';
  }
  return colorMode.store.value === 'dark'
    ? 'icon-park-outline:dark-mode'
    : 'icon-park-outline:light-mode';
});

const modes: App.ColorMode[] = ['light', 'dark', 'auto'];
let index = 0;

function handleSwitch() {
  const next = modes[(modes.indexOf(colorMode.store.value as any) + 1) % modes.length];
  colorMode.store.value = next;
  appStore.setColorMode(next);
}
</script>

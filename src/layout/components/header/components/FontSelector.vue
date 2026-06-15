<template>
  <n-dropdown trigger="hover" :options="options" @select="handleSelect">
    <n-button quaternary size="small">
      <template #icon>
        <n-icon size="18">
          <icon icon="icon-park-outline:font" />
        </n-icon>
      </template>
    </n-button>
  </n-dropdown>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/modules';
import { fontOptions } from '@/settings';
import { Icon } from '@iconify/vue';
import type { DropdownOption } from 'naive-ui';

const appStore = useAppStore();

const options = computed<DropdownOption[]>(() =>
  Object.entries(fontOptions).map(([key, val]) => ({
    label: val.name,
    key,
  })),
);

function handleSelect(key: string) {
  appStore.setFont(key);
}
</script>

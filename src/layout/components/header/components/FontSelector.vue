<script setup lang="ts">
import type { DropdownOption } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { fontOptions } from '@/settings'
import { useAppStore } from '@/store/modules'

const appStore = useAppStore()

const options = computed<DropdownOption[]>(() =>
  Object.entries(fontOptions).map(([key, val]) => ({
    label: val.name,
    key,
  })),
)

function handleSelect(key: string) {
  appStore.setFont(key)
}
</script>

<template>
  <n-dropdown trigger="hover" :options="options" @select="handleSelect">
    <n-button quaternary size="small">
      <template #icon>
        <n-icon size="18">
          <Icon icon="icon-park-outline:font-size-two" />
        </n-icon>
      </template>
    </n-button>
  </n-dropdown>
</template>

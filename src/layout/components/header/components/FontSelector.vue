<script setup lang="ts">
import type { DropdownOption } from 'naive-ui'
import { JIconButton } from '@/components'
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
    <JIconButton icon="icon-park-outline:font-size-two" label="选择字体" />
  </n-dropdown>
</template>

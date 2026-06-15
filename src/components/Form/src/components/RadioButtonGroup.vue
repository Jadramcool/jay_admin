<script setup lang="ts">
defineProps<{
  value?: string
  options?: Array<{ label: string, value: string | number }>
}>()
defineEmits<{ 'update:value': [value: string] }>()
</script>

<template>
  <n-radio-group v-bind="$attrs" :value="value" @update:value="$emit('update:value', $event)">
    <n-radio-button v-for="opt in options" :key="opt.value" :value="opt.value" :label="opt.label" />
  </n-radio-group>
</template>

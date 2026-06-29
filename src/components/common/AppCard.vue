<script setup lang="ts">
defineProps<{
  title?: string
  contentStyle?: string
}>()
</script>

<template>
  <n-card
    :bordered="false"
    size="small"
    class="app-card"
    :title="title"
    :content-style="contentStyle || 'padding: 16px;'"
  >
    <template v-if="$slots['header-extra']" #header-extra>
      <slot name="header-extra" />
    </template>
    <slot />
  </n-card>
</template>

<style lang="scss" scoped>
.app-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  html.dark & {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }
}
</style>

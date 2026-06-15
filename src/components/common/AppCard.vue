<template>
  <n-card
    :bordered="false"
    size="small"
    class="app-card"
    content-style="padding: 16px;">
    <slot />
  </n-card>
</template>

<style scoped>
.app-card {
  border-radius: 8px;
  transition: box-shadow 0.2s ease;
}
</style>


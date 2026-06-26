<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <div class="layout-footer text-xs">
    <span class="footer-text">JDM Admin &copy; {{ year }}</span>
    <span class="footer-divider">|</span>
    <span class="footer-text">Powered by Vue 3 + Naive UI</span>
  </div>
</template>

<style lang="scss" scoped>
.layout-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  gap: 8px;
  color: var(--layout-text-secondary);

  .footer-divider {
    opacity: 0.3;
  }
}
</style>

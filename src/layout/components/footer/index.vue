<template>
  <div class="layout-footer">
    <span class="footer-text">JDM Admin &copy; {{ year }}</span>
    <span class="footer-divider">|</span>
    <span class="footer-text">Powered by Vue 3 + Naive UI</span>
  </div>
</template>

<script setup lang="ts">
const year = new Date().getFullYear();
</script>

<style scoped>
.layout-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  gap: 8px;
  font-size: 12px;
  color: rgba(153, 153, 153, 0.8);
}

.footer-divider {
  opacity: 0.3;
}
</style>


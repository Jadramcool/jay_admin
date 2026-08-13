<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { usePublicConfig } from '@/composables/usePublicConfig'

const year = new Date().getFullYear()
// 版权信息(公开配置;未配置时回退默认)
const copyright = ref('JDM Admin')
onMounted(async () => {
  copyright.value = await usePublicConfig('copyright', copyright.value)
})
</script>

<template>
  <div class="layout-footer text-xs">
    <span class="footer-text">{{ copyright }} &copy; {{ year }}</span>
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
